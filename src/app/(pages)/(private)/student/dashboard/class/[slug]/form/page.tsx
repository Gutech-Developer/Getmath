import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { redirect } from "next/navigation";

interface IClassFormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassFormPage({ params }: IClassFormPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug, "form"));
}
