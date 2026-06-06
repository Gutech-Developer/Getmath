import AdminUserDetailTemplate from "@/components/templates/pages/dashboard/AdminUserDetailTemplate";

export const metadata = {
  title: "Detail Siswa | Admin",
  description: "Lihat detail data siswa",
};

export default function AdminStudentDetailPage() {
  return <AdminUserDetailTemplate role="siswa" />;
}
