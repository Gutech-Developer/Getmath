import AdminManageUsersTemplate from "@/components/templates/pages/dashboard/AdminManageUsersTemplate";

export const metadata = {
  title: "Manajemen Siswa | Admin",
  description: "Kelola data siswa",
};

export default function AdminManageStudentPage() {
  return <AdminManageUsersTemplate role="siswa" />;
}
