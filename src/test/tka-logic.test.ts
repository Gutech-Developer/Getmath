import { describe, expect, it } from "vitest";

import type { EmotionInput } from "@/libs/emotion/types";
import type { TKAQuestionInput } from "@/types/tka";
import {
  computeServerOffsetMs,
  getScoreBucketLabel,
  isMobileOrTabletUserAgent,
  shouldSendEmotionBucket,
  validateTkaPublishGate,
  validateTkaQuestionDraft,
} from "@/utils/tka";
import { formatDiagnosticTime } from "@/utils";

function emotion(overrides: Partial<EmotionInput> = {}): EmotionInput {
  return {
    mode: "neutral",
    distribution: {
      neutral: 1,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      unknown: 0,
    },
    sampleCount: 10,
    durationMs: 1000,
    ...overrides,
  };
}

function question(
  overrides: Partial<TKAQuestionInput> = {},
): TKAQuestionInput {
  return {
    questionType: "MULTIPLE_CHOICE",
    questionText: "Soal",
    options: [
      { optionText: "A", isCorrect: true },
      { optionText: "B", isCorrect: false },
    ],
    ...overrides,
  };
}

describe("TKA logic helpers", () => {
  it("maps score boundaries to continuous buckets", () => {
    expect(getScoreBucketLabel(0)).toBe("0-25");
    expect(getScoreBucketLabel(25)).toBe("0-25");
    expect(getScoreBucketLabel(25.01)).toBe("26-50");
    expect(getScoreBucketLabel(25.58)).toBe("26-50");
    expect(getScoreBucketLabel(50)).toBe("26-50");
    expect(getScoreBucketLabel(50.82)).toBe("51-75");
    expect(getScoreBucketLabel(75)).toBe("51-75");
    expect(getScoreBucketLabel(75.56)).toBe("76-100");
    expect(getScoreBucketLabel(100)).toBe("76-100");
  });

  it("reuses the existing duration formatter", () => {
    expect(formatDiagnosticTime(0)).toBe("00:00");
    expect(formatDiagnosticTime(59)).toBe("00:59");
    expect(formatDiagnosticTime(60)).toBe("01:00");
    expect(formatDiagnosticTime(3661)).toBe("61:01");
  });

  it("computes server offset from deadline and remaining seconds", () => {
    const now = Date.parse("2026-11-20T08:05:00Z");
    const offset = computeServerOffsetMs(
      "2026-11-20T09:05:00Z",
      3600,
      now,
    );
    expect(offset).toBe(0);
  });

  it("detects mobile and tablet user agents", () => {
    expect(
      isMobileOrTabletUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      ),
    ).toBe(true);
    expect(
      isMobileOrTabletUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari",
      ),
    ).toBe(true);
    expect(
      isMobileOrTabletUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126",
      ),
    ).toBe(false);
  });

  it("skips empty emotion buckets", () => {
    expect(shouldSendEmotionBucket(emotion({ sampleCount: 0 }))).toBe(false);
    expect(
      shouldSendEmotionBucket(
        emotion({
          distribution: {
            neutral: 0,
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            disgusted: 0,
            surprised: 0,
            unknown: 0,
          },
        }),
      ),
    ).toBe(false);
    expect(shouldSendEmotionBucket(emotion())).toBe(true);
    expect(
      shouldSendEmotionBucket(
        emotion({
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
        }),
      ),
    ).toBe(true);
  });

  it("validates the three question types", () => {
    expect(validateTkaQuestionDraft(question())).toBeNull();
    expect(
      validateTkaQuestionDraft(
        question({
          options: [
            { optionText: "A", isCorrect: true },
            { optionText: "B", isCorrect: true },
          ],
        }),
      ),
    ).toContain("tepat 1");
    expect(
      validateTkaQuestionDraft(
        question({
          questionType: "MCMA",
          options: [
            { optionText: "A", isCorrect: true },
            { optionText: "B", isCorrect: true },
          ],
        }),
      ),
    ).toBeNull();
    expect(
      validateTkaQuestionDraft(
        question({
          questionType: "MCMA",
          options: [
            { optionText: "A", isCorrect: false },
            { optionText: "B", isCorrect: false },
          ],
        }),
      ),
    ).toContain("minimal 1");
    expect(
      validateTkaQuestionDraft({
        questionType: "COMPLEX_TRUE_FALSE",
        questionText: "Soal",
        statements: [
          { statementText: "Pernyataan", isTrue: true },
        ],
      }),
    ).toBeNull();
    expect(
      validateTkaQuestionDraft({
        questionType: "COMPLEX_TRUE_FALSE",
        questionText: "Soal",
        statements: [],
      }),
    ).toContain("minimal 1");
  });

  it("validates the publish gate", () => {
    expect(
      validateTkaPublishGate({
        status: "AVAILABLE",
        questions: [question()],
        startAt: "2026-11-20T08:00:00Z",
        endAt: "2026-11-20T09:00:00Z",
      }),
    ).toBeNull();
    expect(
      validateTkaPublishGate({
        status: "AVAILABLE",
        questions: [],
        startAt: "2026-11-20T08:00:00Z",
        endAt: "2026-11-20T09:00:00Z",
      }),
    ).toContain("minimal 1");
    expect(
      validateTkaPublishGate({
        status: "AVAILABLE",
        questions: [question()],
        startAt: "2026-11-20T09:00:00Z",
        endAt: "2026-11-20T08:00:00Z",
      }),
    ).toContain("lebih awal");
    expect(
      validateTkaPublishGate({
        status: "DRAFT",
        questions: [],
      }),
    ).toBeNull();
  });
});
