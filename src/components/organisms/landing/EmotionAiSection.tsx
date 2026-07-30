"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function EmotionAiSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeEmotionKey, setActiveEmotionKey] = useState<string>("neutral");

  useGSAP(
    () => {
      gsap.from(".emotion-title-animate", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
      });

      gsap.from(".emotion-row-animate", {
        scrollTrigger: {
          trigger: ".emotion-row-animate",
          start: "top 85%",
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
      });
    },
    { scope: sectionRef }
  );

  const emotionList = [
    { key: "neutral", icon: "😐", color: "bg-slate-100 border-slate-300 text-slate-800" },
    { key: "sad", icon: "😢", color: "bg-blue-100 border-blue-300 text-blue-800" },
    { key: "happy", icon: "😊", color: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { key: "surprised", icon: "😲", color: "bg-amber-100 border-amber-300 text-amber-800" },
    { key: "scared", icon: "😨", color: "bg-purple-100 border-purple-300 text-purple-800" },
    { key: "bored", icon: "😑", color: "bg-orange-100 border-orange-300 text-orange-800" },
    { key: "angry", icon: "😡", color: "bg-rose-100 border-rose-300 text-rose-800" },
  ];

  return (
    <section
      ref={sectionRef}
      id="ai-emotion"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto emotion-title-animate">
         
          <h2 className="mt-4 font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-lottie-midnight leading-tight">
            {t("emotionAi.title")}
          </h2>
          <p className="mt-3 text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed">
            {t("emotionAi.subtitle")}
          </p>
         
        </div>

        {/* Dynamic Interactive Emotion Feature Grid & Table */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Emotion Selector Buttons & Interactive Empathy Preview */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-md">
              <h3 className="text-sm font-bold text-lottie-midnight uppercase tracking-wider font-inter mb-3">
                7 Pola Emosi Utama
              </h3>
              <div className="flex flex-col gap-2">
                {emotionList.map((emo) => {
                  const label = t(`emotionAi.emotions.${emo.key}.label`);
                  const isActive = activeEmotionKey === emo.key;
                  return (
                    <button
                      key={emo.key}
                      onClick={() => setActiveEmotionKey(emo.key)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        isActive
                          ? `${emo.color} shadow-sm font-bold scale-[1.02]`
                          : "bg-white/50 border-white/80 hover:bg-white text-lottie-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{emo.icon}</span>
                        <span className="text-sm font-inter">{label}</span>
                      </div>
                      <span className="text-xs font-mono opacity-75">
                        {isActive ? "✓ Active" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Emotion Empathy Preview Box */}
            <div className="rounded-2xl border border-indigo-200 bg-[#1F2375] p-5 text-white shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2 font-inter">
                <span> AI Empathetic Feedback</span>
              </div>
              <p className="text-lg font-bold font-dm-sans text-amber-300">
                "{t(`emotionAi.emotions.${activeEmotionKey}.feedback`)}"
              </p>
              <p className="mt-2 text-xs text-indigo-100 font-inter leading-relaxed border-t border-white/10 pt-2">
                Pola Ekspresi: {t(`emotionAi.emotions.${activeEmotionKey}.pattern`)}
              </p>
            </div>
          </div>

          {/* Right Column: Full Bilingual Emotion AI Matrix Table */}
          <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-lottie-mist bg-[#1F2375] text-white font-inter text-xs uppercase tracking-wider">
                    <th className="py-4 px-5 font-bold">{t("emotionAi.tableHeadEmotion")}</th>
                    <th className="py-4 px-5 font-bold">{t("emotionAi.tableHeadPattern")}</th>
                    <th className="py-4 px-5 font-bold">{t("emotionAi.tableHeadFeedback")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lottie-mist text-sm font-inter">
                  {emotionList.map((emo) => {
                    const label = t(`emotionAi.emotions.${emo.key}.label`);
                    const pattern = t(`emotionAi.emotions.${emo.key}.pattern`);
                    const feedback = t(`emotionAi.emotions.${emo.key}.feedback`);
                    const isActive = activeEmotionKey === emo.key;

                    return (
                      <tr
                        key={emo.key}
                        onClick={() => setActiveEmotionKey(emo.key)}
                        className={`emotion-row-animate cursor-pointer transition-colors ${
                          isActive
                            ? "bg-indigo-50/90 font-medium"
                            : "hover:bg-white/60"
                        }`}
                      >
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{emo.icon}</span>
                            <span className="font-bold text-lottie-midnight">{label}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-lottie-zinc-600 text-xs leading-relaxed">
                          {pattern}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-block rounded-xl border border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-[#1F2375] shadow-2xs">
                            "{feedback}"
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scientific Footnote / Citation (Ekman, 2004; Goetz et al., 2023) */}
            <div className="border-t border-lottie-mist bg-indigo-50/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-lottie-zinc-600 font-inter">
              <div className="flex items-center gap-2">
               
                <div>
                  <span className="font-bold text-[#1F2375]">
                    {t("emotionAi.citationTitle")}:
                  </span>{" "}
                  <span>{t("emotionAi.citationDesc")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
