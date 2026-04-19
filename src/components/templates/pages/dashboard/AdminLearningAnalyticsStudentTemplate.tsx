import type { IStudentLearningAnalyticsDetail } from "@/components/organisms/AdminLearningAnalyticsStudentContent";
import ClassLADPageTemplate from "@/components/templates/pages/classroom/ClassLADPageTemplate";

interface IClassStudentAnalyticsCollection {
  slug: string;
  students: IStudentLearningAnalyticsDetail[];
}

const STUDENT_ANALYTICS_DATA: IClassStudentAnalyticsCollection[] = [
  {
    slug: "matematika-wajib-kelas-x",
    students: [
      {
        id: "student-1",
        fullname: "Ahmad Rizki",
        nis: "2310001",
        score: 85,
        status: "Lulus",
        progress: 90,
        dominantEmotion: "Fokus",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 70 - Remedial" },
          { title: "Percobaan 2", note: "Nilai 85 - Lulus" },
        ],
      },
      {
        id: "student-2",
        fullname: "Siti Nurhaliza",
        nis: "2310002",
        score: 72,
        status: "Lulus",
        progress: 84,
        dominantEmotion: "Senang",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 65 - Remedial" },
          { title: "Percobaan 2", note: "Nilai 72 - Lulus" },
        ],
      },
      {
        id: "student-3",
        fullname: "Budi Santoso",
        nis: "2310003",
        score: 58,
        status: "Remedial",
        progress: 52,
        dominantEmotion: "Bingung",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 58 - Remedial" },
          { title: "Percobaan 2", note: "Menunggu remedial" },
        ],
      },
      {
        id: "student-4",
        fullname: "Dewi Anggraini",
        nis: "2310004",
        score: 92,
        status: "Lulus",
        progress: 96,
        dominantEmotion: "Fokus",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 88 - Lulus" },
          { title: "Percobaan 2", note: "Nilai 92 - Lulus" },
        ],
      },
      {
        id: "student-5",
        fullname: "Eko Prasetyo",
        nis: "2310005",
        score: 65,
        status: "Remedial",
        progress: 61,
        dominantEmotion: "Tegang",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 60 - Remedial" },
          { title: "Percobaan 2", note: "Nilai 65 - Remedial" },
        ],
      },
    ],
  },
  {
    slug: "matematika-peminatan-xi-ipa",
    students: [
      {
        id: "student-6",
        fullname: "Rina Mahardika",
        nis: "2411001",
        score: 79,
        status: "Lulus",
        progress: 86,
        dominantEmotion: "Fokus",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 74 - Lulus" },
          { title: "Percobaan 2", note: "Nilai 79 - Lulus" },
        ],
      },
      {
        id: "student-7",
        fullname: "Farhan Akbar",
        nis: "2411002",
        score: 61,
        status: "Remedial",
        progress: 58,
        dominantEmotion: "Bingung",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 61 - Remedial" },
          { title: "Percobaan 2", note: "Belum tuntas" },
        ],
      },
    ],
  },
  {
    slug: "statistika-probabilitas",
    students: [
      {
        id: "student-11",
        fullname: "Rafi Nugraha",
        nis: "2512001",
        score: 90,
        status: "Lulus",
        progress: 94,
        dominantEmotion: "Senang",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 86 - Lulus" },
          { title: "Percobaan 2", note: "Nilai 90 - Lulus" },
        ],
      },
    ],
  },
  {
    slug: "geometri-trigonometri",
    students: [
      {
        id: "student-16",
        fullname: "Yusuf Kurniawan",
        nis: "2613001",
        score: 76,
        status: "Lulus",
        progress: 77,
        dominantEmotion: "Fokus",
        testHistory: [
          { title: "Percobaan 1", note: "Nilai 72 - Lulus" },
          { title: "Percobaan 2", note: "Nilai 76 - Lulus" },
        ],
      },
    ],
  },
];

export default function AdminLearningAnalyticsStudentTemplate({
  slug,
  studentId,
}: {
  slug: string;
  studentId: string;
}) {
  const classCollection = STUDENT_ANALYTICS_DATA.find(
    (item) => item.slug === slug,
  );

  const student = classCollection?.students.find(
    (item) => item.id === studentId,
  );

  return (
    <ClassLADPageTemplate
      slug={slug}
      studentName={student?.fullname ?? `Siswa ${studentId}`}
      backHref={`/admin/dashboard/learning-analytics/${slug}`}
      backLabel="← Kembali ke Daftar Siswa"
    />
  );
}
