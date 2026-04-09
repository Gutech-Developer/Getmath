interface InitTemplateProps {
  title: string;
  description: string;
}
export default function InitTemplate({
  title,
  description,
}: InitTemplateProps) {
  return (
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
    </section>
  );
}
