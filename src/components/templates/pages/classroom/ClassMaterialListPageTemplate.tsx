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
import { useGsCourseBySlug, useGsModulesByCourse } from "@/services";
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
 * Map GsCourseModule (type=SUBJECT) → IMaterialModule.
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

    const steps: IMaterialStep[] = [
      {
        id: module.diagnosticTestId ?? test?.id ?? `${moduleId}-diagnostic`,
        typeLabel: "Test Diagnosis",
        title,
        status: flat.completed
          ? "completed"
          : flat.accessible
            ? "in-progress"
            : "locked",
      },
    ];

    const completedSteps = flat.completed ? 1 : 0;

    return {
      id: moduleId,
      title,
      description: test?.description ?? flat.description ?? "",
      totalSteps: steps.length,
      completedSteps,
      progressPercent:
        steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0,
      status: flat.completed
        ? "completed"
        : flat.accessible
          ? "in-progress"
          : "locked",
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
    status: flat.fileRead
      ? "completed"
      : flat.accessible
        ? "in-progress"
        : "locked",
  });

  // 2. Video
  if (flat.hasVideo) {
    steps.push({
      id: `${moduleId}-video`,
      typeLabel: "Video",
      title: `Video: ${title}`,
      status: flat.videoWatched
        ? "completed"
        : flat.fileRead
          ? "in-progress"
          : "locked",
    });
  }

  // 3. E-LKPD
  if (flat.hasELKPD) {
    const prevCompleted = flat.hasVideo ? flat.videoWatched : flat.fileRead;
    steps.push({
      id: `${moduleId}-elkpd`,
      typeLabel: "E-LKPD",
      title: `E-LKPD: ${title}`,
      status: flat.eLKPDGraded
        ? "completed"
        : prevCompleted
          ? "in-progress"
          : "locked",
    });
  }

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "completed").length;

  return {
    id: moduleId,
    title,
    description: subject?.description ?? flat.description ?? "",
    totalSteps,
    completedSteps,
    progressPercent:
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    status: flat.completed
      ? "completed"
      : flat.accessible
        ? "in-progress"
        : "locked",
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
    badgeClass: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    dotClass: "bg-[#22C55E]",
  },
  "in-progress": {
    label: "Sedang Dipelajari",
    badgeClass: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    dotClass: "bg-[#3B82F6]",
  },
  locked: {
    label: "Terkunci",
    badgeClass: "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]",
    dotClass: "bg-[#CBD5E1]",
  },
};

function getStepIcon(typeLabel: string) {
  if (typeLabel === "Video") return VideoIcon;
  if (typeLabel === "E-LKPD") return DocumentIcon;
  if (typeLabel === "Test Diagnosis" || typeLabel === "Tes")
    return CheckCircleIcon;
  return PDFIcon;
}

function getStepIconTone(typeLabel: string): { bg: string; fg: string } {
  if (typeLabel === "Video")
    return { bg: "bg-[#FEF3C7]", fg: "text-[#D97706]" };
  if (typeLabel === "E-LKPD")
    return { bg: "bg-[#D1FAE5]", fg: "text-[#059669]" };
  if (typeLabel === "Test Diagnosis" || typeLabel === "Tes")
    return { bg: "bg-[#FEE2E2]", fg: "text-[#DC2626]" };
  return { bg: "bg-[#DBEAFE]", fg: "text-[#2563EB]" };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClassMaterialListPageTemplate({
  slug,
}: IClassMaterialListPageTemplateProps) {
  const { data: course } = useGsCourseBySlug(slug);
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

  const filteredModules = searchQuery.trim()
    ? modules.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : modules;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <section className="min-h-screen rounded-3xl sm:p-3 lg:p-0">
      {/* ---- Back Link ---- */}
      <Link
        href={`/student/dashboard/class/${encodeURIComponent(slug)}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#475569] transition hover:text-[#3F76EC]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Kembali ke Beranda Kelas
      </Link>

      {/* ---- Hero Header ---- */}
      <header className="overflow-hidden rounded-3xl bg-[#1F2375] p-6 text-white shadow-[0px_20px_40px_rgba(39,48,132,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <BookIcon className="h-3.5 w-3.5" />
              Materi Pembelajaran
            </p>
            <h1 className="mt-3 text-2xl font-bold">Daftar Materi Kelas</h1>
            <p className="mt-1 text-sm text-white/70">
              Pelajari semua modul secara berurutan untuk menguasai materi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              {completedModules}/{totalModules} Modul Selesai
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              {completedStepsAll}/{totalStepsAll} Langkah
            </span>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-white/85">
            <span>Progres keseluruhan materi</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#DCE3FF] transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* ---- Summary Cards ---- */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: CheckCircleIcon,
            iconBg: "bg-[#D1FAE5]",
            iconFg: "text-[#059669]",
            value: `${completedModules}`,
            label: "Modul Selesai",
          },
          {
            icon: ClockIcon,
            iconBg: "bg-[#DBEAFE]",
            iconFg: "text-[#2563EB]",
            value: `${modules.filter((m) => m.status === "in-progress").length}`,
            label: "Sedang Dipelajari",
          },
          {
            icon: BookIcon,
            iconBg: "bg-[#F3E8FF]",
            iconFg: "text-[#7C3AED]",
            value: `${totalModules}`,
            label: "Total Modul",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0px_8px_24px_rgba(148,163,184,0.1)]"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                card.iconBg,
              )}
            >
              <card.icon className={cn("h-4.5 w-4.5", card.iconFg)} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">{card.value}</p>
              <p className="text-xs text-[#64748B]">{card.label}</p>
            </div>
          </article>
        ))}
      </div>

      {/* ---- Search Bar ---- */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul materi..."
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
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

          return (
            <article
              key={module.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-[0px_8px_24px_rgba(148,163,184,0.08)] transition",
                isExpanded
                  ? "border-[#BFDBFE] shadow-[0px_12px_32px_rgba(59,130,246,0.1)]"
                  : "border-[#E2E8F0]",
                isLocked && "opacity-70",
              )}
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleExpand(module.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[#F8FAFC]"
              >
                {/* Number circle */}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                    module.status === "completed"
                      ? "bg-[#D1FAE5] text-[#059669]"
                      : module.status === "in-progress"
                        ? "bg-[#DBEAFE] text-[#2563EB]"
                        : "bg-[#F1F5F9] text-[#94A3B8]",
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
                      <h3 className="text-base font-bold text-[#0F172A] transition group-hover/title:text-[#2563EB]">
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
                  <p className="mt-0.5 text-sm text-[#64748B]">
                    {module.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          module.status === "completed"
                            ? "bg-[#22C55E]"
                            : module.status === "in-progress"
                              ? "bg-[#3B82F6]"
                              : "bg-[#CBD5E1]",
                        )}
                        style={{ width: `${module.progressPercent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-[#475569]">
                      {module.completedSteps}/{module.totalSteps} Langkah
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronLeftIcon
                  className={cn(
                    "h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200",
                    isExpanded ? "-rotate-90" : "rotate-90",
                  )}
                />
              </button>

              {/* Expanded Steps */}
              {isExpanded && (
                <div className="border-t border-[#E2E8F0] bg-[#FAFBFD] px-5 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
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
                            <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 opacity-50">
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                  tone.bg,
                                )}
                              >
                                <StepIcon className={cn("h-4 w-4", tone.fg)} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[#94A3B8]">
                                  {step.title}
                                </p>
                                <p className="text-xs text-[#CBD5E1]">
                                  {step.typeLabel} · Terkunci
                                </p>
                              </div>
                              <span className="text-xs text-[#CBD5E1]">🔒</span>
                            </div>
                          ) : (
                            <Link
                              href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${module.id}${step.typeLabel === "Test Diagnosis" || step.typeLabel === "Tes" ? `/${step.id}` : ""}`}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                                step.status === "in-progress"
                                  ? "border-[#BFDBFE] bg-[#EFF6FF] shadow-sm"
                                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-sm",
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
                                      ? "text-[#0F172A]"
                                      : step.status === "in-progress"
                                        ? "text-[#1D4ED8]"
                                        : "text-[#475569]",
                                  )}
                                >
                                  {step.title}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                  {step.typeLabel} · Langkah {stepIndex + 1}
                                </p>
                              </div>
                              {stepIsCompleted && (
                                <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#22C55E]" />
                              )}
                              {step.status === "in-progress" && (
                                <span className="shrink-0 rounded-full bg-[#2563EB] px-2.5 py-0.5 text-[10px] font-semibold text-white">
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
