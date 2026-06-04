import TeacherPreviewDiagnosticContent from "@/components/organisms/TeacherPreviewDiagnosticContent";

interface IProps {
  id: string;
  role?: "admin" | "teacher";
}

export default function TeacherPreviewDiagnosticTemplate({ id, role = "teacher" }: IProps) {
  return <TeacherPreviewDiagnosticContent id={id} role={role} />;
}
