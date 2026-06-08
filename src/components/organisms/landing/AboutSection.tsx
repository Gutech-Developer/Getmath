"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutSection() {
  const [isMounted, setIsMounted] = useState(false);

  // Visi dashboard mockup state
  const [studentsCount, setStudentsCount] = useState(1248);
  const [hoveredVisiBar, setHoveredVisiBar] = useState<number | null>(null);
  const [visiMode, setVisiMode] = useState<"normal" | "happy" | "focus">(
    "normal",
  );
  const aboutRef = useRef<HTMLDivElement>(null);

  // Misi dashboard mockup state
  const [modules, setModules] = useState([
    {
      id: 1,
      name: "Tes Diagnostik",
      duration: "10m",
      score: 85,
      completed: true,
    },
    {
      id: 2,
      name: "Materi Interaktif",
      duration: "15m",
      score: 90,
      completed: false,
    },
    {
      id: 3,
      name: "Latihan Adaptif",
      duration: "12m",
      score: 95,
      completed: false,
    },
  ]);
  const [hoveredMisiBar, setHoveredMisiBar] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Increment student count slightly to simulate live activity
    const interval = setInterval(() => {
      setStudentsCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    // Fade in title/desc
    gsap.from(".about-title-animate", {
      scrollTrigger: {
        trigger: ".about-title-animate",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      onComplete: () => {
        // Draw the highlighter when visible
        gsap.to(".about-brush-1", {
          strokeDashoffset: 0,
          duration: 1,
          ease: "power1.inOut",
        });
      }
    });

    // Slide in cards
    gsap.from(".about-card-left", {
      scrollTrigger: {
        trigger: ".about-card-left",
        start: "top 80%",
      },
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });

    gsap.from(".about-card-right", {
      scrollTrigger: {
        trigger: ".about-card-right",
        start: "top 80%",
      },
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  }, { scope: aboutRef });

  const toggleModule = (id: number) => {
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === id ? { ...mod, completed: !mod.completed } : mod,
      ),
    );
  };

  const completedCount = modules.filter((m) => m.completed).length;
  const completionPercent = Math.round((completedCount / modules.length) * 100);
  const averageScore =
    completedCount > 0
      ? Math.round(
          modules
            .filter((m) => m.completed)
            .reduce((acc, m) => acc + m.score, 0) / completedCount,
        )
      : 0;

  // Visi graph config
  const getVisiGraphData = () => {
    switch (visiMode) {
      case "happy":
        return {
          heights: [60, 80, 70, 95, 85],
          label: "Status Belajar: Sangat Baik",
          tooltipPrefix: "Skor: ",
          tooltipSuffix: "%",
          colorClass: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        };
      case "focus":
        return {
          heights: [95, 90, 98, 92, 95],
          label: "Mode Fokus: Maksimal",
          tooltipPrefix: "Fokus: ",
          tooltipSuffix: "%",
          colorClass: "bg-[#1F2375] shadow-[0_0_12px_rgba(31,35,117,0.4)]",
        };
      case "normal":
      default:
        return {
          heights: [40, 65, 50, 90, 75],
          label: "Durasi Belajar",
          tooltipPrefix: "Waktu: ",
          tooltipSuffix: " mnt",
          colorClass: "bg-[#1F2375]/85 hover:bg-[#1F2375]",
        };
    }
  };

  const visiData = getVisiGraphData();
  const visiDays = ["Mod 1", "Mod 2", "Mod 3", "Mod 4", "Mod 5"];

  return (
    <section
      ref={aboutRef}
      id="tentang"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden z-0 math-grid-bg"
    >
      {/* Tiny decorative elements */}
      <div className="absolute w-full min-h-[600px] rounded-4xl bg-[#252525] max-w-7xl top-14 left-1/2 -translate-x-1/2 "></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center rounded-full  px-3 py-1 text-base font-semibold text-white font-inter uppercase tracking-wide about-title-animate">
            Tentang Kami
          </span>
          <h2 className="mt-4 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-white sm:text-[48px] leading-[1.12] about-title-animate">
            Apa itu{" "}
            <span className="relative inline-block px-2">
              GetSmart?
              {/* Pink hand-drawn circular highlighter SVG */}
              <svg
                className="absolute -inset-x-5 -inset-y-4 w-[calc(100%+40px)] h-[calc(100%+40px)] pointer-events-none z-[-4]"
                viewBox="0 0 140 50"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="about-brush-1"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  d="M 12 25 C 12 12, 128 8, 128 25 C 128 42, 18 42, 14 30 C 12 20, 95 14, 122 18"
                  stroke="#ff6b9d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-white/80 about-title-animate">
            GetSmart adalah platform E-Learning yang menggabungkan teknologi AI
            untuk menciptakan pengalaman belajar yang adaptif and personal bagi
            setiap siswa di seluruh Indonesia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Visi (Cream Paper Highlight Card - Glassmorphic) */}
          <div className="rounded-[24px] border border-white/60 bg-white/40 backdrop-blur-md p-8 md:p-10 transition-all hover:scale-[1.01] shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] flex flex-col items-center gap-5 about-card-left">
            <h3 className=" font-dm-sans text-2xl font-bold tracking-tight text-white">
              Visi
            </h3>
            <p className="font-inter text-sm md:text-base leading-relaxed text-white">
              Menyediakan modul belajar interaktif, tes diagnostik berbasis
              emosi, dan analitik belajar komprehensif (LAD Dashboard) yang
              membantu siswa, guru, dan orang tua berkolaborasi mencapai hasil
              belajar terbaik.
            </p>
            <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-black/15 bg-[#ededed] backdrop-blur-md shadow-[rgba(31,35,117,0.06)_0px_24px_48px_0px] transition-all duration-300 hover:shadow-[rgba(31,35,117,0.1)_0px_32px_64px_0px] select-none">
              <div className="flex items-center gap-1.5 border-b border-white/40 bg-white/40 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-4 text-[10px] font-medium text-lottie-zinc-500 font-mono">
                  getsmart.id
                </span>
              </div>

              {/* Dashboard Contents Mock */}
              <div className="aspect-[4/3] w-full bg-white/40 p-5 flex flex-col gap-4">
                {/* Top Row: Mini Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                      Siswa Aktif
                    </div>
                    <div className="text-xs font-bold text-[#1F2375] font-inter mt-0.5 tabular-nums">
                      {studentsCount}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                      Skor Rata-rata
                    </div>
                    <div className="text-xs font-bold text-[#818cf8] font-inter mt-0.5">
                      {visiMode === "happy"
                        ? "92.4%"
                        : visiMode === "focus"
                          ? "96.5%"
                          : "88.5%"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#f5ebcb] bg-[#fff8e5]/60 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] backdrop-blur-sm hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-amber-800 uppercase tracking-wider font-inter">
                      Selesai
                    </div>
                    <div className="text-xs font-bold text-[#f59e0b] font-inter mt-0.5">
                      {visiMode === "focus" ? "48/50" : "42/50"}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-3 min-h-0">
                  {/* Graph Card */}
                  <div className="flex-1 rounded-xl border border-white/60 bg-white/50 p-4 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_4px_12px_0px] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1 relative z-10">
                      <div className="text-[10px] font-bold text-[#1F2375]/80 font-inter">
                        {visiData.label}
                      </div>
                      <div className="h-1.5 w-6 rounded bg-[#1F2375]/10" />
                    </div>

                    <div className="absolute inset-0 top-8 px-4 flex flex-col justify-between pointer-events-none opacity-[0.05]">
                      <div className="border-b border-[#1F2375] w-full h-0" />
                      <div className="border-b border-[#1F2375] w-full h-0" />
                      <div className="border-b border-[#1F2375] w-full h-0" />
                    </div>

                    <div className="flex-1 flex items-end justify-around gap-1.5 pt-6 relative z-10 h-28">
                      {visiData.heights.map((h, idx) => {
                        const finalHeight = isMounted ? h : 0;
                        const isDimmed =
                          hoveredVisiBar !== null && hoveredVisiBar !== idx;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer"
                            onMouseEnter={() => setHoveredVisiBar(idx)}
                            onMouseLeave={() => setHoveredVisiBar(null)}
                          >
                            <div
                              className={`absolute top-0 bg-[#1F2375] text-white text-[9px] px-2 py-0.5 rounded shadow-md pointer-events-none transition-all duration-200 font-inter ${
                                hoveredVisiBar === idx
                                  ? "opacity-100 -translate-y-1"
                                  : "opacity-0 translate-y-1"
                              }`}
                            >
                              {visiData.tooltipPrefix}
                              {h}
                              {visiData.tooltipSuffix}
                            </div>

                            <div
                              className={`w-full rounded-t-md transition-all duration-500 ease-out ${visiData.colorClass} ${
                                isDimmed
                                  ? "opacity-40 scale-95"
                                  : "opacity-100 scale-100"
                              }`}
                              style={{ height: `${finalHeight}%` }}
                            />
                            <span className="text-[9px] font-semibold text-lottie-zinc-500 mt-1.5 font-inter">
                              {visiDays[idx]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="w-1/3 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setVisiMode((prev) =>
                          prev === "happy" ? "normal" : "happy",
                        )
                      }
                      className={`rounded-xl border p-2 flex flex-col items-center justify-center shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] transition-all duration-300 w-full group ${
                        visiMode === "happy"
                          ? "bg-emerald-50 border-emerald-300 scale-[1.03]"
                          : "bg-white/50 border-white/60 hover:bg-white/80"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-0.5 transition-transform duration-300 group-hover:scale-110 ${
                          visiMode === "happy"
                            ? "bg-emerald-200 animate-bounce"
                            : "bg-lottie-mint-wash"
                        }`}
                      ></div>
                      <div className="text-[8px] font-bold text-[#1F2375]/70 uppercase tracking-wider font-inter">
                        {visiMode === "happy" ? "Aktif" : "Emosi"}
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setVisiMode((prev) =>
                          prev === "focus" ? "normal" : "focus",
                        )
                      }
                      className={`rounded-xl border p-2 flex flex-col items-center justify-center shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] transition-all duration-300 w-full group ${
                        visiMode === "focus"
                          ? "bg-indigo-50 border-indigo-300 scale-[1.03]"
                          : "bg-white/50 border-white/60 hover:bg-white/80"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-0.5 transition-transform duration-300 group-hover:rotate-12 ${
                          visiMode === "focus"
                            ? "bg-indigo-200 animate-pulse"
                            : "bg-lottie-cream/80"
                        }`}
                      ></div>
                      <div className="text-[8px] font-bold text-[#1F2375]/70 uppercase tracking-wider font-inter">
                        {visiMode === "focus" ? "Fokus" : "Fokus"}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Misi (White Card - Glassmorphic) */}
          <div className="rounded-[24px] border border-white/60 bg-white/40 backdrop-blur-md p-8 md:p-10 transition-all hover:scale-[1.01] shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] flex flex-col items-center gap-5 about-card-right">
            <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[rgba(31,35,117,0.06)_0px_24px_48px_0px] transition-all duration-300 hover:shadow-[rgba(31,35,117,0.1)_0px_32px_64px_0px] select-none">
              <div className="flex items-center gap-1.5 border-b border-white/40 bg-white/40 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-4 text-[10px] font-medium text-lottie-zinc-500 font-mono">
                  getsmart.id
                </span>
              </div>

              {/* Dashboard Contents Mock */}
              <div className="aspect-[4/3] w-full bg-white/40 p-5 flex flex-col gap-4">
                {/* Top Row: Mini Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                      Modul Selesai
                    </div>
                    <div className="text-xs font-bold text-[#1F2375] font-inter mt-0.5">
                      {completedCount} / {modules.length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                      Kemajuan
                    </div>
                    <div className="text-xs font-bold text-[#818cf8] font-inter mt-0.5">
                      {completionPercent}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#f5ebcb] bg-[#fff8e5]/60 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] backdrop-blur-sm hover:scale-[1.03] transition-all duration-300">
                    <div className="text-[9px] font-semibold text-amber-800 uppercase tracking-wider font-inter">
                      Peringkat
                    </div>
                    <div className="text-xs font-bold text-[#f59e0b] font-inter mt-0.5">
                      #1
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-3 min-h-0">
                  {/* Left checklist panel */}
                  <div className="w-1/2 rounded-xl border border-white/60 bg-white/50 p-3 flex flex-col justify-center gap-2 shadow-[rgba(31,35,117,0.02)_0px_4px_12px_0px]">
                    <div className="text-[9px] font-bold text-[#1F2375]/80 uppercase tracking-wider mb-0.5 font-inter">
                      Daftar Modul Belajar
                    </div>
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                          mod.completed
                            ? "bg-indigo-50/50 border-indigo-200/80 text-[#1F2375]"
                            : "bg-white/40 border-transparent hover:bg-white/70 text-lottie-zinc-600"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                            mod.completed
                              ? "bg-[#1F2375] border-[#1F2375] text-white"
                              : "border-lottie-zinc-300 bg-white"
                          }`}
                        >
                          {mod.completed && (
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold truncate leading-none font-inter">
                            {mod.name}
                          </p>
                          <p className="text-[8px] text-lottie-zinc-500 font-inter mt-0.5">
                            {mod.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Graph Panel */}
                  <div className="w-1/2 rounded-xl border border-white/60 bg-white/50 p-3 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_4px_12px_0px] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1 relative z-10">
                      <div className="text-[9px] font-bold text-[#1F2375]/80 font-inter">
                        Nilai / Capaian
                      </div>
                      <div className="h-1.5 w-6 rounded bg-[#1F2375]/10" />
                    </div>

                    <div className="flex-1 flex items-end justify-around gap-2 pt-6 relative z-10 h-24">
                      {modules.map((mod, idx) => {
                        const h = mod.completed ? mod.score : 0;
                        const finalHeight = isMounted ? h : 0;
                        const isDimmed =
                          hoveredMisiBar !== null && hoveredMisiBar !== idx;
                        return (
                          <div
                            key={mod.id}
                            className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer"
                            onMouseEnter={() => setHoveredMisiBar(idx)}
                            onMouseLeave={() => setHoveredMisiBar(null)}
                          >
                            <div
                              className={`absolute top-0 bg-[#1F2375] text-white text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-all duration-200 font-inter ${
                                hoveredMisiBar === idx
                                  ? "opacity-100 -translate-y-1"
                                  : "opacity-0 translate-y-1"
                              }`}
                            >
                              {mod.completed
                                ? `Skor: ${mod.score}`
                                : "Belum selesai"}
                            </div>

                            <div
                              className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                                mod.completed
                                  ? "bg-[#1F2375] shadow-[0_0_8px_rgba(31,35,117,0.2)]"
                                  : "bg-[#1F2375]/10"
                              } ${
                                isDimmed
                                  ? "opacity-50 scale-95"
                                  : "opacity-100 scale-100"
                              }`}
                              style={{ height: `${finalHeight || 10}%` }}
                            />
                            <span className="text-[8px] font-semibold text-lottie-zinc-500 mt-1 font-inter">
                              Mod {mod.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className=" font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
              Misi
            </h3>
            <p className="font-inter text-sm md:text-base leading-relaxed text-lottie-zinc-500">
              Menyediakan modul belajar interaktif, tes diagnostik berbasis
              emosi, dan analitik belajar komprehensif (LAD Dashboard) yang
              membantu siswa, guru, dan orang tua berkolaborasi mencapai hasil
              belajar terbaik.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
