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
    prompt: "Hasil dari x^2 + 5x + 6 = 0 adalah ...",
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
    prompt: "Nilai diskriminan dari x^2 - 4x + 4 = 0 adalah ...",
    correctOptionId: "q-2-b",
    discussion:
      "Gunakan rumus diskriminan D = b^2 - 4ac. Dengan a = 1, b = -4, c = 4 maka D = (-4)^2 - 4(1)(4) = 16 - 16 = 0.",
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
    prompt: "Grafik fungsi y = x^2 - 2x - 3 memotong sumbu x di titik ...",
    correctOptionId: "q-3-c",
    discussion:
      "Titik potong sumbu x diperoleh saat y = 0, sehingga x^2 - 2x - 3 = 0. Faktorkan menjadi (x - 3)(x + 1) = 0, jadi x = 3 atau x = -1.",
    options: [
      { id: "q-3-a", label: "A", text: "(1, 0) dan (3, 0)" },
      { id: "q-3-b", label: "B", text: "(-1, 0) dan (3, 0)" },
      { id: "q-3-c", label: "C", text: "(-3, 0) dan (1, 0)" },
      { id: "q-3-d", label: "D", text: "(-2, 0) dan (2, 0)" },
    ],
  },
];
