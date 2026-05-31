import type { EmotionLabel } from "./types";

const messages: Record<EmotionLabel, string[]> = {
  sad: [
    "Jangan menyerah, kamu sudah berusaha keras. Coba pelan-pelan baca soalnya lagi.",
    "Tarik napas dulu — satu soal salah bukan akhir segalanya. Lanjut yuk!",
    "Setiap kesalahan adalah langkah maju. Yuk coba lagi!",
  ],
  angry: [
    "Tenang sebentar. Ambil 5 detik untuk napas dalam, baru lihat soal lagi.",
    "Frustrasi itu wajar. Coba istirahat sebentar kalau perlu.",
    "Soal ini memang menantang — tapi kamu bisa menyelesaikannya!",
  ],
  fearful: [
    "Tidak apa-apa salah — ini bagian dari belajar. Kamu pasti bisa!",
    "Soal ini menantang ya. Ayo coba sekali lagi, kamu lebih tahu dari yang kamu kira.",
    "Percaya diri! Kamu sudah sampai sejauh ini, artinya kamu mampu.",
  ],
  disgusted: [
    "Materinya berat? Coba lihat pembahasan setelah ini agar lebih paham.",
    "Tenang, kamu pasti bisa menaklukkan soal ini.",
  ],
  surprised: [
    "Kaget ya? Yuk baca soalnya pelan-pelan sekali lagi.",
    "Soal trik! Baca baik-baik setiap kata di soal.",
  ],
  happy: [
    "Mantap! Tetap pertahankan semangatnya.",
    "Semangat yang bagus! Terus lanjutkan.",
    "Kamu tampak penuh energi — manfaatkan itu untuk soal berikutnya!",
  ],
  neutral: [
    "Kamu tetap fokus — keep going!",
    "Tenang dan fokus — itu kunci menjawab soal dengan baik.",
    "Konsistensi adalah kekuatan. Lanjutkan!",
    "Sedikit lagi, kamu pasti bisa menyelesaikan ini.",
    "Tetap tenang, baca soal perlahan, dan percaya instingmu.",
  ],
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
