/**
 * EmotionSampler — Main-thread implementation (no Web Worker).
 *
 * Workers fail because TFJS checks `typeof window` at module-init time. In any
 * WorkerGlobalScope `window` is undefined, so TFJS leaves ENV = null and every
 * subsequent call throws "getEnv – environment is not defined". No amount of
 * stubbing or backend-switching fixes this because it runs before user code.
 *
 * Solution: run @vladmandic/face-api in the MAIN thread via dynamic import
 * (avoids SSR bundle issues). TFJS uses the WebGL backend → GPU-accelerated,
 * faster than a CPU-only worker, and fully non-blocking (inference is async).
 */

import type { EmotionLabel, EmotionSample, EmotionVector } from "./types";

export interface EmotionSamplerOptions {
  video: HTMLVideoElement;
  intervalMs: number;
  modelUrl?: string;
  onSample: (s: EmotionSample) => void;
  onError?: (err: Error) => void;
  /** Max time a single inference can take before it is considered stalled. */
  inflightTimeoutMs?: number;
}

const DEFAULT_INFLIGHT_TIMEOUT_MS = 5000;
const CONFIDENCE_THRESHOLD = 0.4;
const CANONICAL = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
] as const;

export class EmotionSampler {
  private timer: number | null = null;
  private running = false;

  // Back-pressure guard: skip tick if previous inference is still in progress
  private inFlight = false;
  private inFlightSince = 0;

  private stats = { sampled: 0, skipped: 0 };
  private opts: EmotionSamplerOptions;

  // face-api loaded lazily in start() via dynamic import (avoids SSR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private faceapi: any = null;

  constructor(opts: EmotionSamplerOptions) {
    this.opts = opts;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    const modelUrl = this.opts.modelUrl ?? "/models";

    // Dynamic import so face-api is never evaluated during SSR.
    // In the browser TFJS picks the WebGL backend automatically → GPU-fast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faceapi = (await import("@vladmandic/face-api")) as any;
    this.faceapi = faceapi;

    await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
    await faceapi.nets.faceExpressionNet.loadFromUri(modelUrl);

    // If stop() was called while models were loading, abort cleanly
    if (!this.running) return;

    this.timer = window.setInterval(() => {
      void this.tick();
    }, this.opts.intervalMs);
  }

  private async tick(): Promise<void> {
    if (!this.running || !this.faceapi) return;

    if (this.inFlight) {
      const timeout =
        this.opts.inflightTimeoutMs ?? DEFAULT_INFLIGHT_TIMEOUT_MS;
      if (Date.now() - this.inFlightSince > timeout) {
        this.inFlight = false;
        this.opts.onError?.(
          new Error(`Emotion inference stalled (>${timeout}ms)`),
        );
      } else {
        this.stats.skipped += 1;
      }
      return;
    }

    const v = this.opts.video;
    if (v.readyState < 2 || v.paused || v.ended) return;

    this.inFlight = true;
    this.inFlightSince = Date.now();

    try {
      const detection = await this.faceapi
        .detectSingleFace(v, new this.faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      this.inFlight = false;

      if (!detection) return;

      const expr = detection.expressions as unknown as Record<string, number>;
      let argmaxLabel: EmotionLabel = "neutral";
      let maxScore = -1;
      const vector = {} as EmotionVector;

      for (const key of CANONICAL) {
        const score = expr[key] ?? 0;
        vector[key] = score;
        if (score > maxScore) {
          maxScore = score;
          argmaxLabel = key as EmotionLabel;
        }
      }

      if (maxScore < CONFIDENCE_THRESHOLD) return;

      this.stats.sampled += 1;
      this.opts.onSample({
        label: argmaxLabel,
        confidence: maxScore,
        vector,
        ts: Date.now(),
      });
    } catch (err) {
      this.inFlight = false;
      this.opts.onError?.(err as Error);
    }
  }

  getStats() {
    return { ...this.stats };
  }

  stop() {
    this.running = false;
    this.inFlight = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.faceapi = null;
  }
}
