export default function TestimonialSection() {
  const testimonials = [
    {
      stars: 5,
      quote:
        "\"GetSmart membantu saya belajar matematika jauh lebih mudah. Video remedialnya sangat membantu ketika saya tidak mengerti materi.\"",
      name: "Rina Aulia",
      role: "Siswa Kelas 9",
      initial: "RA",
      avatarBg: "bg-lottie-mint-wash text-lottie-teal",
    },
    {
      stars: 5,
      quote:
        "\"Dashboard analitik GetSmart memudahkan saya memantau perkembangan setiap siswa secara detail dan real-time.\"",
      name: "Bapak Hendra",
      role: "Guru Matematika",
      initial: "BH",
      avatarBg: "bg-lottie-cream text-[#ffbf00]",
    },
    {
      stars: 5,
      quote:
        "\"Saya bisa pantau aktivitas belajar anak saya kapan saja. Sangat memudahkan komunikasi dengan guru.\"",
      name: "Ibu Sari",
      role: "Orang Tua Siswa",
      initial: "IS",
      avatarBg: "bg-[#ffeff4] text-[#ff6b9d]",
    },
  ];

  return (
    <section id="testimoni" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center rounded-full bg-lottie-mint-wash px-3 py-1 text-xs font-semibold text-lottie-teal font-inter uppercase tracking-wide">
            Testimoni
          </span>
          <h2 className="mt-4 font-dm-sans text-4xl font-bold tracking-[-0.03em] text-lottie-midnight sm:text-[48px] leading-[1.12]">
            Kata Mereka tentang GetSmart
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testi, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-[24px] border border-white/60 bg-white/60 backdrop-blur-md p-8 transition-all hover:scale-[1.01] shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px]"
            >
              <div>
                <div className="mb-5 flex gap-1">
                  {[...Array(testi.stars)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4.5 w-4.5 text-[#ffbf00]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-8 font-inter text-sm md:text-base leading-relaxed text-lottie-zinc-600 italic">
                  {testi.quote}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Visual Avatar */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-dm-sans font-bold text-xs ${testi.avatarBg}`}>
                  {testi.initial}
                </div>
                <div>
                  <p className="font-dm-sans text-sm font-bold text-lottie-midnight">{testi.name}</p>
                  <p className="font-inter text-xs text-lottie-zinc-500">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
