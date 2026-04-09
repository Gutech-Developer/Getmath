import type { IDiagnosticQuestion } from "@/types";

export const DIAGNOSTIC_DURATION_SECONDS = 15 * 60;
export const DIAGNOSTIC_KKM_MINIMUM_SCORE = 75;

export const CAMERA_REQUIREMENTS = [
  "Gunakan perangkat dengan kamera aktif selama tes.",
  "Pastikan wajah terlihat jelas dan pencahayaan cukup.",
  "Izinkan browser mengakses kamera sebelum mulai.",
];

export const DIAGNOSTIC_RULES = [
  "Kerjakan soal secara mandiri tanpa membuka tab lain.",
  "Pilih jawaban paling tepat pada setiap soal.",
  "Tes akan berakhir otomatis saat waktu habis.",
  "Pastikan koneksi internet stabil selama pengerjaan.",
];

export const DIAGNOSTIC_QUESTIONS: IDiagnosticQuestion[] = [
  {
    id: "q-1",
    topic: "Fungsi Kuadrat",
    typeLabel: "Pilihan Ganda",
    difficulty: "Sedang",
    prompt: "Hasil dari x² + 5x + 6 = 0 adalah ...",
    correctOptionId: "q-1-a",
    discussion:
      "Faktorkan persamaan menjadi (x + 2)(x + 3) = 0. Berdasarkan sifat hasil kali nol, diperoleh x = -2 atau x = -3.",
    options: [
      { id: "q-1-a", label: "A", text: "x = -2 atau x = -3" },
      { id: "q-1-b", label: "B", text: "x = 2 atau x = 3" },
      { id: "q-1-c", label: "C", text: "x = -1 atau x = -6" },
      { id: "q-1-d", label: "D", text: "x = 1 atau x = 6" },
    ],
  },
  {
    id: "q-2",
    topic: "Fungsi Kuadrat",
    typeLabel: "Pilihan Ganda",
    difficulty: "Mudah",
    prompt: "Nilai diskriminan dari x² - 4x + 4 = 0 adalah ...",
    correctOptionId: "q-2-b",
    discussion:
      "Gunakan rumus diskriminan D = b² - 4ac. Dengan a = 1, b = -4, c = 4 maka D = (-4)² - 4(1)(4) = 16 - 16 = 0.",
    options: [
      { id: "q-2-a", label: "A", text: "-4" },
      { id: "q-2-b", label: "B", text: "0" },
      { id: "q-2-c", label: "C", text: "4" },
      { id: "q-2-d", label: "D", text: "8" },
    ],
  },
  {
    id: "q-3",
    topic: "Fungsi Kuadrat",
    typeLabel: "Pilihan Ganda",
    difficulty: "Sedang",
    prompt: "Grafik fungsi y = x² - 2x - 3 memotong sumbu x di titik ...",
    correctOptionId: "q-3-b",
    discussion:
      "Titik potong sumbu x diperoleh saat y = 0, sehingga x² - 2x - 3 = 0. Faktorkan menjadi (x - 3)(x + 1) = 0, jadi x = 3 atau x = -1.",
    options: [
      { id: "q-3-a", label: "A", text: "(1, 0) dan (3, 0)" },
      { id: "q-3-b", label: "B", text: "(-1, 0) dan (3, 0)" },
      { id: "q-3-c", label: "C", text: "(-3, 0) dan (1, 0)" },
      { id: "q-3-d", label: "D", text: "(-2, 0) dan (2, 0)" },
    ],
  },
  {
    id: "q-4",
    topic: "Aljabar",
    typeLabel: "Pilihan Ganda",
    difficulty: "Mudah",
    prompt: "Bentuk sederhana dari (2x + 3)(x – 1) adalah ...",
    correctOptionId: "q-4-b",
    discussion:
      "Gunakan sifat distribusi: (2x + 3)(x – 1) = 2x² – 2x + 3x – 3 = 2x² + x – 3.",
    options: [
      { id: "q-4-a", label: "A", text: "2x² – x – 3" },
      { id: "q-4-b", label: "B", text: "2x² + x – 3" },
      { id: "q-4-c", label: "C", text: "2x² + 5x – 3" },
      { id: "q-4-d", label: "D", text: "2x² – 5x – 3" },
    ],
  },
  {
    id: "q-5",
    topic: "Geometri",
    typeLabel: "Pilihan Ganda",
    difficulty: "Sulit",
    prompt:
      "Jumlah semua sudut dalam sebuah segi empat (quadrilateral) adalah ...",
    correctOptionId: "q-5-c",
    discussion:
      "Jumlah sudut dalam suatu poligon n sisi = (n – 2) × 180°. Untuk segi empat (n = 4): (4 – 2) × 180° = 360°.",
    options: [
      { id: "q-5-a", label: "A", text: "180°" },
      { id: "q-5-b", label: "B", text: "270°" },
      { id: "q-5-c", label: "C", text: "360°" },
      { id: "q-5-d", label: "D", text: "540°" },
    ],
  },
];
