import Link from "next/link";
import {
  buildClassRoute,
  type ClassSidebarRouteKey,
} from "@/constant/classSidebarRoutes";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";

interface IClassFeatureInitPageTemplateProps {
  slug: string;
  activeKey: ClassSidebarRouteKey;
  title: string;
  description: string;
}

export default function ClassFeatureInitPageTemplate({
  slug,
  activeKey,
  title,
  description,
}: IClassFeatureInitPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey={activeKey}
      classTitle={classTitle}
    >
      <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-7">
        <p className="inline-flex rounded-full border border-lottie-teal/20 bg-lottie-teal/5 px-3 py-1 text-xs font-semibold text-lottie-teal">
          Screen Init
        </p>

        <h1 className="mt-3 font-semibold text-2xl  mantap font-normal text-lottie-midnight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-lottie-zinc-500">{description}</p>

        <div className="mt-6 rounded-2xl border border-dashed border-lottie-mist bg-lottie-pearl/50 p-4 text-sm text-lottie-zinc-600">
          Halaman ini sudah disiapkan sebagai baseline modular. Komponen detail
          bisa dilanjutkan setelah desain final tersedia.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={buildClassRoute(slug)}
            className="rounded-xl bg-lottie-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
          >
            Kembali ke Beranda Kelas
          </Link>
          <Link
            href="/student/dashboard"
            className="rounded-xl border border-lottie-mist bg-white px-4 py-2.5 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl"
          >
            Kembali ke Dashboard Student
          </Link>
        </div>
      </section>
    </ClassPageShellTemplate>
  );
}
