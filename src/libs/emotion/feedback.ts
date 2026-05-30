import type { EmotionLabel } from "./types";

const messages: Record<EmotionLabel, string[]> = {
  sad: [
    "Jangan menyerah, kamu sudah berusaha keras. Coba pelan-pelan baca soalnya lagi.",
    "Tarik napas dulu — satu soal salah bukan akhir segalanya. Lanjut yuk!",
  ],
  angry: [
    "Tenang sebentar. Ambil 5 detik untuk napas dalam, baru lihat soal lagi.",
    "Frustrasi itu wajar. Coba istirahat sebentar kalau perlu.",
  ],
  fearful: [
    "Tidak apa-apa salah — ini bagian dari belajar. Kamu pasti bisa!",
    "Soal ini menantang ya. Ayo coba sekali lagi, kamu lebih tahu dari yang kamu kira.",
  ],
  disgusted: [
    "Materinya berat? Coba lihat pembahasan setelah ini agar lebih paham.",
  ],
  surprised: ["Kaget ya? Yuk baca soalnya pelan-pelan sekali lagi."],
  happy: ["Mantap! Tetap pertahankan semangatnya."],
  neutral: ["Kamu tetap fokus — keep going!"],
  unknown: ["Tetap semangat ya, lanjut ke soal berikutnya."],
};

export function pickFeedback(emotion: EmotionLabel): string {
  const pool = messages[emotion] ?? messages.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}
