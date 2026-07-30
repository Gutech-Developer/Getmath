"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RemedialVideoSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(1);

  const phases = [
    {
      id: 1,
      label: t("remedialSection.phase1Title"),
      color: "rose",
      detail: t("remedialSection.phase1Desc"),
    },
    {
      id: 2,
      label: t("remedialSection.phase2Title"),
      color: "amber",
      detail: t("remedialSection.phase2Desc"),
    },
    {
      id: 3,
      label: t("remedialSection.phase3Title"),
      color: "indigo",
      detail: t("remedialSection.phase3Desc"),
    },
    {
      id: 4,
      label: t("remedialSection.phase4Title"),
      color: "emerald",
      detail: t("remedialSection.phase4Desc"),
    },
  ];

  const activePhaseData = phases.find((p) => p.id === activePhase)!;

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((prev) => (prev % phases.length) + 1);
    }, 15000);

    return () => clearInterval(timer);
  }, [phases.length]);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.from(".remedial-text-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });

      tl.to(".remedial-brush-1", {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: "power1.inOut",
      }, "-=0.3");

      tl.from(".remedial-card-animate", {
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.6");

      tl.from(".remedial-phase-animate", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)",
      }, "-=0.3");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="remedial"
      className="bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Graphic Card */}
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-md remedial-card-animate">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-dm-sans text-xl font-bold text-lottie-midnight">
                {t("remedialSection.flowTitle")}
              </h3>
            </div>

            {/* Active Phase Detail */}
            <div className="rounded-2xl border border-lottie-mist bg-white p-5 shadow-2xs flex flex-col gap-3 font-inter transition-all">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold text-lottie-midnight">
                    {t("remedialSection.stepLabel")} {activePhaseData.id}: {activePhaseData.label}
                  </p>
                  <p className="text-xs text-lottie-zinc-500 mt-0.5">
                    {activePhaseData.detail}
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1.5 mt-2">
                {phases.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePhase(p.id)}
                    title={`${t("remedialSection.stepLabel")} ${p.id}: ${p.label}`}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                      p.id <= activePhase
                        ? "bg-[#1F2375]"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Emotion AI Mini Preview */}
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex items-start gap-3">
              <div className="font-inter">
                <p className="text-xs font-bold text-[#1F2375]">
                  {t("remedialSection.aiFeedbackTitle")}
                </p>
                <p className="text-xs text-[#1F2375]/70 leading-relaxed mt-0.5">
                  {t("remedialSection.aiFeedbackDesc")}{" "}
                  <span className="italic font-semibold">
                    {t("remedialSection.aiFeedbackQuote")}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Info */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4">
            <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-lottie-midnight leading-tight remedial-text-animate">
              {t("remedialSection.titlePrefix")}
              <span className="relative inline-block px-2 font-semibold">
                {t("remedialSection.titleHighlight")}
                <svg
                  className="absolute -inset-x-5 -inset-y-3 w-[calc(100%+40px)] h-[calc(100%+20px)] pointer-events-none z-[-4]"
                  viewBox="0 0 120 50"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    className="remedial-brush-1"
                    strokeDasharray="400"
                    strokeDashoffset="400"
                    d="M 10 25 C 10 10, 110 5, 110 25 C 110 45, 15 45, 12 30 C 10 20, 80 12, 105 18"
                    stroke="#ffbf00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {t("remedialSection.titleSuffix")}
            </h2>
            <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed remedial-text-animate">
              {t("faq.q2Desc")}
            </p>

            <div className="mt-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 font-inter text-xs leading-relaxed text-[#1F2375] shadow-2xs remedial-text-animate">
              <span className="font-bold block mb-1 text-sm">
                {t("remedialSection.aiBoxTitle")}
              </span>
              <span>{t("faq.q2Ai")}</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-2 remedial-text-animate">
              <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold text-[#1F2375] font-mono">7</p>
                <p className="text-[10px] text-lottie-zinc-500 font-inter mt-0.5">
                  {t("remedialSection.statEmotions")}
                </p>
              </div>
              <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold text-amber-600 font-mono">
                  3–5m
                </p>
                <p className="text-[10px] text-lottie-zinc-500 font-inter mt-0.5">
                  {t("remedialSection.statInterval")}
                </p>
              </div>
              <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold text-emerald-600 font-mono">∞</p>
                <p className="text-[10px] text-lottie-zinc-500 font-inter mt-0.5">
                  {t("remedialSection.statVariants")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
