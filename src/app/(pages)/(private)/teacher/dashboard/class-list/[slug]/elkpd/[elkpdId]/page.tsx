import LearningAnalyticsELKPDScoreTemplate from "@/components/templates/pages/dashboard/LearningAnalyticsELKPDScoreTemplate";

interface ITeacherDashboardLearningAnalyticsELKPDScorePageProps {
  params: Promise<{ slug: string; elkpdId: string }>;
}

export default async function TeacherDashboardLearningAnalyticsELKPDScorePage({
  params,
}: ITeacherDashboardLearningAnalyticsELKPDScorePageProps) {
  const { slug, elkpdId } = await params;

  return (
    <LearningAnalyticsELKPDScoreTemplate
      role="teacher"
      slug={slug}
      elkpdId={elkpdId}
    />
  );
}
