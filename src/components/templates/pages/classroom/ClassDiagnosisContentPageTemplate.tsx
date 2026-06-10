"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
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
import { toEmbedUrl } from "@/libs/embed";
import type {
  CameraPermissionState,
  DiagnosticFlowStep,
  IClassDiagnosisContentPageTemplateProps,
} from "@/types";
import { formatDiagnosticTime } from "@/utils";
import { showToast } from "@/libs/toast";
import {
  useGsModulesByCourse,
  useGsModuleById,
  useStartTestAttempt,
  useMyTestAttempts,
  useSubmitTestAttempt,
  useStartRemedialAttempt,
  useSubmitRemedialVariant,
  useSubmitRemedialBulk,
  useDiagnosticAnswersReview,
  useRemedialAnswersReview,
  useGsRemedialTestById,
} from "@/services";
import type {
  StartTestAttemptResult,
  SubmitTestAttemptResult,
  RemedialVariant,
} from "@/services/hooks/useGsProgress";
import { useEmotionDetector } from "@/services/hooks/useEmotionDetector";
import { toEmotionInput } from "@/libs/emotion/normalize";
import { pickFeedback } from "@/libs/emotion/feedback";
import { isEmotionSupported } from "@/libs/emotion";
import CameraRequiredScreen from "@/components/molecules/classroom/CameraRequiredScreen";
import EmotionNotification from "@/components/molecules/classroom/EmotionNotification";

interface YoutubePlayerProps {
  iframeId: string;
  url: string;
  title: string;
  onEnded: () => void;
  className?: string;
  frameBorder?: string;
}

const YoutubePlayer = React.memo(
  ({ iframeId, url, title, onEnded, className, frameBorder }: YoutubePlayerProps) => {
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
      onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
      const tagId = "yt-iframe-api";
      if (!document.getElementById(tagId)) {
        const tag = document.createElement("script");
        tag.id = tagId;
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      }

      let player: any;

      const initPlayer = () => {
        if (!document.getElementById(iframeId)) return;
        player = new (window as any).YT.Player(iframeId, {
          events: {
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                onEndedRef.current();
              }
            },
          },
        });
      };

      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        const prevCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (prevCallback) {
            try {
              prevCallback();
            } catch (e) {
              console.error(e);
            }
          }
          initPlayer();
        };
      }

      return () => {
        if (player && player.destroy) {
          player.destroy();
        }
      };
    }, [iframeId, url]);

    return (
      <iframe
        id={iframeId}
        src={url}
        title={title}
        className={className}
        frameBorder={frameBorder}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  },
);

YoutubePlayer.displayName = "YoutubePlayer";

export default function ClassDiagnosisContentPageTemplate({
  slug,
  contentId,
  diagnotisId,
  remediaId,
}: IClassDiagnosisContentPageTemplateProps) {
  type ReviewView = "diagnostic" | "remedial";

  const [flowStep, setFlowStep] = useState<DiagnosticFlowStep>("camera");
  const [reviewView, setReviewView] = useState<ReviewView | null>(null);
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

  const { data: courseModules } = useGsModulesByCourse(
    apiModule?.courseId ?? "",
  );

  const currentModuleIndex =
    courseModules?.findIndex((m) => m.id === contentId) ?? -1;
  const nextModule =
    currentModuleIndex >= 0 &&
      currentModuleIndex < (courseModules?.length ?? 0) - 1
      ? courseModules![currentModuleIndex + 1]
      : null;

  const latestDiagnosticAttempt = useMemo(() => {
    const history = apiModule?.attemptHistory ?? [];
    if (history.length === 0) {
      return null;
    }

    return [...history].sort((a, b) => {
      if (a.attemptNumber !== b.attemptNumber) {
        return b.attemptNumber - a.attemptNumber;
      }

      return (
        new Date(b.completedAt ?? b.startedAt ?? 0).getTime() -
        new Date(a.completedAt ?? a.startedAt ?? 0).getTime()
      );
    })[0];
  }, [apiModule?.attemptHistory]);

  // ─── Remedial States ──────────────────────────────────────────────────────
  // remediaId is URL-based (from page params) — reliable from first render.
  // apiModule?.type is async (needs API fetch) — use as secondary.
  // Prioritise remediaId so we never accidentally treat the remedial page
  // as a diagnostic page, even during the apiModule loading window.
  const hasFailedDiagnosticAttempt =
    !!latestDiagnosticAttempt &&
    !latestDiagnosticAttempt.isPassed &&
    !(apiModule?.attemptHistory?.some((attempt) => attempt.isPassed) ?? false);
  // ─── isRemedial derivation ───────────────────────────────────────────────
  // Priority:
  //   1. !!remediaId          — explicit URL param, strongest signal, available from first render
  //   2. !diagnotisId && ...  — only when user is NOT on an explicit diagnostic URL:
  //        a. apiModule.type === "REMEDIAL"  (backend says so)
  //        b. hasFailedDiagnosticAttempt     (has failed before, no other URL context)
  // IMPORTANT: apiModule.type must also be gated on !diagnotisId.
  // If apiModule happens to return type "REMEDIAL" while user is on the diagnostic URL
  // (diagnotisId is set), we must NOT flip isRemedial to true.
  const isRemedial =
    !!remediaId ||
    (!diagnotisId &&
      (apiModule?.type === "REMEDIAL" || hasFailedDiagnosticAttempt));
  // Ref untuk dibaca dari dalam auto-submit effect tanpa memasukkan isRemedial
  // ke dalam dep array (mencegah race condition: isRemedial berubah saat quiz aktif
  // bisa memicu handleAutoSubmitRemedial secara tidak sengaja).
  const isRemedialRef = useRef(isRemedial);
  isRemedialRef.current = isRemedial;
  const [remedialAttemptId, setRemedialAttemptId] = useState<string | null>(
    null,
  );
  const [currentVariant, setCurrentVariant] = useState<RemedialVariant | null>(
    null,
  );
  const [remedialTestInfo, setRemedialTestInfo] = useState<{
    testName: string;
    passingScore: number;
    totalQuestions: number;
  } | null>(null);
  const [selectedRemedialOptionId, setSelectedRemedialOptionId] = useState<
    string | null
  >(null);
  const [discussionShow, setDiscussionShow] = useState<boolean>(false);
  const [discussionData, setDiscussionData] = useState<{
    text: string;
    videoUrl?: string;
  } | null>(null);
  const [discussionVideoWatched, setDiscussionVideoWatched] =
    useState<boolean>(false);
  const [remedialSummary, setRemedialSummary] = useState<any | null>(null);
  const [nextVariantData, setNextVariantData] =
    useState<RemedialVariant | null>(null);
  const [remedialSubmittedAnswers, setRemedialSubmittedAnswers] = useState<
    Array<{ variantId: string; selectedOptionId: string | null }>
  >([]);
  const [remedialAnswers, setRemedialAnswers] = useState<
    Array<{ questionNumber: number; packageLabel: string; isCorrect: boolean }>
  >([]);

  const startRemedialMutation = useStartRemedialAttempt(contentId);
  const submitRemedialVariantMutation = useSubmitRemedialVariant(contentId);
  const submitRemedialBulkMutation = useSubmitRemedialBulk(contentId);
  const remedialAutoSubmitTriggeredRef = useRef(false);

  const { data: remedialTestData } = useGsRemedialTestById(
    isRemedial ? (apiModule?.remedialTestId ?? "") : "",
  );


  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isImageMediaUrl = (url: string | null | undefined) =>
    Boolean(url) && /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url ?? "");

  const isYouTubeMediaUrl = (url: string | null | undefined) =>
    Boolean(url) &&
    /youtu\.be|youtube\.com|youtube-nocookie\.com/i.test(url ?? "");

  const renderMediaPreview = (
    url: string | null | undefined,
    label: string,
  ) => {
    if (!url) return null;

    if (isImageMediaUrl(url)) {
      return (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <img src={url} alt={label} className="h-auto w-full object-contain" />
        </div>
      );
    }

    if (isYouTubeMediaUrl(url)) {
      return (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-black">
          <iframe
            src={toEmbedUrl(url, "video")}
            title={label}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        controls
        src={url}
        className="w-full rounded-xl border border-[#E2E8F0] bg-black"
      />
    );
  };

  const { data: attemptsData, isLoading: isAttemptsLoading } =
    useMyTestAttempts(contentId);
  const activeAttempt = useMemo(() => {
    return attemptsData?.attempts
      ?.filter((a) => !a.completedAt)
      .sort(
        (a, b) =>
          new Date(b.startedAt ?? 0).getTime() -
          new Date(a.startedAt ?? 0).getTime(),
      )[0];
  }, [attemptsData]);

  const diagnosticQuestions = useMemo(() => {
    const source = attemptQuestions ?? [];

    console.log(
      "[DiagnosticTest] diagnosticQuestions source:",
      attemptQuestions ? "attemptQuestions (from POST /start)" : "empty",
      "ids:",
      source.map((q) => q.id),
    );

    return source.map((q) => ({
      id: q.id,
      prompt: q.textQuestion ?? "",
      imageQuestionUrl: q.imageQuestionUrl ?? null,
      topic: "Umum",
      typeLabel: "Pilihan Ganda",
      options: q.options.map((opt) => ({
        id: opt.id,
        label: opt.option,
        text: opt.textAnswer ?? "",
        imageAnswerUrl: opt.imageAnswerUrl ?? null,
      })),
      discussion: "",
      videoUrl: "",
    }));
  }, [attemptQuestions]);

  const startTestMutation = useStartTestAttempt(contentId);
  const submitAttempt = useSubmitTestAttempt(contentId);
  const activeReviewView: ReviewView =
    reviewView ?? (isRemedial ? "remedial" : "diagnostic");

  const { data: diagnosticReviewData } = useDiagnosticAnswersReview(contentId, {
    enabled: true,
  });
  const { data: remedialReviewData } = useRemedialAnswersReview(contentId, {
    enabled: true,
  });

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Emotion Detection (Remedial only) ────────────────────────────────────
  // Tidak aktif saat soal diagnostik (isRemedial = false).
  // Wajib aktif saat remedial — spec §12: emotion WAJIB di setiap submit variant.
  const emotion = useEmotionDetector({ enabled: isRemedial, intervalMs: 500 });
  const [emotionFeedbackMsg, setEmotionFeedbackMsg] = useState<string | null>(
    null,
  );
  const [emotionFeedbackLabel, setEmotionFeedbackLabel] = useState<string | null>(
    null,
  );
  // Evaluasi sekali (lazy init) agar tidak dijalankan tiap render.
  const [emotionSupported] = useState(() => isEmotionSupported());

  // Start emotion detection setelah quiz render — videoRef.current dijamin non-null.
  // handleRequestCamera hanya probe permission; start() asli di sini.
  useEffect(() => {
    if (!isRemedial || flowStep !== "quiz" || emotion.ready || !!emotion.error)
      return;
    emotion.start().catch(() => {
      // error sudah di-set lewat setError di dalam start(); CameraRequiredScreen render.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemedial, flowStep, emotion.ready, emotion.error]);

  // Spec §15: proactive warning saat wajah tidak terdeteksi ≥10 detik.
  // Toast muncul sekali saat warning aktif, otomatis hilang saat wajah kembali.
  useEffect(() => {
    if (!emotion.noFaceWarning) return;
    showToast.warning(
      "Pastikan wajah kamu terlihat jelas di kamera agar deteksi emosi berjalan.",
    );
  }, [emotion.noFaceWarning]);

  const encodedSlug = encodeURIComponent(slug);
  const encodedContentId = encodeURIComponent(contentId);
  const baseMaterialHref = `/student/dashboard/class/${encodedSlug}/materi/${encodedContentId}`;
  const materialHref = isRemedial
    ? `${baseMaterialHref}?step=remedial`
    : baseMaterialHref;
  const diagnosticHref = isRemedial
    ? `${baseMaterialHref}/remedia/${encodeURIComponent(remediaId ?? "")}`
    : `${baseMaterialHref}/${encodeURIComponent(diagnotisId ?? "")}`;

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
  const hasPassedDiagnosticHistory =
    apiModule?.attemptHistory?.some((attempt) => attempt.isPassed) ?? false;
  const hasTakenDiagnosticHistory =
    (apiModule?.attemptHistory?.length ?? 0) > 0;
  const hasTakenDiagnosticAttempt =
    hasTakenDiagnosticHistory || (attemptsData?.attempts?.length ?? 0) > 0;
  const latestAttemptScore = latestDiagnosticAttempt?.score ?? null;
  const latestAttemptPassed = latestDiagnosticAttempt?.isPassed ?? false;
  const latestAttemptLabel = latestDiagnosticAttempt
    ? `Percobaan #${latestDiagnosticAttempt.attemptNumber}`
    : null;
  const canReviewLatestDiagnosticAttempt = Boolean(latestDiagnosticAttempt);

  const timeLabel = useMemo(
    () => formatDiagnosticTime(remainingSeconds),
    [remainingSeconds],
  );

  useEffect(() => {
    console.log("[DiagnosticTest] attemptsData:", attemptsData);
    console.log("[DiagnosticTest] activeAttempt:", activeAttempt);
  }, [attemptsData, activeAttempt]);

  useEffect(() => {
    if (flowStep !== "quiz" && flowStep !== "completed") {
      if (isRemedial && remedialReviewData) {
        setReviewView("remedial");
        setFlowStep("completed");
      } else if (!isRemedial && diagnosticReviewData) {
        setReviewView("diagnostic");
        setFlowStep("completed");
      }
    }
  }, [isRemedial, remedialReviewData, diagnosticReviewData, flowStep]);

  const handleVideoEnded = useCallback(() => {
    setDiscussionVideoWatched(true);
    showToast.success(
      "Video selesai ditonton! Anda dapat melanjutkan.",
    );
  }, []);
  // ─── Auto-advance to completed when student already has a past attempt ────
  // If apiModule loads and reveals an existing attempt, skip the camera/rules
  // screen entirely and go straight to the result view. This prevents the
  // "Mulai Tes Sekarang" button from appearing when the student already
  // exhausted their one diagnostic attempt.
  useEffect(() => {
    if (
      !isRemedial &&
      flowStep === "camera" &&
      !isModuleLoading &&
      latestDiagnosticAttempt !== null &&
      latestDiagnosticAttempt.completedAt !== undefined &&
      latestDiagnosticAttempt.completedAt !== null
    ) {
      // Hydrate submitResult so scores display correctly before the review
      // API query fires. DiagnosticAttemptItem has score + isPassed; other
      // fields default to 0 and will be overridden once diagnosticReviewData loads.
      setSubmitResult({
        attemptId: latestDiagnosticAttempt.attemptId,
        attemptNumber: latestDiagnosticAttempt.attemptNumber,
        score: latestDiagnosticAttempt.score ?? 0,
        passingScore: apiModule?.passingScore ?? DIAGNOSTIC_KKM_MINIMUM_SCORE,
        isPassed: latestDiagnosticAttempt.isPassed,
        totalQuestions: 0,
        correctAnswers: 0,
        remainingAttempts: 0,
        completedAt:
          latestDiagnosticAttempt.completedAt ?? new Date().toISOString(),
      });
      setFlowStep("completed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemedial, isModuleLoading, latestDiagnosticAttempt]);

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
    if (
      flowStep !== "quiz" ||
      remainingSeconds > 0 ||
      submitRemedialVariantMutation.isPending
    ) {
      return;
    }

    // Baca via ref — bukan dari closure — agar perubahan isRemedial di tengah quiz
    // tidak menyebabkan effect ini re-fire dan auto-submit secara tidak sengaja.
    if (isRemedialRef.current) {
      handleAutoSubmitRemedial();
      return;
    }

    handleCompleteTest();
  }, [flowStep, remainingSeconds, submitRemedialVariantMutation.isPending]);

  const handleCompleteTest = async () => {
    setReviewView("diagnostic");
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

  const handleAutoSubmitRemedial = () => {
    if (
      !remedialAttemptId ||
      remedialAutoSubmitTriggeredRef.current ||
      submitRemedialBulkMutation.isPending
    ) {
      return;
    }

    remedialAutoSubmitTriggeredRef.current = true;

    const submittedAnswersByVariant = new Map(
      remedialSubmittedAnswers.map((answer) => [answer.variantId, answer]),
    );

    if (
      currentVariant &&
      selectedRemedialOptionId &&
      !submittedAnswersByVariant.has(currentVariant.variantId)
    ) {
      submittedAnswersByVariant.set(currentVariant.variantId, {
        variantId: currentVariant.variantId,
        selectedOptionId: selectedRemedialOptionId,
      });
    }

    const answers = Array.from(submittedAnswersByVariant.values()).map(
      (answer) => ({
        variantId: answer.variantId,
        ...(answer.selectedOptionId
          ? { selectedOptionId: answer.selectedOptionId }
          : {}),
      }),
    );

    submitRemedialBulkMutation.mutate(
      {
        remedialAttemptId,
        input: { answers },
      },
      {
        onSuccess: (data) => {
          setDiscussionShow(false);
          setSelectedRemedialOptionId(null);
          setCurrentVariant(null);
          setNextVariantData(null);
          setRemedialSummary(data);
          setReviewView("remedial");
          setFlowStep("completed");
        },
        onError: (err: any) => {
          remedialAutoSubmitTriggeredRef.current = false;
          console.error("[RemedialTest] submitRemedialBulk ERROR:", err);
          showToast.error(err.message || "Gagal auto submit remedial");
        },
      },
    );
  };

  const handleRequestCamera = async () => {
    setCameraError(null);
    setCameraState("requesting");

    // For remedial: test camera permission with a quick getUserMedia probe.
    // Do NOT call emotion.start() here — videoRef.current is null at this
    // flowStep (quiz JSX belum render). emotion.start() deferred ke useEffect.
    if (isRemedial) {
      if (!emotionSupported) {
        setCameraState("denied");
        setCameraError(
          "Browser ini belum mendukung deteksi emosi. Gunakan Chrome/Edge/Firefox versi terbaru.",
        );
        return;
      }
      try {
        // Probe-only: verify the user has granted camera permission
        const probe = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        probe.getTracks().forEach((t) => t.stop()); // release immediately
        setCameraState("granted");
        setFlowStep("briefing");
      } catch {
        setCameraState("denied");
        setCameraError(
          "Akses kamera ditolak. Izinkan akses kamera agar tes remedial bisa dimulai.",
        );
      }
      return;
    }

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

  const handleStartRemedial = () => {
    startRemedialMutation.mutate(undefined, {
      onSuccess: (data) => {
        console.log("[RemedialTest] startRemedial SUCCESS:", data);
        remedialAutoSubmitTriggeredRef.current = false;
        setReviewView(null);
        if (data?.attemptId) {
          setRemedialAttemptId(data.attemptId);
        }
        if (data?.currentVariant) {
          setCurrentVariant(data.currentVariant ?? null);
        }
        setSelectedRemedialOptionId(null);
        setDiscussionShow(false);
        setDiscussionData(null);
        setDiscussionVideoWatched(false);
        setNextVariantData(null);
        setRemedialSubmittedAnswers([]);
        setRemedialAnswers([]);
        setRemedialSummary(null);
        setRemedialTestInfo({
          testName: data?.testName ?? "Tes Remedial",
          passingScore: data?.passingScore ?? 70,
          totalQuestions: data?.totalQuestions ?? 0,
        });
        if (data?.remainingSeconds) {
          setRemainingSeconds(data.remainingSeconds);
        }
        setFlowStep("quiz");
      },
      onError: (err: any) => {
        console.error("[RemedialTest] startRemedial ERROR:", err);
        showToast.error(err.message || "Gagal memulai tes remedial");
      },
    });
  };

  const handleStartDiagnostic = () => {
    // Safety guard: never call diagnostic-test start on the remedial page.
    // This can happen if isRemedial was still false during the apiModule
    // loading window but remediaId is present in the URL.
    if (isRemedial) {
      console.warn(
        "[DiagnosticTest] handleStartDiagnostic blocked — isRemedial is true. Routing to remedial instead.",
      );
      handleStartRemedial();
      return;
    }
    const doStart = () => {
      startTestMutation.mutate(
        {},
        {
          onSuccess: (data) => {
            console.log("[DiagnosticTest] startTestMutation SUCCESS:", data);
            setReviewView(null);
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
            if (data?.remainingSeconds) {
              setRemainingSeconds(data.remainingSeconds);
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

    // Do NOT auto-submit a stale unfinished attempt with empty answers —
    // that would incorrectly mark the diagnostic as completed (score=0) and
    // waste one of the student's 3 allowed attempts.
    // Just start fresh; the backend will handle any conflict.
    doStart();
  };

  const handleOpenDiagnosticReview = () => {
    setReviewView("diagnostic");
    setFlowStep("completed");
  };

  const handleOpenRemedialReview = () => {
    setReviewView("remedial");
    setFlowStep("completed");
  };

  const handleSelectRemedialOption = (optionId: string) => {
    if (discussionShow) return;
    setSelectedRemedialOptionId(optionId);
  };

  const handleCorrectRemedial = () => {
    if (!remedialAttemptId || !currentVariant || !selectedRemedialOptionId)
      return;

    if (!emotion.hasSample) {
      // Spec §15: bedakan antara model masih loading vs wajah tidak terdeteksi.
      if (!emotion.ready) {
        showToast.info("Sedang memuat model deteksi emosi, mohon tunggu...");
      } else {
        showToast.warning("Pastikan wajah kamu terlihat di kamera.");
      }
      return;
    }

    // Spec §12.2: flush atomik via flushOrUnknown() — satu panggilan, window timestamp utuh.
    const emotionResult = emotion.flushOrUnknown();
    console.log("[Emotion] flush →", {
      mode: emotionResult.mode,
      sampleCount: emotionResult.sampleCount,
      distribution: emotionResult.distribution,
      durationMs: emotionResult.durationMs,
    });
    const emotionInput = toEmotionInput(emotionResult);
    // Spec §4.3 & §12.5: startedAt/completedAt di level input, diambil dari window emosi.
    const startedAt = new Date(emotionResult.startedAtMs).toISOString();
    const completedAt = new Date(emotionResult.endedAtMs).toISOString();

    submitRemedialVariantMutation.mutate(
      {
        remedialAttemptId,
        input: {
          variantId: currentVariant.variantId,
          selectedOptionId: selectedRemedialOptionId,
          startedAt,
          completedAt,
          emotion: emotionInput,
        },
      },
      {
        onSuccess: (data) => {
          console.log("[RemedialTest] submitRemedialVariant SUCCESS:", data);

          setRemedialSubmittedAnswers((prev) => {
            const nextAnswers = prev.filter(
              (answer) => answer.variantId !== currentVariant.variantId,
            );

            return [
              ...nextAnswers,
              {
                variantId: currentVariant.variantId,
                selectedOptionId: selectedRemedialOptionId,
              },
            ];
          });

          setRemedialAnswers((prev) => [
            ...prev,
            {
              questionNumber: currentVariant.questionNumber,
              packageLabel: currentVariant.packageLabel,
              isCorrect: data.isCorrect,
            },
          ]);

          // Tampilkan feedback emosi saat jawaban salah
          if (!data.isCorrect) {
            const detectedMode = emotionResult.mode;
            setEmotionFeedbackLabel(translateEmotion(detectedMode));
            setEmotionFeedbackMsg(pickFeedback(detectedMode));
          }

          if (data.isCompleted) {
            setRemedialSummary(data.summary);
            setReviewView("remedial");
            setFlowStep("completed");
          } else if (!data.isCorrect && data.discussion) {
            setDiscussionData(data.discussion);
            setDiscussionShow(true);
            setNextVariantData(data.nextVariant ?? null);
            if (!data.discussion.videoUrl) {
              setDiscussionVideoWatched(true);
            } else {
              setDiscussionVideoWatched(false);
            }
          } else {
            if (data.nextVariant) {
              setCurrentVariant(data.nextVariant ?? null);
              setSelectedRemedialOptionId(null);
              setDiscussionShow(false);
              setDiscussionData(null);
              setNextVariantData(null);
            }
          }
        },
        onError: (err: any) => {
          console.error("[RemedialTest] submitRemedialVariant ERROR:", err);
          showToast.error(err.message || "Gagal mengoreksi jawaban");
        },
      },
    );
  };

  const handleNextRemedialStep = () => {
    if (nextVariantData) {
      setCurrentVariant(nextVariantData);
      setSelectedRemedialOptionId(null);
      setDiscussionShow(false);
      setDiscussionData(null);
      setNextVariantData(null);
      setDiscussionVideoWatched(false);
    }
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
    // Block access for Remedial: must have taken Diagnostic AND not passed
    if (isRemedial) {
      // Wait for attempts data to load before deciding to block access
      if (isAttemptsLoading || isModuleLoading) {
        return (
          <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
            <div className="mx-auto max-w-md rounded-3xl border border-lottie-mist bg-white p-6 text-center shadow-xs">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-lottie-mist border-t-lottie-teal" />
              <p className="mt-4 text-sm font-medium text-lottie-zinc-500">Memuat data tes...</p>
            </div>
          </section>
        );
      }

      const hasTakenDiag = hasTakenDiagnosticAttempt;
      const hasPassedDiag = hasPassedAnyAttempt || hasPassedDiagnosticHistory;

      if (!hasTakenDiag) {
        return (
          <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
            <div className="mx-auto max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100/80">
                <AlertIcon className="h-7 w-7 text-rose-600" />
              </div>
              <h2 className="mt-4  text-xl font-normal text-lottie-midnight">
                Tes Remedial Terkunci
              </h2>
              <p className="mt-2 text-sm text-lottie-zinc-500 leading-6">
                Anda belum mengerjakan Tes Diagnostik. Silakan selesaikan Tes
                Diagnostik terlebih dahulu sebelum mengambil Tes Remedial.
              </p>
              {canReviewLatestDiagnosticAttempt ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-lottie-mist bg-white p-3 text-left shadow-xs">
                  <p className="text-sm font-semibold text-lottie-midnight">
                    Review jawaban sebelumnya
                  </p>
                  <p className="text-xs leading-5 text-lottie-zinc-500">
                    Kamu bisa membuka review jawaban dari percobaan terakhir
                    yang sudah selesai.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenDiagnosticReview}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-lottie-teal px-4 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
                  >
                    Lihat Review Jawaban Diagnostic
                  </button>
                </div>
              ) : null}
              <Link
                href={materialHref}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
              >
                Kembali ke Materi
              </Link>
            </div>
          </section>
        );
      }

      if (hasPassedDiag) {
        return (
          <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
            <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="mt-4  text-xl font-normal text-lottie-midnight">
                Akses Remedial Tidak Diperlukan
              </h2>
              <p className="mt-2 text-sm text-lottie-zinc-500 leading-6">
                Anda telah lulus Tes Diagnostik dengan nilai di atas KKM. Anda
                tidak perlu mengambil Tes Remedial.
              </p>
              {canReviewLatestDiagnosticAttempt ? (
                <button
                  type="button"
                  onClick={handleOpenDiagnosticReview}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
                >
                  Lihat Review Jawaban Diagnostic
                </button>
              ) : null}
              <Link
                href={materialHref}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
              >
                Kembali ke Materi
              </Link>
            </div>
          </section>
        );
      }
    }

    // Block access when max attempts reached or already passed (for diagnostic tests)
    if (
      !isRemedial &&
      (hasPassedAnyAttempt || hasPassedDiagnosticHistory || isMaxAttempts)
    ) {
      return (
        <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
          <div className="mx-auto max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-xs">
            <div
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
                hasPassedAnyAttempt ? "bg-emerald-100" : "bg-rose-100",
              )}
            >
              {hasPassedAnyAttempt ? (
                <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
              ) : (
                <AlertIcon className="h-7 w-7 text-rose-600" />
              )}
            </div>
            <h2 className="mt-4  text-xl font-normal text-lottie-midnight">
              {hasPassedAnyAttempt
                ? "Kamu Sudah Lulus Tes Ini"
                : "Batas Percobaan Habis"}
            </h2>
            <p className="mt-2 text-sm text-lottie-zinc-500 leading-6">
              {hasPassedAnyAttempt
                ? "Kamu telah menyelesaikan tes diagnostik ini dengan tuntas."
                : `Kamu sudah menggunakan 3 dari 3 kesempatan. Hubungi guru untuk mendapat bantuan lebih lanjut.`}
            </p>
            <Link
              href={materialHref}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
            >
              Kembali ke Materi
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div className="mx-auto max-w-md rounded-3xl border border-lottie-mist bg-white p-4 shadow-xs sm:p-5">
          <div className="rounded-2xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-4 text-white shadow-[0_8px_24px_rgba(31,35,117,0.12)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Step 1 dari 2
            </p>
            <h1 className="mt-2 flex items-center gap-2  text-lg font-normal">
              <VideoIcon className="h-4 w-4" />
              Izin Akses Kamera
            </h1>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm leading-6 text-lottie-zinc-500">
              Sebelum tes dimulai, aktifkan kamera untuk memastikan proses
              pengerjaan berjalan tertib.
            </p>

            {diagnosticReviewData || remedialReviewData ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
                <p className="text-sm font-semibold text-blue-800">
                  Sudah ada hasil tes sebelumnya.
                </p>
                <p className="mt-1 text-xs leading-5 text-lottie-zinc-500">
                  Kamu bisa membuka review jawaban dari percobaan terakhir
                  sebelum memulai tes lagi.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {diagnosticReviewData && (
                    <button
                      type="button"
                      onClick={handleOpenDiagnosticReview}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-4 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
                    >
                      Review Diagnostic
                    </button>
                  )}
                  {remedialReviewData && (
                    <button
                      type="button"
                      onClick={handleOpenRemedialReview}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-lottie-mist bg-white px-4 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl"
                    >
                      Review Remedial
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            <ul className="space-y-2">
              {CAMERA_REQUIREMENTS.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2 rounded-xl border border-lottie-mist bg-lottie-pearl/50 px-3 py-2 text-sm text-lottie-zinc-600"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-lottie-teal" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>

            {cameraError ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p>{cameraError}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRequestCamera}
              disabled={cameraState === "requesting"}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-lottie-teal px-4 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
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
    const totalQCount = isRemedial
      ? (apiModule?.remedialTest?.totalQuestions ?? remedialTestData?.questions?.length ?? 0)
      : (apiModule?.totalQuestions ?? apiModule?.nextPackage?.totalQuestions ?? 0);

    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div className="mx-auto max-w-[760px] space-y-4">
          <div className="rounded-3xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-5 text-white shadow-[0_16px_40px_rgba(31,35,117,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Step 2 dari 2
            </p>
            <h1 className="mt-2  text-xl font-normal">
              {isRemedial ? "Tes Remedial" : "Tes Diagnostik"}
            </h1>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/30 bg-white/15 px-3 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <BookIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-white/75">Jumlah Soal</p>
                    <p className="text-sm font-semibold">{totalQCount} Soal</p>
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

          {latestDiagnosticAttempt && (
            <div className="mt-4 rounded-2xl border border-lottie-mist bg-white p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lottie-teal">
                Riwayat Tes Diagnostik
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-lottie-mist bg-lottie-pearl/50 px-3 py-3">
                  <p className="text-[11px] text-lottie-zinc-500">Percobaan</p>
                  <p className="mt-1 text-sm font-semibold text-lottie-midnight">
                    {latestAttemptLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-lottie-mist bg-lottie-pearl/50 px-3 py-3">
                  <p className="text-[11px] text-lottie-zinc-500">Skor Terakhir</p>
                  <p className="mt-1 text-sm font-semibold text-lottie-midnight">
                    {latestAttemptScore ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-lottie-mist bg-lottie-pearl/50 px-3 py-3">
                  <p className="text-[11px] text-lottie-zinc-500">Status</p>
                  <p className="mt-1 text-sm font-semibold text-lottie-midnight">
                    {latestAttemptPassed ? "Lulus KKM" : "Belum Lulus KKM"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-lottie-zinc-500">
                {latestAttemptPassed
                  ? "Hasil diagnostik menunjukkan nilai di atas KKM, jadi remedial tidak diperlukan."
                  : "Hasil diagnostik menunjukkan nilai di bawah KKM, sehingga sesi remedial dapat dimulai dari data ini."}
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-lottie-mist bg-white p-4 shadow-xs sm:p-5">
            <h2 className=" text-base font-normal text-lottie-midnight">Aturan Tes</h2>

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
                          ? "border-lottie-teal/40 bg-lottie-teal/5"
                          : "border-lottie-mist bg-white hover:bg-lottie-pearl",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          checked
                            ? "border-lottie-teal bg-lottie-teal text-white"
                            : "border-lottie-mist bg-white text-lottie-zinc-400",
                        )}
                      >
                        {checked ? (
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <p className="text-sm leading-6 text-lottie-zinc-600">{rule}</p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={isRemedial ? handleStartRemedial : handleStartDiagnostic}
              disabled={!allRulesConfirmed || cameraState !== "granted"}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-lottie-teal px-4 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {latestDiagnosticAttempt && !latestDiagnosticAttempt.completedAt
                ? "Lanjutkan Tes Sekarang"
                : "Mulai Tes Sekarang"}
            </button>

            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
              <h3 className="text-sm font-semibold text-blue-800">
                Rule Passing KKM
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-blue-800/95">
                <li>Nilai dihitung dari jumlah jawaban benar.</li>
                {isRemedial ? (
                  <li>Siswa harus menuntaskan seluruh paket soal remedial.</li>
                ) : (
                  <li>Rumus: (Benar / {diagnosticQuestions.length}) x 100.</li>
                )}
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
    const isReviewRemedial = activeReviewView === "remedial";
    const isPassedKKMResolved = isReviewRemedial
      ? (remedialReviewData?.isPassed ?? remedialSummary?.isPassed ?? false)
      : (diagnosticReviewData?.isPassed ?? isPassedKKM);

    const totalQuestionsResolved = isReviewRemedial
      ? (remedialReviewData?.totalQuestions ??
        remedialSummary?.totalQuestions ??
        remedialTestInfo?.totalQuestions ??
        0)
      : (diagnosticReviewData?.totalQuestions ??
        submitResult?.totalQuestions ??
        diagnosticQuestions.length);

    const correctCountResolved = isReviewRemedial
      ? (remedialReviewData?.correctAnswers ??
        remedialSummary?.correctAnswers ??
        0)
      : (diagnosticReviewData?.correctAnswers ?? correctCount);

    const scorePercentResolved = isReviewRemedial
      ? (remedialReviewData?.score ?? remedialSummary?.score ?? 0)
      : (diagnosticReviewData?.score ?? scorePercent);

    const diagnosticReviewQuestions = diagnosticReviewData?.questions ?? [];
    const remedialReviewQuestions = remedialReviewData?.questions ?? [];

    const renderDiagnosticReview = () => {
      if (!diagnosticReviewData) {
        return (
          <p className="text-sm text-lottie-zinc-500">Memuat review jawaban...</p>
        );
      }

      return (
        <div className="space-y-3">
          {diagnosticReviewQuestions.map((question, index) => {
            const selectedOption = question.options.find(
              (option) => option.id === question.selectedOptionId,
            );
            const correctOption = question.options.find(
              (option) => option.id === question.correctOptionId,
            );

            return (
              <article
                key={question.id}
                className="overflow-hidden rounded-2xl border border-lottie-mist bg-white shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 border-b border-lottie-mist bg-lottie-pearl/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
                      Soal {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-medium text-lottie-midnight">
                      <MathText text={question.textQuestion ?? ""} />
                    </p>
                    {question.imageQuestionUrl ? (
                      <div className="mt-3 max-w-[420px]">
                        {renderMediaPreview(
                          question.imageQuestionUrl,
                          `Gambar soal ${index + 1}`,
                        )}
                      </div>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      question.isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {question.isCorrect ? "Benar" : "Salah"}
                  </span>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Jawaban benar
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-800">
                        {correctOption ? (
                          <>
                            {correctOption.option}.{" "}
                            <MathText text={correctOption.textAnswer ?? ""} />
                          </>
                        ) : (
                          "Tidak ditemukan"
                        )}
                      </p>
                      {correctOption?.imageAnswerUrl ? (
                        <div className="mt-3">
                          {renderMediaPreview(
                            correctOption.imageAnswerUrl,
                            `Jawaban benar soal ${index + 1}`,
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {question.options.map((option) => {
                      const isSelected =
                        option.id === question.selectedOptionId;
                      const isCorrect = option.id === question.correctOptionId;

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "rounded-xl border p-3 text-sm",
                            isCorrect
                              ? "border-emerald-200 bg-emerald-50"
                              : isSelected
                                ? "border-rose-200 bg-rose-50"
                                : "border-lottie-mist bg-white",
                          )}
                        >
                          <p className="font-semibold text-lottie-midnight">
                            {option.option}
                          </p>
                          <p className="mt-1 text-lottie-zinc-600">
                            <MathText text={option.textAnswer ?? ""} />
                          </p>
                          {option.imageAnswerUrl ? (
                            <div className="mt-2">
                              {renderMediaPreview(
                                option.imageAnswerUrl,
                                `Opsi ${option.option} soal ${index + 1}`,
                              )}
                            </div>
                          ) : null}
                          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                            {isCorrect ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                Benar
                              </span>
                            ) : null}
                            {isSelected ? (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                                Dipilih
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      );
    };

    const renderRemedialReview = () => {
      if (!remedialReviewData) {
        return (
          <p className="text-sm text-lottie-zinc-500">Memuat review jawaban...</p>
        );
      }

      return (
        <div className="space-y-3">
          {remedialReviewQuestions.map((question, index) => (
            <article
              key={question.id}
              className="overflow-hidden rounded-2xl border border-lottie-mist bg-white shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 border-b border-lottie-mist bg-lottie-pearl/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
                    Soal {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-lottie-midnight">
                    <MathText text={question.discussionText ?? ""} />
                  </p>
                  {question.discussionImageUrl ? (
                    <div className="mt-3 max-w-[420px]">
                      {renderMediaPreview(
                        question.discussionImageUrl,
                        `Gambar pembahasan soal ${index + 1}`,
                      )}
                    </div>
                  ) : null}
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  {question.variants.length} paket
                </span>
              </div>

              <div className="space-y-3 px-4 py-4">
                {question.discussionVideoUrl ? (
                  <div className="max-w-[640px]">
                    {renderMediaPreview(
                      question.discussionVideoUrl,
                      `Video pembahasan soal ${index + 1}`,
                    )}
                  </div>
                ) : null}

                <div className="space-y-2">
                  {question.variants.map((variant) => {
                    const selectedOption = variant.options.find(
                      (option) => option.id === variant.selectedOptionId,
                    );
                    const correctOption = variant.options.find(
                      (option) => option.id === variant.correctOptionId,
                    );

                    return (
                      <div
                        key={variant.id}
                        className="rounded-xl border border-lottie-mist bg-lottie-pearl/50 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-lottie-midnight">
                            Paket {variant.packageLabel}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              variant.isCorrect
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700",
                            )}
                          >
                            {variant.isCorrect ? "Benar" : "Salah"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-lottie-zinc-600">
                          <MathText text={variant.textQuestion ?? ""} />
                        </p>
                        {variant.imageQuestionUrl ? (
                          <div className="mt-3">
                            {renderMediaPreview(
                              variant.imageQuestionUrl,
                              `Gambar paket ${variant.packageLabel} soal ${index + 1}`,
                            )}
                          </div>
                        ) : null}

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-lottie-mist bg-white p-3">
                            <p className="text-[11px] text-lottie-zinc-500">
                              Jawaban kamu
                            </p>
                            <p className="mt-1 text-sm font-semibold text-lottie-midnight">
                              {selectedOption ? (
                                <>
                                  {selectedOption.option}.{" "}
                                  <MathText
                                    text={selectedOption.textAnswer ?? ""}
                                  />
                                </>
                              ) : (
                                "Tidak menjawab"
                              )}
                            </p>
                            {selectedOption?.imageAnswerUrl ? (
                              <div className="mt-3">
                                {renderMediaPreview(
                                  selectedOption.imageAnswerUrl,
                                  `Jawaban kamu paket ${variant.packageLabel} soal ${index + 1}`,
                                )}
                              </div>
                            ) : null}
                          </div>
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-[11px] text-emerald-700 font-medium">
                              Jawaban benar
                            </p>
                            <p className="mt-1 text-sm font-semibold text-emerald-800">
                              {correctOption ? (
                                <>
                                  {correctOption.option}.{" "}
                                  <MathText
                                    text={correctOption.textAnswer ?? ""}
                                  />
                                </>
                              ) : (
                                "Tidak ditemukan"
                              )}
                            </p>
                            {correctOption?.imageAnswerUrl ? (
                              <div className="mt-3">
                                {renderMediaPreview(
                                  correctOption.imageAnswerUrl,
                                  `Jawaban benar paket ${variant.packageLabel} soal ${index + 1}`,
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    };

    return (
      <section className="mx-auto w-full max-w-[1100px] py-2 sm:py-4">
        <div
          className={cn(
            "mx-auto max-w-xl rounded-3xl border p-6 shadow-xs",
            isPassedKKMResolved
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50",
          )}
        >
          <div
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
              isPassedKKMResolved
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            )}
          >
            <CheckCircleIcon className="h-6 w-6" />
          </div>

          <h1 className="mt-4 font-semibold text-2xl  mantap font-normal text-lottie-midnight sm:text-3xl">
            {isReviewRemedial
              ? (remedialReviewData?.testName ??
                remedialTestInfo?.testName ??
                "Tes Remedial Selesai")
              : (diagnosticReviewData?.testName ??
                apiModule?.testName ??
                "Tes Diagnostik Selesai")}
          </h1>
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              isPassedKKMResolved ? "text-emerald-800" : "text-rose-800",
            )}
          >
            {isPassedKKMResolved
              ? "Jawaban kamu telah tersimpan. Status kamu tuntas sesuai KKM."
              : "Jawaban kamu telah tersimpan. Status kamu belum tuntas karena nilai masih di bawah KKM."}
          </p>

          <div
            className={cn(
              "mt-5 rounded-2xl border p-4 bg-white",
              isPassedKKMResolved
                ? "border-emerald-100"
                : "border-rose-100",
            )}
          >
            <p className="text-sm text-lottie-zinc-500">Ringkasan Hasil</p>
            <p className="mt-1 text-xl font-semibold text-lottie-midnight">
              {isReviewRemedial ? totalQuestionsResolved : answeredCount}/
              {totalQuestionsResolved} soal terjawab
            </p>
            <p className="mt-1 text-sm text-lottie-zinc-600">
              Benar: {correctCountResolved} soal • Nilai: {scorePercentResolved}
            </p>
            <p
              className={cn(
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                isPassedKKMResolved
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800",
              )}
            >
              {isPassedKKMResolved
                ? `Lulus KKM (${kkmScore})`
                : `Belum Lulus KKM (${kkmScore})`}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-lottie-mist bg-white p-4 shadow-xs">
            <h2 className=" text-lg font-normal text-lottie-midnight">
              {isReviewRemedial
                ? "Review Jawaban Remedial"
                : "Review Jawaban Diagnostik"}
            </h2>

            <div className="mt-3 space-y-2.5">
              {isReviewRemedial
                ? renderRemedialReview()
                : renderDiagnosticReview()}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* Tombol primer: "Mulai Remedial" kalau belum lulus,
                "Kembali ke Materi" kalau sudah lulus. */}
            {!isReviewRemedial && !isPassedKKMResolved ? (
              <Link
                href={`${materialHref}/remedia/${encodeURIComponent(contentId)}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
              >
                Mulai Remedial
              </Link>
            ) : (
              <Link
                href={materialHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
              >
                Kembali ke Materi
              </Link>
            )}
            {/* Kembali ke Materi sebagai tombol sekunder saat Mulai Remedial tampil */}
            {!isReviewRemedial && !isPassedKKMResolved && (
              <Link
                href={materialHref}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl"
              >
                Kembali ke Materi
              </Link>
            )}
            {!isReviewRemedial && !!nextModule && (
              <Link
                href={`/student/dashboard/class/${encodedSlug}/materi/${encodeURIComponent(
                  nextModule.id,
                )}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
              >
                Materi Selanjutnya
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const selectedOptionId = activeQuestion ? answers[activeQuestion.id] : null;
  const canSubmitCurrentQuestion = Boolean(
    activeQuestion && answers[activeQuestion.id],
  );

  if (isRemedial) {
    return (
      <section className="mx-auto w-full max-w-[1200px] py-2 sm:py-4">
        {/* Blocking overlays: browser tidak support atau error kamera */}
        {!emotionSupported && (
          <CameraRequiredScreen reason="Browser kamu tidak mendukung deteksi emosi. Gunakan Chrome/Edge/Firefox versi terbaru." />
        )}
        {emotionSupported && emotion.error && (
          <CameraRequiredScreen reason={emotion.error} />
        )}

        {/* <video> is rendered in the sidebar camera box below — see aside */}

        {/* Feedback emosi saat jawaban salah */}
        {emotionFeedbackMsg && (
          <EmotionNotification
            questionIndex={activeQuestionIndex}
            emotionLabel={emotionFeedbackLabel ?? undefined}
            emotionDescription={emotionFeedbackMsg}
            onDismiss={() => {
              setEmotionFeedbackMsg(null);
              setEmotionFeedbackLabel(null);
            }}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-2xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-4 text-white shadow-[0_8px_24px_rgba(31,35,117,0.12)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/85">
                  Soal Remedial
                </p>
                <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold">
                  Soal {currentVariant?.questionNumber ?? 1} • Paket{" "}
                  {currentVariant?.packageLabel ?? "A"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  Sesi remedial sedang berjalan
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/35 bg-white/15 px-3 py-1.5 text-sm font-semibold">
                  <ClockIcon className="h-4 w-4" />
                  {timeLabel}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl border border-lottie-mist bg-white p-4 shadow-xs sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Remedial
                </span>
                <span className="rounded-full border border-lottie-mist bg-lottie-pearl/50 px-3 py-1 text-xs font-semibold text-lottie-zinc-600">
                  Paket {currentVariant?.packageLabel ?? "A"}
                </span>
                <span className="rounded-full border border-lottie-mist bg-lottie-pearl/50 px-3 py-1 text-xs font-semibold text-lottie-zinc-600">
                  Soal {currentVariant?.questionNumber ?? 1}
                </span>
              </div>

              <h2 className="mt-4  text-xl font-normal leading-7 text-lottie-midnight">
                <MathText text={currentVariant?.textQuestion ?? ""} />
              </h2>
              {currentVariant?.imageQuestionUrl ? (
                <div className="mt-4 max-w-[420px]">
                  {renderMediaPreview(
                    currentVariant.imageQuestionUrl,
                    `Gambar soal remedial paket ${currentVariant.packageLabel} no ${currentVariant.questionNumber}`,
                  )}
                </div>
              ) : null}

              <div className="mt-4 space-y-2.5">
                {(currentVariant?.options ?? []).map((option) => {
                  const isSelected = selectedRemedialOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={discussionShow}
                      onClick={() => handleSelectRemedialOption(option.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                        isSelected
                          ? "border-lottie-teal/40 bg-lottie-teal/5"
                          : "border-lottie-mist bg-white hover:bg-lottie-pearl",
                        discussionShow && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                          isSelected
                            ? "border-lottie-teal bg-lottie-teal text-white"
                            : "border-lottie-mist bg-white text-lottie-zinc-500",
                        )}
                      >
                        {option.option}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-lottie-zinc-600">
                          <MathText text={option.textAnswer ?? ""} />
                        </span>
                        {option.imageAnswerUrl ? (
                          <div className="mt-2 max-w-[320px]">
                            {renderMediaPreview(
                              option.imageAnswerUrl,
                              `Gambar jawaban ${option.option}`,
                            )}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Discussion / Video Panel (Only visible when student answered incorrectly) */}
              {discussionShow && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertIcon className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <h3 className="text-sm font-bold text-red-800">
                        Jawaban Kurang Tepat
                      </h3>
                      <p className="mt-1 text-sm text-red-700 leading-6">
                        <MathText text={discussionData?.text ?? ""} />
                      </p>
                    </div>
                  </div>

                  {discussionData?.videoUrl && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-2">
                        Video Pembahasan Pendukung
                      </p>
                      <div className="rounded-2xl overflow-hidden border border-red-200/50 bg-black shadow-md">
                        <YoutubePlayer
                          key={discussionData.videoUrl}
                          iframeId="youtube-remedial-player"
                          url={`https://www.youtube.com/embed/${getYouTubeId(discussionData.videoUrl)}?enablejsapi=1&controls=1&rel=0`}
                          title="Video Pembahasan"
                          frameBorder="0"
                          className="w-full aspect-video"
                          onEnded={handleVideoEnded}
                        />
                      </div>
                      {!discussionVideoWatched && (
                        <p className="mt-2 text-xs font-medium text-red-600 animate-pulse">
                          ℹ️ Tonton video pembahasan di atas sampai selesai
                          untuk melanjutkan ke paket berikutnya.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Button */}
            <div className="flex items-center justify-end gap-3">
              {discussionShow ? (
                <button
                  type="button"
                  onClick={handleNextRemedialStep}
                  disabled={!discussionVideoWatched}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-6 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lanjut ke Langkah Berikutnya
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCorrectRemedial}
                  disabled={
                    !selectedRemedialOptionId ||
                    !emotion.hasSample ||
                    emotion.noFaceWarning ||
                    submitRemedialVariantMutation.isPending
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-6 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitRemedialVariantMutation.isPending
                    ? "Mengoreksi..."
                    : !emotion.ready
                      ? "Memuat deteksi emosi..."
                      : emotion.noFaceWarning
                        ? "Wajah tidak terdeteksi..."
                        : !emotion.hasSample
                          ? "Pastikan wajah di kamera..."
                          : "Kirim Jawaban"}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit getmath-card p-3">
            <div className="rounded-2xl border border-lottie-mist bg-lottie-midnight p-2">
              {/* Camera feed — videoRef lives here; always mounted so the
                  sampler's opts.video reference never becomes stale */}
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-lottie-midnight">
                <video
                  ref={emotion.videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover scale-x-[-1]"
                />
                {/* Emotion label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center">
                  <p className="text-xs font-semibold text-white/90">
                    {emotion.ready
                      ? (emotion.currentEmotion?.label ?? "Mendeteksi...")
                      : emotion.error
                        ? "Error kamera"
                        : "Memuat..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
                Riwayat Remedial
              </p>
              {remedialAnswers.length > 0 ? (
                <div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {remedialAnswers.map((ans, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold",
                        ans.isCorrect
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700",
                      )}
                    >
                      <span>
                        Soal {ans.questionNumber} (Paket {ans.packageLabel})
                      </span>
                      <span>{ans.isCorrect ? "✅" : "❌"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-lottie-zinc-500 italic">
                  Mulai kirim jawaban untuk melihat riwayat.
                </p>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
                Kamera
              </p>
              <p className="mt-1 text-sm font-medium text-lottie-midnight">
                {cameraState === "granted" ? "Aktif" : "Belum aktif"}
              </p>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] py-2 sm:py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-4 text-white shadow-[0_8px_24px_rgba(31,35,117,0.12)] sm:p-5">
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
          <div className="rounded-3xl border border-lottie-mist bg-white p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {activeQuestion?.topic ?? "Diagnostik"}
              </span>
              <span className="rounded-full border border-lottie-mist bg-lottie-pearl/50 px-3 py-1 text-xs font-semibold text-lottie-zinc-600">
                {activeQuestion?.typeLabel ?? "Pilihan Ganda"}
              </span>
              <span className="rounded-full border border-lottie-mist bg-lottie-pearl/50 px-3 py-1 text-xs font-semibold text-lottie-zinc-600">
                Soal {activeQuestionIndex + 1}
              </span>
            </div>

            <h2 className="mt-4  text-xl font-normal leading-7 text-lottie-midnight">
              <MathText text={activeQuestion?.prompt ?? ""} />
            </h2>
            {activeQuestion?.imageQuestionUrl ? (
              <div className="mt-4 max-w-[420px]">
                {renderMediaPreview(
                  activeQuestion.imageQuestionUrl,
                  `Gambar soal ${activeQuestionIndex + 1}`,
                )}
              </div>
            ) : null}

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
                        ? "border-lottie-teal/40 bg-lottie-teal/5"
                        : "border-lottie-mist bg-white hover:bg-lottie-pearl",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                        isSelected
                          ? "border-lottie-teal bg-lottie-teal text-white"
                          : "border-lottie-mist bg-white text-lottie-zinc-500",
                      )}
                    >
                      {option.label}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm text-lottie-zinc-600">
                        <MathText text={option.text} />
                      </span>
                      {option.imageAnswerUrl ? (
                        <div className="mt-2 max-w-[320px]">
                          {renderMediaPreview(
                            option.imageAnswerUrl,
                            `Gambar jawaban ${option.label}`,
                          )}
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-lottie-zinc-500">
              Jawaban terisi {answeredCount}/{diagnosticQuestions.length} soal
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveQuestionIndex((current) => Math.max(0, current - 1))
                }
                disabled={activeQuestionIndex === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-lottie-mist bg-white px-4 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl disabled:cursor-not-allowed disabled:opacity-60"
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
                className="inline-flex h-10 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
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

        <aside className="h-fit getmath-card p-3">
          <div className="rounded-2xl border border-lottie-mist bg-lottie-midnight p-2">
            <video
              ref={previewRef}
              autoPlay
              playsInline
              muted
              className="h-28 w-full rounded-xl bg-lottie-midnight object-cover"
            />
          </div>

          <div className="mt-3 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
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
                        ? "border-lottie-teal bg-lottie-teal text-white"
                        : isAnswered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-lottie-mist bg-white text-lottie-zinc-600",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
              Kamera
            </p>
            <p className="mt-1 text-sm font-medium text-lottie-midnight">
              {cameraState === "granted" ? "Aktif" : "Belum aktif"}
            </p>
            <p className="mt-2 text-xs text-lottie-zinc-500">
              Tetap berada dalam frame selama tes berlangsung.
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lottie-zinc-400">
              Progress
            </p>
            <p className="mt-1 text-sm font-medium text-lottie-midnight">
              {completionPercent}% selesai
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-lottie-mist">
              <div
                className="h-full rounded-full bg-lottie-teal transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function translateEmotion(emotion: string): string {
  switch (emotion) {
    case "happy":
      return "Senang";
    case "sad":
      return "Sedih";
    case "angry":
      return "Marah / Frustrasi";
    case "fearful":
      return "Khawatir";
    case "disgusted":
      return "Jenuh / Bosan";
    case "surprised":
      return "Terkejut";
    case "neutral":
      return "Fokus";
    default:
      return "Fokus";
  }
}
