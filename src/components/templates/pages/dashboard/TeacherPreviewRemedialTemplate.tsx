import TeacherPreviewRemedialContent from "@/components/organisms/TeacherPreviewRemedialContent";

interface IProps {
  id: string;
  role?: "admin" | "teacher";
}

export default function TeacherPreviewRemedialTemplate({ id, role = "teacher" }: IProps) {
  return <TeacherPreviewRemedialContent id={id} role={role} />;
}
