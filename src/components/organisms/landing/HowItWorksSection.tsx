"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorksSection() {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useGSAP(() => {
    if (!howItWorksRef.current) return;

    // Title entrance
    gsap.from(".how-title-animate", {
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
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
        trigger: howItWorksRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
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
            {t("howItWorks.badge")}
          </span>
          <h2 className="mt-4 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-lottie-midnight sm:text-[48px] leading-[1.12]">
            {t("howItWorks.titlePrefix")}
            <span className="relative inline-block px-1">
              {t("howItWorks.titleHighlight")}
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
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-center">
          {/* Column 1: Integrated Flow Laptop Mockup Card */}
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate min-h-[460px]">
            <div className="">
              <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                {t("howItWorks.card1Title")}
              </h3>
              <p className="mt-3 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                {t("howItWorks.card1Desc")}
              </p>
            </div>

            {/* Laptop Mockup Container */}
            <div className="w-full select-none mt-2 ">
              <div className="rounded-t-xl border-[4px] border-b-0 border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
                {/* Browser Top Bar */}
                <div className="h-5 bg-slate-800 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[7px] font-mono text-slate-400">getsmart.id/workspace</span>
                </div>

                {/* Laptop Viewport Content */}
                <div className="bg-slate-50 p-2.5 flex flex-col gap-1.5 text-slate-800 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-[9.5px] font-bold text-[#1F2375] font-inter">
                      Matematika: Aljabar Matriks
                    </span>
                    <span className="text-[7px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 font-mono">
                      4 Step
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {/* Step 1 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                      <div className="flex items-center gap-1.5">
                      
                        <span className="text-[8.5px] font-bold text-slate-800 font-inter">{t("howItWorks.flowStep1")}</span>
                      </div>
                      <span className="text-[7px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">{t("howItWorks.flowStep1Status")}</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/70 border border-rose-100">
                      <div className="flex items-center gap-1.5">
                     
                        <span className="text-[8.5px] font-bold text-slate-800 font-inter">{t("howItWorks.flowStep2")}</span>
                      </div>
                      <span className="text-[7px] font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">{t("howItWorks.flowStep2Status")}</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <div className="flex items-center gap-1.5">
                      
                        <span className="text-[8.5px] font-bold text-slate-800 font-inter">{t("howItWorks.flowStep3")}</span>
                      </div>
                      <span className="text-[7px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">{t("howItWorks.flowStep3Status")}</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/70 border border-amber-100">
                      <div className="flex items-center gap-1.5">
                      
                        <span className="text-[8.5px] font-bold text-slate-800 font-inter">{t("howItWorks.flowStep4")}</span>
                      </div>
                      <span className="text-[7px] font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">{t("howItWorks.flowStep4Status")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Keyboard Base */}
              <div className="relative h-2.5 bg-slate-700 rounded-b-lg border-t border-slate-600 shadow-md flex justify-center items-start">
                <div className="w-10 h-0.5 bg-slate-500 rounded-full mt-0.5" />
              </div>
            </div>
          </div>

          {/* Column 2: Stack of 2 Cards (Performance & Security) */}
          <div className="flex flex-col gap-8 min-h-[460px]">
            {/* Card 2A: Performance */}
            <div className="flex-1 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate">
              <div>
                <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                  {t("howItWorks.card2ATitle")}
                </h3>
                <p className="mt-2.5 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                  {t("howItWorks.card2ADesc")}
                </p>
              </div>

              {/* Stat + Wave Chart Mockup */}
              <div className="mt-6 flex flex-col gap-4 select-none">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#1F2375] font-inter tracking-tight">
                    {t("howItWorks.scoreGain")}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full font-inter">
                    {t("howItWorks.scoreGainLabel")}
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
                  {t("howItWorks.card2BTitle")}
                </h3>
                <p className="mt-2.5 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                  {t("howItWorks.card2BDesc")}
                </p>
              </div>

              {/* Connection Graphic */}
              <div className="mt-6 relative w-full h-16 flex items-center justify-around bg-white/30 rounded-2xl border border-white/50 overflow-hidden px-4 select-none">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#1F2375]/15 z-0" />

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
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-8 flex flex-col justify-between shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 how-card-animate min-h-[460px]">
            <div className="mb-6">
              <h3 className="font-dm-sans text-2xl font-bold text-lottie-midnight tracking-tight">
                {t("howItWorks.card3Title")}
              </h3>
              <p className="mt-3 font-inter text-sm leading-relaxed text-lottie-zinc-500">
                {t("howItWorks.card3Desc")}
              </p>
            </div>

            {/* HTML Mock Code Editor */}
            <div className="w-full bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden flex flex-col h-[260px] font-mono text-[10px] leading-relaxed text-slate-350 select-none">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 border-b border-slate-800">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e293b] rounded-t-md text-[9px] font-bold text-indigo-300 border-t border-indigo-400/50">
                  <svg
                    className="w-3 h-3 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 22h20L12 2zm1 18h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  {t("howItWorks.codeTab")}
                </div>

                <span className="text-[8px] text-slate-500">JSON</span>
              </div>

              <div className="p-4 flex-1 overflow-y-auto no-scrollbar bg-[#111827]/90 flex flex-col justify-center gap-1 text-[9px] md:text-[10px]">
                <div>
                  <span className="text-slate-500">1</span>{" "}
                  <span className="text-indigo-400">{"{"}</span>
                </div>
                <div>
                  <span className="text-slate-500">2</span>{" "}
                  <span className="text-purple-400">&quot;siswa&quot;</span>:{" "}
                  <span className="text-amber-300">
                    &quot;{t("howItWorks.codeStudent")}&quot;
                  </span>
                  ,
                </div>
                <div>
                  <span className="text-slate-500">3</span>{" "}
                  <span className="text-purple-400">
                    &quot;statusFokus&quot;
                  </span>
                  : <span className="text-amber-300">&quot;{t("howItWorks.codeFocus")}&quot;</span>,
                </div>
                <div>
                  <span className="text-slate-500">4</span>{" "}
                  <span className="text-purple-400">
                    &quot;deteksiEmosi&quot;
                  </span>
                  : <span className="text-amber-300">&quot;{t("howItWorks.codeEmotion")}&quot;</span>,
                </div>
                <div>
                  <span className="text-slate-500">5</span>{" "}
                  <span className="text-purple-400">
                    &quot;butuhRemedial&quot;
                  </span>
                  : <span className="text-emerald-400">{t("howItWorks.codeRemedial")}</span>,
                </div>
                <div>
                  <span className="text-slate-500">6</span>{" "}
                  <span className="text-purple-400">
                    &quot;materiRekomendasi&quot;
                  </span>
                  :{" "}
                  <span className="text-amber-300">
                    &quot;{t("howItWorks.codeTopic")}&quot;
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
