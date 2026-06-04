export default function AboutSection() {
  return (
    <section className="bg-[#FAFBFF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Tentang Kami
          </p>
          <h2 className="text-3xl font-bold text-[#111827] sm:text-4xl">
            Apa itu GetSmart?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B7280]">
            GetSmart adalah platform E-Learning yang menggabungkan teknologi AI untuk menciptakan
            pengalaman belajar yang adaptif dan personal bagi setiap siswa.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Visi */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm transition hover:shadow-md sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="mb-4 text-2xl font-bold text-[#111827]">Visi GetSmart</h3>
            <p className="text-[#6B7280] leading-relaxed">
              Mewujudkan pemerataan pendidikan berkualitas tinggi yang dapat diakses oleh seluruh siswa di Indonesia melalui teknologi AI yang inovatif dan mudah digunakan.
            </p>
          </div>

          {/* Misi */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm transition hover:shadow-md sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mb-4 text-2xl font-bold text-[#111827]">Misi GetSmart</h3>
            <p className="text-[#6B7280] leading-relaxed">
              Menyediakan modul belajar interaktif, tes diagnostik berbasis emosi, dan analitik belajar komprehensif yang membantu siswa, guru, dan orang tua berkolaborasi mencapai hasil belajar terbaik.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
