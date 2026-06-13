import type { EmotionLabel } from "./types";

const messages: Record<EmotionLabel, string[]> = {
  sad: ["Jangan menyerah! Saya tahu kamu bisa!"],
  angry: ["Sabar! Kamu pasti menyelesaikannya dengan baik!"],
  fearful: ["Saya tahu kamu pasti bisa! Jangan takut!"],
  disgusted: ["Jangan bosan! Kamu pasti menemukan hal menarik nantinya!"],
  surprised: ["Waah! Ayo eksplor lebih jauh lagi!"],
  happy: ["Aku senang melihat kamu senang!"],
  neutral: ["Bagus, kamu cukup fokus!"],
  unknown: [
    "Tetap semangat ya, lanjut ke soal berikutnya.",
    "Jangan menyerah! Setiap soal adalah kesempatan untuk belajar.",
    "Kamu sudah berusaha — itu yang terpenting. Lanjut!",
    "Coba lagi dengan kepala dingin, pasti bisa!",
  ],
};

export function pickFeedback(emotion: EmotionLabel): string {
  const pool = messages[emotion] ?? messages.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}
