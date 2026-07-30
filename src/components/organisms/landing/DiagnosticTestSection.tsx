"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DiagnosticTestSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);

 

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      tl.from(".diag-text-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });

      tl.to(".diag-brush-1", {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: "power1.inOut",
      }, "-=0.3");

      tl.from(".diag-feature-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      }, "-=0.4");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="tes-diagnostik"
      className="bg-[#ededed] py-20 md:py-24 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          {/* Badge */}
        
          {/* Heading */}
          <h2 className="font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-lottie-midnight leading-tight diag-text-animate">
            {t("diagnosticSection.titlePrefix")}
            <span className="relative inline-block px-2 font-semibold">
              {t("diagnosticSection.titleHighlight")}
              <svg
                className="absolute -inset-x-5 -inset-y-3 w-[calc(100%+40px)] h-[calc(100%+20px)] pointer-events-none z-[-4]"
                viewBox="0 0 120 50"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="diag-brush-1"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  d="M 10 25 C 10 10, 110 5, 110 25 C 110 45, 15 45, 12 30 C 10 20, 80 12, 105 18"
                  stroke="#1F2375"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {t("diagnosticSection.titleSuffix")}
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-lottie-zinc-600 font-inter leading-relaxed diag-text-animate max-w-2xl">
            {t("faq.q1Desc")}
          </p>

          {/* Output Box */}

        </div>

        {/* 4 Pillars / Features Grid */}
        
      </div>
    </section>
  );
}
