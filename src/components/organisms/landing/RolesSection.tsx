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
    if (!rolesRef.current) return;

    gsap.from(".roles-title-animate", {
      scrollTrigger: {
        trigger: rolesRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rolesRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });

    tl.from(".roles-card-animate", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
    });

    tl.from(".roles-laptop-mockup", {
      y: 60,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
    }, "-=0.3");
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
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-7 lg:p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 relative overflow-hidden h-[490px] lg:h-[510px] group roles-card-animate">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-[#1F2375] font-inter">
                  {t("roles.studentBadge")}
                </span>
                <Link
                  href="/register/student"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1F2375] hover:underline font-inter"
                >
                  {t("roles.register")} →
                </Link>
              </div>

              <div className="min-h-[58px] flex items-center mb-1">
                <h3 className="font-dm-sans text-xl lg:text-2xl font-bold tracking-tight text-lottie-midnight leading-snug">
                  {t("roles.studentTitle")}
                </h3>
              </div>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 min-h-[42px]">
                {t("roles.studentDesc")}
              </p>
            </div>

            {/* Laptop Mockup Siswa */}
            <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-[300px] lg:max-w-[330px] select-none roles-laptop-mockup">
              <div className="rounded-t-xl border-[4px] border-b-0 border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
                <div className="h-5 bg-slate-800 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[7px] font-mono text-slate-400">getsmart.id/student</span>
                </div>
                <div className="bg-slate-50 p-3 flex flex-col gap-2 text-slate-800 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-200 bg-white shrink-0">
                      <img
                        src="/images/student_avatar.png"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                        {t("roles.mockupStudent.name")}
                      </p>
                      <p className="text-[6.5px] font-medium text-slate-400 leading-none mt-1">
                        {t("roles.mockupStudent.status")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">📚</span>
                      <span className="font-bold text-[#1F2375] block truncate">{t("roles.mockupStudent.f1Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupStudent.f1Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">🧠</span>
                      <span className="font-bold text-emerald-800 block truncate">{t("roles.mockupStudent.f2Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupStudent.f2Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">🎥</span>
                      <span className="font-bold text-amber-800 block truncate">{t("roles.mockupStudent.f3Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupStudent.f3Desc")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-700 rounded-b-lg border-t border-slate-600 shadow-md flex justify-center items-start">
                <div className="w-10 h-0.5 bg-slate-500 rounded-full mt-0.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Guru */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-7 lg:p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 relative overflow-hidden h-[490px] lg:h-[510px] group roles-card-animate">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 font-inter">
                  {t("roles.teacherBadge")}
                </span>
                <Link
                  href="/register/teacher"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline font-inter"
                >
                  {t("roles.register")} →
                </Link>
              </div>

              <div className="min-h-[58px] flex items-center mb-1">
                <h3 className="font-dm-sans text-xl lg:text-2xl font-bold tracking-tight text-lottie-midnight leading-snug">
                  {t("roles.teacherTitle")}
                </h3>
              </div>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 min-h-[42px]">
                {t("roles.teacherDesc")}
              </p>
            </div>

            {/* Laptop Mockup Guru */}
            <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-[300px] lg:max-w-[330px] select-none roles-laptop-mockup">
              <div className="rounded-t-xl border-[4px] border-b-0 border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
                <div className="h-5 bg-slate-800 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[7px] font-mono text-slate-400">getsmart.id/teacher</span>
                </div>
                <div className="bg-slate-50 p-3 flex flex-col gap-2 text-slate-800 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="w-6 h-6 rounded-full bg-[#ffbf00] flex items-center justify-center text-[9px] font-bold text-amber-950 border border-amber-200 shrink-0">
                      BD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                        {t("roles.mockupTeacher.name")}
                      </p>
                      <p className="text-[6.5px] font-medium text-slate-400 leading-none mt-1">
                        {t("roles.mockupTeacher.role")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">🏫</span>
                      <span className="font-bold text-[#1F2375] block truncate">{t("roles.mockupTeacher.f1Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupTeacher.f1Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">😊</span>
                      <span className="font-bold text-emerald-800 block truncate">{t("roles.mockupTeacher.f2Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupTeacher.f2Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">📈</span>
                      <span className="font-bold text-rose-800 block truncate">{t("roles.mockupTeacher.f3Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupTeacher.f3Desc")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-700 rounded-b-lg border-t border-slate-600 shadow-md flex justify-center items-start">
                <div className="w-10 h-0.5 bg-slate-500 rounded-full mt-0.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Orang Tua */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-7 lg:p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 relative overflow-hidden h-[490px] lg:h-[510px] group roles-card-animate">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 font-inter">
                  {t("roles.parentBadge")}
                </span>
                <Link
                  href="/register/parent"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:underline font-inter"
                >
                  {t("roles.register")} →
                </Link>
              </div>

              <div className="min-h-[58px] flex items-center mb-1">
                <h3 className="font-dm-sans text-xl lg:text-2xl font-bold tracking-tight text-lottie-midnight leading-snug">
                  {t("roles.parentTitle")}
                </h3>
              </div>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 min-h-[42px]">
                {t("roles.parentDesc")}
              </p>
            </div>

            {/* Laptop Mockup Orang Tua */}
            <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-[300px] lg:max-w-[330px] select-none roles-laptop-mockup">
              <div className="rounded-t-xl border-[4px] border-b-0 border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
                <div className="h-5 bg-slate-800 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[7px] font-mono text-slate-400">getsmart.id/parent</span>
                </div>
                <div className="bg-slate-50 p-3 flex flex-col gap-2 text-slate-800 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="w-6 h-6 rounded-full bg-[#ff6b9d] flex items-center justify-center text-[9px] font-bold text-white border border-pink-200 shrink-0">
                      RN
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                        {t("roles.mockupParent.name")}
                      </p>
                      <p className="text-[6.5px] font-medium text-slate-400 leading-none mt-1">
                        {t("roles.mockupParent.child")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">📈</span>
                      <span className="font-bold text-[#1F2375] block truncate">{t("roles.mockupParent.f1Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupParent.f1Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">😊</span>
                      <span className="font-bold text-emerald-800 block truncate">{t("roles.mockupParent.f2Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupParent.f2Desc")}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[7.5px]">
                      <span className="text-[10px] block mb-0.5">⏱️</span>
                      <span className="font-bold text-amber-800 block truncate">{t("roles.mockupParent.f3Title")}</span>
                      <span className="text-slate-400 text-[6.5px] block truncate">{t("roles.mockupParent.f3Desc")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-700 rounded-b-lg border-t border-slate-600 shadow-md flex justify-center items-start">
                <div className="w-10 h-0.5 bg-slate-500 rounded-full mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
