import AdminManageUsersTemplate from "@/components/templates/pages/dashboard/AdminManageUsersTemplate";

export const metadata = {
  title: "Manajemen Guru | Admin",
  description: "Kelola data guru",
};

export default function AdminManageTeacherPage() {
  return <AdminManageUsersTemplate role="guru" />;
}
