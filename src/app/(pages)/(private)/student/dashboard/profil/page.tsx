import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function StudentDashboardProfilPage() {
  return (
    <DashboardFeatureInitTemplate
      title="Profil Siswa"
      description="Halaman profil siswa masih berupa init screen. Nantinya bisa dipakai untuk edit data akun, preferensi, dan riwayat aktivitas belajar."
      dashboardHref="/student/dashboard"
      dashboardLabel="Kembali ke Dashboard Siswa"
    />
  );
}
