import TkaStudentResultTemplate from "@/components/templates/pages/tka/TkaStudentResultTemplate";

export default async function StudentTKAResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TkaStudentResultTemplate testId={id} />;
}
