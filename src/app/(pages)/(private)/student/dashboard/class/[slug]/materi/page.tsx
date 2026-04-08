import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { redirect } from "next/navigation";

interface IClassMateriPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassMateriPage({
  params,
}: IClassMateriPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug, "materi"));
}
