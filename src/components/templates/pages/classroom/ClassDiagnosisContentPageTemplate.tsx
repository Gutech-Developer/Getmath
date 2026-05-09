"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import MathText from "@/components/atoms/MathText";
import {
  CAMERA_REQUIREMENTS,
  DIAGNOSTIC_DURATION_SECONDS,
  DIAGNOSTIC_KKM_MINIMUM_SCORE,
  DIAGNOSTIC_RULES,
} from "@/constant/classDiagnosis";
import { cn } from "@/libs/utils";
import type {
  CameraPermissionState,
  DiagnosticFlowStep,
  IClassDiagnosisContentPageTemplateProps,
} from "@/types";
import { formatDiagnosticTime } from "@/utils";
import { showToast } from "@/libs/toast";
import {
  useGsModuleById,
  useGsModuleByPackage,
  useStartTestAttempt,
  useMyTestAttempts,
  useSubmitTestAttempt,
} from "@/services";
import type {
  StartTestAttemptResult,
  SubmitTestAttemptResult,
} from "@/services/hooks/useGsProgress";

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
  const [submitResult, setSubmitResult] =
    useState<SubmitTestAttemptResult | null>(null);
  // Questions from the started attempt — these IDs must be used as testQuestionId on submit
  const [attemptQuestions, setAttemptQuestions] = useState<
    StartTestAttemptResult["questions"] | null
  >(null);
  // attemptId from POST /start response — used for submit (more reliable than activeAttempt from query)
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

  const { data: apiModule, isLoading: isModuleLoading } =
    useGsModuleById(contentId);

  const { data: attemptsData } = useMyTestAttempts(contentId);
  const activeAttempt = useMemo(() => {
    return attemptsData?.attempts
      ?.filter((a) => !a.completedAt)
      .sort(
        (a, b) =>
          new Date(b.startedAt ?? 0).getTime() -
          new Date(a.startedAt ?? 0).getTime(),
      )[0];
  }, [attemptsData]);

  // Always use the module's nextPackage for displaying questions.
  // The active attempt's package may differ, but we resolve it at submit time via POST /start.
  const packageId = apiModule?.nextPackage?.packageId ?? "";
  const { data: apiPackage } = useGsModuleByPackage(packageId);

  const diagnosticQuestions = useMemo(() => {
    // Prefer questions from the started attempt so that `id` matches
    // the testQuestionId the backend expects on submit.
    // Fall back to the package endpoint for initial display before start.
    const source =
      attemptQuestions ??
      apiPackage?.package?.questions?.map((q) => ({
        id: q.id,
        questionNumber: 0,
        textQuestion: q.textQuestion,
        imageQuestionUrl: q.imageQuestionUrl,
        options: q.options.map((opt) => ({
          id: opt.id,
          option: opt.option,
          textAnswer: opt.textAnswer,
          imageAnswerUrl: opt.imageAnswerUrl,
        })),
      })) ??
      [];

    console.log(
      "[DiagnosticTest] diagnosticQuestions source:",
      attemptQuestions
        ? "attemptQuestions (from POST /start)"
        : "apiPackage (fallback)",
      "ids:",
      source.map((q) => q.id),
    );

    return source.map((q) => ({
      id: q.id,
      prompt: q.textQuestion ?? "",
      topic: "Umum",
      typeLabel: "Pilihan Ganda",
      options: q.options.map((opt) => ({
        id: opt.id,
        label: opt.option,
        text: opt.textAnswer ?? "",
      })),
      discussion:
        apiPackage?.package?.questions?.find((pq) => pq.id === q.id)
          ?.pembahasan ?? "",
      videoUrl:
        apiPackage?.package?.questions?.find((pq) => pq.id === q.id)
          ?.videoUrl ?? "",
    }));
  }, [attemptQuestions, apiPackage]);

  const startTestMutation = useStartTestAttempt(contentId);
  const submitAttempt = useSubmitTestAttempt(contentId);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const encodedSlug = encodeURIComponent(slug);
  const encodedContentId = encodeURIComponent(contentId);
  const encodedDiagnotisId = encodeURIComponent(diagnotisId);
  const materialHref = `/student/dashboard/class/${encodedSlug}/materi/${encodedContentId}`;
  const diagnosticHref = `${materialHref}/${encodedDiagnotisId}`;

  const activeQuestion = diagnosticQuestions[activeQuestionIndex] ?? null;
  const allRulesConfirmed = ruleChecklist.every(Boolean);
  const answeredCount = Object.keys(answers).length;
  // Scoring comes from the server (submitResult); use 0 as fallback before submit
  const correctCount = submitResult?.correctAnswers ?? 0;
  const scorePercent = submitResult?.score ?? 0;
  const kkmScore = apiModule?.passingScore ?? DIAGNOSTIC_KKM_MINIMUM_SCORE;
  const isPassedKKM = submitResult ? submitResult.isPassed : false;
  const allQuestionsAnswered = answeredCount === diagnosticQuestions.length;
  const completionPercent = Math.round(
    (answeredCount / Math.max(1, diagnosticQuestions.length)) * 100,
  );

  const attemptCount = attemptsData?.attempts?.length ?? 0;
  const hasPassedAnyAttempt =
    attemptsData?.attempts?.some((a) => a.isPassed) ?? false;
  const isMaxAttempts = attemptCount >= 3;

  const timeLabel = useMemo(
    () => formatDiagnosticTime(remainingSeconds),
    [remainingSeconds],
  );

  useEffect(() => {
    console.log("[DiagnosticTest] attemptsData:", attemptsData);
    console.log("[DiagnosticTest] activeAttempt:", activeAttempt);
  }, [attemptsData, activeAttempt]);

  useEffect(() => {
    console.log(
      "[DiagnosticTest] apiPackage questions:",
      apiPackage?.package?.questions?.map((q) => ({
        id: q.id,
        text: q.textQuestion?.slice(0, 40),
      })),
    );
  }, [apiPackage]);

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
      handleCompleteTest();
    }
  }, [flowStep, remainingSeconds]);

  const handleCompleteTest = async () => {
    setFlowStep("completed");

    // Prefer attemptId from POST /start response; fall back to activeAttempt from query
    const attemptId = currentAttemptId ?? activeAttempt?.attemptId;

    console.log("[DiagnosticTest] handleCompleteTest called");
    console.log("[DiagnosticTest] currentAttemptId:", currentAttemptId);
    console.log("[DiagnosticTest] activeAttempt:", activeAttempt);
    console.log("[DiagnosticTest] resolved attemptId:", attemptId);
    console.log("[DiagnosticTest] answers state:", answers);
    console.log("[DiagnosticTest] attemptQuestions:", attemptQuestions);
    console.log(
      "[DiagnosticTest] diagnosticQuestions ids:",
      diagnosticQuestions.map((q) => q.id),
    );

    if (attemptId) {
      const formattedAnswers = Object.entries(answers).map(
        ([testQuestionId, selectedOptionId]) => ({
          testQuestionId,
          selectedOptionId,
        }),
      );

      console.log(
        "[DiagnosticTest] formattedAnswers to submit:",
        formattedAnswers,
      );

      submitAttempt.mutate(
        {
          attemptId,
          input: { answers: formattedAnswers },
        },
        {
          onSuccess: (data) => {
            console.log("[DiagnosticTest] submit SUCCESS:", data);
            setSubmitResult(data);
          },
          onError: (err: any) => {
            console.error("[DiagnosticTest] submit ERROR:", err);
          },
        },
      );
    } else {
      console.warn("[DiagnosticTest] No attemptId found — submit skipped", {
        attemptsData,
        activeAttempt,
        currentAttemptId,
      });
    }
  };

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

  const handleStartDiagnostic = () => {
    const packageId = apiModule?.nextPackage?.packageId;
    if (!packageId) {
      showToast.error("Paket soal tidak tersedia");
      return;
    }

    const doStart = () => {
      startTestMutation.mutate(
        { packageId },
        {
          onSuccess: (data) => {
            console.log("[DiagnosticTest] startTestMutation SUCCESS:", data);
            console.log(
              "[DiagnosticTest] attempt questions from start:",
              data?.questions?.map((q) => ({
                id: q.id,
                text: q.textQuestion?.slice(0, 40),
              })),
            );
            if (data?.questions) {
              setAttemptQuestions(data.questions);
            }
            if (data?.attemptId) {
              setCurrentAttemptId(data.attemptId);
              console.log(
                "[DiagnosticTest] currentAttemptId set:",
                data.attemptId,
              );
            }
            setFlowStep("quiz");
          },
          onError: (err: any) => {
            console.error("[DiagnosticTest] startTestMutation ERROR:", err);
            showToast.error(err.message || "Gagal memulai tes");
          },
        },
      );
    };

    // If there's an unsubmitted attempt from a previous session, submit it with
    // empty answers first (backend will mark it completed with score=0), then start fresh.
    if (activeAttempt?.attemptId) {
      console.log(
        "[DiagnosticTest] Submitting stale unfinished attempt before starting new one:",
        activeAttempt.attemptId,
      );
      submitAttempt.mutate(
        { attemptId: activeAttempt.attemptId, input: { answers: [] } },
        {
          onSuccess: () => {
            console.log(
              "[DiagnosticTest] Stale attempt submitted, starting new attempt...",
            );
            doStart();
          },
          onError: (err: any) => {
            console.error(
              "[DiagnosticTest] Failed to submit stale attempt:",
              err,
            );
            // Try starting anyway — backend might allow it now or return a different error
            doStart();
          },
        },
      );
      return;
    }

    doStart();
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

    if (activeQuestionIndex >= diagnosticQuestions.length - 1) {
      handleCompleteTest();
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
    // Block access when max attempts reached or already passed
    if (hasPassedAnyAttempt || isMaxAttempts) {
      return (
        <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
          <div className="mx-auto max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
            <div
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
                hasPassedAnyAttempt ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]",
              )}
            >
              {hasPassedAnyAttempt ? (
                <CheckCircleIcon className="h-7 w-7 text-[#166534]" />
              ) : (
                <AlertIcon className="h-7 w-7 text-[#B91C1C]" />
              )}
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0F172A]">
              {hasPassedAnyAttempt
                ? "Kamu Sudah Lulus Tes Ini"
                : "Batas Percobaan Habis"}
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
              {hasPassedAnyAttempt
                ? "Kamu telah menyelesaikan tes diagnostik ini dengan tuntas."
                : `Kamu sudah menggunakan 3 dari 3 kesempatan. Hubungi guru untuk mendapat bantuan lebih lanjut.`}
            </p>
            <Link
              href={materialHref}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Kembali ke Materi
            </Link>
          </div>
        </section>
      );
    }

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
                      {apiModule?.nextPackage?.totalQuestions} Soal
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
                    <p className="text-xs text-white/75">Durasi</p>
                    <p className="text-sm font-semibold">
                      {apiModule?.durationMinutes ?? 15} Menit
                    </p>
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
                    <p className="text-sm font-semibold">{kkmScore}</p>
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
              onClick={handleStartDiagnostic}
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
                <li>Rumus: (Benar / {diagnosticQuestions.length}) x 100.</li>
                <li>
                  Jika nilai &lt; {kkmScore}: status tidak tuntas (merah).
                </li>
                <li>Jika nilai &gt;= {kkmScore}: status tuntas (biru).</li>
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

          <h1 className="mt-4 text-xl font-bold text-[#0F172A] sm:text-2xl">
            {apiModule?.testName ?? "Tes Diagnostik Selesai"}
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
              {answeredCount}/
              {submitResult?.totalQuestions ?? diagnosticQuestions.length} soal
              terjawab
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
                ? `Lulus KKM (${kkmScore})`
                : `Belum Lulus KKM (${kkmScore})`}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Pembahasan per Soal
            </h2>

            <div className="mt-3 space-y-2.5">
              {diagnosticQuestions.map((question, index) => {
                const selectedOption = question.options.find(
                  (option) => option.id === answers[question.id],
                );
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
                          <MathText text={question.prompt} />
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold",
                            selectedOption
                              ? "border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]"
                              : "border-[#E2E8F0] bg-white text-[#64748B]",
                          )}
                        >
                          {selectedOption
                            ? `Dijawab: ${selectedOption.label}`
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
                            {selectedOption ? (
                              <>
                                {selectedOption.label}.{" "}
                                <MathText text={selectedOption.text} />
                              </>
                            ) : (
                              "Belum menjawab soal ini."
                            )}
                          </p>
                          {question.discussion ? (
                            <p className="leading-6">
                              <span className="font-semibold text-[#0F172A]">
                                Pembahasan:
                              </span>{" "}
                              <MathText text={question.discussion} />
                            </p>
                          ) : null}
                          {question.videoUrl ? (
                            <a
                              href={question.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#2563EB] underline"
                            >
                              Lihat video pembahasan
                            </a>
                          ) : null}
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
                {activeQuestionIndex + 1}/{diagnosticQuestions.length}
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
              <MathText text={activeQuestion?.prompt ?? ""} />
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
                      <MathText text={option.text} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748B]">
              Jawaban terisi {answeredCount}/{diagnosticQuestions.length} soal
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
                  (activeQuestionIndex === diagnosticQuestions.length - 1 &&
                    !allQuestionsAnswered)
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeQuestionIndex === diagnosticQuestions.length - 1
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
              {diagnosticQuestions.map((question, index) => {
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
