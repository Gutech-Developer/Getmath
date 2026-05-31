import type { EmotionSample } from "./types";

export interface EmotionSamplerOptions {
  video: HTMLVideoElement;
  intervalMs: number;
  modelUrl?: string;
  onSample: (s: EmotionSample) => void;
  onError?: (err: Error) => void;
  /** Max waktu worker boleh "sibuk" sebelum dianggap hang. Default 5000ms. */
  inflightTimeoutMs?: number;
}

const DEFAULT_INFLIGHT_TIMEOUT_MS = 5000;

export class EmotionSampler {
  private worker: Worker | null = null;
  private timer: number | null = null;
  private running = false;

  // Back-pressure guard: skip tick kalau worker masih memproses frame sebelumnya
  private inFlight = false;
  private inFlightSince = 0;

  // Debug counter
  private stats = { sampled: 0, skipped: 0 };

  private opts: EmotionSamplerOptions;

  constructor(opts: EmotionSamplerOptions) {
    this.opts = opts;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.worker = new Worker("/workers/emotion-worker.js?v=4");

    // INIT — tunggu model selesai load
    await new Promise<void>((resolve, reject) => {
      const onReady = (e: MessageEvent) => {
        if (e.data.type === "READY") {
          this.worker?.removeEventListener("message", onReady);
          resolve();
        }
        if (e.data.type === "ERROR") {
          this.worker?.removeEventListener("message", onReady);
          reject(new Error(e.data.error));
        }
      };
      this.worker!.addEventListener("message", onReady);
      this.worker!.postMessage({
        type: "INIT",
        payload: { modelUrl: this.opts.modelUrl ?? "/models" },
      });
    });

    // Handler utama — clear inFlight di SETIAP balasan dari worker
    this.worker.addEventListener("message", (e) => {
      const { type, payload, ts } = e.data;
      if (type === "RESULT" || type === "ERROR") {
        this.inFlight = false;
      }
      if (type === "RESULT" && payload) {
        this.stats.sampled += 1;
        this.opts.onSample({ ...payload, ts });
      }
      if (type === "ERROR") {
        this.opts.onError?.(new Error(e.data.error));
      }
    });

    this.timer = window.setInterval(() => {
      void this.tick();
    }, this.opts.intervalMs);
  }

  private async tick() {
    if (!this.worker || !this.running) return;

    // === Skip-if-busy guard ===
    if (this.inFlight) {
      const timeout =
        this.opts.inflightTimeoutMs ?? DEFAULT_INFLIGHT_TIMEOUT_MS;
      if (Date.now() - this.inFlightSince > timeout) {
        // Watchdog: worker dianggap hang
        this.inFlight = false;
        this.opts.onError?.(
          new Error(`Emotion worker stalled (>${timeout}ms no response)`),
        );
      } else {
        this.stats.skipped += 1;
      }
      return;
    }

    const v = this.opts.video;
    if (v.readyState < 2 || v.paused || v.ended) return;

    try {
      const bitmap = await createImageBitmap(v);
      this.inFlight = true;
      this.inFlightSince = Date.now();
      this.worker.postMessage(
        { type: "DETECT", payload: { imageBitmap: bitmap, ts: Date.now() } },
        [bitmap], // transferable — zero-copy, ownership pindah ke worker
      );
    } catch (err) {
      this.inFlight = false; // gagal sebelum kirim → bukan in-flight
      this.opts.onError?.(err as Error);
    }
  }

  /** Snapshot stats (useful untuk diagnosa device lambat). */
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
    this.worker?.terminate();
    this.worker = null;
  }
}
