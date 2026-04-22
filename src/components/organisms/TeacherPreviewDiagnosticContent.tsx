"use client";

import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import MathText from "@/components/atoms/MathText";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGsDiagnosticTestById } from "@/services";
import type { GsTestQuestionPackage } from "@/types/gs-diagnostic-test";

/** Convert YouTube URL to embed URL, returns null if not YouTube */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (
      u.hostname.includes("youtube.com") &&
      u.pathname.startsWith("/embed/")
    ) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface IProps {
  id: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherPreviewDiagnosticContent({ id }: IProps) {
  const router = useRouter();
  const { data: test, isLoading } = useGsDiagnosticTestById(id);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  /* ---- loading / error ---- */
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat tes diagnostik…
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#9CA3AF]">
          Tes diagnostik tidak ditemukan.
        </p>
        <button
          type="button"
          onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
          className="rounded-2xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const totalQuestions =
    test.packages?.reduce((s, p) => s + (p.questions?.length ?? 0), 0) ?? 0;

  /* ------------------------------------------------------------------ */
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F3F4F6]"
            aria-label="Kembali"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">
              {test.testName}
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              {new Date(test.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            router.push(`/teacher/dashboard/manage-diagnostics/${id}/edit`)
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-[#EFF6FF] px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
        >
          <EditIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Soal", value: totalQuestions },
          { label: "Durasi", value: `${test.durationMinutes} menit` },
          { label: "KKM", value: test.passingScore },
          { label: "Tipe Paket", value: test.packages?.length ?? 0 },
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

      {/* Deskripsi */}
      {test.description && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
          <p className="text-sm font-semibold text-[#374151]">Deskripsi</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#6B7280]">
            {test.description}
          </p>
        </section>
      )}

      {/* Packages & Questions — Tab layout */}
      {(() => {
        const packages = test.packages ?? [];
        if (packages.length === 0) return null;
        const activePkg: GsTestQuestionPackage =
          packages.find((p) => p.id === activePackageId) ?? packages[0];
        return (
          <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
            {/* Tab bar */}
            <div className="flex overflow-x-auto border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {packages.map((pkg: GsTestQuestionPackage, pi: number) => {
                const isActive = pkg.id === activePkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setActivePackageId(pkg.id)}
                    className={`relative shrink-0 whitespace-nowrap px-5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-b-2 border-[#2563EB] bg-white text-[#2563EB]"
                        : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]"
                    }`}
                  >
                    {pkg.packageName ?? `Paket ${pi + 1}`}
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${isActive ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#E5E7EB] text-[#6B7280]"}`}
                    >
                      {pkg.questions?.length ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active package questions */}
            <div className="space-y-3 p-4">
              {(activePkg.questions ?? []).map((q, qi) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-[#E5E7EB] bg-white"
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 px-4 py-4">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
                      {qi + 1}
                    </span>
                    <p className="flex-1 max-w-md whitespace-pre-wrap text-sm text-[#111827]">
                      <MathText text={q.textQuestion ?? `Soal ${qi + 1}`} />
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 border-t border-[#F3F4F6] px-4 py-3 sm:grid-cols-2">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          opt.isCorrect
                            ? "border border-[#86EFAC] bg-[#F0FDF4] font-semibold text-[#15803D]"
                            : "border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]"
                        }`}
                      >
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#374151] shadow-sm">
                          {opt.option}
                        </span>
                        <MathText text={opt.textAnswer ?? "–"} />
                      </div>
                    ))}
                  </div>

                  {/* Pembahasan */}
                  {q.pembahasan && (
                    <div className="border-t border-[#F3F4F6] bg-[#FFFBEB] px-4 py-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#92400E]">
                        Pembahasan
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-[#78350F]">
                        <MathText text={q.pembahasan} />
                      </p>
                      {(() => {
                        const embedUrl = getYouTubeEmbedUrl(q.videoUrl ?? "");
                        if (!embedUrl) {
                          return q.videoUrl ? (
                            <a
                              href={q.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
                            >
                              🎬 Tonton video pembahasan
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
        );
      })()}
    </div>
  );
}
