import TeacherLearningAnalyticsClassContent, {
  ITeacherClassLearningAnalyticsDetail,
} from "@/components/organisms/TeacherLearningAnalyticsClassContent";
import { LEARNING_ANALYTICS_CLASS_DATA } from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";

interface ITeacherLearningAnalyticsClassTemplateProps {
  slug: string;
}

function formatClassTitleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const TEACHER_CLASS_ANALYTICS_DATA: ITeacherClassLearningAnalyticsDetail[] =
  LEARNING_ANALYTICS_CLASS_DATA.map((item) => ({
    ...item,
    defaultViewType: "Beranda",
  }));

export default function TeacherLearningAnalyticsClassTemplate({
  slug,
}: ITeacherLearningAnalyticsClassTemplateProps) {
  const classDetail = TEACHER_CLASS_ANALYTICS_DATA.find(
    (item) => item.slug === slug,
  );

  const fallbackDetail: ITeacherClassLearningAnalyticsDetail = {
    slug,
    className: formatClassTitleFromSlug(slug),
    teacherName: "Ibu Rahma Johar",
    studentCount: 28,
    averageScore: 76,
    passedCount: 23,
    remedialCount: 5,
    progress: 75,
    classCode: "MATH-X-001",
    gradeLabel: "Umum",
    semesterLabel: "Ganjil 2024/2025",
    subjectLabel: "Matematika",
    defaultViewType: "Beranda",
    students: [
      {
        id: "teacher-fallback-1",
        fullname: "Ahmad Rizki",
        nis: "2310001",
        score: 92,
        status: "Lulus",
      },
      {
        id: "teacher-fallback-2",
        fullname: "Budi Santoso",
        nis: "2310002",
        score: 84,
        status: "Lulus",
      },
      {
        id: "teacher-fallback-3",
        fullname: "Citra Dewi",
        nis: "2310003",
        score: 76,
        status: "Lulus",
      },
      {
        id: "teacher-fallback-4",
        fullname: "Dimas Prasetyo",
        nis: "2310004",
        score: 61,
        status: "Remedial",
      },
      {
        id: "teacher-fallback-5",
        fullname: "Eka Putri",
        nis: "2310005",
        score: 58,
        status: "Remedial",
      },
    ],
  };

  return (
    <TeacherLearningAnalyticsClassContent
      classDetail={classDetail ?? fallbackDetail}
    />
  );
}
