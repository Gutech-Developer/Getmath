import TeacherManageDiagnosticsContent from "@/components/organisms/TeacherManageDiagnosticsContent";

export default function TeacherManageDiagnosticsTemplate({ role = "teacher" }: { role?: "admin" | "teacher" }) {
  return <TeacherManageDiagnosticsContent role={role} />;
}
