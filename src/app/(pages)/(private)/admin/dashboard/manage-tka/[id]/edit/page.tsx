import TeacherCreateTKATemplate from "@/components/templates/pages/dashboard/TeacherCreateTKATemplate";

export default async function AdminEditTKAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherCreateTKATemplate editId={id} role="admin" />;
}
