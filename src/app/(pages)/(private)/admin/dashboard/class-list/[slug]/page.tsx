import AdminLearningAnalyticsClassTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";
import type { ClassAnalyticsViewType } from "@/types/learningAnalytics";

interface IAdminClassDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: ClassAnalyticsViewType }>;
}

export default async function AdminClassDetailPage({
  params,
  searchParams,
}: IAdminClassDetailPageProps) {
  const { slug } = await params;
  const { view } = await searchParams;

  return (
    <AdminLearningAnalyticsClassTemplate slug={slug} initialViewType={view} />
  );
}
