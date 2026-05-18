import ClassDiagnosisContentPageTemplate from "@/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate";

type PageParams = {
  slug: string;
  id: string;
  remediaId: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export default async function Page({ params }: PageProps) {
  const { slug, id, remediaId } = await params;

  return (
    <ClassDiagnosisContentPageTemplate
      slug={slug}
      contentId={id}
      remediaId={remediaId}
    />
  );
}
