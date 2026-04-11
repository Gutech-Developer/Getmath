import { redirect } from "next/navigation";
import { buildClassRoute } from "@/constant/classSidebarRoutes";

interface IClassFormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassFormPage({ params }: IClassFormPageProps) {
  const { slug } = await params;
  redirect(buildClassRoute(slug, "forum"));
}
