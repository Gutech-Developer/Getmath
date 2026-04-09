import ClassMaterialListPageTemplate from "@/components/templates/pages/classroom/ClassMaterialListPageTemplate";

interface IClassMateriPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassMateriPage({
  params,
}: IClassMateriPageProps) {
  const { slug } = await params;

  return <ClassMaterialListPageTemplate slug={slug} />;
}
