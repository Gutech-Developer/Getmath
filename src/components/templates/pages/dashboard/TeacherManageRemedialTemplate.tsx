import TeacherManageRemedialContent from "@/components/organisms/TeacherManageRemedialContent";

export default function TeacherManageRemedialTemplate({ role = "teacher" }: { role?: "admin" | "teacher" }) {
  return <TeacherManageRemedialContent role={role} />;
}
