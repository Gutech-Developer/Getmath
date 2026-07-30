"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FaqExplainerSection() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".faq-sec-1", {
        scrollTrigger: {
          trigger: ".faq-sec-1",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".faq-sec-2", {
        scrollTrigger: {
          trigger: ".faq-sec-2",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".faq-sec-3", {
        scrollTrigger: {
          trigger: ".faq-sec-3",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} id="metodologi" className="flex flex-col">
      {/* SECTION 1: Apa itu Tes Diagnostik? */}
      <section className="faq-sec-1 bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-1 text-xs font-bold text-[#1F2375] uppercase tracking-wider font-inter shadow-sm backdrop-blur-sm w-fit">
                🎯 {t("faq.badge")} • Section 1
              </span>
              <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-lottie-midnight leading-tight">
                {t("faq.q1Title")}
              </h2>
              <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed">
                {t("faq.q1Desc")}
              </p>

              <div className="mt-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 font-inter text-xs leading-relaxed text-[#1F2375] shadow-2xs">
                <span className="font-bold block mb-1 text-sm">
                  📌 Output & Rekomendasi Hasil:
                </span>
                <span>{t("faq.q1Output")}</span>
              </div>
            </div>

            {/* Right Graphic Card */}
            <div className="lg:col-span-6 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-dm-sans text-xl font-bold text-lottie-midnight">
                  Simulasi Peta Kelemahan Diagnostik
                </h3>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 text-[#1F2375]">
                  Live Diagnostic
                </span>
              </div>

              <div className="flex flex-col gap-4 my-4">
                <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-2xs">
                  <div className="flex justify-between text-xs font-bold text-[#1F2375] mb-2 font-inter">
                    <span>Aljabar & Matriks</span>
                    <span className="text-emerald-600 font-mono">85% Tuntas</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-2xs">
                  <div className="flex justify-between text-xs font-bold text-[#1F2375] mb-2 font-inter">
                    <span>Trigonometri</span>
                    <span className="text-rose-600 font-mono">45% Perlu Remedial</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Bagaimana Cara Kerja Remedial? */}
      <section className="faq-sec-2 bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Graphic Card */}
            <div className="lg:col-span-6 order-2 lg:order-1 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-dm-sans text-xl font-bold text-teal-900">
                  Simulasi Video Remedial Interaktif
                </h3>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900">
                  Checkpoint Concept
                </span>
              </div>

              <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-teal-800">
                  <span className="flex items-center gap-2 font-inter">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                    Video Berhenti pada Titik Krisis Konsep
                  </span>
                </div>
                <p className="text-xs text-lottie-zinc-600 font-inter leading-relaxed">
                  "Berapakah determinan dari matriks orde 2x2 berikut?"
                </p>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-[#1F2375] font-semibold flex items-center gap-2 font-inter">
                  <span className="text-base">🤖</span>
                  <span>"Jangan takut! Coba ingat rumus determinan ad - bc."</span>
                </div>
              </div>
            </div>

            {/* Right Info */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-1 text-xs font-bold text-teal-800 uppercase tracking-wider font-inter shadow-sm backdrop-blur-sm w-fit">
                🎬 {t("faq.badge")} • Section 2
              </span>
              <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-lottie-midnight leading-tight">
                {t("faq.q2Title")}
              </h2>
              <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed">
                {t("faq.q2Desc")}
              </p>

              <div className="mt-2 rounded-2xl border border-teal-200 bg-teal-50/80 p-5 font-inter text-xs leading-relaxed text-teal-900 shadow-2xs">
                <span className="font-bold block mb-1 text-sm">
                  💡 Integrasi AI Afektif:
                </span>
                <span>{t("faq.q2Ai")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Bagaimana Menggunakan Lembar Kerja Interaktif (E-Worksheet)? */}
      <section className="faq-sec-3 bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3.5 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider font-inter shadow-sm backdrop-blur-sm w-fit">
                📝 {t("faq.badge")} • Section 3
              </span>
              <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-lottie-midnight leading-tight">
                {t("faq.q3Title")}
              </h2>
              <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed">
                {t("faq.q3Desc")}
              </p>

              <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 font-inter text-xs leading-relaxed text-amber-900 shadow-2xs">
                <span className="font-bold block mb-1 text-sm">
                  ⚡ Analisis Per-Langkah:
                </span>
                <span>
                  Sistem mendeteksi secara tepat pada langkah mana miskonsepsi atau kesalahan perhitungan terjadi.
                </span>
              </div>
            </div>

            {/* Right Graphic Card */}
            <div className="lg:col-span-6 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-dm-sans text-xl font-bold text-amber-900">
                  Simulasi E-Worksheet Step-by-Step
                </h3>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                  Live Drag & Drop
                </span>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-2xs flex flex-col gap-3 font-inter">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                  <span className="px-3 py-1.5 bg-slate-100 rounded-lg border font-medium text-slate-700">
                    Langkah 1: Menyusun Matriks
                  </span>
                  <span className="text-emerald-600 font-bold text-xs">✓ Benar</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg font-medium text-rose-800">
                    Langkah 2: Menghitung Invers Matriks
                  </span>
                  <span className="text-rose-600 font-bold text-xs">⚠️ Miskonsepsi Tanda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
