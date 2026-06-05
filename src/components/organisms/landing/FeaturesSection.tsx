export default function FeaturesSection() {
  const features = [
    {
      title: "Modul Materi Interaktif",
      desc: "Baca materi flipbook interaktif dengan video pemantik sebelum mengerjakan E-LKPD di akhir setiap materi.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Tes Diagnostik Adaptif",
      desc: "Tes dengan pemantauan emosi real-time dan feedback motivasi yang disesuaikan dengan kondisi siswa.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: "Remedial per Soal",
      desc: "Jawab salah? Tonton video penjelasan per-soal dengan deteksi emosi aktif, lalu coba soal serupa hingga benar.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: "Forum Diskusi Kelas",
      desc: "Diskusikan materi dengan teman dan guru. Ajukan pertanyaan, berikan like, dan balas diskusi.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: "LAD – Analitik Belajar",
      desc: "Lihat grafik nilai, pola emosi saat belajar, peringkat kelas, durasi baca, dan rekomendasi belajar.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Keamanan Data Siswa",
      desc: "Data pribadi siswa dienkripsi dan tidak pernah dibagikan ke pihak ketiga. Privasi adalah prioritas kami.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Fitur Platform
          </p>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-snug text-[#111827] sm:text-4xl">
            Semua yang Kamu Butuhkan untuk Sukses
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B7280]">
            Dirancang khusus untuk siswa, guru, dan orang tua yang ingin hasil belajar yang nyata.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[#E5E7EB] bg-[#FAFBFF] p-8 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2563EB]/10"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#111827]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#6B7280]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
