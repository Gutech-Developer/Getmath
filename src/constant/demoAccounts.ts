export interface IDemoAccount {
  id: string;
  role: "guru" | "siswa";
  roleLabel: string;
  name: string;
  email: string;
  password: string;
  nis: string;
  avatarColor: string;
  initials: string;
  description: string;
  features: string[];
}

export const DEMO_ACCOUNTS: IDemoAccount[] = [
  // 1 Akun Guru
  {
    id: "guru-1",
    role: "guru",
    roleLabel: "Guru / Pengajar",
    name: "Budi Santoso",
    email: "budisantoso@gmail.com",
    password: "Budi1234$",
    nis: "-",
    avatarColor: "from-indigo-600 to-indigo-800",
    initials: "BS",
    description:
      "Akses penuh ke Learning Analytics Dashboard (LAD), monitoring emosi siswa saat belajar, pengelolaan modul E-LKPD, serta manajemen tes diagnostik & remedial.",
    features: [
      "Dashboard LAD Kelas & Siswa",
      "Analisis Tren Emosi Siswa",
      "Kelola E-LKPD & Bahan Ajar",
      "Kelola Tes Diagnostik & Remedial",
    ],
  },
  // 10 Akun Siswa
  {
    id: "siswa-1",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Andi Pratama",
    email: "andi@school.com",
    password: "Student1223#",
    nis: "24001",
    avatarColor: "from-sky-500 to-blue-700",
    initials: "AP",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-2",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Citra Lestari",
    email: "citra@school.com",
    password: "Student1223#",
    nis: "24002",
    avatarColor: "from-emerald-500 to-teal-700",
    initials: "CL",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-3",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Rian Hidayat",
    email: "rian@school.com",
    password: "Student1223#",
    nis: "24003",
    avatarColor: "from-amber-500 to-orange-600",
    initials: "RH",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-4",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Dewi Pertiwi",
    email: "dewi@school.com",
    password: "Student1223#",
    nis: "24004",
    avatarColor: "from-rose-500 to-pink-700",
    initials: "DP",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-5",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Eko Prasetyo",
    email: "eko@school.com",
    password: "Student1223#",
    nis: "24005",
    avatarColor: "from-violet-500 to-purple-700",
    initials: "EP",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-6",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Fani Rahmawati",
    email: "fani@school.com",
    password: "Student1223#",
    nis: "24006",
    avatarColor: "from-teal-500 to-cyan-700",
    initials: "FR",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-7",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Gilang Ramadhan",
    email: "gilang@school.com",
    password: "Student1223#",
    nis: "24007",
    avatarColor: "from-blue-600 to-indigo-700",
    initials: "GR",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-8",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Hany Nuraini",
    email: "hany@school.com",
    password: "Student1223#",
    nis: "24008",
    avatarColor: "from-pink-500 to-rose-600",
    initials: "HN",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-9",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Irfan Kurniawan",
    email: "irfan@school.com",
    password: "Student1223#",
    nis: "24009",
    avatarColor: "from-cyan-600 to-blue-800",
    initials: "IK",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
  {
    id: "siswa-10",
    role: "siswa",
    roleLabel: "Siswa",
    name: "Jasmine Putri",
    email: "jasmine@school.com",
    password: "Student1223#",
    nis: "24010",
    avatarColor: "from-fuchsia-500 to-purple-600",
    initials: "JP",
    description:
      "Pengalaman belajar interaktif, pengerjaan tes matematika dengan deteksi emosi wajah via kamera, serta materi remedial terarah.",
    features: [
      "Materi Interaktif & E-LKPD",
      "Tes Diagnostik dengan Deteksi Emosi",
      "Rekomendasi Remedial Adaptif",
    ],
  },
];
