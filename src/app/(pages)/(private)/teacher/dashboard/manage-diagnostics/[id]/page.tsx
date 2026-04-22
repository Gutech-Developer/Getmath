import TeacherPreviewDiagnosticTemplate from "@/components/templates/pages/dashboard/TeacherPreviewDiagnosticTemplate";

interface IProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherPreviewDiagnosticPage({ params }: IProps) {
  const { id } = await params;
  return <TeacherPreviewDiagnosticTemplate id={id} />;
}
