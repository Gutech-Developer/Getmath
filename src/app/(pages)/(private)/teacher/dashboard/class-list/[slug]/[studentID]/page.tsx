import AdminLearningAnalyticsStudentTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsStudentTemplate";

interface TeacherDashboardLearningAnalyticsClassStudentPageProps {
  params: Promise<{ slug: string; studentID: string }>;
}

export default async function TeacherDashboardLearningAnalyticsClassStudent({
  params,
}: TeacherDashboardLearningAnalyticsClassStudentPageProps) {
  const { slug, studentID } = await params;

  return (
    <AdminLearningAnalyticsStudentTemplate
      slug={slug}
      studentId={studentID}
      backHref={`/teacher/dashboard/class-list/${slug}`}
    />
  );
}
