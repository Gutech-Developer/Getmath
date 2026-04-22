import TeacherCreateDiagnosticTemplate from "@/components/templates/pages/dashboard/TeacherCreateDiagnosticTemplate";

interface IProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherEditDiagnosticPage({ params }: IProps) {
  const { id } = await params;
  return <TeacherCreateDiagnosticTemplate editId={id} />;
}
