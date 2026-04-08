import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { redirect } from "next/navigation";

interface IClassInfoKelasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassInfoKelasPage({
  params,
}: IClassInfoKelasPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug, "info-kelas"));
}
