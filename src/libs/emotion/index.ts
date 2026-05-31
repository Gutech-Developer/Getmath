/**
 * Feature detection: apakah browser mendukung emotion detection?
 * Pakai sebelum mount useEmotionDetector.
 */
export function isEmotionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.Worker &&
    window.OffscreenCanvas &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    "createImageBitmap" in window,
  );
}

export type {
  EmotionLabel,
  EmotionInput,
  EmotionResult,
  EmotionSample,
  EmotionVector,
  EmotionDistribution,
} from "./types";
export { EmotionAggregator } from "./EmotionAggregator";
export { EmotionSampler } from "./EmotionSampler";
export { toEmotionInput } from "./normalize";
export { pickFeedback } from "./feedback";
