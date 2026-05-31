export type EmotionLabel =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "disgusted"
  | "surprised"
  | "unknown";

// 7-label vector dari face-api (tanpa unknown)
export interface EmotionVector {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

export interface EmotionSample {
  label: EmotionLabel;
  confidence: number;
  vector: EmotionVector;
  ts: number; // Date.now() saat sampel diambil
}

// Kontrak backend — 8 key WAJIB ada, total ≈ 1.0
export interface EmotionDistribution {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  unknown: number;
}

// Bentuk objek yang dikirim ke API (lihat spec §4)
export interface EmotionInput {
  mode: EmotionLabel;
  distribution: EmotionDistribution;
  sampleCount: number;
  durationMs: number;
  startedAt?: string; // ISO 8601
  endedAt?: string; // ISO 8601
}

// Bentuk internal sebelum di-serialize ke EmotionInput
export interface EmotionResult {
  mode: EmotionLabel;
  distribution: EmotionDistribution;
  sampleCount: number;
  durationMs: number;
  startedAtMs: number;
  endedAtMs: number;
}
