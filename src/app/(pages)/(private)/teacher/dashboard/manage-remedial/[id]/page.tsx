import TeacherPreviewRemedialTemplate from "@/components/templates/pages/dashboard/TeacherPreviewRemedialTemplate";

interface IProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherPreviewRemedialPage({ params }: IProps) {
  const { id } = await params;
  return <TeacherPreviewRemedialTemplate id={id} />;
}
