import LearningAnalyticsELKPDScoreTemplate from "@/components/templates/pages/dashboard/LearningAnalyticsELKPDScoreTemplate";

interface IAdminDashboardLearningAnalyticsELKPDScorePageProps {
  params: Promise<{ slug: string; elkpdId: string }>;
}

export default async function AdminDashboardLearningAnalyticsELKPDScorePage({
  params,
}: IAdminDashboardLearningAnalyticsELKPDScorePageProps) {
  const { slug, elkpdId } = await params;

  return (
    <LearningAnalyticsELKPDScoreTemplate
      role="admin"
      slug={slug}
      elkpdId={elkpdId}
    />
  );
}
