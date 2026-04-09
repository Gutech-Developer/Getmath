import ClassFeatureInitPageTemplate from "@/components/templates/pages/classroom/ClassFeatureInitPageTemplate";

interface IClassDiagnosisPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassDiagnosisPage({
  params,
}: IClassDiagnosisPageProps) {
  const { slug } = await params;

  return (
    <ClassFeatureInitPageTemplate
      slug={slug}
      activeKey="diagnosis"
      title="Tes Diagnostik"
      description="Screen init untuk tes diagnostik sudah tersedia. Flow soal, timer, dan hasil analisis bisa dilanjutkan di struktur ini."
    />
  );
}
