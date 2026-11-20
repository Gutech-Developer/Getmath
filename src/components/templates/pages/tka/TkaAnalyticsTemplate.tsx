import TkaAnalyticsContent from "@/components/organisms/tka/TkaAnalyticsContent";

export default function TkaAnalyticsTemplate({
  testId,
  role = "teacher",
}: {
  testId: string;
  role?: "admin" | "teacher";
}) {
  return <TkaAnalyticsContent testId={testId} role={role} />;
}
