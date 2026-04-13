import AdminLearningAnalyticsClassTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";

interface IAdminDashboardLearningAnalyticsClassPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardLearningAnalyticsClass({
  params,
}: IAdminDashboardLearningAnalyticsClassPageProps) {
  const { slug } = await params;

  return <AdminLearningAnalyticsClassTemplate slug={slug} />;
}
