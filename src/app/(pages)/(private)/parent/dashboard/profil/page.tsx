import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function ParentDashboardProfilPage() {
  return (
    <DashboardFeatureInitTemplate
      title="Profil Orang Tua"
      description="Halaman profil orang tua masih berupa init screen. Nantinya dapat dipakai untuk mengelola data akun dan preferensi notifikasi."
      dashboardHref="/parent/dashboard"
      dashboardLabel="Kembali ke Dashboard Orang Tua"
    />
  );
}
