"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import PDFIcon from "@/components/atoms/icons/PDFIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { cn } from "@/libs/utils";
import { toEmbedUrl } from "@/libs/embed";
import {
  useGsModulesByCourse,
  useMarkFileRead,
  useMarkVideoWatched,
} from "@/services";
import type { GsCourseModule, GsCourseModuleSubject } from "@/types/gs-course";
import type {
  IClassMaterialContentPageTemplateProps,
  ModuleStepState,
} from "@/types/classMaterial";
import { formatBreadcrumbLabel, formatContentTitle } from "@/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type StepKind = "PDF" | "VIDEO" | "ELKPD" | "DIAGNOSTIC";

interface IFlatStep {
  id: string;
  moduleId: string;
  diagnosticTestId?: string;
  moduleTitle: string;
  kind: StepKind;
  typeLabel: string;
  title: string;
  /** URL embed yang siap dimasukkan ke <iframe>. Untuk DIAGNOSTIC: kosong. */
  url: string | null;
  /** URL asli (sebelum di-rewrite ke /embed) untuk tombol "Buka di tab baru". */
  rawUrl: string | null;
  state: ModuleStepState;
}

interface IModuleView {
  id: string;
  title: string;
  description: string;
  steps: IFlatStep[];
}

/* ------------------------------------------------------------------ */
/*  API → view-model                                                   */
/* ------------------------------------------------------------------ */
function buildModuleView(
  module: GsCourseModule,
  index: number,
): IModuleView | null {
  const moduleType = module.type;
  const subject = getSubjectFromModule(module);

  if (moduleType === "SUBJECT" && subject) {
    return moduleFromSubject(module, subject, index);
  }
  if (moduleType === "DIAGNOSTIC_TEST") {
    return moduleFromDiagnostic(module, index);
  }
  return null;
}

function getModuleId(module: GsCourseModule): string {
  const fallbackId = (module as GsCourseModule & { courseModuleId?: string })
    .courseModuleId;
  return module.id ?? fallbackId ?? "";
}

function getSubjectFromModule(
  module: GsCourseModule,
): GsCourseModuleSubject | null {
  if (module.subject) {
    return module.subject;
  }

  const flat = module as Partial<GsCourseModuleSubject> & {
    subjectName?: string;
    description?: string | null;
    subjectFileUrl?: string;
    eLKPDTitle?: string | null;
    eLKPDDescription?: string | null;
    eLKPDFileUrl?: string | null;
    videoUrl?: string | null;
  };

  if (!flat.subjectName) {
    return null;
  }

  return {
    id: module.subjectId ?? getModuleId(module),
    subjectName: flat.subjectName,
    description: flat.description ?? null,
    subjectFileUrl: flat.subjectFileUrl ?? "",
    eLKPDTitle: flat.eLKPDTitle ?? null,
    eLKPDDescription: flat.eLKPDDescription ?? null,
    eLKPDFileUrl: flat.eLKPDFileUrl ?? null,
    videoUrl: flat.videoUrl ?? null,
  };
}

function moduleFromSubject(
  module: GsCourseModule,
  subject: GsCourseModuleSubject,
  index: number,
): IModuleView {
  const moduleId = getModuleId(module);
  const steps: IFlatStep[] = [];

  if (subject.subjectFileUrl) {
    steps.push({
      id: `${moduleId}-pdf`,
      moduleId,
      moduleTitle: subject.subjectName,
      kind: "PDF",
      typeLabel: "Materi",
      title: subject.subjectName,
      url: toEmbedUrl(subject.subjectFileUrl, "pdf"),
      rawUrl: subject.subjectFileUrl,
      state: index === 0 ? "active" : "upcoming",
    });
  }

  if (subject.videoUrl) {
    steps.push({
      id: `${moduleId}-video`,
      moduleId,
      moduleTitle: subject.subjectName,
      kind: "VIDEO",
      typeLabel: "Video",
      title: `Video: ${subject.subjectName}`,
      url: toEmbedUrl(subject.videoUrl, "video"),
      rawUrl: subject.videoUrl,
      state: "upcoming",
    });
  }

  if (subject.eLKPDTitle && subject.eLKPDFileUrl) {
    steps.push({
      id: `${moduleId}-elkpd-${subject.id}`,
      moduleId,
      moduleTitle: subject.subjectName,
      kind: "ELKPD",
      typeLabel: "E-LKPD",
      title: subject.eLKPDTitle,
      url: toEmbedUrl(subject.eLKPDFileUrl, "elkpd"),
      rawUrl: subject.eLKPDFileUrl,
      state: "upcoming",
    });
  }

  return {
    id: moduleId,
    title: subject.subjectName,
    description: subject.description ?? "",
    steps,
  };
}

function moduleFromDiagnostic(
  module: GsCourseModule,
  index: number,
): IModuleView {
  const moduleId = getModuleId(module);
  const test = module.diagnosticTest;
  const fallback = module as { testName?: string; description?: string | null };
  const title =
    test?.testName ??
    fallback.testName ??
    `Tes Diagnostik ${module.order ?? index + 1}`;
  const diagnosticTestId = module.diagnosticTestId ?? test?.id ?? "";

  return {
    id: moduleId,
    title,
    description: test?.description ?? fallback.description ?? "",
    steps: [
      {
        id: `${moduleId}-diagnostic`,
        moduleId,
        diagnosticTestId,
        moduleTitle: title,
        kind: "DIAGNOSTIC",
        typeLabel: "Test Diagnosis",
        title,
        url: null,
        rawUrl: null,
        state: index === 0 ? "active" : "upcoming",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Step icon helpers                                                  */
/* ------------------------------------------------------------------ */
function getStepIcon(kind: StepKind) {
  switch (kind) {
    case "VIDEO":
      return VideoIcon;
    case "ELKPD":
      return DocumentIcon;
    case "DIAGNOSTIC":
      return CheckCircleIcon;
    case "PDF":
    default:
      return PDFIcon;
  }
}

function getStepTone(kind: StepKind): { bg: string; fg: string } {
  switch (kind) {
    case "VIDEO":
      return { bg: "bg-[#FEF3C7]", fg: "text-[#D97706]" };
    case "ELKPD":
      return { bg: "bg-[#D1FAE5]", fg: "text-[#059669]" };
    case "DIAGNOSTIC":
      return { bg: "bg-[#FEE2E2]", fg: "text-[#DC2626]" };
    case "PDF":
    default:
      return { bg: "bg-[#DBEAFE]", fg: "text-[#2563EB]" };
  }
}

function ContentBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClassMaterialContentPageTemplate({
  courseId,
  contentId,
  slug,
}: IClassMaterialContentPageTemplateProps) {
  const pathname = usePathname();
  const { data: courseModules, isLoading } = useGsModulesByCourse(courseId);

  // ── Progress tracking hooks ──────────────────────────────────────────
  // @deprecated: useModuleProgress endpoint [UNREADY] - removed
  // Mutations still track progress on backend, but visual state not available
  const markFileRead = useMarkFileRead(contentId);
  const markVideoWatched = useMarkVideoWatched(contentId);

  const modules = useMemo<IModuleView[]>(() => {
    return (courseModules ?? [])
      .filter((m) => m.type === "SUBJECT" || m.type === "DIAGNOSTIC_TEST")
      .map((m, i) => buildModuleView(m, i))
      .filter((m): m is IModuleView => m !== null);
  }, [courseModules]);

  // ── Reflect progress state on steps ──────────────────────────────────
  // @deprecated: progressData tracking [UNREADY] - removed
  // All steps render as "in-progress" until endpoint is available
  const flatSteps = useMemo<IFlatStep[]>(() => {
    return modules.flatMap((m) => m.steps);
  }, [modules]);

  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Set default selectedStep dari modul yang dibuka via contentId.
  useEffect(() => {
    if (modules.length === 0 || selectedStepId !== null) return;
    const target = modules.find((m) => m.id === contentId) ?? modules[0];
    setOpenModuleId(target.id);
    if (target.steps[0]) setSelectedStepId(target.steps[0].id);
  }, [modules, contentId, selectedStepId]);

  const toggleModule = (moduleId: string) => {
    setOpenModuleId((cur) => (cur === moduleId ? null : moduleId));
  };

  /* ---------- Breadcrumb ---------- */
  const contentTitle = formatContentTitle(contentId);
  const breadcrumbItems = useMemo(() => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";
    const items = segments
      .map((segment) => {
        currentPath += `/${segment}`;
        const label = formatBreadcrumbLabel(segment, slug ?? "", contentTitle);
        if (!label) return null;
        return { label, href: currentPath };
      })
      .filter(Boolean) as Array<{ label: string; href: string }>;

    return items.map((item, i) => ({
      ...item,
      isCurrent: i === items.length - 1,
    }));
  }, [pathname, slug, contentTitle]);

  /* ---------- Active step ---------- */
  const activeStep = useMemo<IFlatStep | null>(() => {
    return (
      flatSteps.find((s) => s.id === selectedStepId) ??
      flatSteps.find((s) => s.moduleId === contentId) ??
      flatSteps[0] ??
      null
    );
  }, [flatSteps, selectedStepId, contentId]);

  const activeIndex = activeStep
    ? flatSteps.findIndex((s) => s.id === activeStep.id)
    : -1;
  const prevStep = activeIndex > 0 ? flatSteps[activeIndex - 1] : null;
  const nextStep =
    activeIndex >= 0 && activeIndex < flatSteps.length - 1
      ? flatSteps[activeIndex + 1]
      : null;

  const goTo = useCallback(
    (step: IFlatStep | null) => {
      if (!step) return;
      setSelectedStepId(step.id);
      setOpenModuleId(step.moduleId);

      // ── Auto-track progress when navigating ──────────────────────────
      // @deprecated: Conditional tracking based on progressData [UNREADY] - removed
      // Now always tracks to ensure backend state is updated
      if (step.moduleId === contentId) {
        if (step.kind === "PDF") {
          markFileRead.mutate();
        }
        if (step.kind === "VIDEO") {
          markVideoWatched.mutate();
        }
      }
    },
    [contentId, markFileRead, markVideoWatched],
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat materi...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#64748B]">
          Belum ada modul tersedia di kelas ini.
        </p>
      </div>
    );
  }

  const ActiveIcon = getStepIcon(activeStep?.kind ?? "PDF");
  const activeKind = activeStep?.kind ?? "PDF";
  const isPdf = activeKind === "PDF";
  const isVideo = activeKind === "VIDEO";
  const isElkpd = activeKind === "ELKPD";
  const isDiagnostic = activeKind === "DIAGNOSTIC";

  return (
    <section className="min-h-screen rounded-3xl sm:p-3 lg:p-0">
      {/* ---- Breadcrumb ---- */}
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
        {breadcrumbItems.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="inline-flex items-center gap-2"
          >
            {i > 0 && <span className="text-[#94A3B8]">›</span>}
            {item.isCurrent ? (
              <span className="font-medium text-[#3F76EC]">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="font-medium text-[#475569] transition hover:text-[#3F76EC]"
              >
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* ---- Grid: Content + Sidebar ---- */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div>
          {/* ------- Header ------- */}
          <div className="overflow-hidden rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1F2E46] px-4 py-3 text-xs text-white/90">
              <div className="inline-flex items-center gap-3">
                <ActiveIcon className="h-4 w-4 text-white/80" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeStep?.title ?? "Pilih materi"}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {activeStep?.moduleTitle ?? ""}
                  </p>
                </div>
              </div>

              {activeStep?.rawUrl && (
                <a
                  href={activeStep.rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                >
                  Buka di tab baru
                </a>
              )}
            </div>
          </div>

          {/* ------- Content area ------- */}
          <div className="rounded-b-2xl bg-[#F8FAFC] p-4 sm:p-6">
            {isVideo && activeStep?.url && (
              <>
                <ContentBadge icon={VideoIcon} label="Video Pembelajaran" />
                <div className="aspect-video overflow-hidden rounded-2xl border border-[#E2E8F0] bg-black">
                  <iframe
                    key={activeStep.id}
                    src={activeStep.url}
                    title={activeStep.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              </>
            )}

            {isPdf && activeStep?.url && (
              <>
                <ContentBadge icon={PDFIcon} label="Materi (PDF)" />
                <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                  <iframe
                    key={activeStep.id}
                    src={activeStep.url}
                    title={activeStep.title}
                    className="h-full w-full border-0"
                    allow="fullscreen"
                    allowFullScreen
                  />
                </div>
              </>
            )}

            {isElkpd && activeStep?.url && (
              <>
                <ContentBadge icon={DocumentIcon} label="E-LKPD" />
                <div className="h-[80vh] min-h-[520px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                  <iframe
                    key={activeStep.id}
                    src={activeStep.url}
                    title={activeStep.title}
                    className="h-full w-full border-0"
                    allow="clipboard-write; fullscreen"
                    allowFullScreen
                  />
                </div>
              </>
            )}

            {isDiagnostic && (
              <>
                <ContentBadge icon={CheckCircleIcon} label="Tes Diagnostik" />
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
                    Tes Diagnostik
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-[#0F172A] sm:text-2xl">
                    {activeStep?.title}
                  </h1>
                  {activeStep?.moduleTitle && (
                    <p className="mt-1 text-sm text-[#64748B]">
                      Modul: {activeStep.moduleTitle}
                    </p>
                  )}

                  {slug && activeStep?.diagnosticTestId && (
                    <Link
                      href={`/student/dashboard/class/${encodeURIComponent(
                        slug,
                      )}/materi/${encodeURIComponent(
                        activeStep?.moduleId ?? contentId,
                      )}/${encodeURIComponent(activeStep.diagnosticTestId)}`}
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      Mulai Tes Diagnostik
                    </Link>
                  )}

                  {slug && !activeStep?.diagnosticTestId && (
                    <p className="mt-4 text-sm font-medium text-[#DC2626]">
                      Tes diagnostik belum bisa dibuka karena ID diagnostik
                      tidak ditemukan.
                    </p>
                  )}
                </div>
              </>
            )}

            {!activeStep?.url && !isDiagnostic && (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-5">
                <p className="text-sm text-[#64748B]">
                  Materi ini belum memiliki tautan yang dapat ditampilkan.
                </p>
              </div>
            )}
          </div>

          {/* ------- Step navigation ------- */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(prevStep)}
              disabled={!prevStep}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← {prevStep ? `Sebelumnya: ${prevStep.typeLabel}` : "Sebelumnya"}
            </button>
            {activeIndex >= 0 && (
              <span className="text-sm font-semibold text-[#475569]">
                {activeIndex + 1} / {flatSteps.length}
              </span>
            )}
            <button
              type="button"
              onClick={() => goTo(nextStep)}
              disabled={!nextStep}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {nextStep ? `Selanjutnya: ${nextStep.typeLabel}` : "Selesai"} →
            </button>
          </div>
        </div>

        {/* ==================== RIGHT SIDEBAR ==================== */}
        <aside className="sticky top-4 h-fit rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
            Daftar Modul
          </p>

          <ul className="mt-3 space-y-2">
            {modules.map((module, moduleIndex) => {
              const isOpen = openModuleId === module.id;
              const containsActive = module.steps.some(
                (s) => s.id === activeStep?.id,
              );

              return (
                <li
                  key={module.id}
                  className={cn(
                    "rounded-2xl border bg-white transition",
                    isOpen || containsActive
                      ? "border-[#BFDBFE] shadow-[0_8px_24px_rgba(59,130,246,0.08)]"
                      : "border-[#E2E8F0]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        containsActive
                          ? "bg-[#DBEAFE] text-[#2563EB]"
                          : "bg-[#F1F5F9] text-[#475569]",
                      )}
                    >
                      {moduleIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {module.title}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {module.steps.length} langkah
                      </p>
                    </div>
                    <ChevronLeftIcon
                      className={cn(
                        "h-4 w-4 shrink-0 text-[#94A3B8] transition-transform",
                        isOpen ? "-rotate-90" : "rotate-90",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ul className="space-y-1 border-t border-[#E2E8F0] bg-[#FAFBFD] p-2">
                      {module.steps.map((step, stepIndex) => {
                        const StepIcon = getStepIcon(step.kind);
                        const tone = getStepTone(step.kind);
                        const isActive = activeStep?.id === step.id;

                        return (
                          <li key={step.id}>
                            <button
                              type="button"
                              onClick={() => goTo(step)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                                isActive
                                  ? "border-[#BFDBFE] bg-[#EFF6FF]"
                                  : "border-transparent hover:border-[#E2E8F0] hover:bg-white",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                  tone.bg,
                                )}
                              >
                                <StepIcon className={cn("h-4 w-4", tone.fg)} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "truncate text-sm font-medium",
                                    isActive
                                      ? "text-[#1D4ED8]"
                                      : "text-[#0F172A]",
                                  )}
                                >
                                  {step.title}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                  {step.typeLabel} · Langkah {stepIndex + 1}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
