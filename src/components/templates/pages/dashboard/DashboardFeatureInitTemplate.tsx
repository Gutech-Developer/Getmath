import Link from "next/link";

interface IDashboardFeatureInitTemplateProps {
  title: string;
  description: string;
  dashboardHref: string;
  dashboardLabel: string;
}

export default function DashboardFeatureInitTemplate({
  title,
  description,
  dashboardHref,
  dashboardLabel,
}: IDashboardFeatureInitTemplateProps) {
  return (
    <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-7">
      <p className="inline-flex rounded-full border border-lottie-teal/20 bg-lottie-teal/5 px-3 py-1 text-xs font-semibold text-lottie-teal">
        Screen Init
      </p>

      <h1 className="mt-3 font-semibold text-2xl  mantap font-normal text-lottie-midnight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-lottie-zinc-500">{description}</p>

      <div className="mt-6 rounded-2xl border border-dashed border-lottie-mist bg-lottie-pearl/50 p-4 text-sm text-lottie-zinc-600">
        Halaman init sudah disiapkan sebagai baseline modular. Komponen detail
        bisa dilanjutkan setelah desain final tersedia.
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={dashboardHref}
          className="rounded-xl bg-lottie-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
        >
          {dashboardLabel}
        </Link>
      </div>
    </section>
  );
}
