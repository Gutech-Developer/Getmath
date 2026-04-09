import InitTemplate from "@/components/templates/init/InitTemplate";

type PageParams = {
  slug: string;
  id: string;
  diagnotisId: string;
};

type PageProps = {
  params: Promise<PageParams>;
  searchParams?: Promise<any>;
};

export default async function Page({ params }: PageProps) {
  const { slug, id, diagnotisId } = await params;

  return (
    <InitTemplate
      title="Inisialisasi Diagnotis"
      description="Halaman ini sudah disiapkan sebagai baseline modular. Konten detail akan dilanjutkan setelah desain final tersedia."
    />
  );
}
