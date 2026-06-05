import TeacherCreateDiagnosticContent from "@/components/organisms/TeacherCreateDiagnosticContent";

interface IProps {
  editId?: string;
  role?: "admin" | "teacher";
}

export default function TeacherCreateDiagnosticTemplate({ editId, role = "teacher" }: IProps) {
  return <TeacherCreateDiagnosticContent editId={editId} role={role} />;
}
