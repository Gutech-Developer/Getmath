import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function AdminDashboardProfilPage() {
  return (
    <DashboardFeatureInitTemplate
      title="Profil Admin"
      description="Halaman profil admin masih berupa init screen. Nantinya dapat digunakan untuk manajemen akun dan preferensi operasional."
      dashboardHref="/admin/dashboard"
      dashboardLabel="Kembali ke Dashboard Admin"
    />
  );
}
