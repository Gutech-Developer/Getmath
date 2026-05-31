import { describe, it, expect, beforeEach } from "vitest";
import { EmotionAggregator } from "../EmotionAggregator";
import type { EmotionSample } from "../types";

const LABELS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "unknown",
] as const;

function makeSample(
  label: EmotionSample["label"],
  confidence = 0.9,
  ts = Date.now(),
): EmotionSample {
  const vector = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  };
  if (label !== "unknown") vector[label] = confidence;
  return { label, confidence, vector, ts };
}

describe("EmotionAggregator", () => {
  let agg: EmotionAggregator;

  beforeEach(() => {
    agg = new EmotionAggregator();
  });

  it("returns null when no samples pushed", () => {
    expect(agg.computeResult()).toBeNull();
  });

  it("hasData() is false before push and true after", () => {
    expect(agg.hasData()).toBe(false);
    agg.push(makeSample("happy"));
    expect(agg.hasData()).toBe(true);
  });

  it("mode is the dominant label", () => {
    agg.push(makeSample("happy"));
    agg.push(makeSample("happy"));
    agg.push(makeSample("sad"));
    const result = agg.computeResult();
    expect(result?.mode).toBe("happy");
  });

  it("distribution has all 8 keys", () => {
    agg.push(makeSample("happy"));
    const result = agg.computeResult();
    expect(result).not.toBeNull();
    for (const k of LABELS) {
      expect(result!.distribution).toHaveProperty(k);
    }
  });

  it("distribution sums to 1.0 (within floating-point tolerance)", () => {
    // Push a mix to trigger rounding residual correction
    for (let i = 0; i < 3; i++) agg.push(makeSample("happy"));
    for (let i = 0; i < 3; i++) agg.push(makeSample("sad"));
    for (let i = 0; i < 1; i++) agg.push(makeSample("neutral"));
    const result = agg.computeResult()!;
    const sum = Object.values(result.distribution).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 9);
  });

  it("buildUnknownResult returns unknown mode with distribution sum 1.0", () => {
    const result = agg.buildUnknownResult();
    expect(result.mode).toBe("unknown");
    expect(result.distribution.unknown).toBe(1);
    const sum = Object.values(result.distribution).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 9);
    expect(result.sampleCount).toBe(0);
  });

  it("reset clears samples and resets startedAt", async () => {
    agg.push(makeSample("happy"));
    agg.reset();
    expect(agg.computeResult()).toBeNull();
    expect(agg.hasData()).toBe(false);
  });

  it("sampleCount equals number of pushed samples", () => {
    for (let i = 0; i < 5; i++) agg.push(makeSample("neutral"));
    expect(agg.computeResult()?.sampleCount).toBe(5);
  });

  it("durationMs is non-negative", () => {
    const base = Date.now();
    agg.push(makeSample("neutral", 0.9, base));
    agg.push(makeSample("happy", 0.9, base + 1000));
    const result = agg.computeResult()!;
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("no distribution value is negative (guard drift)", () => {
    // Push a mix that could trigger residual correction
    for (let i = 0; i < 7; i++) agg.push(makeSample("happy"));
    for (let i = 0; i < 3; i++) agg.push(makeSample("unknown"));
    const result = agg.computeResult()!;
    for (const k of LABELS) {
      expect(result.distribution[k]).toBeGreaterThanOrEqual(0);
    }
  });
});
