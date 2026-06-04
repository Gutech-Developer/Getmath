import Link from "next/link";

export default function RolesSection() {
  const roles = [
    {
      title: "Siswa",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      desc: "Tingkatkan pemahaman matematika dengan modul interaktif, tes diagnostik, dan analytics belajar.",
      points: [
        "Baca modul materi interaktif dengan E-LKPD",
        "Kerjakan tes diagnostik dengan pantauan emosi",
        "Tonton video remedial per soal jika perlu",
        "Diskusi di forum dan tanya AI Chatbot",
        "Pantau perkembangan belajar di LAD Siswa",
        "Bergabung ke kelas via kode dari guru",
      ],
      linkText: "Daftar sebagai Siswa",
      linkHref: "/register?role=student",
    },
    {
      title: "Guru",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      desc: "Kelola kelas, buat materi dan tes, pantau perkembangan setiap siswa secara detail.",
      points: [
        "Buat dan kelola kelas dengan kode atau link",
        "Upload modul materi PDF dengan E-LKPD",
        "Buat tes diagnostik dengan paket soal",
        "Pantau progress dan emosi seluruh siswa",
        "Diskusi di forum dan balas pertanyaan",
        "Export laporan aktivitas siswa",
      ],
      linkText: "Daftar sebagai Guru",
      linkHref: "/register?role=teacher",
    },
    {
      title: "Orang Tua",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      desc: "Pantau aktivitas dan perkembangan belajar anak kapan saja, di mana saja.",
      points: [
        "Pantau nilai dan skor tes diagnostik anak",
        "Lihat visualisasi emosi anak saat belajar",
        "Monitor durasi dan aktivitas belajar harian",
        "Ketahui kelas dan materi yang dipelajari",
        "Manajemen lebih dari satu anak",
        "Akses dari perangkat mobile kapan saja",
      ],
      linkText: "Daftar sebagai Orang Tua",
      linkHref: "/register?role=parent",
    },
  ];

  return (
    <section className="bg-[#1E3A8A] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#93C5FD]">
            Untuk Siapa
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            GetSmart untuk Semua Peran
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#BFDBFE]">
            Satu platform, tiga perspektif yang saling melengkapi untuk pengalaman belajar terbaik.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-3xl border border-[#2563EB]/40 bg-[#1E40AF]/40 p-8 backdrop-blur-sm transition-all hover:bg-[#1E40AF]/60"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/20 text-white">
                {role.icon}
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">{role.title}</h3>
              <p className="mb-8 text-sm leading-relaxed text-[#BFDBFE]">{role.desc}</p>
              
              <ul className="mb-10 flex flex-col gap-3 flex-1">
                {role.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#93C5FD]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[#E0E7FF]">{point}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={role.linkHref}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-6 font-semibold text-[#1E3A8A] transition hover:bg-[#F8FAFC]"
              >
                {role.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
