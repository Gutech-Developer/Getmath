import TeacherPreviewDiagnosticContent from "@/components/organisms/TeacherPreviewDiagnosticContent";

interface IProps {
  id: string;
}

export default function TeacherPreviewDiagnosticTemplate({ id }: IProps) {
  return <TeacherPreviewDiagnosticContent id={id} />;
}
