import ClassDiagnosisContentPageTemplate from "@/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate";

type PageParams = {
  slug: string;
  id: string;
  diagnotisId: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export default async function Page({ params }: PageProps) {
  const { slug, id, diagnotisId } = await params;

  return (
    <ClassDiagnosisContentPageTemplate
      slug={slug}
      contentId={id}
      diagnotisId={diagnotisId}
    />
  );
}
