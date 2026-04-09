"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import DownloadIcon from "@/components/atoms/icons/DownloadIcon";
import MinusIcon from "@/components/atoms/icons/MinusIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import PDFIcon from "@/components/atoms/icons/PDFIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import {
  ELKPDForm,
  ModulMateriCard,
  PersamaanKuadratCard,
} from "@/components/molecules/classroom";
import { cn } from "@/libs/utils";
import type {
  IClassMaterialContentPageTemplateProps,
  IModuleItem,
} from "@/types/classMaterial";
import {
  formatBreadcrumbLabel,
  formatContentTitle,
  getActiveContentMode,
  getPaginationItems,
} from "@/utils";

/* ------------------------------------------------------------------ */
/*  Static data (akan diganti API)                                     */
/* ------------------------------------------------------------------ */
const MATERIAL_MODULES: IModuleItem[] = [
  {
    id: "module-1",
    title: "Modul Materi",
    readLabel: "6/6 materi terbaca",
    progressPercent: 38,
    progressEntries: [
      { label: "Progress Materi", value: 38, accent: "bg-[#3F76EC]" },
      { label: "E-LKPD Selesai", value: 25, accent: "bg-[#16A34A]" },
    ],
  },
  {
    id: "module-2",
    title: "Persamaan Kuadrat",
    readLabel: "4/4 materi terbaca",
    progressPercent: 100,
    steps: [
      {
        id: "step-1",
        typeLabel: "Materi",
        title: "Pengantar Persamaan Kuadrat",
        state: "lock",
      },
      {
        id: "step-2",
        typeLabel: "Video",
        title: "Konsep Persamaan Kuadrat",
        state: "lock",
      },
      {
        id: "step-3",
        typeLabel: "E-LKPD",
        title: "Pemfaktoran",
        state: "lock",
      },
      {
        id: "step-4",
        typeLabel: "Test Diagnosis",
        title: "Test",
        state: "lock",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getActiveContentIcon(typeLabel: string) {
  if (typeLabel === "Video") return VideoIcon;
  if (typeLabel === "E-LKPD") return DocumentIcon;
  if (typeLabel === "Tes" || typeLabel === "Test Diagnosis")
    return CheckCircleIcon;
  return PDFIcon;
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
  slug,
  contentId,
  totalPages = 16,
}: IClassMaterialContentPageTemplateProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    MATERIAL_MODULES.find((m) => m.steps)?.steps?.[0]?.id ?? null,
  );

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  /* ---------- Handlers ---------- */
  const handleZoomChange = (delta: number) => {
    setZoomLevel((cur) => Math.min(200, Math.max(10, cur + delta)));
  };

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
        const label = formatBreadcrumbLabel(segment, slug, contentTitle);
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
  const activeStep = useMemo(() => {
    const steps = MATERIAL_MODULES.flatMap(
      (m) =>
        m.steps?.map((s) => ({ ...s, moduleTitle: m.title })) ?? [],
    );
    return (
      steps.find((s) => s.id === selectedStepId) ??
      steps.find((s) => s.state === "active") ??
      steps[0] ??
      null
    );
  }, [selectedStepId]);

  const moduleSteps =
    MATERIAL_MODULES.find((m) => m.steps)?.steps ?? [];
  const selectedStepIndex = moduleSteps.findIndex(
    (s) => s.id === selectedStepId,
  );
  const stepCount = moduleSteps.length;
  const nextStep = moduleSteps[selectedStepIndex + 1];
  const isPdfMode = activeStep?.typeLabel === "Materi";
  const isVideoMode = activeStep?.typeLabel === "Video";
  const isELKPDMode = activeStep?.typeLabel === "E-LKPD";
  const isTestDiagnosisMode =
    activeStep?.typeLabel === "Tes" ||
    activeStep?.typeLabel === "Test Diagnosis";

  const getNavLabel = (direction: "prev" | "next") => {
    const step =
      direction === "prev"
        ? moduleSteps[selectedStepIndex - 1]
        : nextStep;
    if (!step) return direction === "prev" ? "Sebelumnya" : "Selanjutnya";
    return direction === "prev"
      ? `Sebelumnya ke ${step.typeLabel}`
      : `Selanjutnya ke ${step.typeLabel}`;
  };

  const handlePageChange = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));

  const handlePdfNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
      return;
    }
    if (nextStep) setSelectedStepId(nextStep.id);
  };

  const handleStepNavigation = (direction: "prev" | "next") => {
    if (selectedStepIndex < 0) return;
    const idx =
      direction === "prev" ? selectedStepIndex - 1 : selectedStepIndex + 1;
    if (idx >= 0 && idx < stepCount) setSelectedStepId(moduleSteps[idx].id);
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <section className="min-h-screen rounded-3xl sm:p-3 lg:p-0">
      {/* ---- Breadcrumb ---- */}
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
        {breadcrumbItems.map((item, i) => (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div>
          {/* ------- Dark header bar ------- */}
          <div className="overflow-hidden rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1F2E46] px-4 py-3 text-xs text-white/90">
              <div className="inline-flex items-center gap-3">
                {(() => {
                  const Icon = getActiveContentIcon(
                    activeStep?.typeLabel ?? "Materi",
                  );
                  return <Icon className="h-4 w-4 text-white/80" />;
                })()}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeStep?.title ?? `${contentTitle}.pdf`}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {isPdfMode
                      ? `Halaman ${currentPage} / ${totalPages}`
                      : `Langkah ${selectedStepIndex + 1} / ${stepCount}`}
                  </p>
                </div>
              </div>

              {/* PDF controls */}
              {isPdfMode && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(-10)}
                    disabled={zoomLevel === 10}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/15",
                      zoomLevel === 10 && "cursor-not-allowed opacity-50",
                    )}
                    aria-label="Zoom keluar"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(10)}
                    disabled={zoomLevel === 200}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/15",
                      zoomLevel === 200 && "cursor-not-allowed opacity-50",
                    )}
                    aria-label="Zoom masuk"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                    aria-label="Download PDF"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Unduh
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ------- Content area ------- */}
          <div className="rounded-b-2xl bg-[#F8FAFC] p-4 sm:p-6">
            {/* ---------- VIDEO MODE ---------- */}
            {isVideoMode && (
              <>
                <ContentBadge icon={VideoIcon} label="Video Pembelajaran" />

                <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0F172A_0%,#172554_50%,#0B193F_100%)] p-5 shadow-lg">
                  <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                    00:00 / 12:45
                  </div>
                  <div className="flex h-80 items-center justify-center">
                    <button
                      type="button"
                      className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition hover:bg-[#1D4ED8]"
                      aria-label="Play video"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info card */}
                <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Video Penjelasan: {activeStep?.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Durasi: 12:45 · Pak Budi
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#475569]">
                    Tonton video ini untuk mendapatkan pemahaman visual tentang
                    konsep variabel dan bagaimana menyelesaikan persamaan
                    kuadrat.
                  </p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="h-full w-0 rounded-full bg-[#2563EB]" />
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                    0% ditonton
                  </p>
                </div>

                {/* Hint box */}
                <div className="mt-4 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-4 text-sm text-[#1E293B]">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                        <path d="M4 5h16v14H4z" opacity="0.2" />
                        <path d="M6 7h12v2H6V7zm0 4h8v2H6v-2zm0 4h6v2H6v-2z" />
                      </svg>
                    </span>
                    <p className="leading-6">
                      Silakan tonton video ini sampai selesai, lalu klik
                      <span className="font-semibold"> {getNavLabel("next")} </span>
                      untuk mengerjakan {nextStep?.typeLabel ?? "langkah berikutnya"}.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ---------- E-LKPD MODE ---------- */}
            {isELKPDMode && (
              <>
                <ContentBadge icon={DocumentIcon} label="E-LKPD" />
                <ELKPDForm
                  title="Elektronik Lembar Kerja Peserta Didik (E-LKPD)"
                  topic={`Topik: Aljabar Dasar – ${activeStep?.title ?? "Persamaan Linier"}`}
                />
              </>
            )}

            {/* ---------- TEST DIAGNOSIS MODE ---------- */}
            {isTestDiagnosisMode && (
              <>
                <ContentBadge icon={CheckCircleIcon} label="Tes Diagnostik" />

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
                    Tes Diagnostik
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-[#0F172A] sm:text-2xl">
                    {activeStep?.title ?? contentTitle}
                  </h1>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Uji pemahamanmu dengan soal diagnosis yang disesuaikan untuk
                    langkah ini.
                  </p>

                  <Link
                    href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(contentId)}/diagnostic`}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    Mulai Tes Diagnostik
                  </Link>
                </div>
              </>
            )}

            {/* ---------- PDF / MATERI MODE ---------- */}
            {isPdfMode && (
              <>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
                    Konten Materi
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-[#0F172A] sm:text-2xl">
                    {activeStep?.title ?? contentTitle}
                  </h1>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Konten ID: {contentId} · Mode{" "}
                    {getActiveContentMode(activeStep?.typeLabel ?? "Materi")}
                  </p>
                </div>

                {/* PDF placeholder */}
                <div
                  className="mt-4 flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white"
                  style={{ zoom: `${zoomLevel}%` }}
                >
                  <p className="text-sm text-[#94A3B8]">
                    Konten PDF halaman {currentPage} akan ditampilkan di sini
                  </p>
                </div>
              </>
            )}

            {/* ---------- FALLBACK ---------- */}
            {!isPdfMode && !isVideoMode && !isELKPDMode && !isTestDiagnosisMode && (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-5">
                <p className="text-sm text-[#64748B]">
                  Konten awal untuk step ini sudah disiapkan.
                </p>
              </div>
            )}
          </div>

          {/* ------- Bottom navigation ------- */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748B]">
              {isPdfMode && (
                <>
                  Halaman{" "}
                  <span className="font-semibold text-[#1E293B]">{currentPage}</span>{" "}
                  dari{" "}
                  <span className="font-semibold text-[#1E293B]">{totalPages}</span>
                </>
              )}
            </p>

            <div className={cn("flex items-center gap-1.5", !isPdfMode && "w-full justify-center")}>
              {isPdfMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {paginationItems.map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-sm text-[#94A3B8]">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        className={cn(
                          "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition",
                          currentPage === item
                            ? "border-[#2563EB] bg-[#E9EEFF] font-semibold text-[#1D4ED8]"
                            : "border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]",
                        )}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={handlePdfNext}
                    disabled={currentPage === totalPages && !nextStep}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      currentPage === totalPages && nextStep
                        ? "Langkah berikutnya"
                        : "Halaman berikutnya"
                    }
                  >
                    <ChevronLeftIcon className="h-4 w-4 rotate-180" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStepNavigation("prev")}
                    disabled={selectedStepIndex <= 0}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Langkah sebelumnya"
                  >
                    ← Sebelumnya
                  </button>
                  <span className="text-sm font-semibold text-[#475569]">
                    {selectedStepIndex + 1} / {stepCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepNavigation("next")}
                    disabled={selectedStepIndex >= stepCount - 1}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Langkah berikutnya"
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT SIDEBAR ==================== */}
        <aside className="sticky top-4 h-fit rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
            Daftar Modul
          </p>

          <div className="mt-3 space-y-3">
            {MATERIAL_MODULES.map((module) =>
              module.progressEntries ? (
                <ModulMateriCard key={module.id} module={module} />
              ) : (
                <PersamaanKuadratCard
                  key={module.id}
                  module={module}
                  openModuleId={openModuleId}
                  selectedStepId={selectedStepId}
                  toggleModule={toggleModule}
                  setSelectedStepId={setSelectedStepId}
                />
              ),
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
