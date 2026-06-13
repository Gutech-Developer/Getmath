"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import PDFIcon from "@/components/atoms/icons/PDFIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { cn } from "@/libs/utils";
import { toEmbedUrl } from "@/libs/embed";
import {
  useGsModulesByCourse,
  useGsModuleById,
  useMarkFileRead,
  useMarkVideoWatched,
  useMyTestAttempts,
  useStartTestAttempt,
} from "@/services";
import { useEmotionDetectorBucketed } from "@/services/hooks/useEmotionDetectorBucketed";
import { isEmotionSupported } from "@/libs/emotion";
import CameraRequiredScreen from "@/components/molecules/classroom/CameraRequiredScreen";
import type { GsCourseModule, GsCourseModuleSubject } from "@/types/gs-course";
import type {
  IClassMaterialContentPageTemplateProps,
  ModuleStepState,
} from "@/types/classMaterial";
import { formatBreadcrumbLabel, formatContentTitle } from "@/utils";
import { showToast } from "@/libs/toast";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type StepKind = "PDF" | "VIDEO" | "ELKPD" | "DIAGNOSTIC" | "REMEDIAL";

interface IFlatStep {
  id: string;
  moduleId: string;
  diagnosticTestId?: string;
  remedialTestId?: string;
  moduleTitle: string;
  kind: StepKind;
  typeLabel: string;
  title: string;
  url: string | null;
  rawUrl: string | null;
  state: ModuleStepState;
  status: "completed" | "in-progress" | "locked";
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface YoutubePlayerProps {
  iframeId?: string;
  url: string;
  title: string;
  onEnded: () => void;
  className?: string;
}

const YoutubePlayer = React.memo(
  ({ url, onEnded, className }: YoutubePlayerProps) => {
    const onEndedRef = useRef(onEnded);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
      onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
      const videoId = extractYoutubeId(url);
      if (!videoId) return;

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

      let timeoutId: any;

      const initPlayer = () => {
        if (!containerRef.current) return;

        if (playerRef.current && playerRef.current.destroy) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.error(e);
          }
        }

        try {
          playerRef.current = new (window as any).YT.Player(containerRef.current, {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              enablejsapi: 1,
              origin: typeof window !== "undefined" ? window.location.origin : "",
            },
            events: {
              onStateChange: (event: any) => {
                const endedState = (window as any).YT?.PlayerState?.ENDED ?? 0;
                if (event.data === endedState || event.data === 0) {
                  onEndedRef.current();
                }
              },
            },
          });
        } catch (err) {
          console.error("[YoutubePlayer] failed to initialize YT.Player:", err);
        }
      };

      const checkAndInit = () => {
        if ((window as any).YT && (window as any).YT.Player) {
          initPlayer();
        } else {
          timeoutId = setTimeout(checkAndInit, 100);
        }
      };

      checkAndInit();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (playerRef.current && playerRef.current.destroy) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // ignore
          }
          playerRef.current = null;
        }
      };
    }, [url]);

    return (
      <div className={className ?? "h-full w-full"}>
        <div ref={containerRef} />
      </div>
    );
  },
);

YoutubePlayer.displayName = "YoutubePlayer";

interface IModuleView {
  id: string;
  title: string;
  description: string;
  steps: IFlatStep[];
}

/* ------------------------------------------------------------------ */
/* API → view-model                                                   */
/* ------------------------------------------------------------------ */
function buildModuleView(
  module: GsCourseModule,
  index: number,
): IModuleView | null {
  const moduleType = module.type;
  const subject = getSubjectFromModule(module);

  if (moduleType === "SUBJECT" && subject) {
    return moduleFromSubject(module, subject, index);
  }
  if (moduleType === "DIAGNOSTIC_TEST") {
    return moduleFromDiagnostic(module, index);
  }
  return null;
}

function getModuleId(module: GsCourseModule): string {
  const fallbackId = (module as GsCourseModule & { courseModuleId?: string })
    .courseModuleId;
  return module.id ?? fallbackId ?? "";
}

function getSubjectFromModule(
  module: GsCourseModule,
): GsCourseModuleSubject | null {
  if (module.subject) {
    return module.subject;
  }

  const flat = module as Partial<GsCourseModuleSubject> & {
    subjectName?: string;
    description?: string | null;
    subjectFileUrl?: string;
    eLKPDTitle?: string | null;
    eLKPDDescription?: string | null;
    eLKPDFileUrl?: string | null;
    videoUrl?: string | null;
    hasVideo?: boolean;
    hasELKPD?: boolean;
  };

  if (!flat.subjectName) {
    return null;
  }

  return {
    id: module.subjectId ?? getModuleId(module),
    subjectName: flat.subjectName,
    description: flat.description ?? null,
    subjectFileUrl: flat.subjectFileUrl ?? "",
    eLKPDTitle: flat.eLKPDTitle ?? null,
    eLKPDDescription: flat.eLKPDDescription ?? null,
    eLKPDFileUrl: flat.eLKPDFileUrl ?? null,
    videoUrl: flat.videoUrl ?? null,
    _hasVideo: flat.hasVideo,
    _hasELKPD: flat.hasELKPD,
  } as GsCourseModuleSubject & { _hasVideo?: boolean; _hasELKPD?: boolean };
}

function moduleFromSubject(
  module: GsCourseModule,
  subject: GsCourseModuleSubject,
  index: number,
): IModuleView {
  const moduleId = getModuleId(module);
  const flat = module as any;
  const steps: IFlatStep[] = [];

  if (subject.subjectFileUrl || flat.hasPDF) {
    steps.push({
      id: `${moduleId}-pdf`,
      moduleId,
      moduleTitle: subject?.subjectName ?? flat.subjectName ?? "",
      kind: "PDF",
      typeLabel: "Materi",
      title: subject?.subjectName ?? flat.subjectName ?? "",
      url: subject?.subjectFileUrl
        ? toEmbedUrl(subject.subjectFileUrl, "pdf")
        : null,
      rawUrl: subject?.subjectFileUrl || null,
      state: index === 0 ? "active" : "upcoming",
      status: flat.fileRead ? "completed" : "in-progress",
    });
  }

  if (subject?.videoUrl || flat.hasVideo) {
    steps.push({
      id: `${moduleId}-video`,
      moduleId,
      moduleTitle: subject?.subjectName ?? flat.subjectName ?? "",
      kind: "VIDEO",
      typeLabel: "Video",
      title: `Video: ${subject?.subjectName ?? flat.subjectName ?? ""}`,
      url: subject?.videoUrl ? toEmbedUrl(subject.videoUrl, "video") : null,
      rawUrl: subject?.videoUrl || null,
      state: "upcoming",
      status: flat.videoWatched ? "completed" : "in-progress",
    });
  }

  if ((subject?.eLKPDTitle && subject?.eLKPDFileUrl) || flat.hasELKPD) {
    steps.push({
      id: `${moduleId}-elkpd-${subject?.id || moduleId}`,
      moduleId,
      moduleTitle: subject?.subjectName ?? flat.subjectName ?? "",
      kind: "ELKPD",
      typeLabel: "E-LKPD",
      title: subject?.eLKPDTitle || "E-LKPD",
      url: subject?.eLKPDFileUrl
        ? toEmbedUrl(subject.eLKPDFileUrl, "elkpd")
        : null,
      rawUrl: subject?.eLKPDFileUrl || null,
      state: "upcoming",
      status:
        flat.eLKPDSubmitted || flat.eLKPDGraded ? "completed" : "in-progress",
    });
  }

  return {
    id: moduleId,
    title: subject.subjectName,
    description: subject.description ?? "",
    steps,
  };
}

function moduleFromDiagnostic(
  module: GsCourseModule,
  index: number,
): IModuleView {
  const moduleId = getModuleId(module);
  const flat = module as any;
  const test = module.diagnosticTest;
  const fallback = module as { testName?: string; description?: string | null };
  const title =
    test?.testName ??
    fallback.testName ??
    `Tes Diagnostik ${module.order ?? index + 1}`;
  const diagnosticTestId = module.diagnosticTestId ?? test?.id ?? "";
  const remedialTestId =
    module.remedialTestId ??
    module.remedialTest?.id ??
    flat.remedialTestId ??
    "";

  const steps: IFlatStep[] = [
    {
      id: `${moduleId}-diagnostic`,
      moduleId,
      diagnosticTestId,
      moduleTitle: title,
      kind: "DIAGNOSTIC",
      typeLabel: "Tes Diagnostik",
      title,
      url: null,
      rawUrl: null,
      state: index === 0 ? "active" : "upcoming",
      status:
        flat.diagnosticCompleted || flat.completed
          ? "completed"
          : "in-progress",
    },
  ];

  if (remedialTestId && flat.diagnosticCompleted && !flat.isPassed) {
    steps.push({
      id: `${moduleId}-remedial`,
      moduleId,
      remedialTestId,
      moduleTitle: title,
      kind: "REMEDIAL",
      typeLabel: "Tes Remedial",
      title: `Tes Remedial: ${title}`,
      url: null,
      rawUrl: null,
      state: "upcoming",
      status: flat.remedialCompleted ? "completed" : "in-progress",
    });
  }

  return {
    id: moduleId,
    title,
    description: test?.description ?? fallback.description ?? "",
    steps,
  };
}

/* ------------------------------------------------------------------ */
/* Step icon helpers                                                  */
/* ------------------------------------------------------------------ */
function getStepIcon(kind: StepKind) {
  switch (kind) {
    case "VIDEO":
      return VideoIcon;
    case "ELKPD":
      return DocumentIcon;
    case "DIAGNOSTIC":
    case "REMEDIAL":
      return CheckCircleIcon;
    case "PDF":
    default:
      return PDFIcon;
  }
}

function getStepTone(kind: StepKind): { bg: string; fg: string } {
  switch (kind) {
    case "VIDEO":
      return { bg: "bg-amber-50", fg: "text-amber-600" };
    case "ELKPD":
      return { bg: "bg-emerald-50", fg: "text-emerald-600" };
    case "DIAGNOSTIC":
      return { bg: "bg-rose-50", fg: "text-rose-600" };
    case "REMEDIAL":
      return { bg: "bg-violet-50", fg: "text-violet-600" };
    case "PDF":
    default:
      return { bg: "bg-blue-50", fg: "text-blue-600" };
  }
}

function ContentBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClassMaterialContentPageTemplate({
  courseId,
  contentId,
  slug,
}: IClassMaterialContentPageTemplateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams?.get("step");

  const { data: courseModules, isPending } = useGsModulesByCourse(courseId);

  const markFileRead = useMarkFileRead(contentId ?? "");
  const markVideoWatched = useMarkVideoWatched(contentId ?? "");

  const [emotionSupported] = useState(() => isEmotionSupported());
  const emotionDetectionEnabled = false; // Flag untuk menonaktifkan deteksi emosi pada halaman materi

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [videoFinished, setVideoFinished] = useState<Record<string, boolean>>(
    {},
  );
  const [elkpdFinished, setElkpdFinished] = useState<Record<string, boolean>>(
    {},
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState<number>(-1);
  const prevContentIdRef = useRef<string | null>(null);

  const { data: detailModule } = useGsModuleById(contentId ?? "");

  // ── REFACTOR: Mengintegrasikan State Lokal Langsung ke Pemetaan Objek Modules ──
  const modules = useMemo<IModuleView[]>(() => {
    return (courseModules ?? [])
      .filter(
        (m: GsCourseModule) =>
          m.type === "SUBJECT" || m.type === "DIAGNOSTIC_TEST",
      )
      .map((m: GsCourseModule, i: number) => {
        const mId = m.id ?? (m as any).courseModuleId;
        const dId = detailModule?.id ?? (detailModule as any)?.courseModuleId;

        // REFACTOR: Pastikan bendera penanda tipe materi selalu diprioritaskan dari list 'm'
        // agar struktur 'steps' langsung terbentuk sempurna sejak aplikasi pertama kali dimuat.
        const moduleToUse: any =
          dId && mId === dId
            ? ({
              ...detailModule,
              accessible: (m as any).accessible,
              fileRead: (m as any).fileRead,
              videoWatched: (m as any).videoWatched,
              eLKPDGraded: (m as any).eLKPDGraded,
              eLKPDSubmitted: (m as any).eLKPDSubmitted,
              completed:
                (detailModule as any).completed ?? (m as any).completed,
              diagnosticCompleted:
                (detailModule as any).diagnosticCompleted ??
                (m as any).diagnosticCompleted,
              remedialCompleted:
                (detailModule as any).remedialCompleted ??
                (m as any).remedialCompleted,
              remedialTestId:
                (detailModule as any).remedialTestId ??
                (m as any).remedialTestId,
              isPassed: (detailModule as any).isPassed ?? (m as any).isPassed,
              // Kunci konsistensi: kunci keberadaan konten harus konsisten antara list & detail
              hasPDF:
                (m as any).hasPDF ?? !!detailModule?.subject?.subjectFileUrl,
              hasVideo:
                (m as any).hasVideo ?? !!(detailModule as any).hasVideo,
              hasELKPD:
                (m as any).hasELKPD ?? !!(detailModule as any).hasELKPD,
            } as GsCourseModule)
            : {
              ...m,
              // Pastikan data list m juga mengenali benderanya sendiri
              hasPDF: (m as any).hasPDF ?? !!m.subject?.subjectFileUrl,
              hasVideo: (m as any).hasVideo,
              hasELKPD: (m as any).hasELKPD,
            };

        const view = buildModuleView(moduleToUse, i);
        if (!view) return null;

        // Sinkronisasi state lokal
        view.steps = view.steps.map((step) => {
          if (step.kind === "VIDEO" && videoFinished[step.id]) {
            return { ...step, status: "completed" };
          }
          if (step.kind === "ELKPD" && elkpdFinished[step.id]) {
            return { ...step, status: "completed" };
          }
          return step;
        });

        return view;
      })
      .filter((m: IModuleView | null): m is IModuleView => m !== null);
  }, [courseModules, detailModule, videoFinished, elkpdFinished]);

  // ── REFACTOR: flatSteps murni memetakan data modules yang sudah ter-update ──
  const flatSteps = useMemo<IFlatStep[]>(() => {
    return modules.flatMap((m) => m.steps);
  }, [modules]);

  // Set default selectedStep dari modul yang dibuka via contentId.
  useEffect(() => {
    if (modules.length === 0) return;
    const target = modules.find((m) => m.id === contentId) ?? modules[0];

    // Hanya sinkronisasi jika contentId berubah atau selectedStepId masih kosong
    if (prevContentIdRef.current !== contentId || !selectedStepId) {
      prevContentIdRef.current = contentId ?? null;

      const currentStepInTarget = target.steps.some((s) => s.id === selectedStepId);

      if (!selectedStepId || !currentStepInTarget) {
        if (stepParam) {
          const matchedStep = target.steps.find(
            (s) => s.kind.toLowerCase() === stepParam.toLowerCase(),
          );
          if (matchedStep) {
            setSelectedStepId(matchedStep.id);
            return;
          }
        }

        if (target.steps[0]) setSelectedStepId(target.steps[0].id);
      }
    }
  }, [modules, contentId, selectedStepId, stepParam]);

  const toggleModule = useCallback((moduleId: string) => {
    setOpenModules((prev) => {
      const isCurrentOpen = prev[moduleId] !== false;
      return {
        ...prev,
        [moduleId]: !isCurrentOpen,
      };
    });
  }, []);

  /* ---------- Derived Progress Data ---------- */
  const totalModules = modules.length;
  const completedModules = modules.filter(
    (m) => m.steps.length > 0 && m.steps.every((s) => s.status === "completed"),
  ).length;

  const totalStepsAll = modules.reduce((sum, m) => sum + m.steps.length, 0);
  const completedStepsAll = modules.reduce(
    (sum, m) => sum + m.steps.filter((s) => s.status === "completed").length,
    0,
  );

  const overallProgress =
    totalModules > 0
      ? Math.round(
        modules.reduce((sum, m) => {
          const mTotal = m.steps.length;
          const mCompleted = m.steps.filter(
            (s) => s.status === "completed",
          ).length;
          return sum + (mTotal > 0 ? (mCompleted / mTotal) * 100 : 0);
        }, 0) / totalModules,
      )
      : 0;

  /* ---------- Breadcrumb ---------- */
  const currentModuleTitle = useMemo(() => {
    return (
      modules.find((module) => module.id === contentId)?.title ??
      formatContentTitle(contentId ?? "")
    );
  }, [modules, contentId]);

  const breadcrumbItems = useMemo(() => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";
    const items = segments
      .map((segment, index) => {
        currentPath += `/${segment}`;
        const isLastSegment = index === segments.length - 1;
        const label = isLastSegment
          ? currentModuleTitle
          : formatBreadcrumbLabel(segment, slug ?? "", currentModuleTitle);
        if (!label) return null;
        return { label, href: currentPath };
      })
      .filter(Boolean) as Array<{ label: string; href: string }>;

    return items.map((item, i) => ({
      ...item,
      isCurrent: i === items.length - 1,
    }));
  }, [pathname, slug, currentModuleTitle]);

  /* ---------- Active step ---------- */
  const activeStep = useMemo<IFlatStep | null>(() => {
    if (selectedStepId) {
      return flatSteps.find((s) => s.id === selectedStepId) ?? null;
    }
    if (contentId) {
      return (
        flatSteps.find((s) => s.moduleId === contentId) ?? flatSteps[0] ?? null
      );
    }
    return null;
  }, [flatSteps, selectedStepId, contentId]);

  // ── Emotion detection for SUBJECT modules (PDF/VIDEO/ELKPD) ─────────
  const isSubjectStep =
    activeStep?.kind === "PDF" ||
    activeStep?.kind === "VIDEO" ||
    activeStep?.kind === "ELKPD";

  const subjectEmotion = useEmotionDetectorBucketed({
    courseModuleId: activeStep?.moduleId ?? "",
    enabled: isSubjectStep && emotionDetectionEnabled,
    bucketMs: 30_000,
  });

  useEffect(() => {
    if (!isSubjectStep || !emotionSupported || !emotionDetectionEnabled) return;
    subjectEmotion.start().catch(() => { });
  }, [isSubjectStep, emotionSupported, emotionDetectionEnabled]);

  useEffect(() => {
    if (!isSubjectStep || !emotionDetectionEnabled) {
      subjectEmotion.stop();
    }
  }, [isSubjectStep, emotionDetectionEnabled]);

  const { data: activeModuleData } = useGsModuleById(
    activeStep?.kind === "DIAGNOSTIC" || activeStep?.kind === "REMEDIAL"
      ? activeStep.moduleId
      : "",
  );

  const activeModuleDataAny = activeModuleData as any;
  const resolvedDiagnosticTestId =
    activeStep?.diagnosticTestId ||
    activeModuleDataAny?.diagnosticTestId ||
    activeModuleDataAny?.diagnosticTest?.id ||
    "";

  const isRemedialCompleted = useMemo(() => {
    const remedialStep = flatSteps.find(
      (s) => s.moduleId === activeStep?.moduleId && s.kind === "REMEDIAL",
    );
    return remedialStep?.status === "completed";
  }, [flatSteps, activeStep?.moduleId]);

  const remedialSiblingStep = flatSteps.find(
    (s) => s.kind === "REMEDIAL" && s.moduleId === activeStep?.moduleId,
  );
  const resolvedRemedialTestId =
    activeStep?.remedialTestId ||
    remedialSiblingStep?.remedialTestId ||
    activeModuleDataAny?.remedialTestId ||
    activeModuleDataAny?.remedialTest?.id ||
    "";

  const activeIndex = activeStep
    ? flatSteps.findIndex((s) => s.id === activeStep.id)
    : -1;
  const prevStep = activeIndex > 0 ? flatSteps[activeIndex - 1] : null;
  const nextStep =
    activeIndex >= 0 && activeIndex < flatSteps.length - 1
      ? flatSteps[activeIndex + 1]
      : null;

  const { data: testAttempts } = useMyTestAttempts(activeStep?.moduleId ?? "", {
    enabled: activeStep?.kind === "DIAGNOSTIC" && !!activeStep?.moduleId,
  });

  const latestAttempt = useMemo(() => {
    if (!testAttempts?.attempts?.length) return null;
    return [...testAttempts.attempts].sort(
      (a, b) =>
        new Date(b.startedAt ?? 0).getTime() -
        new Date(a.startedAt ?? 0).getTime(),
    )[0];
  }, [testAttempts]);

  useEffect(() => {
    if (activeIndex > maxUnlockedIndex) {
      setMaxUnlockedIndex(activeIndex);
    }
  }, [activeIndex, maxUnlockedIndex]);

  const goTo = useCallback(
    (step: IFlatStep | null) => {
      if (!step) {
        showToast.success(
          "Selamat, Kamu menyelesaikan semua materi di kelas ini!",
        );

        if (slug) {
          router.push(
            `/student/dashboard/class/${encodeURIComponent(slug)}/materi`,
          );
        }

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      setSelectedStepId(step.id);
      setOpenModules((prev) => ({ ...prev, [step.moduleId]: true }));

      if (slug) {
        let targetUrl = `/student/dashboard/class/${encodeURIComponent(slug)}/materi/${step.moduleId}`;

        const queryParams = new URLSearchParams();
        queryParams.set("step", step.kind.toLowerCase());

        const queryString = queryParams.toString();
        if (queryString) {
          targetUrl += `?${queryString}`;
        }

        const currentFullUrl =
          window.location.pathname + window.location.search;

        if (currentFullUrl !== targetUrl) {
          router.push(targetUrl);
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      if (activeStep?.moduleId === contentId) {
        if (activeStep?.kind === "PDF") {
          markFileRead.mutate({ target: "SUBJECT" });
        }
      }
    },
    [contentId, slug, router, markFileRead, activeStep],
  );

  const handleVideoEnded = useCallback(() => {
    if (activeStep?.id) {
      setVideoFinished((prev) => ({ ...prev, [activeStep.id]: true }));
      markVideoWatched.mutate();
    }
  }, [activeStep?.id, markVideoWatched]);

  useEffect(() => {
    if (activeStep?.kind !== "VIDEO") return;
    if (!activeStep.url) return;
    if (videoFinished[activeStep.id]) return;

    if (!activeStep.url.includes("youtube.com/embed")) {
      setVideoFinished((prev) => ({ ...prev, [activeStep.id]: true }));
      markVideoWatched.mutate();
    }
  }, [
    activeStep?.id,
    activeStep?.kind,
    activeStep?.url,
    videoFinished,
    markVideoWatched,
  ]);

  useEffect(() => {
    if (activeStep?.kind !== "ELKPD") return;
    if (!activeStep.id) return;
    if (elkpdFinished[activeStep.id]) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setElkpdFinished((prev) => ({ ...prev, [activeStep.id]: true }));
          markFileRead.mutate({ target: "ELKPD" });
        }
      },
      { threshold: 1.0 },
    );

    const currentBottomRef = bottomRef.current;
    if (currentBottomRef) {
      observer.observe(currentBottomRef);
    }

    return () => {
      if (currentBottomRef) {
        observer.unobserve(currentBottomRef);
      }
      observer.disconnect();
    };
  }, [activeStep?.id, activeStep?.kind, elkpdFinished, markFileRead]);

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat materi...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#64748B]">
          Belum ada modul tersedia di kelas ini.
        </p>
      </div>
    );
  }

  const ActiveIcon = getStepIcon(activeStep?.kind ?? "PDF");
  const activeKind = activeStep?.kind ?? "PDF";
  const isPdf = activeKind === "PDF";
  const isVideo = activeKind === "VIDEO";
  const isElkpd = activeKind === "ELKPD";
  const isDiagnostic = activeKind === "DIAGNOSTIC";
  const isRemedial = activeKind === "REMEDIAL";

  return (
    <section className="min-h-screen rounded-3xl sm:p-3 lg:p-0">
      {emotionDetectionEnabled && isSubjectStep && emotionSupported && subjectEmotion.error && (
        <CameraRequiredScreen reason={subjectEmotion.error} />
      )}

      {emotionDetectionEnabled && (
        <video
          ref={subjectEmotion.videoRef}
          autoPlay
          playsInline
          muted
          className="pointer-events-none fixed -left-[9999px] top-0 h-60 w-80"
          aria-hidden="true"
        />
      )}

      {/* ---- Breadcrumb ---- */}
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-lottie-zinc-500">
        {breadcrumbItems.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="inline-flex items-center gap-2"
          >
            {i > 0 && <span className="text-lottie-fog">›</span>}
            {item.isCurrent ? (
              <span className="font-medium text-lottie-teal">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="font-medium text-lottie-zinc-500 transition hover:text-lottie-teal"
              >
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* ---- Grid: Content + Sidebar ---- */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div>
          <div className="overflow-hidden rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-lottie-teal to-lottie-teal/95 px-4 py-3 text-xs text-white/90">
              <div className="inline-flex items-center gap-3">
                <ActiveIcon className="h-4 w-4 text-white/80" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeStep?.title ?? "Pilih materi"}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {activeStep?.moduleTitle ?? ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-b-2xl bg-white border border-t-0 border-lottie-mist/60 p-4 sm:p-6 shadow-[rgba(31,35,117,0.02)]_0px_16px_32px_0px">
            {!activeStep ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lottie-teal/10 text-lottie-teal mb-4 shadow-xs">
                  <BookIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg  font-normal text-lottie-midnight">
                  Mulai Pembelajaran
                </h3>
                <p className="mt-2 max-w-sm text-sm text-lottie-zinc-500 leading-relaxed">
                  Silakan pilih modul materi atau tes di menu sidebar kanan
                  untuk memulai pembelajaran kelas ini.
                </p>
              </div>
            ) : (
              <>
                {isVideo && activeStep?.url && (
                  <>
                    <ContentBadge icon={VideoIcon} label="Video Pembelajaran" />
                    <div className="aspect-video overflow-hidden rounded-2xl border border-[#E2E8F0] bg-black">
                      {activeStep.url.includes("youtube.com/embed") ? (
                        <YoutubePlayer
                          key={activeStep.id}
                          iframeId={`Youtubeer-${activeStep.id}`}
                          url={activeStep.url}
                          title={activeStep.title}
                          onEnded={handleVideoEnded}
                        />
                      ) : (
                        <iframe
                          id={`Youtubeer-${activeStep.id}`}
                          key={activeStep.id}
                          src={activeStep.url}
                          title={activeStep.title}
                          className="h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </>
                )}

                {isPdf && activeStep?.url && (
                  <>
                    <ContentBadge icon={PDFIcon} label="Materi (PDF)" />
                    <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                      <iframe
                        key={activeStep.id}
                        src={activeStep.url}
                        title={activeStep.title}
                        className="h-full w-full border-0"
                        allow="fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </>
                )}

                {isElkpd && activeStep?.url && (
                  <>
                    <ContentBadge icon={DocumentIcon} label="E-LKPD" />
                    <div className="h-[80vh] min-h-[520px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                      <iframe
                        key={activeStep.id}
                        src={activeStep.url}
                        title={activeStep.title}
                        className="h-full w-full border-0"
                        allow="clipboard-write; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </>
                )}

                {isDiagnostic && (
                  <>
                    <ContentBadge
                      icon={CheckCircleIcon}
                      label="Tes Diagnostik"
                    />
                    <div className="rounded-2xl border border-lottie-mist bg-white p-6 shadow-xs">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lottie-zinc-500">
                        Tes Diagnostik
                      </p>
                      <h1 className="mt-1 font-semibold text-2xl  mantap font-normal text-lottie-midnight">
                        {activeStep?.title}
                      </h1>
                      {activeStep?.moduleTitle && (
                        <p className="mt-1 text-sm text-lottie-zinc-500">
                          Modul: {activeStep.moduleTitle}
                        </p>
                      )}

                      {latestAttempt && latestAttempt.completedAt && (
                        <div className="mt-4 rounded-xl border border-lottie-mist bg-lottie-pearl/50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-lottie-midnight">
                              Hasil Terakhir
                            </p>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                latestAttempt.isPassed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200",
                              )}
                            >
                              {latestAttempt.isPassed
                                ? "Tuntas"
                                : "Belum Tuntas"}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-6">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-lottie-zinc-500">
                                Skor
                              </p>
                              <p className="text-2xl  font-medium text-lottie-midnight">
                                {latestAttempt.score ?? 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-lottie-zinc-500">
                                Status
                              </p>
                              <p className="text-2xl  font-medium text-lottie-midnight">
                                {latestAttempt.isPassed
                                  ? "Lulus"
                                  : "Belum Lulus"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-lottie-zinc-500">
                                Tanggal
                              </p>
                              <p className="text-sm font-medium text-lottie-zinc-600">
                                {new Date(
                                  latestAttempt.startedAt ?? Date.now(),
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {slug &&
                        resolvedDiagnosticTestId &&
                        (() => {
                          const attemptCount =
                            testAttempts?.attempts?.length ?? 0;
                          const finishedAttemptCount =
                            testAttempts?.attempts?.filter(
                              (a) => !!a.completedAt,
                            )?.length ?? 0;
                          const hasPassed =
                            testAttempts?.attempts?.some((a) => a.isPassed) ??
                            false;

                          if (hasPassed) {
                            return (
                              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                                <CheckCircleIcon className="h-4 w-4" />
                                Kamu sudah lulus tes ini
                              </div>
                            );
                          }

                          if (finishedAttemptCount > 0) {
                            if (hasPassed || isRemedialCompleted) {
                              return (
                                <div className="mt-4">
                                  <Link
                                    href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/${encodeURIComponent(resolvedDiagnosticTestId)}`}
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-midnight transition hover:bg-lottie-pearl"
                                  >
                                    Lihat Hasil & Pembahasan
                                  </Link>
                                </div>
                              );
                            }

                            if (resolvedRemedialTestId) {
                              return (
                                <div className="mt-4 space-y-3">
                                  <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                                    Nilai kamu belum mencapai KKM.
                                  </div>
                                  <div className="flex gap-2">
                                    <Link
                                      href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/remedia/${encodeURIComponent(resolvedRemedialTestId)}`}
                                      className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 shadow-xs"
                                    >
                                      Kerjakan Tes Remedial
                                    </Link>
                                    <Link
                                      href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/${encodeURIComponent(resolvedDiagnosticTestId)}`}
                                      className="inline-flex h-11 items-center justify-center rounded-xl border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-midnight transition hover:bg-lottie-pearl"
                                    >
                                      Lihat Hasil & Pembahasan
                                    </Link>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-4 space-y-2">
                                  <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                                    Batas percobaan tes sudah habis (1/1)
                                  </div>
                                  <p className="text-xs text-lottie-zinc-500">
                                    Tidak ada tes remedial yang tersedia untuk
                                    modul ini. Hubungi guru kamu.
                                  </p>
                                </div>
                              );
                            }
                          }

                          return (
                            <Link
                              href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/${encodeURIComponent(resolvedDiagnosticTestId)}`}
                              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/95 shadow-xs"
                            >
                              {attemptCount > 0
                                ? "Lanjutkan Tes Diagnostik"
                                : "Mulai Tes Diagnostik"}
                            </Link>
                          );
                        })()}

                      {slug && !resolvedDiagnosticTestId && (
                        <p className="mt-4 text-sm font-medium text-[#DC2626]">
                          Tes diagnostik belum bisa dibuka karena ID diagnostik
                          tidak ditemukan.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isRemedial && (
                  <>
                    <ContentBadge icon={CheckCircleIcon} label="Tes Remedial" />
                    <div className="rounded-2xl border border-lottie-mist bg-white p-6 shadow-xs">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lottie-zinc-500">
                        Tes Remedial
                      </p>
                      <h1 className="mt-1 font-semibold text-2xl  mantap font-normal text-lottie-midnight">
                        {activeStep?.title}
                      </h1>
                      {activeStep?.moduleTitle && (
                        <p className="mt-1 text-sm text-lottie-zinc-500">
                          Modul: {activeStep.moduleTitle}
                        </p>
                      )}

                      {activeModuleDataAny?.remedialCompleted && (
                        <div className="mt-4 rounded-xl border border-lottie-mist bg-lottie-pearl/50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-lottie-midnight">
                              Hasil Terakhir
                            </p>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                activeModuleDataAny.remedialTest?.isPassed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200",
                              )}
                            >
                              {activeModuleDataAny.remedialTest?.isPassed
                                ? "Tuntas"
                                : "Belum Tuntas"}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-6">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-lottie-zinc-500">
                                Skor
                              </p>
                              <p className="text-2xl  font-medium text-lottie-midnight">
                                {activeModuleDataAny.remedialTest?.score ?? 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-lottie-zinc-500">
                                Status
                              </p>
                              <p className="text-2xl  font-medium text-lottie-midnight">
                                {activeModuleDataAny.remedialTest?.isPassed
                                  ? "Lulus"
                                  : "Belum Lulus"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {slug &&
                        resolvedRemedialTestId &&
                        (() => {
                          if (
                            isRemedialCompleted ||
                            activeModuleDataAny?.hasCompleted ||
                            activeModuleDataAny?.remedialCompleted
                          ) {
                            return (
                              <div className="mt-4">
                                <Link
                                  href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/remedia/${encodeURIComponent(resolvedRemedialTestId)}`}
                                  className="inline-flex h-11 items-center justify-center rounded-xl border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-midnight transition hover:bg-lottie-pearl"
                                >
                                  Lihat Hasil & Pembahasan
                                </Link>
                              </div>
                            );
                          }

                          return (
                            <div className="mt-4 space-y-2">
                              {latestAttempt && latestAttempt.isPassed && (
                                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Kamu sudah lulus tes diagnostik ini
                                </div>
                              )}
                              {latestAttempt && !latestAttempt.isPassed && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                  <p className="font-semibold">
                                    Skor Tes Diagnostik belum mencapai KKM (
                                    {activeModuleDataAny?.passingScore ?? 80}).
                                  </p>
                                  <p className="mt-1 text-xs text-rose-600">
                                    Silakan ikuti Tes Remedial di bawah ini
                                    untuk memperbaiki pemahaman materi Anda.
                                  </p>
                                </div>
                              )}
                              <Link
                                href={`/student/dashboard/class/${encodeURIComponent(slug)}/materi/${encodeURIComponent(activeStep?.moduleId ?? contentId)}/remedia/${encodeURIComponent(resolvedRemedialTestId)}`}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 duration-200"
                              >
                                Ikuti Tes Remedial
                              </Link>
                            </div>
                          );
                        })()}

                      {slug && !resolvedRemedialTestId && (
                        <p className="mt-4 text-sm font-medium text-[#DC2626]">
                          Tes remedial belum bisa dibuka karena ID remedial
                          tidak ditemukan.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {!activeStep?.url && !isDiagnostic && !isRemedial && (
                  <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-5">
                    <p className="text-sm text-[#64748B]">
                      Materi ini belum memiliki tautan yang dapat ditampilkan.
                    </p>
                  </div>
                )}

                <div ref={bottomRef} className="h-px w-full" />
              </>
            )}
          </div>

          {activeStep && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goTo(prevStep)}
                disabled={!prevStep}
                className="inline-flex h-11 items-center justify-center rounded-full border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←{" "}
                {prevStep ? `Sebelumnya: ${prevStep.typeLabel}` : "Sebelumnya"}
              </button>
              {activeIndex >= 0 && (
                <span className="text-sm font-semibold text-lottie-zinc-600">
                  {activeIndex + 1} / {flatSteps.length}
                </span>
              )}
              <button
                type="button"
                onClick={() => goTo(nextStep)}
                disabled={
                  isVideo && !nextStep && !videoFinished[activeStep?.id || ""]
                }
                className="inline-flex h-11 items-center justify-center rounded-full bg-lottie-teal px-5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(31,35,117,0.15)] transition hover:bg-lottie-teal/95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nextStep
                  ? `Selanjutnya: ${nextStep.typeLabel === "Tes Diagnostik" ? "Tes Diagnostik" : nextStep.typeLabel}`
                  : "Selesai"}{" "}
                →
              </button>
            </div>
          )}
        </div>

        {/* ==================== RIGHT SIDEBAR ==================== */}
        <aside className="sticky top-4 h-fit getmath-card p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-lottie-zinc-500">
            Daftar Modul
          </p>

          <div className="mt-3 overflow-hidden rounded-2xl bg-lottie-teal p-4 text-white shadow-[0px_12px_24px_rgba(31,35,117,0.2)]">
            <div className="flex flex-col gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90">
                  <BookIcon className="h-3 w-3" />
                  Materi Pembelajaran
                </p>
                <h1 className="mt-2  text-xl font-normal text-white">
                  Daftar Materi Kelas
                </h1>
                <p className="mt-1 text-xs text-white/70">
                  Pelajari semua modul secara berurutan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white/90">
                  {completedModules}/{totalModules} Modul Selesai
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white/90">
                  {completedStepsAll}/{totalStepsAll} Langkah
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] font-medium text-white/85">
                <span>Progres keseluruhan</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-lottie-mint-glow transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {modules.map((module, moduleIndex) => {
              const isOpen = openModules[module.id] !== false;
              const containsActive = module.steps.some(
                (s) => s.id === activeStep?.id,
              );

              return (
                <li
                  key={module.id}
                  className={cn(
                    "rounded-2xl bg-lottie-teal transition-all duration-200",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        containsActive
                          ? "bg-lottie-mint-glow text-white"
                          : "bg-white/10 text-white/90",
                      )}
                    >
                      {moduleIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {module.title}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {module.steps.length} langkah
                      </p>
                    </div>
                    <ChevronLeftIcon
                      className={cn(
                        "h-4 w-4 shrink-0 text-white/80 transition-transform",
                        isOpen ? "-rotate-90" : "rotate-90",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden min-h-0">
                      <ul className="space-y-1 border rounded-b-2xl bg-lottie-pearl p-2 border-lottie-teal/15">
                        {module.steps.map((step, stepIndex) => {
                          const StepIcon = getStepIcon(step.kind);
                          const tone = getStepTone(step.kind);
                          const isActive = activeStep?.id === step.id;
                          const isLocked = step.status === "locked";
                          const stepIsCompleted = step.status === "completed";
                          const stepIsInProgress =
                            step.status === "in-progress";

                          return (
                            <li key={step.id}>
                              {isLocked ? (
                                <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 opacity-40">
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                      tone.bg,
                                    )}
                                  >
                                    <StepIcon
                                      className={cn("h-4 w-4", tone.fg)}
                                    />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-lottie-zinc-500">
                                      {step.title}
                                    </p>
                                    <p className="text-xs text-lottie-fog">
                                      {step.typeLabel} · Terkunci
                                    </p>
                                  </div>
                                  <span className="text-xs text-lottie-fog">
                                    🔒
                                  </span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => goTo(step)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                                    isActive
                                      ? "border-lottie-teal/30 bg-lottie-teal/5 shadow-xs text-lottie-teal"
                                      : stepIsInProgress
                                        ? "border-lottie-teal/20 bg-lottie-teal/5 text-lottie-teal"
                                        : "border-transparent hover:border-lottie-mist hover:bg-white text-lottie-midnight",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                      tone.bg,
                                    )}
                                  >
                                    <StepIcon
                                      className={cn("h-4 w-4", tone.fg)}
                                    />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={cn(
                                        "truncate text-sm font-medium",
                                        isActive || stepIsInProgress
                                          ? "text-lottie-teal font-semibold"
                                          : "text-lottie-midnight",
                                      )}
                                    >
                                      {step.title}
                                    </p>
                                    <p className="text-xs text-lottie-zinc-500">
                                      {step.typeLabel} · Langkah {stepIndex + 1}
                                    </p>
                                  </div>
                                  {stepIsCompleted && (
                                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                                  )}
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
