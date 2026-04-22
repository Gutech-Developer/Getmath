import TeacherCreateDiagnosticContent from "@/components/organisms/TeacherCreateDiagnosticContent";

interface IProps {
  editId?: string;
}

export default function TeacherCreateDiagnosticTemplate({ editId }: IProps) {
  return <TeacherCreateDiagnosticContent editId={editId} />;
}
