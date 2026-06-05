import { describe, it, expect } from "vitest";
import { toEmotionInput } from "@/libs/emotion/normalize";
import type { EmotionResult } from "@/libs/emotion/types";

function makeResult(overrides: Partial<EmotionResult> = {}): EmotionResult {
  return {
    mode: "happy",
    distribution: {
      neutral: 0.1,
      happy: 0.7,
      sad: 0.05,
      angry: 0.03,
      fearful: 0.04,
      disgusted: 0.04,
      surprised: 0.04,
      unknown: 0,
    },
    sampleCount: 20,
    durationMs: 10000,
    startedAtMs: 1_000_000,
    endedAtMs: 1_010_000,
    ...overrides,
  };
}

describe("toEmotionInput", () => {
  it("copies mode correctly", () => {
    expect(toEmotionInput(makeResult({ mode: "sad" })).mode).toBe("sad");
  });

  it("copies distribution correctly", () => {
    const r = makeResult();
    const input = toEmotionInput(r);
    expect(input.distribution).toEqual(r.distribution);
  });

  it("copies sampleCount and durationMs", () => {
    const r = makeResult({ sampleCount: 42, durationMs: 5000 });
    const input = toEmotionInput(r);
    expect(input.sampleCount).toBe(42);
    expect(input.durationMs).toBe(5000);
  });

  it("converts startedAtMs to valid ISO 8601 startedAt string", () => {
    const r = makeResult({ startedAtMs: 1_748_700_000_000 });
    const input = toEmotionInput(r);
    expect(typeof input.startedAt).toBe("string");
    // Must parse back to same timestamp
    expect(new Date(input.startedAt!).getTime()).toBe(1_748_700_000_000);
    // Must be ISO format
    expect(input.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("converts endedAtMs to valid ISO 8601 endedAt string", () => {
    const r = makeResult({ endedAtMs: 1_748_700_010_000 });
    const input = toEmotionInput(r);
    expect(new Date(input.endedAt!).getTime()).toBe(1_748_700_010_000);
    expect(input.endedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("endedAt is after startedAt when endedAtMs > startedAtMs", () => {
    const r = makeResult({ startedAtMs: 1000, endedAtMs: 2000 });
    const input = toEmotionInput(r);
    expect(new Date(input.endedAt!).getTime()).toBeGreaterThan(
      new Date(input.startedAt!).getTime(),
    );
  });

  it("output has all required EmotionInput fields", () => {
    const input = toEmotionInput(makeResult());
    expect(input).toHaveProperty("mode");
    expect(input).toHaveProperty("distribution");
    expect(input).toHaveProperty("sampleCount");
    expect(input).toHaveProperty("durationMs");
    expect(input).toHaveProperty("startedAt");
    expect(input).toHaveProperty("endedAt");
  });

  it("works for unknown mode result", () => {
    const r = makeResult({
      mode: "unknown",
      distribution: {
        neutral: 0,
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        unknown: 1,
      },
      sampleCount: 0,
    });
    const input = toEmotionInput(r);
    expect(input.mode).toBe("unknown");
    expect(input.distribution.unknown).toBe(1);
    expect(input.sampleCount).toBe(0);
  });
});
