"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { useRouter } from "next/navigation";
import { useGsRemedialTestById } from "@/services";
import { cn, resolveAssetUrl } from "@/libs/utils";
import MathText from "@/components/atoms/MathText";
import type { GsRemedialTest, GsRemedialVariant } from "@/types/gs-remedial";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be")
      return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/"))
      return url;
    return null;
  } catch {
    return null;
  }
}

export function RemedialPreviewBody({ test }: { test: GsRemedialTest }) {
  const [activePackage, setActivePackage] = useState<string>("A");

  const labels = new Set<string>();
  test.questions?.forEach((q) => {
    q.variants?.forEach((v) => labels.add(v.packageLabel));
  });
  const packageLabels = Array.from(labels).sort();

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-6 getmath-card px-6 py-5">
        <div>
          <p className="text-xs uppercase text-[#9CA3AF]">KKM</p>
          <p className="mt-1 text-base font-semibold text-[#F97316]">
            {test.passingScore}
          </p>
        </div>
        <div className="h-10 w-px bg-[#E5E7EB]" />
        <div>
          <p className="text-xs uppercase text-[#9CA3AF]">Durasi</p>
          <p className="mt-1 text-base font-semibold text-[#111827]">
            {test.durationMinutes} menit
          </p>
        </div>
        <div className="h-10 w-px bg-[#E5E7EB]" />
        <div>
          <p className="text-xs uppercase text-[#9CA3AF]">Deskripsi</p>
          <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
            {test.description || "-"}
          </p>
        </div>
      </section>

      {/* Tabs */}
      {packageLabels.length > 0 && (
        <section className="overflow-hidden getmath-card">
          <div className="flex items-center gap-0 overflow-x-auto border-b border-[#E5E7EB] bg-lottie-teal/5">
            {packageLabels.map((label) => {
              const isActive = activePackage === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActivePackage(label)}
                  className={cn(
                    "relative px-5 py-3 text-sm font-semibold transition whitespace-nowrap cursor-pointer",
                    isActive
                      ? "border-b-2 border-lottie-teal bg-white text-lottie-teal"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]",
                  )}
                >
                  Paket {label}
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {test.questions?.map((question, i) => {
              const variant = question.variants?.find(
                (v) => v.packageLabel === activePackage,
              );
              if (!variant) return null;

              const hasDiscussion = activePackage === "A" || activePackage === "B";
              const discussionText = hasDiscussion ? variant.discussionText : null;
              const discussionVideoUrl = hasDiscussion ? variant.discussionVideoUrl : null;
              
              const embed = discussionVideoUrl
                ? getYouTubeEmbedUrl(discussionVideoUrl)
                : null;

              return (
                <div key={question.id || i} className="p-5 sm:p-6 space-y-4">
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lottie-teal/10 text-sm font-semibold text-lottie-teal">
                      {question.questionNumber || i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-4">
                      {/* Pertanyaan */}
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none text-[#374151]">
                          <MathText text={variant.textQuestion || ""} />
                        </div>
                        {variant.imageQuestionUrl && (
                          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-2">
                            <img
                              src={resolveAssetUrl(variant.imageQuestionUrl)}
                              alt="Gambar Soal"
                              className="max-h-80 w-auto object-contain rounded-lg mx-auto"
                            />
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <ul className="space-y-2">
                        {variant.options?.map((opt) => (
                          <li
                            key={opt.id || opt.option}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border p-3 text-sm",
                              opt.isCorrect
                                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                                : "border-[#E5E7EB] bg-white text-[#4B5563]",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-semibold",
                                opt.isCorrect
                                  ? "bg-[#34D399] text-white"
                                  : "bg-[#F3F4F6] text-[#374151]",
                              )}
                            >
                              {opt.option}
                            </span>
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="prose prose-sm max-w-none">
                                <MathText text={opt.textAnswer || ""} />
                              </div>
                              {opt.imageAnswerUrl && (
                                <img
                                  src={resolveAssetUrl(opt.imageAnswerUrl)}
                                  alt={`Gambar Opsi ${opt.option}`}
                                  className="max-h-40 w-auto object-contain rounded-lg"
                                />
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* Pembahasan */}
                      {hasDiscussion && (discussionText || embed) && (
                        <div className="mt-4 rounded-2xl bg-[#F9FAFB] p-4 space-y-4">
                          {discussionText && (
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase text-[#6B7280]">
                                Pembahasan
                              </p>
                              <div className="prose prose-sm max-w-none text-[#4B5563]">
                                <MathText text={discussionText} />
                              </div>
                            </div>
                          )}

                          {embed && (
                            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                              <iframe
                                src={embed}
                                title={`Pembahasan Soal ${i + 1}`}
                                className="aspect-video w-full"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface IProps {
  id: string;
  role?: "admin" | "teacher";
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherPreviewRemedialContent({ id, role = "teacher" }: IProps) {
  const basePath = role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";
  const router = useRouter();
  const { data: test, isLoading } = useGsRemedialTestById(id);

  /* ---- loading / error ---- */
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat tes remedial…
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#9CA3AF]">Tes remedial tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => router.push(`${basePath}/manage-remedial`)}
          className="rounded-2xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-5 py-2 text-sm font-semibold text-white cursor-pointer"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`${basePath}/manage-remedial`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-lottie-teal/10 bg-white text-lottie-teal hover:bg-lottie-teal/5 transition cursor-pointer"
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
            router.push(`${basePath}/manage-remedial/${id}/edit`)
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-lottie-teal/5 px-4 py-2.5 text-sm font-semibold text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
        >
          <EditIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      <RemedialPreviewBody test={test} />
    </div>
  );
}
