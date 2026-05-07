"use client";

import BookIcon from "@/components/atoms/icons/BookIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import MathText from "@/components/atoms/MathText";
import { cn } from "@/libs/utils";
import type {
  GsDiagnosticTest,
  GsTestQuestionPackage,
} from "@/types/gs-diagnostic-test";
import type {
  IMateriSequenceItem,
  ILearningAnalyticsStudentListItem,
  MateriAssetKind,
} from "@/types/learningAnalytics";
import { useEffect, useMemo, useState } from "react";

export interface ISequencePreviewAsset {
  title: string;
  url: string;
  type: "pdf" | "video" | "elkpd";
}

function getAssetIconComponent(
  kind: MateriAssetKind,
):
  | typeof BookIcon
  | typeof NotebookIcon
  | typeof VideoIcon
  | typeof DocumentIcon {
  if (kind === "PDF") {
    return DocumentIcon;
  }

  if (kind === "Video") {
    return VideoIcon;
  }

  return NotebookIcon;
}

function getAssetTextClassName(kind: MateriAssetKind): string {
  if (kind === "PDF") {
    return "text-[#2563EB]";
  }

  if (kind === "Video") {
    return "text-[#16A34A]";
  }

  return "text-[#EA580C]";
}

import { toEmbedUrl } from "@/libs/embed";

function getPreviewLabel(type: ISequencePreviewAsset["type"]): string {
  if (type === "pdf") {
    return "PDF · Heyzine";
  }

  if (type === "video") {
    return "Video · YouTube";
  }

  return "E-LKPD · Liveworksheets";
}

export function MaterialPreviewPanel({
  items,
}: {
  items: ISequencePreviewAsset[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const activeItem = items[activeIndex] ?? items[0];

  if (!activeItem) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-10 text-sm text-[#94A3B8]">
        Preview materi belum tersedia.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
        {items.map((item, index) => (
          <button
            key={`${item.type}-${item.title}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
              index === activeIndex
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]",
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              {getPreviewLabel(activeItem.type)}
            </p>
            <h4 className="text-base font-semibold text-[#111827]">
              {activeItem.title}
            </h4>
          </div>
         
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6]">
          <iframe
            src={toEmbedUrl(activeItem.url, activeItem.type)}
            className="min-h-[420px] w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={activeItem.title}
          />
        </div>
      </div>
    </div>
  );
}

export function DiagnosticPreviewBody({ test }: { test: GsDiagnosticTest }) {
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  const totalQuestions =
    test.packages?.reduce(
      (sum, pkg) => sum + (pkg.questions?.length ?? 0),
      0,
    ) ?? 0;

  const packages = test.packages ?? [];
  const activePackage: GsTestQuestionPackage | undefined = useMemo(() => {
    if (packages.length === 0) {
      return undefined;
    }

    return packages.find((pkg) => pkg.id === activePackageId) ?? packages[0];
  }, [activePackageId, packages]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Soal", value: totalQuestions },
          { label: "Durasi", value: `${test.durationMinutes} menit` },
          { label: "KKM", value: test.passingScore },
          { label: "Tipe Paket", value: packages.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#111827]">
              {value}
            </p>
          </div>
        ))}
      </section>

      {test.description && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
          <p className="text-sm font-semibold text-[#374151]">Deskripsi</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#6B7280]">
            {test.description}
          </p>
        </section>
      )}

      {packages.length > 0 && activePackage ? (
        <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
          <div className="flex overflow-x-auto border-b border-[#E5E7EB] bg-[#F9FAFB]">
            {packages.map((pkg, index) => {
              const isActive = pkg.id === activePackage.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setActivePackageId(pkg.id)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap px-5 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-b-2 border-[#2563EB] bg-white text-[#2563EB]"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]",
                  )}
                >
                  {pkg.packageName ?? `Paket ${index + 1}`}
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                      isActive
                        ? "bg-[#DBEAFE] text-[#1D4ED8]"
                        : "bg-[#E5E7EB] text-[#6B7280]",
                    )}
                  >
                    {pkg.questions?.length ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 p-4">
            {(activePackage.questions ?? []).map((question, questionIndex) => (
              <div
                key={question.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white"
              >
                <div className="flex items-start gap-3 px-4 py-4">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
                    {questionIndex + 1}
                  </span>
                  <p className="flex-1 max-w-md whitespace-pre-wrap text-sm text-[#111827]">
                    <MathText
                      text={
                        question.textQuestion ?? `Soal ${questionIndex + 1}`
                      }
                    />
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 border-t border-[#F3F4F6] px-4 py-3 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                        option.isCorrect
                          ? "border border-[#86EFAC] bg-[#F0FDF4] font-semibold text-[#15803D]"
                          : "border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]",
                      )}
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#374151] shadow-sm">
                        {option.option}
                      </span>
                      <MathText text={option.textAnswer ?? "–"} />
                    </div>
                  ))}
                </div>

                {question.pembahasan && (
                  <div className="space-y-2 border-t border-[#F3F4F6] bg-[#FFFBEB] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#92400E]">
                      Pembahasan
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-[#78350F]">
                      <MathText text={question.pembahasan} />
                    </p>
                    {(() => {
                      const embedUrl = toEmbedUrl(
                        question.videoUrl ?? "",
                        "video"
                      );

                      // toEmbedUrl returns the original URL if it can't embed it.
                      // If it is the original URL and it's not a youtube embed URL (since we want an iframe), we should probably just show the link.
                      // Wait, toEmbedUrl for video always returns a youtube embed link if it's youtube.
                      // Let's just check if it contains /embed/ to be safe.
                      const isEmbeddable = embedUrl.includes("/embed/");

                      if (!isEmbeddable) {
                        return question.videoUrl ? (
                          <a
                            href={question.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
                          >
                            Tonton video pembahasan
                          </a>
                        ) : null;
                      }

                      return (
                        <div className="overflow-hidden rounded-xl border border-[#FDE68A]">
                          <iframe
                            src={embedUrl}
                            title="Video pembahasan"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="aspect-video w-full"
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function MateriSequenceItemCard({
  item,
  index,
  totalItems,
  isMutating,
  onMove,
  onView,
  onDelete,
}: {
  item: IMateriSequenceItem;
  index: number;
  totalItems: number;
  isMutating: boolean;
  onMove: (itemIndex: number, direction: -1 | 1) => void;
  onView: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}) {
  const isFirst = index === 0;
  const isLast = index === totalItems - 1;

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] px-3 py-3 md:px-4">
      <div className="flex items-start gap-2.5 md:gap-3">
        <div className="flex shrink-0 flex-col gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => void onMove(index, -1)}
            disabled={isFirst || isMutating}
            className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F8FAFC] text-[#94A3B8] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Geser ${item.title} ke atas`}
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path
                d="M5.5 12.5L10 8L14.5 12.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => void onMove(index, 1)}
            disabled={isLast || isMutating}
            className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F8FAFC] text-[#94A3B8] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Geser ${item.title} ke bawah`}
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path
                d="M5.5 7.5L10 12L14.5 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <span
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            item.type === "Modul"
              ? "bg-[#DBEAFE] text-[#2563EB]"
              : "bg-[#EDE9FE] text-[#7C3AED]",
          )}
        >
          {item.type === "Modul" ? (
            <BookIcon className="h-4 w-4" />
          ) : (
            <NotebookIcon className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-semibold",
                item.type === "Modul"
                  ? "bg-[#DBEAFE] text-[#2563EB]"
                  : "bg-[#EDE9FE] text-[#6D28D9]",
              )}
            >
              {item.type}
            </span>
            <span className="text-[#9CA3AF]">Urutan {index + 1}</span>
            {item.formatLabel && (
              <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[#94A3B8]">
                {item.formatLabel}
              </span>
            )}
          </div>

          <h3 className="mt-1 text-lg font-bold leading-tight text-[#1F2937]">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm text-[#94A3B8]">{item.description}</p>

          {item.type === "Modul" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.assets.map((asset) => {
                const AssetIcon = getAssetIconComponent(asset.kind);
                const textClassName = getAssetTextClassName(asset.kind);

                return (
                  <span
                    key={asset.id}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      textClassName,
                    )}
                  >
                    <AssetIcon className={cn("h-3.5 w-3.5", textClassName)} />
                    {asset.kind}: {asset.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs font-medium text-[#9CA3AF]">
              KKM 80 · Durasi: {item.durationMinutes ?? 60} menit ·{" "}
              {item.questionCount ?? 5} soal acak 2 tipe soal
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-start gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onView(item.id)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
            aria-label={`Lihat ${item.title}`}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={isMutating}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Hapus ${item.title}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export interface IELKPDPreview {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
}

export interface IELKPDGradingPanelProps {
  elkpds: IELKPDPreview[];
  students: ILearningAnalyticsStudentListItem[];
  activeELKPDId?: string;
  onELKPDChange?: (elkpdId: string) => void;
}

export function ELKPDGradingPanel({
  elkpds,
  students,
  activeELKPDId,
  onELKPDChange,
}: IELKPDGradingPanelProps) {
  const activeELKPD = elkpds.find((e) => e.id === activeELKPDId) ?? elkpds[0];

  if (!activeELKPD) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-10 text-sm text-[#94A3B8]">
        Tidak ada E-LKPD di modul ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* E-LKPD Tabs */}
      {elkpds.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {elkpds.map((elkpd) => (
            <button
              key={elkpd.id}
              type="button"
              onClick={() => onELKPDChange?.(elkpd.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                elkpd.id === activeELKPD.id
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] border border-[#E5E7EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]",
              )}
            >
              {elkpd.title}
            </button>
          ))}
        </div>
      )}

      {/* E-LKPD Info */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              E-LKPD · Liveworksheets
            </p>
            <h4 className="mt-1 text-base font-semibold text-[#111827]">
              {activeELKPD.title}
            </h4>
            {activeELKPD.description && (
              <p className="mt-1 text-sm text-[#6B7280]">
                {activeELKPD.description}
              </p>
            )}
          </div>
         
        </div>
      </div>

      {/* Student Grades Grid */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#374151]">Nilai Siswa</p>
        <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-[#1F2937]">
                  {student.fullname}
                </p>
                <p className="text-xs text-[#94A3B8]">NIS: {student.nis}</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#2563EB] border border-[#DBEAFE]">
                <span className="text-xs text-[#6B7280]">-</span>
                <span>/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
