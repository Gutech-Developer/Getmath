import TeacherCreateRemedialContent from "@/components/organisms/TeacherCreateRemedialContent";

export default function TeacherCreateRemedialTemplate({ role = "teacher" }: { role?: "admin" | "teacher" }) {
  return <TeacherCreateRemedialContent role={role} />;
}
