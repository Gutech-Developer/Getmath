import AdminLearningAnalyticsStudentTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsStudentTemplate";

interface IAdminDashboardLearningAnalyticsClassStudentPageProps {
  params: Promise<{ slug: string; studentId: string }>;
}

export default async function AdminDashboardLearningAnalyticsClassStudent({
  params,
}: IAdminDashboardLearningAnalyticsClassStudentPageProps) {
  const { slug, studentId } = await params;

  return (
    <AdminLearningAnalyticsStudentTemplate slug={slug} studentId={studentId} />
  );
}
