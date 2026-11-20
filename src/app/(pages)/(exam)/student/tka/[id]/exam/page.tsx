import TkaStudentExamTemplate from "@/components/templates/pages/tka/TkaStudentExamTemplate";

export default async function StudentTKAExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TkaStudentExamTemplate testId={id} />;
}
