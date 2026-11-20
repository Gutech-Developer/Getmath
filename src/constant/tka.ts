import type { EmotionLabel } from "@/libs/emotion/types";
import type { TKAQuestionType, TKAStatus } from "@/types/tka";

export const TKA_STATUS_LABEL: Record<TKAStatus, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Tersedia",
  COMPLETED: "Selesai",
};

export const TKA_STATUS_BADGE: Record<
  TKAStatus,
  "warning" | "success" | "info"
> = {
  DRAFT: "warning",
  AVAILABLE: "success",
  COMPLETED: "info",
};

export const TKA_QUESTION_TYPE_LABEL: Record<TKAQuestionType, string> = {
  MULTIPLE_CHOICE: "Pilihan Ganda",
  MCMA: "MCMA",
  COMPLEX_TRUE_FALSE: "Benar/Salah Kompleks",
};

export const TKA_EMOTION_LABEL: Record<EmotionLabel, string> = {
  neutral: "Netral",
  happy: "Senang",
  sad: "Sedih",
  angry: "Marah",
  fearful: "Takut",
  disgusted: "Jijik",
  surprised: "Terkejut",
  unknown: "Tidak Terdeteksi",
};

export const TKA_EMOTION_COLOR: Record<EmotionLabel, string> = {
  neutral: "#3B82F6",
  happy: "#22C55E",
  sad: "#6366F1",
  angry: "#EF4444",
  fearful: "#F59E0B",
  disgusted: "#8B5CF6",
  surprised: "#06B6D4",
  unknown: "#94A3B8",
};
