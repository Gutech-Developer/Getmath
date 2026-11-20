"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { TKA_EMOTION_LABEL } from "@/constant/tka";
import { GsApiError } from "@/libs/api";
import { useStudentTkaResult } from "@/services";
import { formatTkaDateTime, formatTkaNumber } from "@/utils/tka";

export default function TkaStudentResultTemplate({ testId }: { testId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useStudentTkaResult(testId);

  useEffect(() => {
    if (error instanceof GsApiError && error.status === 400) {
      router.replace(`/student/tka/${testId}/exam`);
    }
  }, [error, router, testId]);

  if (isLoading) {
    return (
      <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
        Memuat hasil TKA...
      </div>
    );
  }

  if (isError || !data) {
    const status = error instanceof GsApiError ? error.status : undefined;
    return (
      <div className="getmath-card space-y-3 p-8 text-center text-sm text-rose-600">
        <p>
          {status === 404
            ? "Anda belum mengerjakan TKA ini."
            : error?.message ?? "Hasil TKA tidak ditemukan."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/student/dashboard/tka")}
          className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke daftar TKA
        </button>
      </div>
    );
  }

  const score = formatTkaNumber(data.score);

  return (
    <section className="mx-auto w-full max-w-[760px] space-y-4 py-4">
      <div className="rounded-3xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-6 text-white shadow-[0_16px_40px_rgba(31,35,117,0.18)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
          Hasil TKA
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{data.title}</h1>
        <p className="mt-1 text-sm text-white/80">
          {data.schoolName} · {data.schoolYear ?? "-"}
        </p>
        <div className="mt-5 flex items-end gap-3">
          <span className="text-5xl font-bold">{score}</span>
          <span className="pb-1 text-sm text-white/80">/ 100</span>
        </div>
      </div>

      <div className="getmath-card grid gap-3 p-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-4 text-center">
          <p className="text-xs text-emerald-700">Benar</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {data.correctCount}
          </p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 text-center">
          <p className="text-xs text-rose-700">Salah</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">
            {data.wrongCount}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 text-center">
          <p className="text-xs text-amber-700">Kosong</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {data.unansweredCount}
          </p>
        </div>
      </div>

      <div className="getmath-card space-y-3 p-5 text-sm text-[#4B5563]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Siswa</span>
          <span className="font-semibold text-[#111827]">
            {data.studentName} {data.nis ? `(${data.nis})` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Submisi</span>
          <Badge variant={data.submissionType === "MANUAL" ? "success" : "warning"}>
            {data.submissionType === "MANUAL"
              ? "Dikumpulkan Manual"
              : "Otomatis (Waktu Habis)"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Waktu</span>
          <span className="font-semibold text-[#111827]">
            {formatTkaDateTime(data.startedAt)} -{" "}
            {formatTkaDateTime(data.completedAt)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Emosi</span>
          <span className="font-semibold text-[#111827]">
            {data.emotionRecorded
              ? `${TKA_EMOTION_LABEL[data.emotionDominant ?? "unknown"] ?? data.emotionDominant} (${data.emotionTotalSamples} sampel)`
              : "Tidak terekam"}
          </span>
        </div>
      </div>

      {data.unansweredQuestionNumbers.length > 0 && (
        <div className="getmath-card space-y-2 p-5">
          <p className="text-sm font-semibold text-[#111827]">
            Soal belum dijawab
          </p>
          <div className="flex flex-wrap gap-2">
            {data.unansweredQuestionNumbers.map((number) => (
              <span
                key={number}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#FEF2F2] px-2 text-xs font-semibold text-[#DC2626]"
              >
                {number}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/student/dashboard/tka")}
          className="rounded-2xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white"
        >
          Kembali ke daftar TKA
        </button>
      </div>
    </section>
  );
}
