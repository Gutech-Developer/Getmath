"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import CameraIcon from "@/components/atoms/icons/CameraIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import ShieldIcon from "@/components/atoms/icons/ShieldIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import {
  DiagnosticQuestionCard,
  EmotionDetectionWidget,
  EmotionNotification,
} from "@/components/molecules/classroom";
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

/* ------------------------------------------------------------------ */
/*  Privacy bullets for camera screen                                  */
/* ------------------------------------------------------------------ */
const PRIVACY_ITEMS = [
  {
    icon: ShieldIcon,
    text: "Data kamera tidak disimpan di server mana pun.",
  },
  {
    icon: BookIcon,
    text: "Deteksi berjalan sepenuhnya di perangkatmu (on-device).",
  },
  {
    icon: ClockIcon,
    text: "Kamu bisa menutup kamera kapan saja selama tes.",
  },
];

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function ClassDiagnosisContentPageTemplate({
  slug,
  contentId,
  diagnotisId,
}: IClassDiagnosisContentPageTemplateProps) {
  /* ---------- State ---------- */
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
  const [showEmotionNotification, setShowEmotionNotification] = useState(false);

  /* ---------- Refs ---------- */
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ---------- Derived ---------- */
  const encodedSlug = encodeURIComponent(slug);
  const encodedContentId = encodeURIComponent(contentId);
  const encodedDiagnotisId = encodeURIComponent(diagnotisId);
  const materialHref = `/student/dashboard/class/${encodedSlug}/materi/${encodedContentId}`;
  const diagnosticHref = `${materialHref}/${encodedDiagnotisId}`;

  const activeQuestion = DIAGNOSTIC_QUESTIONS[activeQuestionIndex] ?? null;
  const allRulesConfirmed = ruleChecklist.every(Boolean);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const correctCount = DIAGNOSTIC_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctOptionId,
  ).length;
  const wrongCount = answeredCount - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isPassedKKM = scorePercent >= DIAGNOSTIC_KKM_MINIMUM_SCORE;
  const allQuestionsAnswered = answeredCount === totalQuestions;
  const completionPercent = Math.round((answeredCount / totalQuestions) * 100);

  const timeLabel = useMemo(
    () => formatDiagnosticTime(remainingSeconds),
    [remainingSeconds],
  );

  const elapsedLabel = useMemo(() => {
    const elapsed = DIAGNOSTIC_DURATION_SECONDS - remainingSeconds;
    return formatDiagnosticTime(elapsed);
  }, [remainingSeconds]);

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (!previewRef.current || !streamRef.current) return;
    previewRef.current.srcObject = streamRef.current;
  }, [cameraState, flowStep]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (flowStep !== "quiz" || remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [flowStep, remainingSeconds]);

  useEffect(() => {
    if (flowStep === "quiz" && remainingSeconds <= 0) setFlowStep("completed");
  }, [flowStep, remainingSeconds]);

  /* ---------- Handlers ---------- */
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
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
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

  const handleSkipCamera = () => {
    setCameraState("denied");
    setFlowStep("briefing");
  };

  const handleToggleRule = (i: number) => {
    setRuleChecklist((c) => c.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleStartQuiz = () => {
    if (!allRulesConfirmed) return;
    setRemainingSeconds(DIAGNOSTIC_DURATION_SECONDS);
    setActiveQuestionIndex(0);
    setFlowStep("quiz");
  };

  const handleSelectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((c) => ({ ...c, [questionId]: optionId }));
      setShowEmotionNotification(true);
    },
    [],
  );

  const handleSubmitQuiz = () => {
    if (!allQuestionsAnswered) return;
    setFlowStep("completed");
  };

  const handleToggleDiscussion = (qId: string) => {
    setOpenedDiscussionIds((c) =>
      c.includes(qId) ? c.filter((id) => id !== qId) : [...c, qId],
    );
  };

  /* ================================================================ */
  /*  FLOW: CAMERA                                                     */
  /* ================================================================ */
  if (flowStep === "camera") {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-6">
        <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_20px_50px_rgba(37,99,235,0.1)]">
          {/* Blue header */}
          <div className="rounded-t-3xl bg-[#2563EB] px-6 py-5 text-center text-white">
            <span className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <CameraIcon className="h-7 w-7 text-white" />
            </span>
            <h1 className="text-lg font-bold">Izin Akses Kamera</h1>
            <p className="mt-1 text-sm text-white/80">
              Deteksi emosi saat tes berlangsung
            </p>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-5">
            {/* Privacy bullets */}
            <ul className="space-y-2.5">
              {PRIVACY_ITEMS.map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                    <item.icon className="h-4 w-4 text-[#2563EB]" />
                  </span>
                  <span className="text-sm leading-5 text-[#334155]">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Error */}
            {cameraError && (
              <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                <p>{cameraError}</p>
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={handleRequestCamera}
              disabled={cameraState === "requesting"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CameraIcon className="h-4 w-4" />
              {cameraState === "requesting"
                ? "Meminta akses kamera..."
                : "Izinkan Kamera & Lanjutkan"}
            </button>

            {/* Skip link */}
            <button
              type="button"
              onClick={handleSkipCamera}
              className="block w-full text-center text-sm text-[#94A3B8] transition hover:text-[#64748B]"
            >
              Lewati, lanjutkan tanpa kamera
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ================================================================ */
  /*  FLOW: BRIEFING                                                   */
  /* ================================================================ */
  if (flowStep === "briefing") {
    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div className="mx-auto max-w-[760px] space-y-4">
          {/* Blue hero card */}
          <div className="rounded-3xl bg-[#2563EB] p-5 text-white shadow-[0_16px_40px_rgba(37,99,235,0.28)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Step 2 dari 2
            </p>
            <h1 className="mt-2 text-xl font-semibold">Tes Diagnostik</h1>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { icon: BookIcon, label: "Jumlah Soal", value: `${totalQuestions} Soal` },
                { icon: ClockIcon, label: "Durasi", value: "15 Menit" },
                { icon: CheckCircleIcon, label: "KKM / Passing", value: String(DIAGNOSTIC_KKM_MINIMUM_SCORE) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/30 bg-white/15 px-3 py-3 text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <stat.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] text-white/75">{stat.label}</p>
                      <p className="text-sm font-semibold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules card */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Aturan Tes
            </h2>

            <ul className="mt-3 space-y-2">
              {DIAGNOSTIC_RULES.map((rule, i) => {
                const checked = ruleChecklist[i];
                return (
                  <li key={rule}>
                    <button
                      type="button"
                      onClick={() => handleToggleRule(i)}
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
                          i + 1
                        )}
                      </span>
                      <p className="text-sm leading-6 text-[#334155]">
                        {rule}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={!allRulesConfirmed}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mulai Tes Sekarang
            </button>

            {/* KKM info */}
            <div className="mt-4 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-3">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">
                Rule Parsing KKM
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-[#1E3A8A]">
                <li>Nilai dihitung dari jumlah jawaban benar.</li>
                <li>Rumus: (Benar / {totalQuestions}) x 100.</li>
                <li>Jika nilai &lt; {DIAGNOSTIC_KKM_MINIMUM_SCORE}: status tidak tuntas (merah).</li>
                <li>Jika nilai &gt;= {DIAGNOSTIC_KKM_MINIMUM_SCORE}: status tuntas (biru).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ================================================================ */
  /*  FLOW: COMPLETED                                                  */
  /* ================================================================ */
  if (flowStep === "completed") {
    return (
      <section className="mx-auto w-full max-w-[800px] py-4 sm:py-6">
        {/* ---- Dark result card ---- */}
        <div className="overflow-hidden rounded-3xl bg-[#0F172A] px-6 py-8 text-center text-white shadow-[0_24px_60px_rgba(15,23,42,0.35)]">
          {/* X / Check circle */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#334155]">
            {isPassedKKM ? (
              <CheckCircleIcon className="h-8 w-8 text-[#22C55E]" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Score */}
          <p className="mt-4 text-6xl font-extrabold tracking-tight">
            {scorePercent}
          </p>

          {/* Badge */}
          <span
            className={cn(
              "mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider",
              isPassedKKM
                ? "bg-[#166534] text-[#86EFAC]"
                : "bg-[#7F1D1D] text-[#FCA5A5]",
            )}
          >
            {isPassedKKM ? "LULUS" : "REMEDIAL"}
          </span>

          {/* Subtitle */}
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#94A3B8]">
            {isPassedKKM
              ? `Selamat! Nilai kamu di atas KKM ${DIAGNOSTIC_KKM_MINIMUM_SCORE}. Kamu berhasil menuntaskan tes diagnostik.`
              : `Nilai di bawah KKM ${DIAGNOSTIC_KKM_MINIMUM_SCORE}. Tonton video pembahasan lalu ulangi.`}
          </p>

          {/* Stats grid */}
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#1E293B] px-3 py-3">
              <p className="text-2xl font-bold text-[#22C55E]">{correctCount}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">Benar</p>
            </div>
            <div className="rounded-2xl bg-[#1E293B] px-3 py-3">
              <p className="text-2xl font-bold text-[#EF4444]">{wrongCount}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">Salah</p>
            </div>
            <div className="rounded-2xl bg-[#1E293B] px-3 py-3">
              <p className="text-2xl font-bold text-[#3B82F6]">{elapsedLabel}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">Waktu</p>
            </div>
          </div>
        </div>

        {/* ---- Pembahasan Soal ---- */}
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Pembahasan Soal
          </h2>

          <div className="mt-3 space-y-2.5">
            {DIAGNOSTIC_QUESTIONS.map((question, index) => {
              const selectedOption = question.options.find(
                (o) => o.id === answers[question.id],
              );
              const correctOption = question.options.find(
                (o) => o.id === question.correctOptionId,
              );
              const isCorrect = selectedOption?.id === question.correctOptionId;
              const isOpen = openedDiscussionIds.includes(question.id);
              const panelId = `discussion-panel-${question.id}`;

              return (
                <article
                  key={question.id}
                  className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDiscussion(question.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F8FAFC]"
                  >
                    {/* Icon */}
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        selectedOption
                          ? isCorrect
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#FEE2E2] text-[#DC2626]"
                          : "bg-[#F1F5F9] text-[#94A3B8]",
                      )}
                    >
                      {selectedOption ? (
                        isCorrect ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </span>

                    {/* Question text */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0F172A]">
                        Soal {index + 1}: {question.prompt}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          selectedOption
                            ? isCorrect
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#FEE2E2] text-[#B91C1C]"
                            : "bg-[#F1F5F9] text-[#64748B]",
                        )}
                      >
                        {selectedOption ? (isCorrect ? "Benar" : "Salah") : "–"}
                      </span>
                      {question.discussion && (
                        <span className="hidden rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8] sm:inline">
                          📄 Ada video
                        </span>
                      )}
                      <ChevronLeftIcon
                        className={cn(
                          "h-4 w-4 text-[#94A3B8] transition-transform",
                          isOpen ? "-rotate-90" : "rotate-90",
                        )}
                      />
                    </div>
                  </button>

                  {/* Expandable discussion */}
                  {isOpen && (
                    <div
                      id={panelId}
                      className="border-t border-[#F1F5F9] px-4 py-3"
                    >
                      <div className="space-y-2 text-sm text-[#334155]">
                        <p>
                          <span className="font-semibold text-[#0F172A]">Jawaban kamu:</span>{" "}
                          {selectedOption
                            ? `${selectedOption.label}. ${selectedOption.text}`
                            : "Belum menjawab soal ini."}
                        </p>
                        <p>
                          <span className="font-semibold text-[#0F172A]">Jawaban benar:</span>{" "}
                          {correctOption
                            ? `${correctOption.label}. ${correctOption.text}`
                            : "-"}
                        </p>
                        <p className="leading-6">
                          <span className="font-semibold text-[#0F172A]">Pembahasan:</span>{" "}
                          {question.discussion}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
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
      </section>
    );
  }

  /* ================================================================ */
  /*  FLOW: QUIZ                                                       */
  /* ================================================================ */
  const selectedOptionId = activeQuestion ? answers[activeQuestion.id] : null;

  return (
    <section className="relative mx-auto w-full max-w-[1100px] py-2 sm:py-4">
      {/* ---- Blue banner header ---- */}
      <div className="rounded-2xl bg-[#2563EB] px-5 py-4 text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">
              Tes Diagnostik /
            </span>
            <span className="text-sm font-bold">
              Soal {activeQuestionIndex + 1} dari {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">
              Terjawab: {answeredCount}/{totalQuestions}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold">
              <ClockIcon className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* ---- Question number bubbles ---- */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {DIAGNOSTIC_QUESTIONS.map((q, i) => {
          const isActive = i === activeQuestionIndex;
          const isAnswered = Boolean(answers[q.id]);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveQuestionIndex(i)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition",
                isActive
                  ? "border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                  : isAnswered
                    ? "border-[#93C5FD] bg-[#EFF6FF] text-[#1D4ED8]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* ---- Question card ---- */}
      <div className="mt-4">
        {activeQuestion && (
          <DiagnosticQuestionCard
            question={activeQuestion}
            questionNumber={activeQuestionIndex + 1}
            selectedOptionId={selectedOptionId}
            onSelectOption={handleSelectAnswer}
          />
        )}
      </div>

      {/* ---- Bottom navigation ---- */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setActiveQuestionIndex((c) => Math.max(0, c - 1))
          }
          disabled={activeQuestionIndex === 0}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Sebelumnya
        </button>

        <div className="flex items-center gap-2">
          {activeQuestionIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() =>
                setActiveQuestionIndex((c) =>
                  Math.min(totalQuestions - 1, c + 1),
                )
              }
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Selanjutnya →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kumpulkan
            </button>
          )}
        </div>
      </div>

      {/* ---- Emotion detection widget (bottom-right) ---- */}
      {cameraState === "granted" && (
        <EmotionDetectionWidget
          videoRef={previewRef}
          emotionLabel="Fokus"
          isLive
        />
      )}

      {/* ---- Emotion notification (top-right) ---- */}
      {showEmotionNotification && cameraState === "granted" && (
        <EmotionNotification
          questionIndex={activeQuestionIndex}
          emotionLabel="Fokus"
          emotionDescription="Kamu terlihat fokus. Pertahankan kondisi ini selama tes berlangsung."
          autoDismissMs={9000}
          onDismiss={() => setShowEmotionNotification(false)}
        />
      )}
    </section>
  );
}
