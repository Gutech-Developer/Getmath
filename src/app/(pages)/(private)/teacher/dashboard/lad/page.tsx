import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function TeacherDashboardLadPage() {
  return (
    <DashboardFeatureInitTemplate
      title="LAD Guru"
      description="Halaman LAD guru sedang disiapkan. Nantinya memuat analitik performa kelas, aktivitas siswa, dan insight pembelajaran."
      dashboardHref="/teacher/dashboard"
      dashboardLabel="Kembali ke Dashboard Guru"
    />
  );
}
