import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { redirect } from "next/navigation";

interface IClassDiagnosisPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassDiagnosisPage({
  params,
}: IClassDiagnosisPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug, "diagnosis"));
}
