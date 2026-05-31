/**
 * emotion-worker.ts — Module Worker (bundled by webpack via Next.js)
 *
 * Loaded with: new Worker(new URL('./emotion-worker.ts', import.meta.url))
 *
 * Using a webpack-bundled module worker (instead of importScripts + CDN) gives
 * @vladmandic/face-api a proper browser-like environment so TFJS can initialise
 * ENV correctly. The CDN / importScripts approach fails because TFJS detects the
 * WorkerGlobalScope as neither browser nor Node, leaving ENV = null → getEnv() throws.
 */

import * as faceapi from "@vladmandic/face-api";

// ─── Tuning ───────────────────────────────────────────────────────────────────
// Frames where max-confidence < THRESHOLD are labelled "unknown" to avoid
// polluting the distribution with low-confidence/noisy frames.
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

// ─── State ────────────────────────────────────────────────────────────────────
let ready = false;

// ─── Message handler ─────────────────────────────────────────────────────────
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data as { type: string; payload: any };

  // ── INIT ───────────────────────────────────────────────────────────────────
  if (type === "INIT") {
    try {
      const modelUrl: string = payload?.modelUrl ?? "/models";

      // Force CPU backend — Web Workers have no real GPU/WebGL context.
      // Even though webpack gives us a browser-like env, WebGL backend will
      // fail to create a context inside a worker → explicitly use CPU.
      // faceapi.tf is typed as 'typeof tf' which has no setBackend in its
      // type declaration, but the runtime object does — cast through unknown.
      const tf = faceapi.tf as unknown as {
        setBackend: (name: string) => Promise<boolean>;
        ready: () => Promise<void>;
      };
      await tf.setBackend("cpu");
      await tf.ready();

      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceExpressionNet.loadFromUri(modelUrl);

      ready = true;
      self.postMessage({ type: "READY" });
    } catch (err) {
      self.postMessage({ type: "ERROR", error: String(err) });
    }
    return;
  }

  // ── DETECT ─────────────────────────────────────────────────────────────────
  if (type === "DETECT") {
    if (!ready) {
      self.postMessage({ type: "ERROR", error: "Worker not ready" });
      return;
    }

    const { imageBitmap, ts } = payload as {
      imageBitmap: ImageBitmap;
      ts: number;
    };

    try {
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      (canvas.getContext("2d") as OffscreenCanvasRenderingContext2D).drawImage(
        imageBitmap,
        0,
        0,
      );

      const detection = await faceapi
        .detectSingleFace(canvas as any, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      imageBitmap.close();

      if (!detection) {
        self.postMessage({ type: "RESULT", payload: null, ts });
        return;
      }

      const expr = detection.expressions as unknown as Record<string, number>;
      let argmaxLabel: string = "neutral";
      let maxScore = -1;
      const vector: Record<string, number> = {};

      for (const key of CANONICAL) {
        const score = expr[key] ?? 0;
        vector[key] = score;
        if (score > maxScore) {
          maxScore = score;
          argmaxLabel = key;
        }
      }

      if (maxScore < CONFIDENCE_THRESHOLD) {
        self.postMessage({ type: "RESULT", payload: null, ts });
        return;
      }

      self.postMessage({
        type: "RESULT",
        payload: {
          label: argmaxLabel,
          score: maxScore,
          vector,
        },
        ts,
      });
    } catch (err) {
      self.postMessage({ type: "ERROR", error: String(err) });
    }
    return;
  }
};
