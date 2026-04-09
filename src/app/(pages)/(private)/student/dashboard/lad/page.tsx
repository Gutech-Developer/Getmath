import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function StudentDashboardLadPage() {
  return (
    <DashboardFeatureInitTemplate
      title="LAD Siswa"
      description="Halaman LAD siswa sedang disiapkan. Nantinya berisi learning analytics, progres belajar, dan rekomendasi tindak lanjut."
      dashboardHref="/student/dashboard"
      dashboardLabel="Kembali ke Dashboard Siswa"
    />
  );
}
