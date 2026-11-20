import TkaAttemptDetailContent from "@/components/organisms/tka/TkaAttemptDetailContent";

export default function TkaAttemptDetailTemplate({
  testId,
  attemptId,
  role = "teacher",
}: {
  testId: string;
  attemptId: string;
  role?: "admin" | "teacher";
}) {
  return (
    <TkaAttemptDetailContent
      testId={testId}
      attemptId={attemptId}
      role={role}
    />
  );
}
