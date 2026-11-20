import TkaAnalyticsTemplate from "@/components/templates/pages/tka/TkaAnalyticsTemplate";

export default async function TeacherTKAAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TkaAnalyticsTemplate testId={id} />;
}
