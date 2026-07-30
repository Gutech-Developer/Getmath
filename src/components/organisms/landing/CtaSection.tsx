"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CtaSection() {
  const { t } = useI18n();
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-box-animate", {
        scrollTrigger: {
          trigger: ".cta-box-animate",
          start: "top 85%",
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
      });
    },
    { scope: ctaRef }
  );

  return (
    <section ref={ctaRef} className="bg-[#ededed] py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden bg-[#1F2375] border border-white/20 backdrop-blur-md rounded-[32px] px-8 py-16 md:px-12 md:py-20 text-center shadow-[rgba(31,35,117,0.18)_0px_24px_64px_0px] cta-box-animate">
          <div className="relative z-10">
           
            <h2 className="mt-2 mb-4 font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-white leading-tight max-w-3xl mx-auto">
              {t("cta.bannerTitle")}
            </h2>

            <p className="mx-auto mb-10 max-w-2xl font-inter text-base md:text-lg text-indigo-100/90 leading-relaxed">
              {t("cta.bannerSubtitle")}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-white px-8 text-sm font-bold text-[#1F2375] transition-all hover:bg-amber-300 sm:w-auto shadow-md"
              >
                {t("cta.buttonPrimary")}
              </Link>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-2xl px-8 border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm sm:w-auto text-sm font-medium"
              >
                {t("cta.buttonSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
