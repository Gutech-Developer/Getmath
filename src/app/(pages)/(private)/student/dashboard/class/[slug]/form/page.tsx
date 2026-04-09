import ClassFeatureInitPageTemplate from "@/components/templates/pages/classroom/ClassFeatureInitPageTemplate";

interface IClassFormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassFormPage({ params }: IClassFormPageProps) {
  const { slug } = await params;

  return (
    <ClassFeatureInitPageTemplate
      slug={slug}
      activeKey="form"
      title="Forum & AI"
      description="Screen init forum dan AI assistant kelas. Nantinya ruang diskusi, thread, dan tanya AI bisa diaktifkan dari halaman ini."
    />
  );
}
