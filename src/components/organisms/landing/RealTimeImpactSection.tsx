"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";
import { useLandingStats } from "@/services/hooks/useLandingStats";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RealTimeImpactSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: stats, isLoading } = useLandingStats();

  useGSAP(
    () => {
      gsap.from(".stats-card-animate", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  const activeStudents = stats?.active_students?.formatted ?? "14.250+";
  const registeredSchools = stats?.registered_schools?.formatted ?? "180+";
  const diagnosticRate = stats?.diagnostic_completion_rate?.formatted ?? "88,7%";
  const remedialRate = stats?.remedial_completion_rate?.formatted ?? "92,4%";
  const totalReach = stats?.total_reach_visitors?.formatted ?? "178.900+";

  const metrics = [
    {
      id: "active_students",
      label: t("stats.activeStudents"),
      value: activeStudents,
      desc: t("stats.activeStudentsDesc"),
      icon: "🎓",
      color: "from-blue-500/10 to-indigo-500/10 border-indigo-200/80 text-[#1F2375]",
      badge: "+12.5%",
    },
    {
      id: "registered_schools",
      label: t("stats.registeredSchools"),
      value: registeredSchools,
      desc: t("stats.registeredSchoolsDesc"),
      icon: "🏫",
      color: "from-teal-500/10 to-emerald-500/10 border-teal-200/80 text-teal-800",
      badge: "Real-time API",
    },
    {
      id: "diagnostic_completion",
      label: t("stats.diagnosticCompletion"),
      value: diagnosticRate,
      desc: t("stats.diagnosticCompletionDesc"),
      icon: "⚡",
      color: "from-[#818cf8]/15 to-indigo-500/10 border-indigo-300/80 text-indigo-900",
      badge: "TKA Ready",
    },
    {
      id: "remedial_completion",
      label: t("stats.remedialCompletion"),
      value: remedialRate,
      desc: t("stats.remedialCompletionDesc"),
      icon: "📈",
      color: "from-emerald-500/10 to-green-500/10 border-emerald-300/80 text-emerald-900",
      badge: "Mastery",
    },
    {
      id: "total_reach",
      label: t("stats.platformReach"),
      value: totalReach,
      desc: t("stats.platformReachDesc"),
      icon: "🌐",
      color: "from-amber-500/10 to-orange-500/10 border-amber-300/80 text-amber-900",
      badge: "National",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="statistik"
      className="bg-[#ededed] py-16 md:py-24 relative overflow-hidden z-10 border-y border-lottie-mist/60"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2375]/15 bg-white/70 px-3.5 py-1 text-xs font-bold text-[#1F2375] uppercase tracking-wider font-inter shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-lottie-teal animate-ping" />
            {t("stats.badge")}
          </span>
          <h2 className="mt-4 font-dm-sans text-3xl sm:text-4xl font-normal tracking-tight text-lottie-midnight leading-tight">
            {t("stats.title")}
          </h2>
          <p className="mt-3 text-base text-lottie-zinc-500 font-inter leading-relaxed">
            {t("stats.subtitle")}
          </p>
        </div>

        {/* 5 Stats Grid Cards */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((item) => (
            <div
              key={item.id}
              className={`stats-card-animate group relative flex flex-col justify-between rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md ${item.color} backdrop-blur-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-white/60 text-lottie-midnight shadow-2xs font-mono">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold font-dm-sans tracking-tight text-lottie-midnight">
                  {isLoading ? (
                    <span className="inline-block h-8 w-20 animate-pulse rounded bg-black/10" />
                  ) : (
                    item.value
                  )}
                </h3>
                <p className="mt-1 text-sm font-bold text-lottie-midnight font-inter">
                  {item.label}
                </p>
              </div>

              <p className="mt-3 text-[11px] text-lottie-zinc-500 font-inter leading-snug border-t border-black/5 pt-2.5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-lottie-zinc-400 font-inter flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("stats.liveUpdate")}
          </p>
        </div>
      </div>
    </section>
  );
}
