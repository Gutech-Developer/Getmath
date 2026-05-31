import { describe, it, expect } from "vitest";
import { toEmotionInput } from "../normalize";
import type { EmotionResult } from "../types";

const EIGHT_KEYS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "unknown",
] as const;

function makeResult(overrides: Partial<EmotionResult> = {}): EmotionResult {
  return {
    mode: "happy",
    distribution: {
      neutral: 0.1,
      happy: 0.6,
      sad: 0.05,
      angry: 0.05,
      fearful: 0.05,
      disgusted: 0.05,
      surprised: 0.05,
      unknown: 0.05,
    },
    sampleCount: 10,
    durationMs: 5000,
    startedAtMs: 1_700_000_000_000,
    endedAtMs: 1_700_000_005_000,
    ...overrides,
  };
}

describe("toEmotionInput", () => {
  it("contains all 8 keys in distribution", () => {
    const input = toEmotionInput(makeResult());
    for (const k of EIGHT_KEYS) {
      expect(input.distribution).toHaveProperty(k);
    }
  });

  it("startedAt is a valid ISO 8601 string", () => {
    const input = toEmotionInput(makeResult());
    expect(input.startedAt).toBeDefined();
    expect(() => new Date(input.startedAt!)).not.toThrow();
    expect(new Date(input.startedAt!).toISOString()).toBe(input.startedAt);
  });

  it("endedAt is a valid ISO 8601 string", () => {
    const input = toEmotionInput(makeResult());
    expect(input.endedAt).toBeDefined();
    expect(new Date(input.endedAt!).toISOString()).toBe(input.endedAt);
  });

  it("startedAt < endedAt when endedAtMs > startedAtMs", () => {
    const input = toEmotionInput(makeResult());
    expect(new Date(input.startedAt!).getTime()).toBeLessThan(
      new Date(input.endedAt!).getTime(),
    );
  });

  it("mode is passed through unchanged", () => {
    const input = toEmotionInput(makeResult({ mode: "sad" }));
    expect(input.mode).toBe("sad");
  });

  it("sampleCount and durationMs are passed through", () => {
    const input = toEmotionInput(
      makeResult({ sampleCount: 42, durationMs: 3000 }),
    );
    expect(input.sampleCount).toBe(42);
    expect(input.durationMs).toBe(3000);
  });

  it("distribution values sum to ≈ 1.0", () => {
    const input = toEmotionInput(makeResult());
    const sum = Object.values(input.distribution).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });
});
