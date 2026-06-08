"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorksSection() {
  const [isMounted, setIsMounted] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useGSAP(() => {
    // Title entrance
    gsap.from(".how-title-animate", {
      scrollTrigger: {
        trigger: ".how-title-animate",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        // Draw brush underline
        gsap.to(".how-brush-1", {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power1.inOut",
        });
      }
    });

    // Cards staggered entrance
    gsap.from(".how-card-animate", {
      scrollTrigger: {
        trigger: ".how-card-animate",
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });
  }, { scope: howItWorksRef });

  return (
    <section
      ref={howItWorksRef}
      id="cara-kerja"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden z-0 math-grid-bg"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16 text-center how-title-animate">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-base font-semibold text-[#1F2375] font-inter uppercase tracking-wide">
            Cara Kerja
          </span>
          <h2 className="mt-4 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-lottie-midnight sm:text-[48px] leading-[1.12]">
            Segala Kemudahan dalam{" "}
            <span className="relative inline-block px-1">
              Satu Genggaman
              {/* Orange brush stroke line under the word */}
              <svg
                className="absolute left-0 bottom-[-4px] w-full h-[8px] pointer-events-none z-0"
                viewBox="0 0 100 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="how-brush-1"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  d="M 5 4 Q 25 1, 50 4 T 95 4"
                  stroke="#f97316"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-inter text-base text-lottie-zinc-500">
            Dari belajar di smartphone hingga analisis perkembangan AI yang
            mendalam, temukan alur belajar yang ringkas.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {/* Column 1: Mobile Friendly Card */}
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate">
            <div className="mb-8">
              <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                Akses Mobile Ringan
              </h3>
              <p className="mt-3 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                Belajar matematika dan ilmu pengetahuan lainnya di mana saja,
                kapan saja dengan tampilan seluler yang responsif, adaptif, dan
                super cepat.
              </p>
            </div>

            {/* HTML Mobile Mockup */}
            <div className="w-[200px] h-[340px] border-[6px] border-lottie-zinc-900 rounded-[36px] bg-white/80 shadow-xl mx-auto relative overflow-hidden flex flex-col pt-3 select-none">
              {/* Speaker & Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-lottie-zinc-900 rounded-full flex items-center justify-center gap-1.5 z-25">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-6 h-0.5 rounded bg-white/20" />
              </div>

              {/* Screen Content */}
              <div className="flex-1 flex flex-col bg-white/40 p-3 pt-4 gap-3">
                {/* Header inside phone */}
                <div className="flex justify-between items-center pb-2 border-b border-lottie-zinc-200">
                  <div className="text-[10px] font-bold text-[#1F2375]">
                    Matematika 10-A
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Tasks List inside phone */}
                <div className="flex flex-col gap-2">
                  <div className="text-[8px] font-bold text-lottie-zinc-400 uppercase tracking-wider font-inter">
                    Tugas Hari Ini
                  </div>

                  {/* Task 1 */}
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-lottie-zinc-100 shadow-sm">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[8px] text-emerald-600 font-bold">
                      ✓
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-lottie-midnight truncate leading-none font-inter">
                        Matriks Dasar
                      </p>
                      <p className="text-[7px] text-lottie-zinc-400 mt-0.5 font-inter">
                        Selesai • 100 XP
                      </p>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1F2375]" />
                    <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[8px] text-indigo-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F2375] animate-ping" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-lottie-midnight truncate leading-none font-inter">
                        Aljabar Determinan
                      </p>
                      <p className="text-[7px] text-indigo-600 font-semibold mt-0.5 font-inter">
                        Dikerjakan
                      </p>
                    </div>
                  </div>

                  {/* Task 3 */}
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/50 border border-dashed border-lottie-zinc-200 opacity-60">
                    <span className="w-4 h-4 rounded-full border border-lottie-zinc-300 flex items-center justify-center text-[8px] text-lottie-zinc-400 font-inter">
                      •
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-semibold text-lottie-zinc-500 truncate leading-none font-inter">
                        Kuis Invers Matriks
                      </p>
                      <p className="text-[7px] text-lottie-zinc-400 mt-0.5 font-inter">
                        Belum Terbuka
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Stack of 2 Cards (Performance & Security) */}
          <div className="flex flex-col gap-8">
            {/* Card 2A: Performance */}
            <div className="flex-1 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate">
              <div>
                <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                  Analisis Hasil & Kenaikan
                </h3>
                <p className="mt-2.5 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                  AI secara aktif merekomendasikan video pemantik dan kuis
                  remedial untuk meningkatkan skor kognitif rata-rata siswa.
                </p>
              </div>

              {/* Stat + Wave Chart Mockup */}
              <div className="mt-6 flex flex-col gap-4 select-none">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#1F2375] font-inter tracking-tight">
                    +28%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full font-inter">
                    Kenaikan Skor
                  </span>
                </div>

                {/* Wave bar chart */}
                <div className="h-14 flex items-end gap-1 px-2 pb-1 bg-white/30 rounded-xl border border-white/50 relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none p-2">
                    <div className="border-b border-[#1F2375] w-full" />
                    <div className="border-b border-[#1F2375] w-full" />
                  </div>
                  {[
                    20, 30, 45, 60, 50, 40, 55, 75, 90, 80, 65, 50, 40, 45, 60,
                  ].map((h, i) => {
                    const finalHeight = isMounted ? h : 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-[#1F2375] rounded-t-sm transition-all duration-500 hover:bg-[#818cf8]"
                        style={{ height: `${finalHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card 2B: Security */}
            <div className="flex-1 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate">
              <div>
                <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                  Keamanan & Koneksi Orang Tua
                </h3>
                <p className="mt-2.5 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                  Data hasil belajar anak terhubung secara terenkripsi langsung
                  ke dashboard guru dan dapat diakses real-time oleh orang tua.
                </p>
              </div>

              {/* Connection Graphic */}
              <div className="mt-6 relative w-full h-16 flex items-center justify-around bg-white/30 rounded-2xl border border-white/50 overflow-hidden px-4 select-none">
                {/* Connective background line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#1F2375]/15 z-0" />

                {/* Cloud Circle */}
                <div className="w-10 h-10 rounded-full bg-white border border-[#1F2375]/20 flex items-center justify-center text-indigo-600 shadow-sm z-10 hover:scale-105 transition-transform">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>

                {/* Verified Shield in Middle */}
                <div className="w-12 h-12 rounded-full bg-[#e0e7ff] border border-indigo-300 flex items-center justify-center text-[#1F2375] shadow-md z-10 relative hover:scale-105 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-extrabold shadow-sm">
                    ✓
                  </span>
                </div>

                {/* Server/Database Circle */}
                <div className="w-10 h-10 rounded-full bg-white border border-[#1F2375]/20 flex items-center justify-center text-indigo-600 shadow-sm z-10 hover:scale-105 transition-transform">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Recommendations AI Card (Code editor) */}
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate">
            <div className="mb-8">
              <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                Analisis & Rekomendasi AI
              </h3>
              <p className="mt-3 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                Sistem AI GetSmart memetakan emosi dan fokus untuk memberikan
                kesimpulan diagnostik serta rekomendasi topik materi
                selanjutnya.
              </p>
            </div>

            {/* HTML Mock Code Editor */}
            <div className="w-full bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden flex flex-col h-[280px] font-mono text-[10px] leading-relaxed text-slate-350 select-none">
              {/* Tab Header bar */}
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 border-b border-slate-800">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>

                {/* Active tab tag */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e293b] rounded-t-md text-[9px] font-bold text-indigo-300 border-t border-indigo-400/50">
                  <svg
                    className="w-3 h-3 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 22h20L12 2zm1 18h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  RekomendasiAI.json
                </div>

                <span className="text-[8px] text-slate-500">JSON</span>
              </div>

              {/* Editor Workspace content */}
              <div className="p-4 flex-1 overflow-y-auto no-scrollbar bg-[#111827]/90 flex flex-col justify-center gap-1 text-[9px] md:text-[10px]">
                <div>
                  <span className="text-slate-500">1</span>{" "}
                  <span className="text-indigo-400">{"{"}</span>
                </div>
                <div>
                  <span className="text-slate-500">2</span>{" "}
                  <span className="text-purple-400">&quot;siswa&quot;</span>:{" "}
                  <span className="text-amber-300">
                    &quot;Alya Nabila&quot;
                  </span>
                  ,
                </div>
                <div>
                  <span className="text-slate-500">3</span>{" "}
                  <span className="text-purple-400">
                    &quot;statusFokus&quot;
                  </span>
                  : <span className="text-amber-300">&quot;94%&quot;</span>,
                </div>
                <div>
                  <span className="text-slate-500">4</span>{" "}
                  <span className="text-purple-400">
                    &quot;deteksiEmosi&quot;
                  </span>
                  : <span className="text-amber-300">&quot;Bahagia&quot;</span>,
                </div>
                <div>
                  <span className="text-slate-500">5</span>{" "}
                  <span className="text-purple-400">
                    &quot;butuhRemedial&quot;
                  </span>
                  : <span className="text-emerald-400">true</span>,
                </div>
                <div>
                  <span className="text-slate-500">6</span>{" "}
                  <span className="text-purple-400">
                    &quot;materiRekomendasi&quot;
                  </span>
                  :{" "}
                  <span className="text-amber-300">
                    &quot;Aljabar Matriks&quot;
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">7</span>{" "}
                  <span className="text-indigo-400">{"}"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
