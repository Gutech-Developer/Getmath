"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [studentsCount, setStudentsCount] = useState(1248);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [dashboardMode, setDashboardMode] = useState<
    "normal" | "happy" | "focus"
  >("normal");
  const heroRef = useRef<HTMLDivElement>(null);

  // Trigger entrance heights animation on mount
  useEffect(() => {
    setIsMounted(true);
    // Increment student count slightly to simulate live activity
    const interval = setInterval(() => {
      setStudentsCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    // Create entrance timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-text-animate", {
      y: 35,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
    });

    tl.from(".hero-mockup-animate", {
      scale: 0.95,
      y: 45,
      opacity: 0,
      duration: 1.1,
      ease: "power2.out",
    }, "-=0.6");

    // Draw SVG brush strokes
    tl.to(".hero-brush-1", {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power1.inOut",
    }, "-=0.5");

    tl.to([".hero-brush-2", ".hero-brush-3"], {
      strokeDashoffset: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power1.inOut",
    }, "-=0.9");

    // Floating animations
    gsap.to(".hero-float-1", {
      y: "-=12",
      rotation: 6,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".hero-float-2", {
      y: "+=15",
      rotation: -5,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".hero-float-3", {
      y: "-=10",
      rotation: 8,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: heroRef });

  // Determine heights and labels based on the active mode
  const getGraphData = () => {
    switch (dashboardMode) {
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

  const currentData = getGraphData();
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum"];

  return (
    <section ref={heroRef} className="relative w-full min-h-svh overflow-hidden bg-[#ededed] math-grid-bg pt-28 pb-20 md:pt-36 md:pb-32">
      {/* Playful background vector elements - Full screen coverage */}

      {/* Hand-drawn star doodle in the left margin */}
      <div className="absolute left-[3%] top-[30%] pointer-events-none z-0 hidden lg:block select-none hero-float-1">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#ffbf00"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 5 C20 15, 25 20, 35 20 C25 20, 20 25, 20 35 C20 25, 15 20, 5 20 C15 20, 20 15, 20 5 Z"
            fill="#fffbeb"
          />
        </svg>
      </div>

      {/* Curved loop arrow */}
      <div className="absolute left-[42%] top-[8%] pointer-events-none z-0 hidden xl:block select-none hero-float-2">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <path d="M 15 15 C 40 15, 65 25, 65 50 C 65 75, 25 75, 25 50 C 25 25, 75 20, 85 45" />
          <path d="M 77 42 L 85 45 L 87 37" />
        </svg>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col justify-center items-center gap-12 px-6 lg:flex-row lg:px-8 relative z-10">
        {/* Left Column: Text Content */}
        <div className="flex flex-1 flex-col items-start gap-6 lg:max-w-xl">
          {/* Announcement/Badge */}
          <div className="inline-flex items-center gap-2 rounded-full hero-text-animate">
            <span className="text-xs font-semibold text-lottie-teal font-inter">
              Platform E-Learning Adaptif
            </span>
          </div>

          {/* Headline in DM Sans */}
          <h1 className="font-dm-sans text-5xl font-normal leading-[1.08] tracking-[-0.04em] text-lottie-midnight lg:text-[4rem] relative hero-text-animate">
            Belajar Lebih{" "}
            <span className="relative inline-block px-2">
              Cerdas
              {/* Hand-drawn yellow highlight circle loop SVG */}
              <svg
                className="absolute -inset-x-5 -inset-y-3 w-[calc(100%+40px)] h-[calc(100%+20px)] pointer-events-none z-[-4]"
                viewBox="0 0 120 50"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="hero-brush-1"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  d="M 10 25 C 10 10, 110 5, 110 25 C 110 45, 15 45, 12 30 C 10 20, 80 12, 105 18"
                  stroke="#ffbf00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{" "}
            untuk Semua{" "}
            <span className="text-[#1F2375] relative inline-block px-1">
              Mata Pelajaran
              {/* Hand-drawn double underline SVG in purple */}
              <svg
                className="absolute left-0 bottom-[-6px] w-full h-[12px] pointer-events-none z-0"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="hero-brush-2"
                  strokeDasharray="300"
                  strokeDashoffset="300"
                  d="M 5 3 Q 100 8 195 3"
                  stroke="#818cf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  className="hero-brush-3"
                  strokeDasharray="300"
                  strokeDashoffset="300"
                  d="M 12 7 Q 100 11 188 8"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Body Copy */}
          <p className="font-inter text-base md:text-lg leading-relaxed text-lottie-zinc-500 max-w-[480px] hero-text-animate">
            GetSmart menyediakan pengalaman belajar yang dipersonalisasi — dari
            modul interaktif, remedial per soal, hingga analitik belajar yang
            komprehensif untuk Matematika, Sains, Sosial, dan lainnya.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-2 hero-text-animate">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-lottie-teal px-6 text-sm font-medium text-white transition-all hover:bg-lottie-teal/90 hover:shadow-[rgba(31,35,117,0.3)_0px_8px_16px_0px] active:scale-[0.98] shadow-[rgba(31,35,117,0.2)_0px_4px_12px_0px]"
            >
              Mulai Belajar Gratis
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="#cara-kerja"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/50 bg-white/40 px-6 text-sm font-medium text-lottie-midnight transition-colors hover:bg-white/80 active:scale-[0.98] backdrop-blur-sm"
            >
              Lihat Demo
            </Link>
          </div>
        </div>

        {/* Right Column: Graphic Content with Lottie Spirits peeking */}
        <div className="relative flex-1 w-full max-w-lg lg:max-w-none hero-mockup-animate">
          {/* Background decoration */}
          <div className="absolute -inset-4 rounded-3xl bg-white/30 border border-white/40 backdrop-blur-sm -rotate-2 scale-95 pointer-events-none" />

          {/* Laptop frame / Dashboard Mock */}
          <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[rgba(31,35,117,0.06)_0px_24px_48px_0px] transition-all duration-300 hover:shadow-[rgba(31,35,117,0.1)_0px_32px_64px_0px]">
            <div className="flex items-center gap-1.5 border-b border-white/40 bg-white/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="ml-4 text-[10px] font-medium text-lottie-zinc-500 font-mono">
                getsmart.id
              </span>
            </div>

            {/* Dashboard Contents Mock */}
            <div className="aspect-[4/3] w-full bg-white/40 p-5 flex flex-col gap-4 select-none">
              {/* Top Row: Mini Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                  <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                    Siswa Aktif
                  </div>
                  <div className="text-xs md:text-sm font-bold text-[#1F2375] font-inter mt-0.5 tabular-nums transition-all duration-300">
                    {studentsCount}
                  </div>
                </div>
                <div className="rounded-xl border border-white/60 bg-white/50 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] hover:scale-[1.03] transition-all duration-300">
                  <div className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider font-inter">
                    Rerata Skor
                  </div>
                  <div className="text-xs md:text-sm font-bold text-[#818cf8] font-inter mt-0.5">
                    {dashboardMode === "happy"
                      ? "92.4%"
                      : dashboardMode === "focus"
                        ? "96.5%"
                        : "88.5%"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#f5ebcb] bg-[#fff8e5]/60 p-2.5 shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] backdrop-blur-sm hover:scale-[1.03] transition-all duration-300">
                  <div className="text-[9px] font-semibold text-amber-800 uppercase tracking-wider font-inter">
                    Selesai
                  </div>
                  <div className="text-xs md:text-sm font-bold text-[#f59e0b] font-inter mt-0.5">
                    {dashboardMode === "focus" ? "48/50" : "42/50"}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex gap-3 min-h-0">
                {/* Graph Card */}
                <div className="flex-1 rounded-xl border border-white/60 bg-white/50 p-4 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_4px_12px_0px] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <div className="text-[10px] font-bold text-[#1F2375]/80 font-inter">
                      {currentData.label}
                    </div>
                    <div className="h-1.5 w-6 rounded bg-[#1F2375]/10" />
                  </div>

                  {/* SVG Grid background lines for professional look */}
                  <div className="absolute inset-0 top-8 px-4 flex flex-col justify-between pointer-events-none opacity-[0.05]">
                    <div className="border-b border-[#1F2375] w-full h-0" />
                    <div className="border-b border-[#1F2375] w-full h-0" />
                    <div className="border-b border-[#1F2375] w-full h-0" />
                  </div>

                  {/* Bar Chart Container */}
                  <div className="flex-1 flex items-end justify-around gap-1.5 pt-6 relative z-10 h-28">
                    {currentData.heights.map((h, idx) => {
                      const finalHeight = isMounted ? h : 0;
                      const isDimmed =
                        hoveredBar !== null && hoveredBar !== idx;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Tooltip */}
                          <div
                            className={`absolute top-0 bg-[#1F2375] text-white text-[9px] px-2 py-0.5 rounded shadow-md pointer-events-none transition-all duration-200 font-inter ${
                              hoveredBar === idx
                                ? "opacity-100 -translate-y-1"
                                : "opacity-0 translate-y-1"
                            }`}
                          >
                            {currentData.tooltipPrefix}
                            {h}
                            {currentData.tooltipSuffix}
                          </div>

                          {/* Bar */}
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ease-out ${currentData.colorClass} ${
                              isDimmed
                                ? "opacity-40 scale-95"
                                : "opacity-100 scale-100"
                            }`}
                            style={{ height: `${finalHeight}%` }}
                          />
                          <span className="text-[9px] font-semibold text-lottie-zinc-500 mt-1.5 font-inter">
                            {days[idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Column (Diagnostic Controls) */}
                <div className="w-1/3 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      setDashboardMode((prev) =>
                        prev === "happy" ? "normal" : "happy",
                      )
                    }
                    className={`rounded-xl border p-2 flex flex-col items-center justify-center shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] transition-all duration-300 w-full group ${
                      dashboardMode === "happy"
                        ? "bg-emerald-50 border-emerald-300 scale-[1.03]"
                        : "bg-white/50 border-white/60 hover:bg-white/80"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-0.5 transition-transform duration-300 group-hover:scale-110 ${
                        dashboardMode === "happy"
                          ? "bg-emerald-200 animate-bounce"
                          : "bg-lottie-mint-wash"
                      }`}
                    >
                      😊
                    </div>
                    <div className="text-[8px] font-bold text-[#1F2375]/70 uppercase tracking-wider font-inter">
                      {dashboardMode === "happy" ? "Aktif" : "Emosi"}
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setDashboardMode((prev) =>
                        prev === "focus" ? "normal" : "focus",
                      )
                    }
                    className={`rounded-xl border p-2 flex flex-col items-center justify-center shadow-[rgba(31,35,117,0.01)_0px_2px_4px_0px] transition-all duration-300 w-full group ${
                      dashboardMode === "focus"
                        ? "bg-indigo-50 border-indigo-300 scale-[1.03]"
                        : "bg-white/50 border-white/60 hover:bg-white/80"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-0.5 transition-transform duration-300 group-hover:rotate-12 ${
                        dashboardMode === "focus"
                          ? "bg-indigo-200 animate-pulse"
                          : "bg-lottie-cream/80"
                      }`}
                    >
                      🎯
                    </div>
                    <div className="text-[8px] font-bold text-[#1F2375]/70 uppercase tracking-wider font-inter">
                      {dashboardMode === "focus" ? "Fokus" : "Fokus"}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Playful Mascot: Pink Spirit peeking from behind the laptop */}
          <div
            className="absolute -top-12 right-12 z-0 animate-bounce"
            style={{ animationDuration: "4s" }}
          >
            <svg
              width="60"
              height="70"
              viewBox="0 0 60 70"
              fill="none"
              className="drop-shadow-sm"
            >
              {/* Pink body */}
              <path d="M5 65C5 30 15 5 30 5C45 5 55 30 55 65" fill="#ff6b9d" />
              {/* Eyes */}
              <circle cx="23" cy="35" r="3" fill="#09090b" />
              <circle cx="37" cy="35" r="3" fill="#09090b" />
              {/* Rosy cheeks */}
              <circle cx="18" cy="39" r="2" fill="#ff9ebb" />
              <circle cx="42" cy="39" r="2" fill="#ff9ebb" />
              {/* Smile */}
              <path
                d="M28 40C28 41 32 41 32 40"
                stroke="#09090b"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Cute little hair tuft */}
              <path
                d="M30 5C30 -2 33 2 30 5"
                stroke="#ff6b9d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Playful Mascot: Yellow Star Spirit peeking from the bottom-left */}
          <div className="absolute -bottom-10 -left-8 z-20 hover:scale-110 transition-transform cursor-pointer hero-float-3">
            <svg
              width="70"
              height="70"
              viewBox="0 0 70 70"
              fill="none"
              className="drop-shadow-md"
            >
              {/* Yellow star body */}
              <path
                d="M35 5L44 24L65 27L50 42L54 63L35 53L16 63L20 42L5 27L26 24L35 5Z"
                fill="#ffbf00"
              />
              {/* Cute face */}
              <circle cx="28" cy="35" r="2.5" fill="#09090b" />
              <circle cx="42" cy="35" r="2.5" fill="#09090b" />
              <path
                d="M33 39C34 40.5 36 40.5 37 39"
                stroke="#09090b"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Cheeks */}
              <circle cx="24" cy="37" r="1.5" fill="#ffd043" />
              <circle cx="46" cy="37" r="1.5" fill="#ffd043" />
              {/* Stick arm waving */}
              <path
                d="M54 42C58 40 60 38 62 38"
                stroke="#09090b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Floating badge: Emotion Recognition Indicator */}
          {/* <div className="absolute -right-8 top-16 z-20 flex items-center gap-2.5 rounded-2xl border border-white/50 bg-white/70 px-3 py-2.5 shadow-[rgba(31,35,117,0.06)_0px_8px_24px_0px] backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lottie-mint-wash text-lottie-teal font-bold">
              😊
            </div>
            <div>
              <p className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider">AI Emotion</p>
              <p className="text-xs font-bold text-lottie-midnight">Fokus Stabil</p>
            </div>
          </div> */}

          {/* Floating badge: Active Student Count */}
          {/* <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2.5 rounded-2xl border border-white/50 bg-white/70 px-3 py-2.5 shadow-[rgba(31,35,117,0.06)_0px_8px_24px_0px] backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lottie-cream text-lottie-midnight">
              <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-lottie-zinc-500 uppercase tracking-wider">Aktif Belajar</p>
              <p className="text-xs font-bold text-lottie-midnight">15.000+ Siswa</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Subtle math vector background element */}
      <div className="absolute left-[5%] bottom-[10%] opacity-[0.05] pointer-events-none z-0 hidden lg:block select-none">
        <svg width="240" height="120" viewBox="0 0 240 120" fill="none">
          <line
            x1="10"
            y1="60"
            x2="230"
            y2="60"
            stroke="#1F2375"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1="120"
            y1="10"
            x2="120"
            y2="110"
            stroke="#1F2375"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M10,60 Q37.5,0 65,60 T120,60 T175,60 T230,60"
            stroke="#1F2375"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M10,10 Q37.5,60 65,110 T120,10 T175,110 T230,10"
            stroke="#1F2375"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            fill="none"
          />
          <circle cx="65" cy="60" r="3" fill="#1F2375" />
          <circle cx="120" cy="60" r="3" fill="#1F2375" />
          <circle cx="175" cy="60" r="3" fill="#1F2375" />
          <text
            x="225"
            y="52"
            fill="#1F2375"
            fontSize="8"
            fontFamily="monospace"
          >
            x
          </text>
          <text
            x="125"
            y="18"
            fill="#1F2375"
            fontSize="8"
            fontFamily="monospace"
          >
            y
          </text>
          <text
            x="70"
            y="55"
            fill="#1F2375"
            fontSize="6"
            fontFamily="monospace"
          >
            π/2
          </text>
          <text
            x="130"
            y="55"
            fill="#1F2375"
            fontSize="6"
            fontFamily="monospace"
          >
            π
          </text>
        </svg>
      </div>
    </section>
  );
}
