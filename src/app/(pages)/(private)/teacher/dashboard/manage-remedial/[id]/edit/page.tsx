import TeacherCreateRemedialTemplate from "@/components/templates/pages/dashboard/TeacherCreateRemedialTemplate";
import TeacherCreateRemedialContent from "@/components/organisms/TeacherCreateRemedialContent";

export default async function TeacherEditRemedialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherCreateRemedialContent editId={id} />;
}
