import TeacherPreviewRemedialContent from "@/components/organisms/TeacherPreviewRemedialContent";

interface IProps {
  id: string;
}

export default function TeacherPreviewRemedialTemplate({ id }: IProps) {
  return <TeacherPreviewRemedialContent id={id} />;
}
