import LearningAnalyticsELKPDScoreContent from "@/components/organisms/LearningAnalyticsELKPDScoreContent";
import { LEARNING_ANALYTICS_CLASS_DATA } from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";
import type { IClassLearningAnalyticsDetail } from "@/types/learningAnalytics";

type AnalyticsRole = "admin" | "teacher";

interface ILearningAnalyticsELKPDScoreTemplateProps {
  role: AnalyticsRole;
  slug: string;
  elkpdId: string;
}

function formatClassTitleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createFallbackClassDetail(
  slug: string,
  elkpdId: string,
): IClassLearningAnalyticsDetail {
  return {
    slug,
    className: formatClassTitleFromSlug(slug),
    teacherName: "Ibu Rahma Johar",
    studentCount: 5,
    averageScore: 75,
    passedCount: 3,
    remedialCount: 2,
    progress: 64,
    classCode: "MATH-X-001",
    gradeLabel: "Umum",
    semesterLabel: "Ganjil 2024/2025",
    subjectLabel: "Matematika",
    students: [
      {
        id: "fallback-student-1",
        fullname: "Andi Pratama",
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
    elkpdItems: [
      {
        id: elkpdId,
        title: "E-LKPD - Penilaian Kelas",
        dueLabel: "30 Apr 2026",
        submittedCount: 0,
        status: "Aktif",
      },
    ],
  };
}

export default function LearningAnalyticsELKPDScoreTemplate({
  role,
  slug,
  elkpdId,
}: ILearningAnalyticsELKPDScoreTemplateProps) {
  const classDetail = LEARNING_ANALYTICS_CLASS_DATA.find(
    (item) => item.slug === slug,
  );

  return (
    <LearningAnalyticsELKPDScoreContent
      role={role}
      classDetail={classDetail ?? createFallbackClassDetail(slug, elkpdId)}
      elkpdId={elkpdId}
    />
  );
}
