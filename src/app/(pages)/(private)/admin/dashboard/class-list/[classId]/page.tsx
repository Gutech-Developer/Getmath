import InitTemplate from "@/components/templates/init/InitTemplate";

interface AdminDashboardClassDetailPageProps {
  params: Promise<{ slug: string }>;
}
export default async function AdminDashboardClassDetailPage({
  params,
}: AdminDashboardClassDetailPageProps) {
  const { slug } = await params;
  return <InitTemplate description="detail class" title="Detail Class" />;
}
