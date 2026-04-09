import ClassFeatureInitPageTemplate from "@/components/templates/pages/classroom/ClassFeatureInitPageTemplate";

interface IClassInfoKelasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassInfoKelasPage({
  params,
}: IClassInfoKelasPageProps) {
  const { slug } = await params;

  return (
    <ClassFeatureInitPageTemplate
      slug={slug}
      activeKey="info-kelas"
      title="Info Kelas"
      description="Screen init info kelas berisi ringkasan guru, daftar siswa, jadwal, dan metadata kelas sebelum masuk detail desain final."
    />
  );
}
