import TeacherCreateTKATemplate from "@/components/templates/pages/dashboard/TeacherCreateTKATemplate";

export default async function TeacherEditTKAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherCreateTKATemplate editId={id} />;
}
