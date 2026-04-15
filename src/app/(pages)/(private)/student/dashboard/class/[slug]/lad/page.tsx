import ClassLADPageTemplate from "@/components/templates/pages/classroom/ClassLADPageTemplate";

interface IClassLADPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassLADPage({ params }: IClassLADPageProps) {
  const { slug } = await params;

  return <ClassLADPageTemplate slug={slug} />;
}
