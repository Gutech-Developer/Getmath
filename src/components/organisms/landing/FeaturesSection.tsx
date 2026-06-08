"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FeaturesSection() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = [
    {
      name: "Matematika",
      sub: "Aljabar Linier",
      desc: "Bab 3: Matriks & Determinan • 2m lalu",
      badge: "Selesai",
      type: "success",
    },
    {
      name: "Fisika",
      sub: "Kinematika",
      desc: "E-LKPD 2: Gerak Parabola • 10m lalu",
      badge: "Sedang Belajar",
      type: "info",
    },
    {
      name: "Kimia",
      sub: "Reaksi Redoks",
      desc: "Bab 5: Reaksi Oksidasi • 1j lalu",
      badge: "Tugas Baru",
      type: "warning",
    },
    {
      name: "Matematika",
      sub: "Trigonometri",
      desc: "Video Pemantik: Identitas Trigonometri • 1d lalu",
      badge: "Selesai",
      type: "success",
    },
    {
      name: "Biologi",
      sub: "Struktur Sel",
      desc: "Kuis Diagnostik: Organel Sel • 2d lalu",
      badge: "Sedang Belajar",
      type: "info",
    },
    {
      name: "Fisika",
      sub: "Termodinamika",
      desc: "Kuis Diagnostik: Siklus Carnot • 3d lalu",
      badge: "Remedial",
      type: "error",
    },
  ];

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.sub.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useGSAP(() => {
    // Fade in title/desc
    gsap.from(".features-title-animate", {
      scrollTrigger: {
        trigger: ".features-title-animate",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        // Draw the highlight brush
        gsap.to(".features-brush-1", {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power1.inOut",
        });
      }
    });

    // Stagger features items
    gsap.from(".features-item-animate", {
      scrollTrigger: {
        trigger: ".features-item-animate",
        start: "top 85%",
      },
      x: -40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });

    // Mockup anim
    gsap.from(".features-mockup-animate", {
      scrollTrigger: {
        trigger: ".features-mockup-animate",
        start: "top 80%",
      },
      y: 50,
      scale: 0.96,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  }, { scope: featuresRef });

  return (
    <section
      ref={featuresRef}
      id="fitur"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden z-0 math-grid-bg"
    >
      {/* Curved loop arrow SVG */}
      <div className="absolute left-[38%] top-[8%] pointer-events-none z-0 hidden xl:block select-none opacity-80">
        <svg
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 55 12 C 40 18, 25 18, 25 35 C 25 52, 52 52, 52 35 C 52 18, 12 35, 7 52" />
          <path d="M 12 51 L 7 52 L 8 45" />
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          {/* Left Column: Title and Feature Items */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="features-title-animate">
              <span className="text-sm font-semibold text-[#1F2375] uppercase tracking-wider font-inter">
                Fitur Utama
              </span>
              <h2 className="mt-3 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-lottie-midnight sm:text-[48px] leading-[1.12]">
                Alur Belajar{" "}
                <span className="relative inline-block px-1">
                  Pintar
                  {/* Teal hand-drawn wavy highlight line under the word */}
                  <svg
                    className="absolute left-0 bottom-[-4px] w-full h-[8px] pointer-events-none z-0"
                    viewBox="0 0 100 8"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      className="features-brush-1"
                      strokeDasharray="100"
                      strokeDashoffset="100"
                      d="M 5 4 Q 25 1, 50 4 T 95 4"
                      stroke="#14b8a6"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                GetSmart
              </h2>
              <p className="mt-4 font-inter text-base leading-relaxed text-lottie-zinc-500">
                Dirancang khusus untuk menciptakan pengalaman belajar yang
                dipersonalisasi bagi siswa, dibantu dengan sistem AI canggih
                untuk memetakan emosi dan pemahaman.
              </p>
            </div>

            {/* Inline list of features */}
            <div className="flex flex-col gap-6 mt-2">
              {/* Feature Item 1 */}
              <div className="flex gap-4 items-start features-item-animate">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e7ff] border border-indigo-150 text-[#1F2375] shadow-[rgba(31,35,117,0.06)_0px_4px_12px_0px]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="text-sm font-inter leading-relaxed text-lottie-zinc-500">
                  <span className="font-bold text-lottie-midnight text-base block mb-0.5">
                    Modul & E-LKPD Interaktif.
                  </span>
                  Baca flipbook interaktif lengkap dengan video pemantik sebelum
                  langsung mengerjakan Lembar Kerja interaktif di akhir materi.
                </div>
              </div>

              {/* Feature Item 2 */}
              <div className="flex gap-4 items-start features-item-animate">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e7ff] border border-indigo-150 text-[#1F2375] shadow-[rgba(31,35,117,0.06)_0px_4px_12px_0px]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-inter leading-relaxed text-lottie-zinc-500">
                  <span className="font-bold text-lottie-midnight text-base block mb-0.5">
                    Tes Diagnostik Emosi AI.
                  </span>
                  Analisis pemahaman materi secara otomatis dengan mendeteksi
                  emosi dan tingkat fokus siswa selama proses evaluasi berjalan.
                </div>
              </div>

              {/* Feature Item 3 */}
              <div className="flex gap-4 items-start features-item-animate">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0e7ff] border border-indigo-150 text-[#1F2375] shadow-[rgba(31,35,117,0.06)_0px_4px_12px_0px]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-inter leading-relaxed text-lottie-zinc-500">
                  <span className="font-bold text-lottie-midnight text-base block mb-0.5">
                    LAD Dashboard Real-time.
                  </span>
                  Siswa, guru, dan orang tua dapat memantau data perkembangan
                  belajar lengkap dengan pola emosi, tingkat ketuntasan kuis,
                  dan durasi belajar.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Mockup (HTML-only) */}
          <div className="lg:col-span-7 w-full features-mockup-animate">
            <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-[rgba(31,35,117,0.06)_0px_24px_48px_0px] flex flex-col md:flex-row aspect-[16/10] md:h-[480px]">
              {/* Sidebar */}
              <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-white/40 bg-white/20 flex flex-col justify-between p-4 flex-shrink-0 select-none">
                <div className="flex flex-col gap-6">
                  {/* Logo header */}
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-[#1F2375] flex items-center justify-center text-white font-bold text-xs shadow-md">
                      G
                    </span>
                    <span className="text-xs font-bold text-[#1F2375] tracking-wider font-mono">
                      GETSMART.ID
                    </span>
                  </div>

                  {/* Navigation list */}
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] font-bold text-[#1F2375]/50 uppercase tracking-widest px-2 mb-1.5 font-inter">
                      Navigasi
                    </div>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-[#1F2375] text-white text-[11px] font-semibold text-left shadow-[rgba(31,35,117,0.15)_0px_4px_12px_0px] transition-all">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      Kelas Saya
                    </button>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-lottie-zinc-600 hover:text-[#1F2375] hover:bg-white/60 text-[11px] font-semibold text-left transition-all">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Materi & Tugas
                    </button>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-lottie-zinc-600 hover:text-[#1F2375] hover:bg-white/60 text-[11px] font-semibold text-left transition-all">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Aktivitas
                    </button>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-lottie-zinc-600 hover:text-[#1F2375] hover:bg-white/60 text-[11px] font-semibold text-left transition-all">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Rapor Belajar
                    </button>
                  </div>

                  {/* Kelompok Belajar */}
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] font-bold text-[#1F2375]/50 uppercase tracking-widest px-2 mb-1.5 font-inter">
                      Grup Belajar
                    </div>
                    <button className="flex items-center gap-2 px-2 py-1 text-[11px] text-lottie-zinc-600 hover:text-[#1F2375] transition-all text-left">
                      <span className="w-1.5 h-1.5 rounded bg-indigo-500" />
                      Kelas 10-A Matematika
                    </button>
                    <button className="flex items-center gap-2 px-2 py-1 text-[11px] text-lottie-zinc-600 hover:text-[#1F2375] transition-all text-left">
                      <span className="w-1.5 h-1.5 rounded bg-emerald-500" />
                      Kelompok Belajar Fisika
                    </button>
                  </div>
                </div>

                {/* Profile card */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-white/40 mt-4">
                  <div className="w-8 h-8 rounded-full border border-white/40 overflow-hidden relative flex-shrink-0 bg-white/20">
                    <img
                      src="/images/student_avatar.png"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[10px] font-bold text-lottie-midnight truncate leading-none">
                        Alya Nabila
                      </p>
                      <span className="w-3.5 h-3.5 bg-[#1F2375] rounded-full flex items-center justify-center text-[7px] text-white font-bold flex-shrink-0">
                        ✓
                      </span>
                    </div>
                    <p className="text-[8px] text-lottie-zinc-500 truncate mt-0.5 leading-none">
                      Siswa Premium
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-white/10 min-h-0">
                {/* Search Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/40 bg-white/20">
                  <div className="relative flex-1 max-w-xs">
                    <svg
                      className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-lottie-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kelas / topik materi..."
                      className="w-full pl-8 pr-6 py-1 text-[11px] text-lottie-midnight placeholder-lottie-zinc-400 bg-white/50 rounded-md border border-white/60 focus:outline-none focus:border-[#1F2375]/50 transition-colors"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-lottie-zinc-400 bg-white/60 px-1 rounded pointer-events-none">
                      /
                    </span>
                  </div>
                  <div className="text-[10px] text-[#1F2375]/70 font-semibold flex items-center gap-1 cursor-pointer hover:text-[#1F2375] transition-colors">
                    Dokumen
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Sub Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/40 bg-white/15">
                  <div className="text-[9px] font-bold text-[#1F2375]/60 tracking-wider font-inter">
                    MATERI & TUGAS AKTIF
                  </div>
                  <div className="text-[9px] text-lottie-zinc-500 flex items-center gap-1 hover:text-[#1F2375] cursor-pointer transition-colors">
                    Urutkan
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Subject List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1.5">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((sub, idx) => {
                      let badgeColorClass = "";
                      switch (sub.type) {
                        case "success":
                          badgeColorClass =
                            "text-emerald-700 bg-emerald-100/60 border-emerald-200";
                          break;
                        case "info":
                          badgeColorClass =
                            "text-indigo-700 bg-indigo-100/60 border-indigo-200";
                          break;
                        case "warning":
                          badgeColorClass =
                            "text-amber-700 bg-amber-100/60 border-amber-200";
                          break;
                        case "error":
                          badgeColorClass =
                            "text-rose-700 bg-rose-100/60 border-rose-200";
                          break;
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/30 border border-white/40 hover:bg-white/60 hover:border-white/80 transition-all group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-lottie-midnight group-hover:text-[#1F2375] transition-colors">
                                {sub.name}
                              </span>
                              <span className="text-lottie-zinc-350 text-[9px] font-mono">
                                /
                              </span>
                              <span className="text-[10px] text-lottie-zinc-700 font-medium">
                                {sub.sub}
                              </span>
                            </div>
                            <div className="text-[8px] text-lottie-zinc-400 font-inter leading-none mt-0.5">
                              {sub.desc}
                            </div>
                          </div>
                          <span
                            className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${badgeColorClass} transition-transform group-hover:scale-105`}
                          >
                            {sub.badge}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-lottie-zinc-400">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[10px] font-inter">
                        Pelajaran tidak ditemukan
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle math vector background element */}
    </section>
  );
}
