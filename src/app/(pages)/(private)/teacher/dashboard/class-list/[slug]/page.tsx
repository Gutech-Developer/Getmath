import TeacherLearningAnalyticsClassTemplate from "@/components/templates/pages/dashboard/TeacherLearningAnalyticsClassTemplate";

interface ITeacherDashboardClassDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeacherDashboardClassDetailPage({
  params,
}: ITeacherDashboardClassDetailPageProps) {
  const { slug } = await params;

  return <TeacherLearningAnalyticsClassTemplate slug={slug} />;
}
