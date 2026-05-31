import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmotionAggregator } from "@/libs/emotion/EmotionAggregator";
import type { EmotionSample, EmotionLabel } from "@/libs/emotion/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSample(label: EmotionLabel, ts = Date.now()): EmotionSample {
  const base = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  };
  return { label, confidence: 0.9, vector: { ...base, [label]: 0.9 }, ts };
}

import type { EmotionDistribution } from "@/libs/emotion/types";

function sumDistribution(d: EmotionDistribution): number {
  return (
    d.neutral +
    d.happy +
    d.sad +
    d.angry +
    d.fearful +
    d.disgusted +
    d.surprised +
    d.unknown
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("EmotionAggregator", () => {
  let agg: EmotionAggregator;

  beforeEach(() => {
    agg = new EmotionAggregator();
  });

  // ── hasData ────────────────────────────────────────────────────────────────
  it("hasData() returns false when empty", () => {
    expect(agg.hasData()).toBe(false);
  });

  it("hasData() returns true after push", () => {
    agg.push(makeSample("happy"));
    expect(agg.hasData()).toBe(true);
  });

  // ── computeResult — null when empty ───────────────────────────────────────
  it("computeResult() returns null when no samples", () => {
    expect(agg.computeResult()).toBeNull();
  });

  // ── computeResult — single sample ─────────────────────────────────────────
  it("computeResult() single sample: mode = that label", () => {
    agg.push(makeSample("happy", 1000));
    const result = agg.computeResult();
    expect(result).not.toBeNull();
    expect(result!.mode).toBe("happy");
    expect(result!.sampleCount).toBe(1);
    expect(result!.distribution.happy).toBe(1);
  });

  // ── computeResult — mode is the dominant label ────────────────────────────
  it("computeResult() picks dominant label as mode", () => {
    agg.push(makeSample("sad", 1000));
    agg.push(makeSample("sad", 1100));
    agg.push(makeSample("happy", 1200));
    const result = agg.computeResult()!;
    expect(result.mode).toBe("sad");
    expect(result.sampleCount).toBe(3);
  });

  // ── distribution sum == 1.0 (normalization after rounding) ────────────────
  it("distribution sums to exactly 1.0 for equal-weight samples", () => {
    // 7 different labels — each has 1/7 proportion → notorious rounding drift
    const labels: EmotionLabel[] = [
      "neutral",
      "happy",
      "sad",
      "angry",
      "fearful",
      "disgusted",
      "surprised",
    ];
    let ts = 1000;
    for (const label of labels) {
      agg.push(makeSample(label, ts++));
    }
    const result = agg.computeResult()!;
    const sum = sumDistribution(result.distribution);
    expect(sum).toBeCloseTo(1.0, 4);
    // Must be EXACTLY 1.0 at 4-decimal precision
    expect(Math.round(sum * 10000)).toBe(10000);
  });

  it("distribution sums to 1.0 for 3 labels with non-round proportions", () => {
    // 3 happy, 3 sad, 1 angry → 3/7, 3/7, 1/7
    const labels: EmotionLabel[] = [
      "happy",
      "happy",
      "happy",
      "sad",
      "sad",
      "sad",
      "angry",
    ];
    let ts = 1000;
    for (const label of labels) agg.push(makeSample(label, ts++));
    const result = agg.computeResult()!;
    expect(Math.round(sumDistribution(result.distribution) * 10000)).toBe(
      10000,
    );
  });

  it("distribution sums to 1.0 for all-unknown samples", () => {
    for (let i = 0; i < 10; i++) agg.push(makeSample("unknown", 1000 + i));
    const result = agg.computeResult()!;
    expect(result.mode).toBe("unknown");
    expect(result.distribution.unknown).toBe(1);
    expect(Math.round(sumDistribution(result.distribution) * 10000)).toBe(
      10000,
    );
  });

  // ── distribution proportions are correct ──────────────────────────────────
  it("distribution proportions reflect sample counts", () => {
    // 2 happy, 2 sad out of 4 total
    agg.push(makeSample("happy", 1000));
    agg.push(makeSample("happy", 1100));
    agg.push(makeSample("sad", 1200));
    agg.push(makeSample("sad", 1300));
    const result = agg.computeResult()!;
    expect(result.distribution.happy).toBe(0.5);
    expect(result.distribution.sad).toBe(0.5);
    expect(result.distribution.neutral).toBe(0);
  });

  // ── durationMs ────────────────────────────────────────────────────────────
  it("durationMs equals endedAtMs - startedAtMs (ts of last sample - reset time)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(5000);
    agg.reset(); // startedAt = 5000

    vi.setSystemTime(5000);
    agg.push(makeSample("neutral", 5000));
    vi.setSystemTime(6000);
    agg.push(makeSample("happy", 6000));

    const result = agg.computeResult()!;
    // endedAtMs = ts of last sample = 6000, startedAt = 5000
    expect(result.durationMs).toBe(1000);
    expect(result.startedAtMs).toBe(5000);
    expect(result.endedAtMs).toBe(6000);

    vi.useRealTimers();
  });

  // ── reset ─────────────────────────────────────────────────────────────────
  it("reset() clears samples → computeResult returns null", () => {
    agg.push(makeSample("happy"));
    agg.reset();
    expect(agg.computeResult()).toBeNull();
    expect(agg.hasData()).toBe(false);
  });

  it("reset() refreshes startedAt timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    agg.push(makeSample("happy", 1000));

    vi.setSystemTime(9000);
    agg.reset(); // startedAt should now be 9000

    vi.setSystemTime(9000);
    agg.push(makeSample("sad", 9000));
    vi.setSystemTime(9500);
    agg.push(makeSample("sad", 9500));
    const result = agg.computeResult()!;
    expect(result.startedAtMs).toBe(9000);

    vi.useRealTimers();
  });

  // ── buildUnknownResult ────────────────────────────────────────────────────
  it("buildUnknownResult() has sampleCount=0, mode=unknown, distribution.unknown=1", () => {
    const result = agg.buildUnknownResult();
    expect(result.mode).toBe("unknown");
    expect(result.sampleCount).toBe(0);
    expect(result.distribution.unknown).toBe(1);
    expect(sumDistribution(result.distribution)).toBeCloseTo(1.0, 4);
  });

  it("buildUnknownResult() durationMs >= 0", () => {
    const result = agg.buildUnknownResult();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  // ── all labels remain in distribution (no missing keys) ───────────────────
  it("computeResult() always returns all 8 distribution keys", () => {
    agg.push(makeSample("happy"));
    const result = agg.computeResult()!;
    const keys = Object.keys(result.distribution).sort();
    expect(keys).toEqual(
      [
        "angry",
        "disgusted",
        "fearful",
        "happy",
        "neutral",
        "sad",
        "surprised",
        "unknown",
      ].sort(),
    );
  });
});
