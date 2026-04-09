import ClassMaterialContentPageTemplate from "@/components/templates/pages/classroom/ClassMaterialContentPageTemplate";

interface IClassMateriContentPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ContentMateri({
  params,
}: IClassMateriContentPageProps) {
  const { slug, id } = await params;

  return <ClassMaterialContentPageTemplate slug={slug} contentId={id} />;
}
