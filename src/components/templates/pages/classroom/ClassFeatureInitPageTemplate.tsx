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
      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.14)] sm:p-7">
        <p className="inline-flex rounded-full border border-[#DCE3FF] bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#3730A3]">
          Screen Init
        </p>

        <h1 className="mt-3 text-2xl font-bold text-[#0F172A]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#64748B]">{description}</p>

        <div className="mt-6 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-sm text-[#475569]">
          Halaman ini sudah disiapkan sebagai baseline modular. Komponen detail
          bisa dilanjutkan setelah desain final tersedia.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={buildClassRoute(slug)}
            className="rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1A2F6B]"
          >
            Kembali ke Beranda Kelas
          </Link>
          <Link
            href="/student/dashboard"
            className="rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
          >
            Kembali ke Dashboard Student
          </Link>
        </div>
      </section>
    </ClassPageShellTemplate>
  );
}
