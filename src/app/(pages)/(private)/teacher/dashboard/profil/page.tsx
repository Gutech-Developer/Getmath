import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function TeacherDashboardProfilPage() {
  return (
    <DashboardFeatureInitTemplate
      title="Profil Guru"
      description="Halaman profil guru masih berupa init screen. Nantinya berisi data akun, preferensi kelas, dan pengaturan personal."
      dashboardHref="/teacher/dashboard"
      dashboardLabel="Kembali ke Dashboard Guru"
    />
  );
}
