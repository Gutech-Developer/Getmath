import ClassFeatureInitPageTemplate from "@/components/templates/pages/classroom/ClassFeatureInitPageTemplate";

interface IClassMateriPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassMateriPage({
  params,
}: IClassMateriPageProps) {
  const { slug } = await params;

  return (
    <ClassFeatureInitPageTemplate
      slug={slug}
      activeKey="materi"
      title="Materi Kelas"
      description="Area materi sedang disiapkan. Nantinya siswa bisa baca modul, tandai progres, dan lanjut per topik dari halaman ini."
    />
  );
}
