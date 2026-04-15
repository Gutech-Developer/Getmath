"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import {
  CAMERA_REQUIREMENTS,
  DIAGNOSTIC_DURATION_SECONDS,
  DIAGNOSTIC_KKM_MINIMUM_SCORE,
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_RULES,
} from "@/constant/classDiagnosis";
import { cn } from "@/libs/utils";
import type {
  CameraPermissionState,
  DiagnosticFlowStep,
  IClassDiagnosisContentPageTemplateProps,
} from "@/types";
import { formatDiagnosticTime } from "@/utils";

export default function ClassDiagnosisContentPageTemplate({
  slug,
  contentId,
  diagnotisId,
}: IClassDiagnosisContentPageTemplateProps) {
  const [flowStep, setFlowStep] = useState<DiagnosticFlowStep>("camera");
  const [cameraState, setCameraState] = useState<CameraPermissionState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ruleChecklist, setRuleChecklist] = useState<boolean[]>(
    DIAGNOSTIC_RULES.map(() => false),
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openedDiscussionIds, setOpenedDiscussionIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(
    DIAGNOSTIC_DURATION_SECONDS,
  );

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const encodedSlug = encodeURIComponent(slug);
  const encodedContentId = encodeURIComponent(contentId);
  const encodedDiagnotisId = encodeURIComponent(diagnotisId);
  const materialHref = `/student/dashboard/class/${encodedSlug}/materi/${encodedContentId}`;
  const diagnosticHref = `${materialHref}/${encodedDiagnotisId}`;

  const activeQuestion = DIAGNOSTIC_QUESTIONS[activeQuestionIndex] ?? null;
  const allRulesConfirmed = ruleChecklist.every(Boolean);
  const answeredCount = Object.keys(answers).length;
  const correctCount = DIAGNOSTIC_QUESTIONS.filter(
    (question) => answers[question.id] === question.correctOptionId,
  ).length;
  const scorePercent = Math.round(
    (correctCount / DIAGNOSTIC_QUESTIONS.length) * 100,
  );
  const isPassedKKM = scorePercent >= DIAGNOSTIC_KKM_MINIMUM_SCORE;
  const allQuestionsAnswered = answeredCount === DIAGNOSTIC_QUESTIONS.length;
  const completionPercent = Math.round(
    (answeredCount / DIAGNOSTIC_QUESTIONS.length) * 100,
  );

  const timeLabel = useMemo(
    () => formatDiagnosticTime(remainingSeconds),
    [remainingSeconds],
  );

  useEffect(() => {
    if (!previewRef.current || !streamRef.current) {
      return;
    }

    previewRef.current.srcObject = streamRef.current;
  }, [cameraState, flowStep]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (flowStep !== "quiz" || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [flowStep, remainingSeconds]);

  useEffect(() => {
    if (flowStep === "quiz" && remainingSeconds <= 0) {
      setFlowStep("completed");
    }
  }, [flowStep, remainingSeconds]);

  const handleRequestCamera = async () => {
    setCameraError(null);
    setCameraState("requesting");

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraState("denied");
      setCameraError("Browser ini belum mendukung akses kamera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = stream;
      setCameraState("granted");
      setFlowStep("briefing");
    } catch {
      setCameraState("denied");
      setCameraError(
        "Akses kamera ditolak. Izinkan akses kamera agar tes diagnostik bisa dimulai.",
      );
    }
  };

  const handleToggleRule = (ruleIndex: number) => {
    setRuleChecklist((current) =>
      current.map((value, index) => (index === ruleIndex ? !value : value)),
    );
  };

  const handleStartQuiz = () => {
    if (cameraState !== "granted" || !allRulesConfirmed) {
      return;
    }

    setRemainingSeconds(DIAGNOSTIC_DURATION_SECONDS);
    setActiveQuestionIndex(0);
    setFlowStep("quiz");
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeQuestion) {
      return;
    }

    if (!answers[activeQuestion.id]) {
      return;
    }

    if (activeQuestionIndex >= DIAGNOSTIC_QUESTIONS.length - 1) {
      setFlowStep("completed");
      return;
    }

    setActiveQuestionIndex((current) => current + 1);
  };

  const handleToggleDiscussion = (questionId: string) => {
    setOpenedDiscussionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  };

  if (flowStep === "camera") {
    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div className="mx-auto max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_45px_rgba(37,99,235,0.12)] sm:p-5">
          <div className="rounded-2xl bg-[#2563EB] p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Step 1 dari 2
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-lg font-semibold">
              <VideoIcon className="h-4 w-4" />
              Izin Akses Kamera
            </h1>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm leading-6 text-[#475569]">
              Sebelum tes dimulai, aktifkan kamera untuk memastikan proses
              diagnosis berjalan tertib.
            </p>

            <ul className="space-y-2">
              {CAMERA_REQUIREMENTS.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>

            {cameraError ? (
              <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                <p>{cameraError}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRequestCamera}
              disabled={cameraState === "requesting"}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cameraState === "requesting"
                ? "Meminta akses kamera..."
                : "Buka Kamera & Lanjutkan"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (flowStep === "briefing") {
    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div className="mx-auto max-w-[760px] space-y-4">
          <div className="rounded-3xl bg-[#2563EB] p-5 text-white shadow-[0_16px_40px_rgba(37,99,235,0.28)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Step 2 dari 2
            </p>
            <h1 className="mt-2 text-xl font-semibold">Tes Diagnostik</h1>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/30 bg-white/15 px-3 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <BookIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-white/75">Jumlah Soal</p>
                    <p className="text-sm font-semibold">
                      {DIAGNOSTIC_QUESTIONS.length} Soal
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/15 px-3 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <ClockIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-white/75">Durasi</p>
                    <p className="text-sm font-semibold">15 Menit</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/15 px-3 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <CheckCircleIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-white/75">KKM / Passing</p>
                    <p className="text-sm font-semibold">
                      {DIAGNOSTIC_KKM_MINIMUM_SCORE}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-[#0F172A]">Aturan Tes</h2>

            <ul className="mt-3 space-y-2">
              {DIAGNOSTIC_RULES.map((rule, index) => {
                const checked = ruleChecklist[index];

                return (
                  <li key={rule}>
                    <button
                      type="button"
                      onClick={() => handleToggleRule(index)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                        checked
                          ? "border-[#BFDBFE] bg-[#EFF6FF]"
                          : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          checked
                            ? "border-[#2563EB] bg-[#2563EB] text-white"
                            : "border-[#CBD5E1] bg-white text-[#94A3B8]",
                        )}
                      >
                        {checked ? (
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <p className="text-sm leading-6 text-[#334155]">{rule}</p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={!allRulesConfirmed || cameraState !== "granted"}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mulai Tes Sekarang
            </button>

            <div className="mt-4 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-3">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">
                Rule Parsing KKM
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-[#1E3A8A]">
                <li>Nilai dihitung dari jumlah jawaban benar.</li>
                <li>Rumus: (Benar / {DIAGNOSTIC_QUESTIONS.length}) x 100.</li>
                <li>
                  Jika nilai &lt; {DIAGNOSTIC_KKM_MINIMUM_SCORE}: status tidak
                  tuntas (merah).
                </li>
                <li>
                  Jika nilai &gt;= {DIAGNOSTIC_KKM_MINIMUM_SCORE}: status tuntas
                  (biru).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flowStep === "completed") {
    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div
          className={cn(
            "mx-auto max-w-xl rounded-3xl border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
            isPassedKKM
              ? "border-[#BFDBFE] bg-[#EFF6FF]"
              : "border-[#FECACA] bg-[#FEF2F2]",
          )}
        >
          <div
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
              isPassedKKM
                ? "bg-[#DBEAFE] text-[#2563EB]"
                : "bg-[#FECACA] text-[#DC2626]",
            )}
          >
            <CheckCircleIcon className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#0F172A]">
            Tes Diagnostik Selesai
          </h1>
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              isPassedKKM ? "text-[#1E3A8A]" : "text-[#B91C1C]",
            )}
          >
            {isPassedKKM
              ? "Jawaban kamu telah tersimpan. Status kamu tuntas sesuai KKM."
              : "Jawaban kamu telah tersimpan. Status kamu belum tuntas karena nilai masih di bawah KKM."}
          </p>

          <div
            className={cn(
              "mt-5 rounded-2xl border p-4",
              isPassedKKM
                ? "border-[#BFDBFE] bg-white"
                : "border-[#FECACA] bg-white",
            )}
          >
            <p className="text-sm text-[#475569]">Ringkasan Hasil</p>
            <p className="mt-1 text-xl font-semibold text-[#0F172A]">
              {answeredCount}/{DIAGNOSTIC_QUESTIONS.length} soal terjawab
            </p>
            <p className="mt-1 text-sm text-[#334155]">
              Benar: {correctCount} soal • Nilai: {scorePercent}
            </p>
            <p
              className={cn(
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                isPassedKKM
                  ? "bg-[#DBEAFE] text-[#1E40AF]"
                  : "bg-[#FEE2E2] text-[#B91C1C]",
              )}
            >
              {isPassedKKM
                ? `Lulus KKM (${DIAGNOSTIC_KKM_MINIMUM_SCORE})`
                : `Belum Lulus KKM (${DIAGNOSTIC_KKM_MINIMUM_SCORE})`}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Pembahasan per Soal
            </h2>

            <div className="mt-3 space-y-2.5">
              {DIAGNOSTIC_QUESTIONS.map((question, index) => {
                const selectedOption = question.options.find(
                  (option) => option.id === answers[question.id],
                );
                const correctOption = question.options.find(
                  (option) => option.id === question.correctOptionId,
                );
                const isCorrect =
                  selectedOption?.id === question.correctOptionId;
                const isOpen = openedDiscussionIds.includes(question.id);
                const panelId = `discussion-panel-${question.id}`;

                return (
                  <article
                    key={question.id}
                    className="overflow-hidden rounded-xl border border-[#E2E8F0]"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleDiscussion(question.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-start justify-between gap-3 bg-[#F8FAFC] px-3 py-3 text-left transition hover:bg-[#F1F5F9]"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                          Soal {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#0F172A]">
                          {question.prompt}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold",
                            selectedOption
                              ? isCorrect
                                ? "border-[#86EFAC] bg-[#DCFCE7] text-[#166534]"
                                : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
                              : "border-[#E2E8F0] bg-white text-[#64748B]",
                          )}
                        >
                          {selectedOption
                            ? isCorrect
                              ? "Benar"
                              : "Salah"
                            : "Belum Dijawab"}
                        </span>

                        <ChevronLeftIcon
                          className={cn(
                            "h-4 w-4 text-[#64748B] transition-transform",
                            isOpen ? "-rotate-90" : "rotate-90",
                          )}
                        />
                      </div>
                    </button>

                    {isOpen ? (
                      <div
                        id={panelId}
                        className="border-t border-[#E2E8F0] px-3 py-3"
                      >
                        <div className="space-y-2 text-sm text-[#334155]">
                          <p>
                            <span className="font-semibold text-[#0F172A]">
                              Jawaban kamu:
                            </span>{" "}
                            {selectedOption
                              ? `${selectedOption.label}. ${selectedOption.text}`
                              : "Belum menjawab soal ini."}
                          </p>
                          <p>
                            <span className="font-semibold text-[#0F172A]">
                              Jawaban benar:
                            </span>{" "}
                            {correctOption
                              ? `${correctOption.label}. ${correctOption.text}`
                              : "-"}
                          </p>
                          <p className="leading-6">
                            <span className="font-semibold text-[#0F172A]">
                              Pembahasan:
                            </span>{" "}
                            {question.discussion}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={materialHref}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Kembali ke Materi
            </Link>
            <Link
              href={diagnosticHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
            >
              Kerjakan Ulang
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const selectedOptionId = activeQuestion ? answers[activeQuestion.id] : null;
  const canSubmitCurrentQuestion = Boolean(
    activeQuestion && answers[activeQuestion.id],
  );

  return (
    <section className="mx-auto w-full max-w-[1200px] py-2 sm:py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#2563EB] p-4 text-white shadow-[0_16px_35px_rgba(37,99,235,0.26)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-white/80">
                Soal Diagnostik
              </p>
              <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold">
                {activeQuestionIndex + 1}/{DIAGNOSTIC_QUESTIONS.length}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">Sesi sedang berjalan</p>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/35 bg-white/15 px-3 py-1.5 text-sm font-semibold">
                <ClockIcon className="h-4 w-4" />
                {timeLabel}
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                {activeQuestion?.topic ?? "Diagnostik"}
              </span>
              <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#475569]">
                {activeQuestion?.typeLabel ?? "Pilihan Ganda"}
              </span>
              <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#475569]">
                Soal {activeQuestionIndex + 1}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-7 text-[#0F172A]">
              {activeQuestion?.prompt}
            </h2>

            <div className="mt-4 space-y-2.5">
              {(activeQuestion?.options ?? []).map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      activeQuestion &&
                      handleSelectAnswer(activeQuestion.id, option.id)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                      isSelected
                        ? "border-[#93C5FD] bg-[#EFF6FF]"
                        : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                        isSelected
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-[#CBD5E1] bg-white text-[#64748B]",
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="text-sm text-[#334155]">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748B]">
              Jawaban terisi {answeredCount}/{DIAGNOSTIC_QUESTIONS.length} soal
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveQuestionIndex((current) => Math.max(0, current - 1))
                }
                disabled={activeQuestionIndex === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={
                  !canSubmitCurrentQuestion ||
                  (activeQuestionIndex === DIAGNOSTIC_QUESTIONS.length - 1 &&
                    !allQuestionsAnswered)
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeQuestionIndex === DIAGNOSTIC_QUESTIONS.length - 1
                  ? allQuestionsAnswered
                    ? "Selesaikan Tes"
                    : "Lengkapi Semua Soal"
                  : "Selanjutnya"}
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#0F172A] p-2">
            <video
              ref={previewRef}
              autoPlay
              playsInline
              muted
              className="h-28 w-full rounded-xl bg-[#0B1120] object-cover"
            />
          </div>

          <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
              Soal
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIAGNOSTIC_QUESTIONS.map((question, index) => {
                const isActive = index === activeQuestionIndex;
                const isAnswered = Boolean(answers[question.id]);

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(index)}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition",
                      isActive
                        ? "border-white bg-[#2563EB] text-white"
                        : isAnswered
                          ? "border-[#86EFAC] bg-[#DCFCE7] text-[#166534]"
                          : "border-white bg-slate-300 text-black",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
              Kamera
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {cameraState === "granted" ? "Aktif" : "Belum aktif"}
            </p>
            <p className="mt-2 text-xs text-[#64748B]">
              Tetap berada dalam frame selama tes berlangsung.
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
              Progress
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {completionPercent}% selesai
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
