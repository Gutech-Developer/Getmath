import AdminUserDetailTemplate from "@/components/templates/pages/dashboard/AdminUserDetailTemplate";

export const metadata = {
  title: "Detail Guru | Admin",
  description: "Lihat detail data guru",
};

export default function AdminTeacherDetailPage() {
  return <AdminUserDetailTemplate role="guru" />;
}
