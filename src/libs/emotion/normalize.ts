import type { EmotionInput, EmotionResult } from "./types";

/**
 * Bridge dari EmotionResult (bentuk internal) ke EmotionInput (kontrak backend).
 * Pastikan tidak ada kode yang langsung manipulasi shape DTO.
 */
export function toEmotionInput(r: EmotionResult): EmotionInput {
  return {
    mode: r.mode,
    distribution: r.distribution,
    sampleCount: r.sampleCount,
    durationMs: r.durationMs,
    startedAt: new Date(r.startedAtMs).toISOString(),
    endedAt: new Date(r.endedAtMs).toISOString(),
  };
}
