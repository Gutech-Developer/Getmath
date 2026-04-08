import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { redirect } from "next/navigation";

interface IClassOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassOverviewPage({
  params,
}: IClassOverviewPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug));
}
