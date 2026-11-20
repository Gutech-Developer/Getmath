import TeacherCreateTKAContent from "@/components/organisms/TeacherCreateTKAContent";

export default function TeacherCreateTKATemplate({
  editId,
  role = "teacher",
}: {
  editId?: string;
  role?: "admin" | "teacher";
}) {
  return <TeacherCreateTKAContent editId={editId} role={role} />;
}
