"use client";

import { useEffect, useRef } from "react";
import { useEmotionDetector } from "./useEmotionDetector";
import { useSubmitEmotionBucket } from "./useGsEmotion";
import { toEmotionInput } from "@/libs/emotion/normalize";

interface UseEmotionDetectorBucketedOptions {
  /** Wajib SUBJECT — pemanggil harus pastikan ini courseModule SUBJECT */
  courseModuleId: string;
  enabled: boolean;
  /** Interval flush bucket dalam ms. Default 30_000 (30 detik). */
  bucketMs?: number;
}

/**
 * Turunan dari useEmotionDetector untuk module SUBJECT.
 * Auto-flush hasil agregat setiap bucketMs ke endpoint emotion-bucket.
 * Juga flush final saat unmount (best-effort).
 */
export function useEmotionDetectorBucketed(
  opts: UseEmotionDetectorBucketedOptions,
) {
  const { courseModuleId, enabled, bucketMs = 30_000 } = opts;
  const detector = useEmotionDetector({ enabled, intervalMs: 1000 });
  const submitBucket = useSubmitEmotionBucket(courseModuleId);
  const flushTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!detector.ready || !enabled) return;

    const tick = () => {
      const result = detector.flushAndReset();
      if (result && result.sampleCount > 0) {
        submitBucket.mutate({
          context: "MODULE_LEARNING",
          attemptId: null,
          emotion: toEmotionInput(result),
        });
      }
      flushTimer.current = window.setTimeout(tick, bucketMs);
    };

    flushTimer.current = window.setTimeout(tick, bucketMs);

    return () => {
      if (flushTimer.current !== null) {
        window.clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
      // Flush final saat unmount (best-effort, jangan await)
      const final = detector.flushAndReset();
      if (final && final.sampleCount > 0) {
        submitBucket.mutate({
          context: "MODULE_LEARNING",
          attemptId: null,
          emotion: toEmotionInput(final),
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detector.ready, enabled, bucketMs, courseModuleId]);

  return detector;
}
