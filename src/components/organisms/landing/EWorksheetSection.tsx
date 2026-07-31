"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function EWorksheetSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"pdf" | "video" | "elkpd">("pdf");

  const tabs = [
    {
      key: "pdf" as const,
      label: t("eworksheetSection.pdfTab"),
      icon: "📄",
      title: t("eworksheetSection.pdfTitle"),
      desc: t("eworksheetSection.pdfDesc"),
      badge: t("eworksheetSection.pdfBadge"),
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      features: [
        t("eworksheetSection.pdfFeature1"),
        t("eworksheetSection.pdfFeature2"),
        t("eworksheetSection.pdfFeature3"),
      ],
    },
    {
      key: "video" as const,
      label: t("eworksheetSection.videoTab"),
      icon: "🎬",
      title: t("eworksheetSection.videoTitle"),
      desc: t("eworksheetSection.videoDesc"),
      badge: t("eworksheetSection.videoBadge"),
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      features: [
        t("eworksheetSection.videoFeature1"),
        t("eworksheetSection.videoFeature2"),
        t("eworksheetSection.videoFeature3"),
      ],
    },
    {
      key: "elkpd" as const,
      label: t("eworksheetSection.elkpdTab"),
      icon: "📝",
      title: t("eworksheetSection.elkpdTitle"),
      desc: t("eworksheetSection.elkpdDesc"),
      badge: t("eworksheetSection.elkpdBadge"),
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      features: [
        t("eworksheetSection.elkpdFeature1"),
        t("eworksheetSection.elkpdFeature2"),
        t("eworksheetSection.elkpdFeature3"),
      ],
    },
  ];

  const activeTabData = tabs.find((tab) => tab.key === activeTab)!;

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.from(".ework-text-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });

      tl.to(
        ".ework-brush-1",
        {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power1.inOut",
        },
        "-=0.3",
      );

      tl.from(
        ".ework-card-animate",
        {
          x: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6",
      );

      tl.from(
        ".ework-tab-animate",
        {
          y: 10,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="e-worksheet"
      className="bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Info */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-lottie-midnight leading-tight ework-text-animate">
              {t("eworksheetSection.titlePrefix")}
              <span className="relative inline-block px-2 font-semibold">
                {t("eworksheetSection.titleHighlight")}
                <svg
                  className="absolute -inset-x-5 -inset-y-3 w-[calc(100%+40px)] h-[calc(100%+20px)] pointer-events-none z-[-4]"
                  viewBox="0 0 140 50"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    className="ework-brush-1"
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
              {t("eworksheetSection.titleSuffix")}
            </h2>
            <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed ework-text-animate">
              {t("eworksheetSection.description")}
            </p>

            <div className="mt-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 font-inter text-xs leading-relaxed text-[#1F2375] shadow-2xs ework-text-animate">
              <span className="font-bold block mb-1 text-sm">
                {t("eworksheetSection.trackingBoxTitle")}
              </span>
              <span>{t("eworksheetSection.trackingBoxDesc")}</span>
            </div>

            {/* Flow Diagram */}
            <div className="flex items-center gap-2 mt-2 ework-text-animate flex-wrap">
              {["PDF", "→", "Video", "→", "E-LKPD", "→", "Tes Diagnostik"].map(
                (item, idx) => (
                  <span
                    key={idx}
                    className={`text-xs font-bold font-inter ${
                      item === "→"
                        ? "text-lottie-zinc-400"
                        : "rounded-lg border border-white/60 bg-white/60 px-2.5 py-1.5 text-lottie-midnight"
                    }`}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right Graphic Card */}
          <div className="lg:col-span-6 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-md ework-card-animate">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-dm-sans text-xl font-bold text-lottie-midnight">
                {t("eworksheetSection.componentsTitle")}
              </h3>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`ework-tab-animate flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1F2375] text-white border-[#1F2375] shadow-md"
                        : "bg-white/50 border-white/80 text-lottie-zinc-600 hover:bg-white hover:border-lottie-mist"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="rounded-2xl border border-lottie-mist bg-white p-5 shadow-2xs flex flex-col gap-4 font-inter transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1F2375]/10 text-2xl">
                    {activeTabData.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-lottie-midnight">
                      {activeTabData.title}
                    </p>
                    <p className="text-xs text-lottie-zinc-500 leading-relaxed mt-0.5">
                      {activeTabData.desc}
                    </p>
                  </div>
                </div>
              </div>

              <span
                className={`self-start text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${activeTabData.badgeColor}`}
              >
                {activeTabData.badge}
              </span>

              {/* Feature List */}
              <div className="flex flex-col gap-2 mt-1">
                {activeTabData.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-lottie-zinc-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Step Mockup */}
            <div className="mt-4 rounded-xl border border-lottie-mist bg-slate-50 p-3 font-inter">
              <p className="text-[10px] font-bold uppercase tracking-wider text-lottie-zinc-400 mb-2">
                {t("eworksheetSection.sampleTitle")}
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  {
                    label: t("eworksheetSection.samplePdfLabel"),
                    status: t("eworksheetSection.statusCompleted"),
                    color: "text-emerald-600",
                    bg: "bg-emerald-50 border-emerald-200",
                  },
                  {
                    label: t("eworksheetSection.sampleVideoLabel"),
                    status:
                      activeTab === "video"
                        ? t("eworksheetSection.statusWatching")
                        : t("eworksheetSection.statusCompleted"),
                    color:
                      activeTab === "video"
                        ? "text-amber-600"
                        : "text-emerald-600",
                    bg:
                      activeTab === "video"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-emerald-200",
                  },
                  {
                    label: t("eworksheetSection.sampleElkpdLabel"),
                    status:
                      activeTab === "elkpd"
                        ? t("eworksheetSection.statusWorking")
                        : t("eworksheetSection.statusPending"),
                    color:
                      activeTab === "elkpd"
                        ? "text-blue-600"
                        : "text-lottie-zinc-400",
                    bg:
                      activeTab === "elkpd"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-lottie-mist",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-[11px] px-3 py-2 rounded-lg border ${item.bg}`}
                  >
                    <span className="text-lottie-midnight font-medium">
                      {item.label}
                    </span>
                    <span className={`font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
