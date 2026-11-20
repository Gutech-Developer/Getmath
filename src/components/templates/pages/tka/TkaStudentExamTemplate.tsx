"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MathText from "@/components/atoms/MathText";
import EmotionDetectionWidget from "@/components/molecules/classroom/EmotionDetectionWidget";
import { Modal } from "@/components/molecules/Modal";
import TkaExamBoarding from "@/components/organisms/tka/TkaExamBoarding";
import { GsApiError } from "@/libs/api";
import { toEmotionInput } from "@/libs/emotion";
import { showToast } from "@/libs/toast";
import {
  useEmotionDetector,
  useSaveTkaAnswer,
  useSubmitTkaAttempt,
  useSubmitTkaEmotionBucket,
} from "@/services";
import type {
  SaveTKAAnswerInput,
  TKAStudentQuestionDTO,
  TKAStudentSessionResponse,
} from "@/types/tka";
import { formatDiagnosticTime } from "@/utils";
import {
  enterFullscreen,
  exitFullscreen,
  isFullscreenActive,
  isFullscreenSupported,
} from "@/utils/fullscreen";
import {
  computeServerOffsetMs,
  isMobileOrTabletUserAgent,
  shouldSendEmotionBucket,
} from "@/utils/tka";

function isQuestionAnswered(
  question: TKAStudentQuestionDTO,
  selectedOptions: Record<string, string[]>,
  statementAnswers: Record<string, Record<string, boolean>>,
) {
  if (question.questionType === "COMPLEX_TRUE_FALSE") {
    return Object.keys(statementAnswers[question.id] ?? {}).length > 0;
  }
  return (selectedOptions[question.id]?.length ?? 0) > 0;
}

export default function TkaStudentExamTemplate({ testId }: { testId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<TKAStudentSessionResponse | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [statementAnswers, setStatementAnswers] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  const selectedOptionsRef = useRef<Record<string, string[]>>({});
  const statementAnswersRef = useRef<Record<string, Record<string, boolean>>>(
    {},
  );
  const doubtfulRef = useRef<Record<string, boolean>>({});
  const dirtyRef = useRef<Set<string>>(new Set());
  const queuedRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, number>>(new Map());
  const offsetRef = useRef(0);
  const submittingRef = useRef(false);
  const flushEmotionRef = useRef<() => void>(() => {});

  const saveMutation = useSaveTkaAnswer(testId, session?.attemptId ?? "");
  const submitMutation = useSubmitTkaAttempt(testId, session?.attemptId ?? "");
  const emotion = useEmotionDetector({
    enabled: Boolean(session),
    intervalMs: 500,
  });
  const submitBucket = useSubmitTkaEmotionBucket(
    testId,
    session?.attemptId ?? "",
    { onTerminalError: () => emotion.stop() },
  );

  useEffect(() => {
    setIsMobile(isMobileOrTabletUserAgent(navigator.userAgent));
  }, []);

  useEffect(() => {
    const supported = isFullscreenSupported();
    setFullscreenSupported(supported);
    setIsFullscreen(isFullscreenActive());
    if (!supported) return;

    const handler = () => setIsFullscreen(isFullscreenActive());
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      void exitFullscreen().catch(() => {});
    };
  }, []);

  const handleStarted = (nextSession: TKAStudentSessionResponse) => {
    setSession(nextSession);
    setRemainingSeconds(nextSession.remainingSeconds);
    offsetRef.current = computeServerOffsetMs(
      nextSession.effectiveDeadlineAt,
      nextSession.remainingSeconds,
    );

    const nextSelected: Record<string, string[]> = {};
    const nextStatements: Record<string, Record<string, boolean>> = {};
    const nextDoubtful: Record<string, boolean> = {};
    for (const saved of nextSession.savedAnswers) {
      if (saved.selectedOptionIds.length > 0) {
        nextSelected[saved.questionId] = saved.selectedOptionIds;
      }
      if (saved.statementAnswers.length > 0) {
        nextStatements[saved.questionId] = Object.fromEntries(
          saved.statementAnswers.map((entry) => [entry.statementId, entry.isTrue]),
        );
      }
      if (saved.isDoubtful) {
        nextDoubtful[saved.questionId] = true;
      }
    }

    selectedOptionsRef.current = nextSelected;
    statementAnswersRef.current = nextStatements;
    doubtfulRef.current = nextDoubtful;
    setSelectedOptions(nextSelected);
    setStatementAnswers(nextStatements);
    setDoubtful(nextDoubtful);
  };

  useEffect(() => {
    if (!session) return;
    const tick = () => {
      const deadlineMs = new Date(session.effectiveDeadlineAt).getTime();
      const next = Math.max(
        0,
        Math.ceil((deadlineMs - (Date.now() + offsetRef.current)) / 1000),
      );
      setRemainingSeconds(next);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session || emotion.ready || emotion.error) return;
    void emotion.start().catch(() => {});
  }, [emotion, session]);

  useEffect(() => {
    if (!session) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (submittingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [session]);

  const buildQuestionAnswer = (
    question: TKAStudentQuestionDTO,
  ): SaveTKAAnswerInput => {
    const isDoubtful = Boolean(doubtfulRef.current[question.id]);
    if (question.questionType === "COMPLEX_TRUE_FALSE") {
      const entries = Object.entries(statementAnswersRef.current[question.id] ?? {})
        .filter(([, value]) => typeof value === "boolean")
        .map(([statementId, isTrue]) => ({ statementId, isTrue }));
      return {
        questionId: question.id,
        statementAnswers: entries,
        isDoubtful,
      };
    }
    return {
      questionId: question.id,
      selectedOptionIds: selectedOptionsRef.current[question.id] ?? [],
      isDoubtful,
    };
  };

  const buildAllAnswers = (): SaveTKAAnswerInput[] => {
    if (!session) return [];
    return session.questions
      .map((question) => {
        const answer = buildQuestionAnswer(question);
        const hasAnswer =
          (answer.selectedOptionIds?.length ?? 0) > 0 ||
          (answer.statementAnswers?.length ?? 0) > 0;
        if (!hasAnswer && !answer.isDoubtful) return null;
        return answer;
      })
      .filter((answer): answer is SaveTKAAnswerInput => answer !== null);
  };

  const submit = (isAutoSubmit: boolean) => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    dirtyRef.current.clear();
    setSavingCount(0);

    flushEmotionRef.current();
    emotion.stop();

    submitMutation.mutate(
      { isAutoSubmit, answers: buildAllAnswers() },
      {
        onSuccess: () => {
          void exitFullscreen().catch(() => {});
          router.replace(`/student/tka/${testId}/result`);
        },
        onError: (error) => {
          submittingRef.current = false;
          if (
            error instanceof GsApiError &&
            (error.status === 409 || error.status === 410)
          ) {
            router.replace(`/student/tka/${testId}/result`);
            return;
          }
          showToast.error(error.message);
        },
      },
    );
  };

  const saveQuestion = (questionId: string) => {
    if (!session || submittingRef.current) return;
    if (inFlightRef.current.has(questionId)) {
      queuedRef.current.add(questionId);
      return;
    }
    const question = session.questions.find((item) => item.id === questionId);
    if (!question) return;

    dirtyRef.current.delete(questionId);
    setSavingCount((current) => current + 1);
    inFlightRef.current.add(questionId);

    saveMutation.mutate(buildQuestionAnswer(question), {
      onSuccess: (response) => {
        inFlightRef.current.delete(questionId);
        setSavingCount((current) => Math.max(0, current - 1));
        setLastSavedAt(new Date());

        const localRemaining = Math.max(
          0,
          Math.ceil(
            (new Date(session.effectiveDeadlineAt).getTime() -
              (Date.now() + offsetRef.current)) /
              1000,
          ),
        );
        if (Math.abs(localRemaining - response.remainingSeconds) > 3) {
          setRemainingSeconds(response.remainingSeconds);
          offsetRef.current = computeServerOffsetMs(
            session.effectiveDeadlineAt,
            response.remainingSeconds,
          );
        }

        if (queuedRef.current.delete(questionId)) {
          saveQuestion(questionId);
        }
      },
      onError: (error) => {
        inFlightRef.current.delete(questionId);
        setSavingCount((current) => Math.max(0, current - 1));
        dirtyRef.current.add(questionId);
        if (queuedRef.current.delete(questionId)) {
          saveQuestion(questionId);
        }

        if (error instanceof GsApiError && error.status === 410) {
          submit(true);
          return;
        }
        if (error instanceof GsApiError && error.status === 409) {
          router.replace(`/student/tka/${testId}/result`);
          return;
        }
        showToast.error(error.message || "Gagal menyimpan jawaban");
      },
    });
  };

  const markDirty = (questionId: string) => {
    dirtyRef.current.add(questionId);
    const existing = timersRef.current.get(questionId);
    if (existing) window.clearTimeout(existing);
    const timer = window.setTimeout(() => {
      timersRef.current.delete(questionId);
      saveQuestion(questionId);
    }, 500);
    timersRef.current.set(questionId, timer);
  };

  const flushEmotionBucket = () => {
    if (!session) return;
    const { result } = emotion.flushAndReset();
    if (!result) return;
    const payload = toEmotionInput(result);
    if (!shouldSendEmotionBucket(payload)) return;
    submitBucket.mutate({ emotion: payload });
  };
  flushEmotionRef.current = flushEmotionBucket;

  useEffect(() => {
    if (!session || !emotion.ready) return;
    const timer = window.setInterval(() => {
      flushEmotionRef.current();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [emotion.ready, session]);

  useEffect(() => {
    if (!session || remainingSeconds > 0) return;
    submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, session]);

  if (!session) {
    return (
      <TkaExamBoarding
        testId={testId}
        isMobile={isMobile}
        onStarted={handleStarted}
      />
    );
  }

  const answeredCount = session.questions.filter((question) =>
    isQuestionAnswered(question, selectedOptions, statementAnswers),
  ).length;

  const toggleOption = (
    question: TKAStudentQuestionDTO,
    optionId: string,
    checked: boolean,
  ) => {
    const selected = selectedOptionsRef.current[question.id] ?? [];
    let next: string[];
    if (question.questionType === "MULTIPLE_CHOICE") {
      next = checked ? [optionId] : [];
    } else {
      next = checked
        ? Array.from(new Set([...selected, optionId]))
        : selected.filter((id) => id !== optionId);
    }
    selectedOptionsRef.current = {
      ...selectedOptionsRef.current,
      [question.id]: next,
    };
    setSelectedOptions(selectedOptionsRef.current);
    markDirty(question.id);
  };

  const setStatement = (
    questionId: string,
    statementId: string,
    value: boolean,
  ) => {
    const current = statementAnswersRef.current[questionId] ?? {};
    statementAnswersRef.current = {
      ...statementAnswersRef.current,
      [questionId]: { ...current, [statementId]: value },
    };
    setStatementAnswers(statementAnswersRef.current);
    markDirty(questionId);
  };

  const toggleDoubtful = (questionId: string) => {
    const next = !doubtfulRef.current[questionId];
    doubtfulRef.current = {
      ...doubtfulRef.current,
      [questionId]: next,
    };
    setDoubtful(doubtfulRef.current);
    markDirty(questionId);
  };

  const savedLabel = savingCount > 0
    ? "Menyimpan..."
    : lastSavedAt
      ? `Tersimpan ${lastSavedAt.toLocaleTimeString("id-ID")}`
      : "Belum ada perubahan";

  return (
    <section className="mx-auto w-full max-w-[1280px] pb-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="order-2 space-y-4 xl:order-1 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-2">
      {emotion.error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Deteksi emosi tidak aktif. Ujian tetap berjalan dan jawaban tetap
          dapat dikumpulkan.
        </div>
      )}

      <div className="space-y-4">
        {session.questions.map((question) => (
          <article
            key={question.id}
            id={`tka-question-${question.id}`}
            className="getmath-card space-y-4 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lottie-teal text-sm font-semibold text-white">
                  {question.questionNumber}
                </span>
                <div className="min-w-0 text-[15px] font-medium leading-6 text-[#0F172A]">
                  <MathText text={question.questionText} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDoubtful(question.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  doubtful[question.id]
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Ragu-ragu
              </button>
            </div>

            {question.questionType === "COMPLEX_TRUE_FALSE" ? (
              <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-[#F8FAFC] text-left text-xs uppercase tracking-wide text-[#64748B]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Pernyataan</th>
                      <th className="w-20 px-3 py-2 text-center font-semibold">
                        Benar
                      </th>
                      <th className="w-20 px-3 py-2 text-center font-semibold">
                        Salah
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(question.statements ?? []).map((statement) => (
                      <tr
                        key={statement.id}
                        className="border-t border-[#E5E7EB] align-top"
                      >
                        <td className="px-3 py-3 text-[#334155]">
                          <MathText text={statement.statementText} />
                        </td>
                        {[true, false].map((value) => (
                          <td
                            key={String(value)}
                            className="px-3 py-3 text-center"
                          >
                            <input
                              type="radio"
                              name={`statement-${question.id}-${statement.id}`}
                              checked={
                                statementAnswers[question.id]?.[statement.id] ===
                                value
                              }
                              onChange={() =>
                                setStatement(question.id, statement.id, value)
                              }
                              className="h-4 w-4 accent-lottie-teal"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="space-y-2">
                {(question.options ?? []).map((option) => {
                  const selected = (selectedOptions[question.id] ?? []).includes(
                    option.id,
                  );
                  return (
                    <li key={option.id}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                          selected
                            ? "border-lottie-teal bg-lottie-teal/5"
                            : "border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <input
                          type={
                            question.questionType === "MCMA"
                              ? "checkbox"
                              : "radio"
                          }
                          name={`question-${question.id}`}
                          checked={selected}
                          onChange={(event) =>
                            toggleOption(question, option.id, event.target.checked)
                          }
                          className="mt-1 h-4 w-4 accent-lottie-teal"
                        />
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-semibold text-[#475569]">
                          {option.label}
                        </span>
                        <span className="text-sm text-[#334155]">
                          <MathText text={option.optionText} />
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        ))}
      </div>

        </div>

        <aside className="order-1 space-y-3 xl:order-2 xl:sticky xl:top-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lottie-teal">
              TKA
            </p>
            <h1 className="mt-1 text-lg font-semibold leading-snug text-[#111827]">
              {session.title}
            </h1>
            <p className="mt-1 text-xs text-[#6B7280]">
              {session.schoolName} · {session.totalQuestions} soal
            </p>

            <div className="mt-4 rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#B45309]">
                Sisa Waktu
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#B45309]">
                {formatDiagnosticTime(remainingSeconds)}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
              <span>{savedLabel}</span>
              <span className="font-semibold text-[#111827]">
                {answeredCount}/{session.totalQuestions}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full rounded-full bg-lottie-teal transition-all"
                style={{
                  width: `${Math.round((answeredCount / Math.max(1, session.totalQuestions)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <nav className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
                Navigasi Soal
              </p>
              <span className="text-[10px] text-[#94A3B8]">
                Klik untuk menuju soal
              </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {session.questions.map((question) => {
                const answered = isQuestionAnswered(
                  question,
                  selectedOptions,
                  statementAnswers,
                );
                const isDoubtful = Boolean(doubtful[question.id]);
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(`tka-question-${question.id}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }
                    className={`inline-flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      isDoubtful
                        ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                        : answered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                    }`}
                    aria-label={`Soal ${question.questionNumber}`}
                  >
                    {question.questionNumber}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[#64748B]">
              <span className="inline-flex items-center gap-1">
                <i className="h-2.5 w-2.5 rounded-sm bg-emerald-200" /> Dijawab
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Ragu-ragu
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2.5 w-2.5 rounded-sm bg-[#E2E8F0]" /> Kosong
              </span>
            </div>
          </nav>

          <EmotionDetectionWidget
            videoRef={emotion.videoRef}
            emotionLabel={emotion.currentEmotion?.label ?? "Menunggu deteksi"}
            isLive={emotion.ready}
            keepMounted
            embedded
          />

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={submitMutation.isPending}
            className="w-full rounded-2xl bg-lottie-teal px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/15 transition hover:bg-lottie-teal/90 disabled:opacity-60"
          >
            {submitMutation.isPending ? "Mengumpulkan..." : "Kumpulkan TKA"}
          </button>
        </aside>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Kumpulkan TKA"
        size="sm"
      >
        <p className="text-sm text-[#4B5563]">
          Kamu sudah menjawab {answeredCount} dari {session.totalQuestions} soal.
          Soal yang tidak dijawab bernilai 0. Setelah dikumpulkan, jawaban
          tidak dapat diubah.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={submitMutation.isPending}
            className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Kumpulkan
          </button>
        </div>
      </Modal>

      {session && fullscreenSupported && !isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090B]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Kembali ke mode fullscreen"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 3H5a2 2 0 00-2 2v3m13-5h3a2 2 0 012 2v3M3 16v3a2 2 0 002 2h3m13-5v3a2 2 0 01-2 2h-3"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#111827]">
              Kembali ke Mode Fokus
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Pengerjaan soal dikunci sementara karena kamu keluar dari mode
              fullscreen. Waktu ujian tetap berjalan sampai kamu kembali.
            </p>
            {fullscreenError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {fullscreenError}
              </p>
            )}
            <button
              type="button"
              onClick={async () => {
                setFullscreenError(null);
                try {
                  await enterFullscreen();
                } catch {
                  setFullscreenError(
                    "Browser menolak mode fullscreen. Izinkan fullscreen lalu coba lagi.",
                  );
                }
              }}
              className="mt-6 w-full rounded-2xl bg-lottie-teal px-4 py-3.5 text-sm font-semibold text-white"
            >
              Aktifkan Fullscreen
            </button>
            <p className="mt-3 text-xs text-[#94A3B8]">
              Gunakan tombol di atas, bukan tombol Esc.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
