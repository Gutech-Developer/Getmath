"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import {
  TKA_EMOTION_COLOR,
  TKA_EMOTION_LABEL,
  TKA_QUESTION_TYPE_LABEL,
} from "@/constant/tka";
import MathText from "@/components/atoms/MathText";
import LADDonutChart, {
  type IEmotionSegment,
} from "@/components/molecules/classroom/LADDonutChart";
import { useTkaAttemptDetail } from "@/services";
import {
  formatTkaDateTime,
  formatTkaNumber,
} from "@/utils/tka";

export default function TkaAttemptDetailContent({
  testId,
  attemptId,
  role = "teacher",
}: {
  testId: string;
  attemptId: string;
  role?: "admin" | "teacher";
}) {
  const router = useRouter();
  const basePath =
    role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";
  const { data, isLoading, isError, error } = useTkaAttemptDetail(
    testId,
    attemptId,
  );

  if (isLoading) {
    return (
      <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
        Memuat detail jawaban...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="getmath-card space-y-3 p-8 text-center text-sm text-rose-600">
        <p>{error?.message ?? "Detail jawaban tidak ditemukan."}</p>
        <button
          type="button"
          onClick={() =>
            router.push(`${basePath}/manage-tka/${testId}/analytics`)
          }
          className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke analitik
        </button>
      </div>
    );
  }

  const emotionSegments: IEmotionSegment[] = Object.entries(
    data.emotionSummary.distribution,
  )
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      label: TKA_EMOTION_LABEL[label as keyof typeof TKA_EMOTION_LABEL] ?? label,
      value: Math.round(value * 10000) / 100,
      color: TKA_EMOTION_COLOR[label as keyof typeof TKA_EMOTION_COLOR] ?? "#94A3B8",
    }));

  return (
    <section className="w-full space-y-4">
      <header>
        <button
          type="button"
          onClick={() =>
            router.push(`${basePath}/manage-tka/${testId}/analytics`)
          }
          className="mb-2 text-sm font-medium text-lottie-teal"
        >
          ← Kembali ke analitik
        </button>
        <h1 className="text-xl font-semibold leading-tight text-[#111827]">
          Detail Jawaban Siswa
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">{data.testTitle}</p>
      </header>

      <div className="getmath-card grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs text-[#9CA3AF]">Siswa</p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {data.studentName}
          </p>
          <p className="text-xs text-[#6B7280]">{data.nis ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">Status</p>
          <div className="mt-1">
            <Badge
              variant={data.status === "COMPLETED" ? "success" : "warning"}
            >
              {data.status === "COMPLETED"
                ? "Selesai"
                : "Sedang Mengerjakan"}
            </Badge>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">Skor</p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {data.score === undefined ? "-" : formatTkaNumber(data.score)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">Waktu</p>
          <p className="mt-1 text-xs font-semibold text-[#111827]">
            {formatTkaDateTime(data.startedAt)}
          </p>
          <p className="text-xs text-[#6B7280]">
            {data.completedAt
              ? formatTkaDateTime(data.completedAt)
              : "Belum selesai"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {data.questions.map((question) => {
            const selected = new Set(question.selectedOptionIds);
            const statementMap = Object.fromEntries(
              question.statementAnswers.map((entry) => [
                entry.statementId,
                entry.isTrue,
              ]),
            );

            return (
              <article key={question.questionId} className="getmath-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lottie-teal text-sm font-semibold text-white">
                      {question.questionNumber}
                    </span>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">
                        {TKA_QUESTION_TYPE_LABEL[question.questionType]}
                      </p>
                      <div className="text-sm font-medium leading-6 text-[#0F172A]">
                        <MathText text={question.questionText} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {question.isDoubtful && (
                      <Badge variant="warning">Ragu-ragu</Badge>
                    )}
                    <Badge
                      variant={
                        !question.isAnswered
                          ? "info"
                          : question.isCorrect
                            ? "success"
                            : "error"
                      }
                    >
                      {!question.isAnswered
                        ? "Kosong"
                        : question.isCorrect
                          ? "Benar"
                          : "Salah"}
                    </Badge>
                    <span className="text-xs text-[#6B7280]">
                      {question.pointsEarned}/{question.maxPoints}
                    </span>
                  </div>
                </div>

                {question.questionType === "COMPLEX_TRUE_FALSE" ? (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB]">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="bg-[#F8FAFC] text-left text-xs uppercase tracking-wide text-[#64748B]">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Pernyataan</th>
                          <th className="px-3 py-2 font-semibold">Jawaban</th>
                          <th className="px-3 py-2 font-semibold">Kunci</th>
                          <th className="px-3 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(question.statements ?? []).map((statement) => {
                          const answer = statementMap[statement.id];
                          const isCorrectAnswer =
                            answer !== undefined && answer === statement.isTrue;
                          return (
                            <tr
                              key={statement.id}
                              className={`border-t border-[#E5E7EB] ${
                                answer === undefined
                                  ? "bg-[#F8FAFC]"
                                  : isCorrectAnswer
                                    ? "bg-emerald-50"
                                    : "bg-rose-50"
                              }`}
                            >
                              <td className="px-3 py-2 text-[#334155]">
                                <MathText text={statement.statementText} />
                              </td>
                              <td className="px-3 py-2">
                                {answer === undefined
                                  ? "Kosong"
                                  : answer
                                    ? "Benar"
                                    : "Salah"}
                              </td>
                              <td className="px-3 py-2">
                                {statement.isTrue ? "Benar" : "Salah"}
                              </td>
                              <td className="px-3 py-2">
                                {answer === undefined
                                  ? "-"
                                  : isCorrectAnswer
                                    ? "Tepat"
                                    : "Tidak Tepat"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {(question.options ?? []).map((option) => {
                      const isSelected = selected.has(option.id);
                      const isCorrect = option.isCorrect;
                      return (
                        <div
                          key={option.id}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            isSelected && isCorrect
                              ? "border-emerald-200 bg-emerald-50"
                              : isSelected
                                ? "border-rose-200 bg-rose-50"
                                : isCorrect
                                  ? "border-emerald-200 bg-emerald-50/50"
                                  : "border-[#E5E7EB] bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-semibold text-[#475569]">
                              {option.label}
                            </span>
                            <div className="flex-1">
                              <MathText text={option.optionText} />
                            </div>
                            <span className="text-xs font-semibold text-[#6B7280]">
                              {isSelected ? "Dipilih" : ""}
                              {isCorrect ? " · Kunci" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="space-y-3">
          <div className="getmath-card p-5">
            <h2 className="text-base font-semibold text-[#111827]">
              Ringkasan Emosi
            </h2>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              {data.emotionSummary.totalSamples} sampel
            </p>
            <LADDonutChart segments={emotionSegments} className="mt-2" />
            <p className="mt-2 text-sm text-[#4B5563]">
              Dominan:{" "}
              <span className="font-semibold text-[#111827]">
                {TKA_EMOTION_LABEL[data.emotionSummary.dominant] ??
                  data.emotionSummary.dominant}
              </span>
            </p>
          </div>

          <div className="getmath-card p-5 text-sm text-[#4B5563]">
            <div className="flex justify-between gap-3">
              <span>Benar</span>
              <span className="font-semibold text-[#111827]">
                {data.correctCount}
              </span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span>Salah</span>
              <span className="font-semibold text-[#111827]">
                {data.wrongCount}
              </span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span>Kosong</span>
              <span className="font-semibold text-[#111827]">
                {data.unansweredCount}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
