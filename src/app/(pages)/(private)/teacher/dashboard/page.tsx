import DashboardFeatureInitTemplate from "@/components/templates/pages/dashboard/DashboardFeatureInitTemplate";

export default function DashboardGuru() {
  return (
    <DashboardFeatureInitTemplate
      title="Teacher Dashboard"
      description="This teacher dashboard is currently an init screen. It will show class summaries, student progress, and recent learning activity."
      dashboardHref="/teacher/dashboard"
      dashboardLabel="Refresh Page"
    />
  );
}
