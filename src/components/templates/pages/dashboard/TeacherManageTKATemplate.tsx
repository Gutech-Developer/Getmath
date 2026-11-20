import TeacherManageTKAContent from "@/components/organisms/TeacherManageTKAContent";

export default function TeacherManageTKATemplate({
  role = "teacher",
}: {
  role?: "admin" | "teacher";
}) {
  return <TeacherManageTKAContent role={role} />;
}
