import TkaAttemptDetailTemplate from "@/components/templates/pages/tka/TkaAttemptDetailTemplate";

export default async function AdminTKAAttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;
  return (
    <TkaAttemptDetailTemplate testId={id} attemptId={attemptId} role="admin" />
  );
}
