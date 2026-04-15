import ClassInfoPageTemplate from "@/components/templates/pages/classroom/ClassInfoPageTemplate";

interface IClassInfoKelasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassInfoKelasPage({
  params,
}: IClassInfoKelasPageProps) {
  const { slug } = await params;

  return <ClassInfoPageTemplate slug={slug} />;
}
