import ClassDashboardPageTemplate from "@/components/templates/pages/classroom/ClassDashboardPageTemplate";

interface IClassOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassOverviewPage({
  params,
}: IClassOverviewPageProps) {
  const { slug } = await params;

  return <ClassDashboardPageTemplate slug={slug} />;
}
