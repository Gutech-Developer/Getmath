"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BookIcon from "@/components/atoms/icons/BookIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import PDFIcon from "@/components/atoms/icons/PDFIcon";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { cn } from "@/libs/utils";
import { useGsCourseBySlug, useGsModulesByCourse, useGsStudentDashboard } from "@/services";
import type { GsCourseModule, GsCourseModuleSubject } from "@/types/gs-course";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type MaterialStatus = "completed" | "in-progress" | "locked";

interface IMaterialStep {
  id: string;
  typeLabel: string;
  title: string;
  status: MaterialStatus;
  diagnosticTestId?: string;
}

interface IMaterialModule {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  status: MaterialStatus;
  steps: IMaterialStep[];
}

interface IClassMaterialListPageTemplateProps {
  slug: string;
}

/* ------------------------------------------------------------------ */
/*  API mapper                                                         */
/* ------------------------------------------------------------------ */
function getModuleId(module: GsCourseModule): string {
  return module.id || (module as any).courseModuleId || "";
}

/**
 * Map GsCourseModule → IMaterialModule.
 * Module yang dikembalikan backend hanya berisi subset subject
 * (subjectName, subjectFileUrl, videoUrl, eLKPDTitle, dll).
 */
function mapModuleToMaterial(
  module: GsCourseModule,
  index: number,
): IMaterialModule {
  const moduleId = getModuleId(module);
  const flat = module as any;

  // Handle diagnostic test modules
  if (module.type === "DIAGNOSTIC_TEST") {
    const test = module.diagnosticTest;
    const title =
      flat.testName ??
      test?.testName ??
      `Tes Diagnostik ${module.order ?? index + 1}`;

    const diagnosticTestId = module.diagnosticTestId ?? test?.id ?? "";
    const remedialTestId = module.remedialTestId ?? flat.remedialTestId ?? "";

    const steps: IMaterialStep[] = [
      {
        id: diagnosticTestId || `${moduleId}-diagnostic`,
        typeLabel: "Tes Diagnostik",
        title,
        status: flat.diagnosticCompleted || flat.completed ? "completed" : "in-progress",
      },
    ];

    if (remedialTestId && flat.diagnosticCompleted && !flat.isPassed) {
      steps.push({
        id: remedialTestId,
        typeLabel: "Tes Remedial",
        title: `Tes Remedial: ${title}`,
        status: flat.remedialCompleted ? "completed" : "in-progress",
        diagnosticTestId,
      });
    }

    const completedSteps =
      (flat.diagnosticCompleted || flat.completed ? 1 : 0) + (flat.remedialCompleted ? 1 : 0);

    return {
      id: moduleId,
      title,
      description: test?.description ?? flat.description ?? "",
      totalSteps: steps.length,
      completedSteps,
      progressPercent:
        steps.length > 0
          ? Math.round((completedSteps / steps.length) * 100)
          : 0,
      status: flat.completed ? "completed" : "in-progress",
      steps,
    };
  }

  // SUBJECT modules
  const subject = module.subject;
  const title =
    flat.subjectName ??
    subject?.subjectName ??
    `Modul ${module.order ?? index + 1}`;

  const steps: IMaterialStep[] = [];

  // 1. Materi (PDF) - Standard for SUBJECT
  steps.push({
    id: `${moduleId}-materi`,
    typeLabel: "Materi",
    title,
    status: flat.fileRead ? "completed" : "in-progress",
  });

  // 2. Video
  if (flat.hasVideo) {
    steps.push({
      id: `${moduleId}-video`,
      typeLabel: "Video",
      title: `Video: ${title}`,
      status: flat.videoWatched ? "completed" : "in-progress",
    });
  }

  // 3. E-LKPD
  if (flat.hasELKPD) {
    steps.push({
      id: `${moduleId}-elkpd`,
      typeLabel: "E-LKPD",
      title: `E-LKPD: ${title}`,
      status:
        flat.eLKPDSubmitted || flat.eLKPDGraded ? "completed" : "in-progress",
    });
  }

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const isModuleCompleted = totalSteps > 0 && completedSteps === totalSteps;

  return {
    id: moduleId,
    title,
    description: subject?.description ?? flat.description ?? "",
    totalSteps,
    completedSteps,
    progressPercent:
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    status: isModuleCompleted ? "completed" : "in-progress",
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<
  MaterialStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  completed: {
    label: "Selesai",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  "in-progress": {
    label: "Sedang Dipelajari",
    badgeClass: "border-lottie-teal/20 bg-lottie-teal/5 text-lottie-teal",
    dotClass: "bg-lottie-teal",
  },
  locked: {
    label: "Terkunci",
    badgeClass: "border-lottie-mist bg-lottie-pearl text-lottie-zinc-500",
    dotClass: "bg-lottie-fog",
  },
};

function getStepIcon(typeLabel: string) {
  if (typeLabel === "Video") return VideoIcon;
  if (typeLabel === "E-LKPD") return DocumentIcon;
  if (
    typeLabel === "Tes Diagnostik" ||
    typeLabel === "Tes" ||
    typeLabel === "Tes Remedial"
  )
    return CheckCircleIcon;
  return PDFIcon;
}

function getStepIconTone(typeLabel: string): { bg: string; fg: string } {
  if (typeLabel === "Video")
    return { bg: "bg-amber-50", fg: "text-amber-600" };
  if (typeLabel === "E-LKPD")
    return { bg: "bg-emerald-50", fg: "text-emerald-600" };
  if (typeLabel === "Tes Diagnostik" || typeLabel === "Tes")
    return { bg: "bg-rose-50", fg: "text-rose-600" };
  if (typeLabel === "Tes Remedial")
    return { bg: "bg-violet-50", fg: "text-violet-600" };
  return { bg: "bg-blue-50", fg: "text-blue-600" };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClassMaterialListPageTemplate({
  slug,
}: IClassMaterialListPageTemplateProps) {
  const { data: course } = useGsCourseBySlug(slug);
  const { data: studentDashboard } = useGsStudentDashboard(course?.id ?? "");
  const { data: courseModules, isLoading } = useGsModulesByCourse(
    course?.id ?? "",
  );

  const modules: IMaterialModule[] = (courseModules ?? [])
    .filter((m) => m.type === "SUBJECT" || m.type === "DIAGNOSTIC_TEST")
    .map((m, i) => mapModuleToMaterial(m, i));

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (modules.length > 0 && expandedModuleId === null) {
      const inProgress = modules.find((m) => m.status === "in-progress");
      setExpandedModuleId(inProgress?.id ?? modules[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules.length]);

  const toggleExpand = (moduleId: string) => {
    setExpandedModuleId((cur) => (cur === moduleId ? null : moduleId));
  };

  /* ---------- Derived ---------- */
  const totalModules = modules.length;
  const completedModules = modules.filter(
    (m) => m.status === "completed",
  ).length;
  const overallProgress =
    totalModules > 0
      ? Math.round(
        modules.reduce((sum, m) => sum + m.progressPercent, 0) / totalModules,
      )
      : 0;
  const totalStepsAll = modules.reduce((sum, m) => sum + m.totalSteps, 0);
  const completedStepsAll = modules.reduce(
    (sum, m) => sum + m.completedSteps,
    0,
  );

  const displayCompletedModules = studentDashboard ? studentDashboard.subjectModuleRead : completedModules;
  // Memakai asumsi modul diagnostik belum tercatat sebagai 'read', namun subjectModuleTotal bisa digunakan.
  // Jika diagnostic dihitung ke total:
  const displayTotalModules = studentDashboard ? studentDashboard.subjectModuleTotal + studentDashboard.diagnosticTestTotal : totalModules;
  const displayProgress = studentDashboard ? studentDashboard.progressPercent : overallProgress;

  const filteredModules = searchQuery.trim()
    ? modules.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : modules;

  console.log("Module: ", modules);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <section className="min-h-screen rounded-3xl sm:p-3 lg:p-0">
      {/* ---- Back Link ---- */}
      <Link
        href={`/student/dashboard/class/${encodeURIComponent(slug)}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-lottie-zinc-500 transition hover:text-lottie-teal"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Kembali ke Beranda Kelas
      </Link>

      {/* ---- Hero Header ---- */}
      <header className="relative overflow-hidden rounded-3xl bg-lottie-teal p-6 text-white shadow-[0px_20px_40px_rgba(39,48,132,0.28)]">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <BookIcon className="h-3.5 w-3.5" />
              Materi Pembelajaran
            </p>
            <h1 className="mt-3  text-3xl font-normal text-white">Daftar Materi Kelas</h1>
            <p className="mt-1 text-sm text-white/70">
              Pelajari semua modul secara berurutan untuk menguasai materi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              {displayCompletedModules}/{displayTotalModules} Modul Selesai
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              {completedStepsAll}/{totalStepsAll} Langkah
            </span>
          </div>
        </div>

        {/* Overall progress */}
        <div className="relative z-10 mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-white/85">
            <span>Progres keseluruhan materi</span>
            <span>{displayProgress}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-lottie-mint-glow transition-all duration-500"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* ---- Summary Cards ---- */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: CheckCircleIcon,
            iconBg: "bg-emerald-50",
            iconFg: "text-emerald-600",
            value: `${completedModules}`,
            label: "Modul Selesai",
          },
          {
            icon: ClockIcon,
            iconBg: "bg-lottie-teal/10",
            iconFg: "text-lottie-teal",
            value: `${modules.filter((m) => m.status === "in-progress").length}`,
            label: "Sedang Dipelajari",
          },
          {
            icon: BookIcon,
            iconBg: "bg-violet-50",
            iconFg: "text-violet-600",
            value: `${totalModules}`,
            label: "Total Modul",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="flex items-center gap-4 getmath-card p-4"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                card.iconBg,
              )}
            >
              <card.icon className={cn("h-5 w-5", card.iconFg)} />
            </div>
            <div>
              <p className=" text-2xl font-normal text-lottie-midnight leading-tight">{card.value}</p>
              <p className="text-xs text-lottie-zinc-500 mt-0.5">{card.label}</p>
            </div>
          </article>
        ))}
      </div>

      {/* ---- Search Bar ---- */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lottie-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul materi..."
            className="h-11 w-full rounded-xl border border-transparent bg-lottie-teal/5 pl-10 pr-4 text-sm text-lottie-midnight placeholder:text-lottie-zinc-500 outline-none transition-all duration-200 focus:border-lottie-teal/30 focus:bg-white focus:ring-2 focus:ring-lottie-teal/10"
          />
        </div>
      </div>

      {/* ---- Module List ---- */}
      <div className="mt-5 space-y-4">
        {filteredModules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
            <p className="text-sm text-[#64748B]">
              Tidak ada modul yang cocok dengan pencarian &quot;{searchQuery}
              &quot;
            </p>
          </div>
        )}

        {isLoading && (
          <p className="py-10 text-center text-sm text-[#9CA3AF]">
            Memuat materi...
          </p>
        )}
        {!isLoading && filteredModules.length === 0 && (
          <p className="py-10 text-center text-sm text-[#9CA3AF]">
            Belum ada materi tersedia.
          </p>
        )}
        {filteredModules.map((module, moduleIndex) => {
          const isExpanded = expandedModuleId === module.id;
          const statusConfig = STATUS_CONFIG[module.status];
          const isLocked = module.status === "locked";
          // if (moduleIndex === 1) console.log(module);

          return (
            <article
              key={module.id}
              className={cn(
                "overflow-hidden getmath-card",
                isExpanded && "border-lottie-mint-glow/30 ring-2 ring-lottie-mint-glow/5",
                isLocked && "opacity-60 pointer-events-none",
              )}
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleExpand(module.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-lottie-teal/5"
              >
                {/* Number circle */}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                    module.status === "completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : module.status === "in-progress"
                        ? "bg-lottie-teal/10 text-lottie-teal"
                        : "bg-lottie-pearl text-lottie-zinc-500",
                  )}
                >
                  {module.status === "completed" ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    moduleIndex + 1
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${module.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="group/title"
                    >
                      <h3 className=" text-lg font-medium text-lottie-midnight transition group-hover/title:text-lottie-mint-glow">
                        {module.title}
                      </h3>
                    </Link>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        statusConfig.badgeClass,
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          statusConfig.dotClass,
                        )}
                      />
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-lottie-zinc-500">
                    {module.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lottie-mist">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          module.status === "completed"
                            ? "bg-emerald-500"
                            : module.status === "in-progress"
                              ? "bg-lottie-teal"
                              : "bg-lottie-fog",
                        )}
                        style={{ width: `${module.progressPercent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-lottie-zinc-500">
                      {module.completedSteps}/{module.totalSteps} Langkah
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronLeftIcon
                  className={cn(
                    "h-5 w-5 shrink-0 text-lottie-zinc-500 transition-transform duration-200",
                    isExpanded ? "-rotate-90" : "rotate-90",
                  )}
                />
              </button>

              {/* Expanded Steps */}
              {isExpanded && (
                <div className="border-t border-lottie-mist/50 bg-lottie-teal/[0.02] px-5 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lottie-zinc-500">
                    Langkah Pembelajaran
                  </p>

                  <ul className="space-y-2">
                    {module.steps.map((step, stepIndex) => {
                      const StepIcon = getStepIcon(step.typeLabel);
                      const tone = getStepIconTone(step.typeLabel);
                      const stepIsLocked = step.status === "locked";
                      const stepIsCompleted = step.status === "completed";

                      return (
                        <li key={step.id}>
                          {stepIsLocked ? (
                            <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 opacity-40">
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                  tone.bg,
                                )}
                              >
                                <StepIcon className={cn("h-4 w-4", tone.fg)} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-lottie-zinc-500">
                                  {step.title}
                                </p>
                                <p className="text-xs text-lottie-fog">
                                  {step.typeLabel} · Terkunci
                                </p>
                              </div>
                              <span className="text-xs text-lottie-fog">🔒</span>
                            </div>
                          ) : (
                            <Link
                              href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${module.id}${step.typeLabel === "Tes Diagnostik" ||
                                step.typeLabel === "Tes"
                                ? `/${step.id}`
                                : step.typeLabel === "Tes Remedial"
                                  ? stepIsCompleted
                                    ? `/${step.diagnosticTestId}`
                                    : `/remedia/${step.id}`
                                  : ""
                                }`}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                                step.status === "in-progress"
                                  ? "border-lottie-teal/30 bg-lottie-teal/5 shadow-xs text-lottie-teal"
                                  : "border-lottie-mist bg-white hover:border-lottie-teal/20 hover:shadow-xs text-lottie-midnight",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                  tone.bg,
                                )}
                              >
                                <StepIcon className={cn("h-4 w-4", tone.fg)} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    stepIsCompleted
                                      ? "text-lottie-midnight"
                                      : step.status === "in-progress"
                                        ? "text-lottie-teal"
                                        : "text-lottie-zinc-600",
                                  )}
                                >
                                  {step.title}
                                </p>
                                <p className="text-xs text-lottie-zinc-500">
                                  {step.typeLabel} · Langkah {stepIndex + 1}
                                </p>
                              </div>
                              {stepIsCompleted && (
                                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                              )}
                              {step.status === "in-progress" && (
                                <span className="shrink-0 rounded-full bg-lottie-teal px-2.5 py-0.5 text-[10px] font-semibold text-white hover:bg-lottie-teal/95 transition-all">
                                  Lanjutkan
                                </span>
                              )}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
