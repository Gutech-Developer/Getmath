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

export default function RolesSection() {
  const { t } = useI18n();
  const rolesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".roles-title-animate", {
      scrollTrigger: {
        trigger: ".roles-title-animate",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        gsap.to([".roles-brush-1", ".roles-brush-2"], {
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power1.inOut",
        });
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".roles-card-animate",
        start: "top 80%",
      }
    });

    tl.from(".roles-card-animate", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });

    tl.from(".roles-circles-animate", {
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.5)"
    }, "-=0.4");

    tl.from([".roles-phone-siswa", ".roles-phone-ortu"], {
      y: 150,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
    }, "-=0.6");

    tl.from(".roles-phone-guru", {
      y: -150,
      duration: 0.8,
      ease: "power2.out",
    }, "-=0.6");
  }, { scope: rolesRef });

  return (
    <section
      ref={rolesRef}
      id="peran"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center roles-title-animate">
         
          <h2 className="mt-4 font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-lottie-midnight leading-tight">
            {t("roles.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-lottie-zinc-500">
            {t("roles.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {/* Card 1: Siswa */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-sm hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-[#1F2375] font-inter">
                  Siswa / Student
                </span>
                <Link
                  href="/register/student"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1F2375] hover:underline font-inter"
                >
                  Daftar →
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                Pengalaman Siswa
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {t("roles.studentDesc")}
              </p>
            </div>

            <div className="absolute bottom-[-50px] lg:bottom-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-t-[32px] shadow-2xl flex flex-col pt-3 lg:pt-4 select-none overflow-hidden roles-phone-siswa">
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-3.5 bg-slate-950 rounded-full z-30" />
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col gap-2 rounded-t-[22px] text-slate-800">
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-200 flex-shrink-0 bg-white">
                    <img
                      src="/images/student_avatar.png"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                      Alya Nabila
                    </p>
                    <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                      Siswa • Active
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">📚</span>
                    <div className="leading-tight">
                      <span className="font-bold text-[#1F2375] block">
                        E-LKPD & Modul
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Akses materi interaktif
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">🧠</span>
                    <div className="leading-tight">
                      <span className="font-bold text-emerald-800 block">
                        Kuis Emosi AI
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Evaluasi adaptif & fokus
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">🎥</span>
                    <div className="leading-tight">
                      <span className="font-bold text-amber-800 block">
                        Video Remedial
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Solusi pembahasan soal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Guru */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-sm hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            <div className="absolute top-[-50px] lg:top-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-b-[32px] border-t-0 shadow-2xl flex flex-col pb-3 lg:pb-4 select-none overflow-hidden roles-phone-guru">
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col justify-between rounded-b-[22px] text-slate-800">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#ffbf00] flex items-center justify-center text-[9px] font-bold text-amber-950 border border-amber-200 flex-shrink-0">
                      BD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                        Budi, M.Pd.
                      </p>
                      <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                        Guru / Teacher
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">🏫</span>
                      <div className="leading-tight">
                        <span className="font-bold text-[#1F2375] block">
                          LAD Analytics Class
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          Sebaran ketuntasan kelas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">😊</span>
                      <div className="leading-tight">
                        <span className="font-bold text-emerald-800 block">
                          Monitor Emosi
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          Pola emosi kolektif
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">📈</span>
                      <div className="leading-tight">
                        <span className="font-bold text-rose-800 block">
                          Download Rekap
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          Export laporan PDF/Excel
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2 flex-shrink-0" />
              </div>
            </div>

            <div className="mt-auto z-10 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 font-inter">
                  Guru / Teacher
                </span>
                <Link 
                  href="/register/teacher"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline font-inter"
                >
                  Daftar →
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                {t("roles.teacherTitle")}
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {t("roles.teacherDesc")}
              </p>
            </div>
          </div>

          {/* Card 3: Orang Tua */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-sm hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 font-inter">
                  Orang Tua / Parent
                </span>
                <Link
                  href="/register/parent"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:underline font-inter"
                >
                  Daftar →
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                {t("roles.parentTitle")}
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {t("roles.parentDesc")}
              </p>
            </div>

            <div className="absolute bottom-[-50px] lg:bottom-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-t-[32px] shadow-2xl flex flex-col pt-3 lg:pt-4 select-none overflow-hidden roles-phone-ortu">
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-3.5 bg-slate-950 rounded-full z-30" />
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col gap-2 rounded-t-[22px] text-slate-800">
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#ff6b9d] flex items-center justify-center text-[9px] font-bold text-white border border-pink-200 flex-shrink-0">
                    RN
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                      Ibu Rina
                    </p>
                    <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                      Anak: Alya Nabila
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">📈</span>
                    <div className="leading-tight">
                      <span className="font-bold text-[#1F2375] block">
                        Pantau Progress Real-time
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Skor tes & ketuntasan
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">😊</span>
                    <div className="leading-tight">
                      <span className="font-bold text-emerald-800 block">
                        Tren Emosi Anak
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Deteksi emosi belajar
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">⏱️</span>
                    <div className="leading-tight">
                      <span className="font-bold text-amber-800 block">
                        Notifikasi Instan
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Info ketuntasan remedial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
