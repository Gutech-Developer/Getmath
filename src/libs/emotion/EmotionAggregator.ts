import type {
  EmotionLabel,
  EmotionSample,
  EmotionResult,
  EmotionDistribution,
} from "./types";

const LABELS: EmotionLabel[] = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "unknown",
];

function emptyDistribution(): EmotionDistribution {
  return {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    unknown: 0,
  };
}

export class EmotionAggregator {
  private samples: EmotionSample[] = [];
  private startedAt: number = Date.now();

  reset() {
    this.samples = [];
    this.startedAt = Date.now();
  }

  push(s: EmotionSample) {
    this.samples.push(s);
  }

  hasData() {
    return this.samples.length > 0;
  }

  /** Pakai untuk window fatal-error (kamera mati di tengah jalan). */
  buildUnknownResult(): EmotionResult {
    const now = Date.now();
    const dist = emptyDistribution();
    dist.unknown = 1;
    return {
      mode: "unknown",
      distribution: dist,
      sampleCount: 0,
      durationMs: Math.max(0, now - this.startedAt),
      startedAtMs: this.startedAt,
      endedAtMs: now,
    };
  }

  computeResult(): EmotionResult | null {
    if (this.samples.length === 0) return null;

    // Hitung proporsi LABEL DOMINAN per frame (mode-based)
    const counts: Record<EmotionLabel, number> = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      unknown: 0,
    };
    for (const s of this.samples) counts[s.label] += 1;

    const total = this.samples.length;
    const distribution = emptyDistribution();
    let mode: EmotionLabel = "neutral";
    let max = -1;
    for (const k of LABELS) {
      const pct = counts[k] / total;
      distribution[k] = Math.round(pct * 10000) / 10000;
      if (counts[k] > max) {
        max = counts[k];
        mode = k;
      }
    }

    // Normalize: correct floating-point rounding drift so sum == 1.0 exactly.
    // Find the key with the highest raw count and absorb any residual there.
    const sumRounded = (Object.values(distribution) as number[]).reduce(
      (a, b) => a + b,
      0,
    );
    const residual = Math.round((1 - sumRounded) * 10000) / 10000;
    if (residual !== 0) {
      distribution[mode] =
        Math.round((distribution[mode] + residual) * 10000) / 10000;
    }

    const endedAtMs = this.samples[this.samples.length - 1].ts;
    return {
      mode,
      distribution,
      sampleCount: total,
      durationMs: Math.max(0, endedAtMs - this.startedAt),
      startedAtMs: this.startedAt,
      endedAtMs,
    };
  }
}
