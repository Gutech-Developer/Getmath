import type {
  ForumActivityFilter,
  ForumOwnershipFilter,
  ForumSortOption,
  IForumAuthor,
  IForumDiscussion,
  IForumMaterial,
  IForumOption,
} from "@/types";

const MINUTE_IN_MS = 60 * 1000;

function minutesAgo(value: number): number {
  return Date.now() - value * MINUTE_IN_MS;
}

export const CURRENT_CLASS_FORUM_USER: IForumAuthor = {
  id: "student-andi-pratama",
  name: "Andi Pratama",
  role: "student",
  tone: "rose",
  isCurrentUser: true,
};

export const CLASS_FORUM_MATERIALS: IForumMaterial[] = [
  { id: "umum", label: "Umum", isGeneral: true },
  { id: "persamaan-kuadrat", label: "Persamaan Kuadrat" },
  { id: "fungsi-kuadrat", label: "Fungsi Kuadrat" },
  { id: "aljabar-linear", label: "Aljabar Linear" },
  { id: "geometri-dasar", label: "Geometri Dasar" },
];

export const FORUM_OWNERSHIP_FILTER_OPTIONS: IForumOption<ForumOwnershipFilter>[] =
  [
    { value: "all", label: "Semua Diskusi" },
    { value: "mine", label: "Diskusiku Sendiri" },
    { value: "others", label: "Diskusi Orang Lain" },
  ];

export const FORUM_ACTIVITY_FILTER_OPTIONS: IForumOption<ForumActivityFilter>[] =
  [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Hanya Aktif" },
    { value: "inactive", label: "Hanya Nonaktif" },
  ];

export const FORUM_SORT_OPTIONS: IForumOption<ForumSortOption>[] = [
  { value: "latest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "most-replied", label: "Paling Banyak Dibalas" },
  { value: "most-liked", label: "Paling Banyak Disukai" },
];

export const CLASS_FORUM_DISCUSSIONS: IForumDiscussion[] = [
  {
    id: "pengumuman-kuis-bab-3",
    content:
      "PENGUMUMAN: Kuis Bab 3 besok. Fokus pada rumus kuadrat dan pemfaktoran. Saya sudah mengunggah soal latihan di bagian materi. Tetap semangat belajar.",
    materialId: "umum",
    status: "active",
    isPinned: true,
    createdAt: minutesAgo(300),
    likesCount: 65,
    isLiked: true,
    author: {
      id: "teacher-sari-dewi",
      name: "Ibu Sari Dewi",
      role: "teacher",
      tone: "emerald",
    },
    replies: [
      {
        id: "reply-pengumuman-1",
        content: "Siap Bu. Saya sudah mulai latihan dari semalam.",
        createdAt: minutesAgo(240),
        likesCount: 8,
        isLiked: false,
        author: CURRENT_CLASS_FORUM_USER,
      },
    ],
  },
  {
    id: "tips-persamaan-kuadrat",
    content:
      "Tips cepat persamaan kuadrat: cek diskriminan terlebih dahulu. Kalau b kuadrat dikurangi empat a c kurang dari nol, berarti tidak ada akar real dan kita tidak perlu memaksakan pemfaktoran.",
    materialId: "persamaan-kuadrat",
    status: "active",
    isPinned: true,
    createdAt: minutesAgo(120),
    likesCount: 42,
    isLiked: false,
    author: {
      id: "teacher-budi-santoso",
      name: "Bpk. Budi Santoso",
      role: "teacher",
      tone: "amber",
    },
    replies: [
      {
        id: "reply-diskriminan-1",
        content: "Berarti kalau hasilnya nol, akarnya kembar ya Pak?",
        createdAt: minutesAgo(105),
        likesCount: 5,
        isLiked: false,
        author: {
          id: "student-alya-nadhira",
          name: "Alya Nadhira",
          role: "student",
          tone: "sky",
        },
      },
      {
        id: "reply-diskriminan-2",
        content: "Betul, kalau nol biasanya akar kembarnya sama.",
        createdAt: minutesAgo(95),
        likesCount: 9,
        isLiked: true,
        author: {
          id: "student-bima-setiawan",
          name: "Bima Setiawan",
          role: "student",
          tone: "violet",
        },
      },
      {
        id: "reply-diskriminan-3",
        content:
          "Saya baru sadar langkah ini bikin pengerjaan lebih cepat. Terima kasih, Pak.",
        createdAt: minutesAgo(90),
        likesCount: 4,
        isLiked: false,
        author: CURRENT_CLASS_FORUM_USER,
      },
    ],
  },
  {
    id: "cara-menghafal-rumus-abc",
    content:
      "Teman-teman, ada cara cepat untuk menghafal rumus abc tanpa tertukar tandanya? Saya masih sering salah waktu menyalin ke kertas kerja.",
    materialId: "persamaan-kuadrat",
    status: "active",
    isPinned: false,
    createdAt: minutesAgo(45),
    likesCount: 24,
    isLiked: false,
    author: CURRENT_CLASS_FORUM_USER,
    replies: [
      {
        id: "reply-rumus-abc-1",
        content:
          "Saya biasanya ingat bentuk minus b, lalu plus minus akar, dibagi dua a.",
        createdAt: minutesAgo(30),
        likesCount: 7,
        isLiked: false,
        author: {
          id: "student-luthfi-akbar",
          name: "Luthfi Akbar",
          role: "student",
          tone: "slate",
        },
      },
    ],
  },
  {
    id: "butuh-bantuan-fungsi-kuadrat",
    content:
      "Saya masih bingung menentukan titik puncak grafik fungsi kuadrat. Apakah ada langkah cepat supaya tidak salah saat ujian?",
    materialId: "fungsi-kuadrat",
    status: "active",
    isPinned: false,
    createdAt: minutesAgo(70),
    likesCount: 27,
    isLiked: true,
    author: {
      id: "student-nadia-putri",
      name: "Nadia Putri",
      role: "student",
      tone: "sky",
    },
    replies: [
      {
        id: "reply-titik-puncak-1",
        content:
          "Coba pakai rumus x sama dengan minus b per dua a dulu, lalu substitusi ke fungsi.",
        createdAt: minutesAgo(55),
        likesCount: 10,
        isLiked: false,
        author: {
          id: "student-bima-setiawan",
          name: "Bima Setiawan",
          role: "student",
          tone: "violet",
        },
      },
      {
        id: "reply-titik-puncak-2",
        content:
          "Iya, saya juga pakai cara itu. Biasanya lebih aman daripada menebak dari grafik.",
        createdAt: minutesAgo(51),
        likesCount: 3,
        isLiked: false,
        author: CURRENT_CLASS_FORUM_USER,
      },
      {
        id: "reply-titik-puncak-3",
        content:
          "Kalau mau, nanti saya kirim catatan ringkas yang saya buat sebelum kuis.",
        createdAt: minutesAgo(49),
        likesCount: 5,
        isLiked: true,
        author: {
          id: "student-alya-nadhira",
          name: "Alya Nadhira",
          role: "student",
          tone: "sky",
        },
      },
      {
        id: "reply-titik-puncak-4",
        content: "Wah boleh, itu akan sangat membantu. Terima kasih.",
        createdAt: minutesAgo(47),
        likesCount: 2,
        isLiked: false,
        author: {
          id: "student-nadia-putri",
          name: "Nadia Putri",
          role: "student",
          tone: "sky",
        },
      },
    ],
  },
  {
    id: "diskusi-kelompok-aljabar",
    content:
      "Kelompok saya masih mencari contoh soal tambahan untuk aljabar linear. Kalau ada yang punya rekomendasi sumber latihan, boleh dibagikan di sini.",
    materialId: "aljabar-linear",
    status: "inactive",
    isPinned: false,
    createdAt: minutesAgo(1440),
    likesCount: 18,
    isLiked: false,
    author: CURRENT_CLASS_FORUM_USER,
    replies: [],
  },
  {
    id: "rangkuman-geometri-dasar",
    content:
      "Saya unggah rangkuman geometri dasar pada folder materi tambahan. Silakan gunakan untuk review sebelum pertemuan berikutnya.",
    materialId: "geometri-dasar",
    status: "active",
    isPinned: false,
    createdAt: minutesAgo(180),
    likesCount: 16,
    isLiked: false,
    author: {
      id: "teacher-sari-dewi",
      name: "Ibu Sari Dewi",
      role: "teacher",
      tone: "emerald",
    },
    replies: [
      {
        id: "reply-geometri-1",
        content:
          "Terima kasih Bu. Saya pakai rangkumannya untuk belajar malam ini.",
        createdAt: minutesAgo(160),
        likesCount: 6,
        isLiked: false,
        author: {
          id: "student-haikal-dwi",
          name: "Haikal Dwi",
          role: "student",
          tone: "slate",
        },
      },
      {
        id: "reply-geometri-2",
        content:
          "File-nya rapi sekali, jadi lebih mudah membandingkan bangun datar dan bangun ruang.",
        createdAt: minutesAgo(145),
        likesCount: 4,
        isLiked: true,
        author: {
          id: "student-aulia-rahma",
          name: "Aulia Rahma",
          role: "student",
          tone: "rose",
        },
      },
    ],
  },
];
