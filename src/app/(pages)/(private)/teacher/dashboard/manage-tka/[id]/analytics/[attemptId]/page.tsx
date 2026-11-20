import TkaAttemptDetailTemplate from "@/components/templates/pages/tka/TkaAttemptDetailTemplate";

export default async function TeacherTKAAttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;
  return <TkaAttemptDetailTemplate testId={id} attemptId={attemptId} />;
}
