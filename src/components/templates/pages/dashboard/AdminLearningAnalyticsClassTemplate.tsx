import AdminLearningAnalyticsClassContent, {
  IClassLearningAnalyticsDetail,
} from "@/components/organisms/AdminLearningAnalyticsClassContent";

const LEARNING_ANALYTICS_CLASS_DATA: IClassLearningAnalyticsDetail[] = [
  {
    slug: "matematika-wajib-kelas-x",
    className: "Matematika Wajib Kelas X",
    teacherName: "Ibu Rahma",
    studentCount: 28,
    averageScore: 80,
    passedCount: 22,
    remedialCount: 6,
    progress: 80,
    classCode: "MATH-X-001",
    gradeLabel: "Umum",
    semesterLabel: "Ganjil 2024/2025",
    subjectLabel: "Matematika",
    defaultViewType: "Laporan",
    reportSummaryCards: [
      {
        label: "Total Siswa",
        value: "28",
      },
      {
        label: "Sudah Masuk Kelas",
        value: "28",
        hint: "dari 28",
      },
      {
        label: "Selesai Tes",
        value: "24",
        hint: "dari 28",
      },
      {
        label: "Tingkat Kelulusan",
        value: "80%",
        valueClassName: "text-[#F97316]",
      },
    ],
    scoreBuckets: [
      { label: "< 50", value: 0, color: "#94A3B8" },
      { label: "50-64", value: 0, color: "#F59E0B" },
      { label: "65-74", value: 1, color: "#EAB308" },
      { label: "75-84", value: 2, color: "#22C55E" },
      { label: "85-100", value: 2, color: "#3B82F6" },
    ],
    emotionSegments: [
      { label: "Fokus", value: 4, color: "#3B82F6" },
      { label: "Senang", value: 3, color: "#22C55E" },
      { label: "Bingung", value: 2, color: "#F59E0B" },
      { label: "Tegang", value: 1, color: "#EF4444" },
    ],
    materials: [
      {
        id: "material-lad-1",
        title: "Pengantar Persamaan Kuadrat",
        updatedAt: "12 Apr 2026",
        type: "Materi",
        status: "Aktif",
      },
      {
        id: "material-lad-2",
        title: "Video: Bentuk Akar dan Diskriminan",
        updatedAt: "10 Apr 2026",
        type: "Video",
        status: "Aktif",
      },
      {
        id: "material-lad-3",
        title: "Tes Formatif Bab 1",
        updatedAt: "08 Apr 2026",
        type: "Tes",
        status: "Draft",
      },
    ],
    elkpdItems: [
      {
        id: "elkpd-lad-1",
        title: "E-LKPD 1 - Menentukan Akar Persamaan",
        dueLabel: "18 Apr 2026",
        submittedCount: 21,
        status: "Aktif",
      },
      {
        id: "elkpd-lad-2",
        title: "E-LKPD 2 - Pemodelan Soal Cerita",
        dueLabel: "24 Apr 2026",
        submittedCount: 16,
        status: "Aktif",
      },
    ],
    students: [
      {
        id: "student-1",
        fullname: "Ahmad Rizki",
        nis: "2310001",
        score: 90,
        status: "Lulus",
      },
      {
        id: "student-2",
        fullname: "Budi Santoso",
        nis: "2310002",
        score: 84,
        status: "Lulus",
      },
      {
        id: "student-3",
        fullname: "Citra Dewi",
        nis: "2310003",
        score: 76,
        status: "Lulus",
      },
      {
        id: "student-4",
        fullname: "Dimas Prasetyo",
        nis: "2310004",
        score: 68,
        status: "Remedial",
      },
      {
        id: "student-5",
        fullname: "Eka Putri",
        nis: "2310005",
        score: 73,
        status: "Remedial",
      },
    ],
  },
  {
    slug: "matematika-peminatan-xi-ipa",
    className: "Matematika Peminatan XI IPA",
    teacherName: "Bpk. Budi Santoso",
    studentCount: 28,
    averageScore: 77,
    passedCount: 22,
    remedialCount: 6,
    progress: 55,
    students: [
      {
        id: "student-6",
        fullname: "Rina Mahardika",
        nis: "2411001",
        score: 79,
        status: "Lulus",
      },
      {
        id: "student-7",
        fullname: "Farhan Akbar",
        nis: "2411002",
        score: 61,
        status: "Remedial",
      },
      {
        id: "student-8",
        fullname: "Nabila Putri",
        nis: "2411003",
        score: 88,
        status: "Lulus",
      },
      {
        id: "student-9",
        fullname: "Dimas Pradana",
        nis: "2411004",
        score: 74,
        status: "Lulus",
      },
      {
        id: "student-10",
        fullname: "Salma Aulia",
        nis: "2411005",
        score: 59,
        status: "Remedial",
      },
    ],
  },
  {
    slug: "statistika-probabilitas",
    className: "Statistika & Probabilitas",
    teacherName: "Ibu Sari Dewi",
    studentCount: 24,
    averageScore: 85,
    passedCount: 22,
    remedialCount: 2,
    progress: 90,
    students: [
      {
        id: "student-11",
        fullname: "Rafi Nugraha",
        nis: "2512001",
        score: 90,
        status: "Lulus",
      },
      {
        id: "student-12",
        fullname: "Aisyah Zahra",
        nis: "2512002",
        score: 87,
        status: "Lulus",
      },
      {
        id: "student-13",
        fullname: "Khalid Ramadhan",
        nis: "2512003",
        score: 83,
        status: "Lulus",
      },
      {
        id: "student-14",
        fullname: "Putri Melati",
        nis: "2512004",
        score: 69,
        status: "Remedial",
      },
      {
        id: "student-15",
        fullname: "Iqbal Maulana",
        nis: "2512005",
        score: 94,
        status: "Lulus",
      },
    ],
  },
  {
    slug: "geometri-trigonometri",
    className: "Geometri & Trigonometri",
    teacherName: "Bpk. Dani Wirawan",
    studentCount: 20,
    averageScore: 74,
    passedCount: 15,
    remedialCount: 5,
    progress: 40,
    students: [
      {
        id: "student-16",
        fullname: "Yusuf Kurniawan",
        nis: "2613001",
        score: 76,
        status: "Lulus",
      },
      {
        id: "student-17",
        fullname: "Maya Saraswati",
        nis: "2613002",
        score: 63,
        status: "Remedial",
      },
      {
        id: "student-18",
        fullname: "Fikri Hidayat",
        nis: "2613003",
        score: 58,
        status: "Remedial",
      },
      {
        id: "student-19",
        fullname: "Nadia Permata",
        nis: "2613004",
        score: 82,
        status: "Lulus",
      },
      {
        id: "student-20",
        fullname: "Rendy Saputra",
        nis: "2613005",
        score: 71,
        status: "Lulus",
      },
    ],
  },
];

export default function AdminLearningAnalyticsClassTemplate({
  slug,
}: {
  slug: string;
}) {
  const classDetail = LEARNING_ANALYTICS_CLASS_DATA.find(
    (classItem) => classItem.slug === slug,
  );

  const fallbackDetail: IClassLearningAnalyticsDetail = {
    slug,
    className: slug
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    teacherName: "Guru Tidak Diketahui",
    studentCount: 5,
    averageScore: 75,
    passedCount: 3,
    remedialCount: 2,
    progress: 64,
    students: [
      {
        id: "fallback-student-1",
        fullname: "Ahmad Rizki",
        nis: "2310001",
        score: 85,
        status: "Lulus",
      },
      {
        id: "fallback-student-2",
        fullname: "Siti Nurhaliza",
        nis: "2310002",
        score: 72,
        status: "Lulus",
      },
      {
        id: "fallback-student-3",
        fullname: "Budi Santoso",
        nis: "2310003",
        score: 58,
        status: "Remedial",
      },
      {
        id: "fallback-student-4",
        fullname: "Dewi Anggraini",
        nis: "2310004",
        score: 92,
        status: "Lulus",
      },
      {
        id: "fallback-student-5",
        fullname: "Eko Prasetyo",
        nis: "2310005",
        score: 65,
        status: "Remedial",
      },
    ],
  };

  return (
    <AdminLearningAnalyticsClassContent
      classDetail={classDetail ?? fallbackDetail}
    />
  );
}
