"use client";

import { useMutation } from "@tanstack/react-query";
import { gsPost } from "@/libs/api/gsAction";
import type { EmotionInput } from "@/libs/emotion/types";

// ── Submit emotion bucket (module SUBJECT atau remedial di luar siklus variant) ──

export interface SubmitEmotionBucketInput {
  context: "MODULE_LEARNING" | "REMEDIAL";
  attemptId?: string | null;
  emotion: EmotionInput;
}

/**
 * Fire-and-forget — server response selalu 202 Accepted.
 * Best-effort: tidak retry, tidak toast error (data analitik, bukan kritikal).
 */
export function useSubmitEmotionBucket(courseModuleId: string) {
  return useMutation<void, Error, SubmitEmotionBucketInput>({
    mutationFn: (input) =>
      gsPost<void>(`/progress/modules/${courseModuleId}/emotion-bucket`, input),
    retry: 0,
    // 503 = queue penuh → silent skip
    onError: () => {}, // intentional: jangan propagate error ke UI
  });
}
