import { describe, it, expect } from "vitest";
import { pickFeedback } from "@/libs/emotion/feedback";
import type { EmotionLabel } from "@/libs/emotion/types";

const ALL_LABELS: EmotionLabel[] = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "unknown",
];

describe("pickFeedback", () => {
  it("returns a non-empty string for every valid EmotionLabel", () => {
    for (const label of ALL_LABELS) {
      const msg = pickFeedback(label);
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it("returns string for sad", () => {
    const msg = pickFeedback("sad");
    expect(msg).toMatch(/menyerah|napas|soal|kesalahan|langkah|coba/i);
  });

  it("returns string for angry", () => {
    const msg = pickFeedback("angry");
    expect(msg).toMatch(/tenang|frustrasi|menantang|menyelesaikannya|soal/i);
  });

  it("returns string for happy", () => {
    const msg = pickFeedback("happy");
    expect(msg).toMatch(/mantap|semangat|energi|berikutnya/i);
  });

  it("returns string for fearful", () => {
    const msg = pickFeedback("fearful");
    expect(msg).toMatch(/salah|belajar|menantang|bisa/i);
  });

  it("returns string for neutral", () => {
    const msg = pickFeedback("neutral");
    expect(msg).toMatch(/fokus|keep going|konsistensi|kekuatan|lanjutkan|sedikit|bisa|menyelesaikan|tenang|perlahan|instingmu/i);
  });

  it("returns string for unknown", () => {
    const msg = pickFeedback("unknown");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns different messages over many calls for sad (random pool)", () => {
    // With 2 messages in sad pool, repeated calls should eventually differ
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(pickFeedback("sad"));
    }
    // Pool has >= 2 messages so we should see >= 2 distinct results
    expect(results.size).toBeGreaterThanOrEqual(2);
  });

  it("disgusted and surprised always return a string (single-item pools)", () => {
    // These have only 1 message — ensure no RNG edge case breaks them
    for (let i = 0; i < 10; i++) {
      expect(pickFeedback("disgusted").length).toBeGreaterThan(0);
      expect(pickFeedback("surprised").length).toBeGreaterThan(0);
    }
  });
});
