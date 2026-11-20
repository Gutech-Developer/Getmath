import type { EmotionInput } from "@/libs/emotion/types";
import type {
  TKAQuestionInput,
  TKAStatus,
} from "@/types/tka";

const DISALLOWED_MOBILE_UA_TOKENS = [
  "iphone",
  "ipad",
  "ipod",
  "android",
  "mobile",
  "tablet",
  "windows phone",
  "blackberry",
  "opera mini",
];

export function isMobileOrTabletUserAgent(userAgent?: string | null): boolean {
  const value = userAgent?.trim().toLowerCase();
  if (!value) return false;
  return DISALLOWED_MOBILE_UA_TOKENS.some((token) => value.includes(token));
}

export function formatTkaNumber(value: number, digits = 2): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function getScoreBucketLabel(
  score: number,
): "0-25" | "26-50" | "51-75" | "76-100" {
  if (score <= 25) return "0-25";
  if (score <= 50) return "26-50";
  if (score <= 75) return "51-75";
  return "76-100";
}

export function computeServerOffsetMs(
  effectiveDeadlineAt: string,
  remainingSeconds: number,
  nowMs = Date.now(),
): number {
  const deadlineMs = new Date(effectiveDeadlineAt).getTime();
  if (!Number.isFinite(deadlineMs)) return 0;
  return deadlineMs - remainingSeconds * 1000 - nowMs;
}

export function shouldSendEmotionBucket(emotion: EmotionInput): boolean {
  if (emotion.sampleCount <= 0) return false;
  return Object.values(emotion.distribution).some((value) => value > 0);
}

export function validateTkaQuestionDraft(
  question: TKAQuestionInput,
): string | null {
  if (!question.questionText.trim()) {
    return "Teks soal wajib diisi";
  }

  if (question.questionType === "MULTIPLE_CHOICE") {
    if ((question.statements?.length ?? 0) > 0) {
      return "Soal pilihan ganda tidak boleh memiliki pernyataan Benar/Salah";
    }
    const options = question.options ?? [];
    if (options.length < 2) {
      return "Soal pilihan ganda minimal memiliki 2 opsi";
    }
    if (options.some((option) => !option.optionText.trim())) {
      return "Teks opsi tidak boleh kosong";
    }
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      return "Soal pilihan ganda wajib memiliki tepat 1 kunci jawaban";
    }
    return null;
  }

  if (question.questionType === "MCMA") {
    if ((question.statements?.length ?? 0) > 0) {
      return "Soal MCMA tidak boleh memiliki pernyataan Benar/Salah";
    }
    const options = question.options ?? [];
    if (options.length < 2) {
      return "Soal MCMA minimal memiliki 2 opsi";
    }
    if (options.some((option) => !option.optionText.trim())) {
      return "Teks opsi tidak boleh kosong";
    }
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount < 1) {
      return "Soal MCMA wajib memiliki minimal 1 kunci jawaban";
    }
    return null;
  }

  if (question.questionType === "COMPLEX_TRUE_FALSE") {
    if ((question.options?.length ?? 0) > 0) {
      return "Soal Benar/Salah tidak boleh memiliki opsi pilihan ganda";
    }
    const statements = question.statements ?? [];
    if (statements.length < 1) {
      return "Soal Benar/Salah wajib memiliki minimal 1 pernyataan";
    }
    if (statements.some((statement) => !statement.statementText.trim())) {
      return "Teks pernyataan tidak boleh kosong";
    }
    if (statements.some((statement) => typeof statement.isTrue !== "boolean")) {
      return "Nilai Benar/Salah setiap pernyataan wajib dipilih";
    }
    return null;
  }

  return "Tipe soal tidak valid";
}

export function validateTkaPublishGate(input: {
  status?: TKAStatus;
  questions?: TKAQuestionInput[];
  startAt?: string;
  endAt?: string;
}): string | null {
  if (input.status !== "AVAILABLE") return null;

  if (!input.questions?.length) {
    return "TKA tidak dapat dipublikasikan tanpa minimal 1 soal";
  }
  if (!input.startAt || !input.endAt) {
    return "Tanggal dan jam mulai serta selesai wajib diisi saat mempublikasikan TKA";
  }

  const startMs = new Date(input.startAt).getTime();
  const endMs = new Date(input.endAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return "Jadwal TKA tidak valid";
  }
  if (startMs >= endMs) {
    return "Waktu mulai harus lebih awal dari waktu selesai";
  }
  return null;
}

export function toIsoOrUndefined(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTkaDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
