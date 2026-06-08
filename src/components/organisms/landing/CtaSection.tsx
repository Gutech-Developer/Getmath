"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CtaSection() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".cta-box-animate", {
      scrollTrigger: {
        trigger: ".cta-box-animate",
        start: "top 85%",
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  }, { scope: ctaRef });

  return (
    <section ref={ctaRef} className="bg-[#ededed] py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden bg-lottie-zinc-900 border border-white/10 backdrop-blur-md rounded-[32px] px-8 py-16 md:px-12 md:py-20 text-center shadow-[rgba(31,35,117,0.12)_0px_24px_64px_0px] cta-box-animate">
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full  px-3 py-1 text-base font-semibold text-white font-inter uppercase tracking-wide backdrop-blur-sm">
              Mulai Sekarang
            </span>

            <h2 className="mt-6 mb-6 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-white sm:text-[48px] leading-[1.12]">
              Siap Bergabung dengan
              <br />
              GetSmart?
            </h2>

            <p className="mx-auto mb-10 max-w-2xl font-inter text-base md:text-lg text-lottie-zinc-500">
              Bergabunglah dengan ribuan siswa, guru, dan orang tua yang telah
              merasakan manfaat belajar bersama GetSmart.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-white px-8 text-sm font-medium text-lottie-midnight transition-colors hover:bg-lottie-pearl sm:w-auto shadow-sm"
              >
                Mulai Belajar Sekarang
              </Link>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-2xl px-8 border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm sm:w-auto"
              >
                Sudah Punya Akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
