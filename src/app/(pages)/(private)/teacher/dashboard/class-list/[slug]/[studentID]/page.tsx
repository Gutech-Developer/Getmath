import AdminLearningAnalyticsStudentTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsStudentTemplate";

interface TeacherDashboardLearningAnalyticsClassStudentPageProps {
  params: Promise<{ slug: string; studentID: string }>;
  searchParams: Promise<{ studentName?: string }>;
}

export default async function TeacherDashboardLearningAnalyticsClassStudent({
  params,
  searchParams,
}: TeacherDashboardLearningAnalyticsClassStudentPageProps) {
  const { slug, studentID } = await params;
  const { studentName } = await searchParams;

  return (
    <AdminLearningAnalyticsStudentTemplate
      slug={slug}
      studentId={studentID}
      studentName={studentName}
      backHref={`/teacher/dashboard/class-list/${slug}`}
    />
  );
}
