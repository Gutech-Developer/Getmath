import AdminLearningAnalyticsStudentTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsStudentTemplate";

interface IAdminDashboardLearningAnalyticsClassStudentPageProps {
  params: Promise<{ slug: string; studentId: string }>;
  searchParams: Promise<{ studentName?: string }>;
}

export default async function AdminDashboardLearningAnalyticsClassStudent({
  params,
  searchParams,
}: IAdminDashboardLearningAnalyticsClassStudentPageProps) {
  const { slug, studentId } = await params;
  const { studentName } = await searchParams;

  return (
    <AdminLearningAnalyticsStudentTemplate
      slug={slug}
      studentId={studentId}
      studentName={studentName}
      backHref={`/admin/dashboard/learning-analytics/${slug}`}
    />
  );
}
