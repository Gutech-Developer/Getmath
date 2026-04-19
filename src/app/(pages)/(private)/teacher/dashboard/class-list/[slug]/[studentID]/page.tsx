import AdminLearningAnalyticsStudentTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsStudentTemplate";

interface TeacherDashboardLearningAnalyticsClassStudentPageProps {
  params: Promise<{ slug: string; studentId: string }>;
}

export default async function TeacherDashboardLearningAnalyticsClassStudent({
  params,
}: TeacherDashboardLearningAnalyticsClassStudentPageProps) {
  const { slug, studentId } = await params;

  return (
    <AdminLearningAnalyticsStudentTemplate slug={slug} studentId={studentId} />
  );
}
