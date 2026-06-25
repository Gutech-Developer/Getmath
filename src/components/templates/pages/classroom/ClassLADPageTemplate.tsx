"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import StarIcon from "@/components/atoms/icons/StarIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import TrophyIcon from "@/components/atoms/icons/TrophyIcon";
import {
  LADBarChart,
  LADDonutChart,
  LADMetricCard,
} from "@/components/molecules/classroom";
import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { cn } from "@/libs/utils";
import { useGsChildCourseDetail } from "@/services/hooks/useGsParent";
import { useStudentDashboard } from "@/services/hooks/useGsDashboard";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";
import {
  useCourseSummary,
  useEmotionDistribution,
  useStudyTimeByModule,
  useActivityLogs,
} from "@/services/hooks/useLAD";
import {
  useGsCourseBySlug,
  useUserById,
  useGsModulesByCourse,
  useModuleProgressTable,
} from "@/services";
import type {
  IActivityLog,
  IRemedialAnswerCell,
  IRemedialDiscussionCell,
  IModuleProgressTableResponse,
} from "@/types/LAD";
import type { GsCourseModule } from "@/types/gs-course";

/* ------------------------------------------------------------------ */
/* Static data (akan diganti API)                                     */
/* ------------------------------------------------------------------ */
const SCORE_TREND_DATA = [
  { date: "21 Jan", nilai: 63 },
  { date: "23 Jan", nilai: 78 },
  { date: "26 Jan", nilai: 74 },
  { date: "29 Jan", nilai: 80 },
  { date: "3 Feb", nilai: 78 },
  { date: "7 Feb", nilai: 84 },
  { date: "10 Feb", nilai: 88 },
];

export const EMOTION_MATERI_DATA = [
  { label: "Fokus", value: 40, color: "#14B8A6" },
  { label: "Senang", value: 30, color: "#22C55E" },
  { label: "Bingung", value: 18, color: "#F59E0B" },
  { label: "Netral", value: 12, color: "#CBD5E1" },
];

const EMOTION_TES_DATA = [
  { label: "Fokus", value: 35, color: "#14B8A6" },
  { label: "Tegang", value: 28, color: "#EF4444" },
  { label: "Netral", value: 22, color: "#CBD5E1" },
  { label: "Bingung", value: 15, color: "#F59E0B" },
];

export const mapDistributionToSegments = (
  dist:
    | {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
      }
    | undefined,
) => {
  const fallback = [
    { label: "Netral", value: 0, color: "#10B981" },
    { label: "Senang", value: 0, color: "#8B5CF6" },
    { label: "Sedih", value: 0, color: "#3B82F6" },
    { label: "Marah", value: 0, color: "#F43F5E" },
    { label: "Takut", value: 0, color: "#F97316" },
    { label: "Sangat Tidak Suka", value: 0, color: "#94A3B8" },
    { label: "Terkejut", value: 0, color: "#06B6D4" },
  ];

  if (!dist) {
    return fallback;
  }

  return [
    { label: "Netral", value: dist.neutral || 0, color: "#10B981" },
    { label: "Senang", value: dist.happy || 0, color: "#8B5CF6" },
    { label: "Sedih", value: dist.sad || 0, color: "#3B82F6" },
    { label: "Marah", value: dist.angry || 0, color: "#F43F5E" },
    { label: "Takut", value: dist.fearful || 0, color: "#F97316" },
    {
      label: "Sangat Tidak Suka",
      value: dist.disgusted || 0,
      color: "#94A3B8",
    },
    { label: "Terkejut", value: dist.surprised || 0, color: "#06B6D4" },
  ];
};

const formatMsToHoursAndMinutes = (ms: number) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}j ${minutes}m`;
};

const formatLogDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateStr;
  }
};

const renderLogMessage = (log: IActivityLog) => {
  switch (log.action) {
    case "LOGIN": {
      const method = log.metadata?.method === "google" ? "Google" : "Password";
      return (
        <span>
          Masuk ke aplikasi menggunakan{" "}
          <span className="font-semibold text-[#0F172A]">{method}</span>
        </span>
      );
    }
    case "LOGOUT":
      return <span>Keluar dari aplikasi</span>;
    case "COURSE_ENROLLED":
      return (
        <span>
          Mendaftar ke kelas{" "}
          <span className="font-semibold text-[#2563EB]">
            {log.courseName || "Kelas"}
          </span>
        </span>
      );
    case "COURSE_OPENED":
      return (
        <span>
          Membuka kelas{" "}
          <span className="font-semibold text-[#2563EB]">
            {log.courseName || "Kelas"}
          </span>
        </span>
      );
    case "SUBJECT_MODULE_OPENED":
      return (
        <span>
          Membuka modul{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Materi"}
          </span>
        </span>
      );
    case "FILE_READ":
      return (
        <span>
          Membaca materi{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Dokumen"}
          </span>
        </span>
      );
    case "VIDEO_WATCHED":
      return (
        <span>
          Menonton video{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Video"}
          </span>
        </span>
      );
    case "ELKPD_SUBMITTED":
      return (
        <span>
          Mengirimkan E-LKPD{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tugas"}
          </span>
        </span>
      );
    case "DIAGNOSTIC_MODULE_OPENED":
      return (
        <span>
          Membuka halaman tes diagnostik{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tes"}
          </span>
        </span>
      );
    case "DIAGNOSTIC_STARTED":
      return (
        <span>
          Memulai tes diagnostik{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tes"}
          </span>
        </span>
      );
    case "DIAGNOSTIC_SUBMITTED": {
      const score = log.metadata?.score;
      return (
        <span>
          Menyelesaikan tes diagnostik{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tes"}
          </span>
          {score !== undefined && (
            <>
              {" "}
              dengan nilai{" "}
              <span className="font-bold text-[#10B981]">{score}</span>
            </>
          )}
        </span>
      );
    }
    case "REMEDIAL_STARTED":
      return (
        <span>
          Memulai tes remedial{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tes"}
          </span>
        </span>
      );
    case "REMEDIAL_COMPLETED": {
      const score = log.metadata?.score;
      return (
        <span>
          Menyelesaikan tes remedial{" "}
          <span className="font-semibold text-[#0F172A]">
            {log.moduleName || "Tes"}
          </span>
          {score !== undefined && (
            <>
              {" "}
              dengan nilai{" "}
              <span className="font-bold text-[#10B981]">{score}</span>
            </>
          )}
        </span>
      );
    }
    case "DISCUSSION_STARTED": {
      const title = log.metadata?.title || "diskusi baru";
      return (
        <span>
          Membuat diskusi baru:{" "}
          <span className="italic text-[#475569]">"{title}"</span>
        </span>
      );
    }
    case "DISCUSSION_COMMENTED":
      return <span>Mengomentari diskusi di forum</span>;
    case "DISCUSSION_LIKED":
      return <span>Menyukai diskusi di forum</span>;
    case "COMMENT_LIKED":
      return <span>Menyukai komentar di forum</span>;
    default:
      const words = log.action
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
      return <span>{words}</span>;
  }
};

const getLogIcon = (action: string) => {
  switch (action) {
    case "LOGIN":
    case "LOGOUT":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lottie-pearl text-lottie-zinc-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </span>
      );
    case "COURSE_ENROLLED":
    case "COURSE_OPENED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </span>
      );
    case "SUBJECT_MODULE_OPENED":
    case "FILE_READ":
    case "DIAGNOSTIC_MODULE_OPENED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>
      );
    case "VIDEO_WATCHED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
    case "DIAGNOSTIC_STARTED":
    case "REMEDIAL_STARTED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </span>
      );
    case "DIAGNOSTIC_SUBMITTED":
    case "REMEDIAL_COMPLETED":
    case "ELKPD_SUBMITTED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
    case "DISCUSSION_STARTED":
    case "DISCUSSION_COMMENTED":
    case "DISCUSSION_LIKED":
    case "COMMENT_LIKED":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </span>
      );
    default:
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lottie-pearl text-lottie-zinc-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
  }
};

const RADAR_DATA = [
  { subject: "Aljabar", value: 80 },
  { subject: "Fungsi", value: 70 },
  { subject: "Geometri", value: 60 },
  { subject: "Statistika", value: 55 },
  { subject: "Matriks", value: 45 },
  { subject: "Log Ka", value: 65 },
];

const NEEDS_IMPROVEMENT = [
  "Operasi Matriks",
  "Determinan & Invers Matriks",
  "Fungsi Kuadrat",
];

const AI_SUMMARY =
  "Kamu menunjukkan perkembangan yang sangat baik! Nilai terus meningkat dari 65 menjadi 88. Fokuslah lebih pada materi Matriks karena masih belum dibaca. Pertahankan semangat belajarmu! 🎉";

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
interface IClassLADPageTemplateProps {
  slug: string;
  courseId?: string;
  studentId?: string;
  studentName?: string;
  backHref?: string;
  backLabel?: string;
}

/* ------------------------------------------------------------------ */
/* Sub-components (atoms level usage)                                 */
/* ------------------------------------------------------------------ */
function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-lottie-mist bg-white p-5 shadow-xs",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-2">
        {icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lottie-teal/5 text-lottie-teal">
            {icon}
          </span>
        )}
        <div>
          <h2 className=" text-base font-normal text-lottie-midnight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-lottie-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
};

const translateEmotion = (emotion: string | null | undefined): string => {
  if (!emotion) return "-";
  switch (emotion.toLowerCase()) {
    case "happy":
      return "Senang";
    case "sad":
      return "Sedih";
    case "angry":
      return "Marah";
    case "fearful":
      return "Takut";
    case "disgusted":
      return "Jenuh";
    case "surprised":
      return "Terkejut";
    case "neutral":
      return "Netral";
    default:
      return emotion;
  }
};

const renderAnswerCell = (cell: IRemedialAnswerCell | null | undefined) => {
  if (!cell) return <span className="text-lottie-zinc-300">-</span>;
  const option = cell.selectedOption ?? "Kosong";
  return (
    <span
      className={cn(
        "font-semibold text-[11px]",
        cell.isCorrect ? "text-emerald-600" : "text-rose-600",
      )}
    >
      {option} ({cell.isCorrect ? "BENAR" : "SALAH"})
    </span>
  );
};

const renderDiscussionCell = (
  cell: IRemedialDiscussionCell | null | undefined,
) => {
  if (!cell) return <span className="text-lottie-zinc-300">-</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {formatDuration(cell.durationMs)}
      {cell.isEstimated && (
        <span
          className="text-[10px] font-bold text-amber-500 cursor-help"
          title="Estimasi berdasarkan selisih waktu pengerjaan"
        >
          *
        </span>
      )}
    </span>
  );
};

const renderEmotionCell = (emotion: string | null | undefined) => {
  if (!emotion) return <span className="text-lottie-zinc-300">-</span>;
  return <span className="text-[11px]">{translateEmotion(emotion)}</span>;
};

/* ------------------------------------------------------------------ */
/* Accordion Sub-components for Diagnostic Progress                  */
/* ------------------------------------------------------------------ */

interface IDiagnosticAccordionContentProps {
  moduleId: string;
  studentId?: string;
}

function DiagnosticAccordionContent({
  moduleId,
  studentId,
}: IDiagnosticAccordionContentProps) {
  const {
    data: progressTable,
    isLoading,
    error,
  } = useModuleProgressTable(moduleId, studentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-lottie-teal border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center text-rose-600 text-sm">
        Gagal memuat data progress: {error.message}
      </div>
    );
  }

  if (!progressTable) {
    return (
      <div className="rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-5 text-center text-lottie-zinc-500 text-sm">
        Gagal memuat data progress.
      </div>
    );
  }

  if (!progressTable.diagnostic) {
    return (
      <div className="rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-5 text-center text-lottie-zinc-500 text-sm">
        {studentId
          ? "Siswa belum mengerjakan tes diagnostik ini."
          : "Anda belum mengerjakan tes diagnostik ini."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-lottie-pearl/50 border border-lottie-mist rounded-xl p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-lottie-zinc-400">
            Nama Tes
          </p>
          <p className="text-sm font-semibold text-lottie-midnight mt-0.5">
            {progressTable.diagnostic.testName}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-lottie-zinc-400">
            Nilai Diagnostik
          </p>
          <p
            className={`text-sm font-extrabold mt-0.5 ${progressTable.diagnostic.isPassed ? "text-emerald-600" : "text-rose-600"}`}
          >
            {progressTable.diagnostic.score !== null
              ? `${progressTable.diagnostic.score} / 100`
              : "Belum Bernilai"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-lottie-zinc-400">
            Status Diagnostik
          </p>
          <div className="mt-0.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                progressTable.diagnostic.isPassed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {progressTable.diagnostic.isPassed ? "Lulus" : "Remedial"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Data (Tabel Remedial jika isRemedial === true) */}
      {progressTable.isRemedial ? (
        progressTable.remedial ? (
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-xl border border-lottie-mist bg-white">
              <table className="w-full min-w-[1000px] border-collapse text-left text-xs text-lottie-midnight">
                <thead className="bg-lottie-pearl border-b border-lottie-mist font-semibold text-lottie-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-3 text-center w-[70px]">No Soal</th>
                    <th
                      className="px-3 py-3 text-center border-l border-lottie-mist"
                      colSpan={3}
                    >
                      Jawaban Paket
                    </th>
                    <th
                      className="px-3 py-3 text-center border-l border-lottie-mist"
                      colSpan={3}
                    >
                      Durasi Soal
                    </th>
                    <th
                      className="px-3 py-3 text-center border-l border-lottie-mist"
                      colSpan={2}
                    >
                      Durasi Diskusi Pembahasan
                    </th>
                    <th
                      className="px-3 py-3 text-center border-l border-lottie-mist"
                      colSpan={3}
                    >
                      Emosi Dominan
                    </th>
                  </tr>
                  <tr className="border-t border-lottie-mist bg-lottie-pearl/50 text-[10px]">
                    <th></th>
                    {/* Jawaban */}
                    <th className="px-3 py-2 text-center border-l border-lottie-mist">
                      Paket A
                    </th>
                    <th className="px-3 py-2 text-center">Paket B</th>
                    <th className="px-3 py-2 text-center">Paket C</th>
                    {/* Durasi */}
                    <th className="px-3 py-2 text-center border-l border-lottie-mist">
                      Paket A
                    </th>
                    <th className="px-3 py-2 text-center">Paket B</th>
                    <th className="px-3 py-2 text-center">Paket C</th>
                    {/* Durasi Pembahasan */}
                    <th className="px-3 py-2 text-center border-l border-lottie-mist">
                      Paket A
                    </th>
                    <th className="px-3 py-2 text-center">Paket B</th>
                    {/* Emosi */}
                    <th className="px-3 py-2 text-center border-l border-lottie-mist">
                      Paket A
                    </th>
                    <th className="px-3 py-2 text-center">Paket B</th>
                    <th className="px-3 py-2 text-center">Paket C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lottie-mist bg-white">
                  {progressTable.remedial.rows.map((row) => (
                    <tr
                      key={row.questionId}
                      className="hover:bg-lottie-pearl/30 transition-colors"
                    >
                      <td className="px-3 py-3 text-center font-medium text-lottie-zinc-600">
                        {row.questionNumber}
                      </td>

                      {/* Jawaban */}
                      <td className="px-3 py-3 text-center border-l border-lottie-mist">
                        {renderAnswerCell(row.packages.a)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {renderAnswerCell(row.packages.b)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {renderAnswerCell(row.packages.c)}
                      </td>

                      {/* Durasi Soal */}
                      <td className="px-3 py-3 text-center border-l border-lottie-mist text-lottie-zinc-500 font-mono">
                        {formatDuration(row.packages.a?.durationMs)}
                      </td>
                      <td className="px-3 py-3 text-center text-lottie-zinc-500 font-mono">
                        {formatDuration(row.packages.b?.durationMs)}
                      </td>
                      <td className="px-3 py-3 text-center text-lottie-zinc-500 font-mono">
                        {formatDuration(row.packages.c?.durationMs)}
                      </td>

                      {/* Durasi Pembahasan */}
                      <td className="px-3 py-3 text-center border-l border-lottie-mist text-lottie-zinc-500 font-mono">
                        {renderDiscussionCell(row.discussions.a)}
                      </td>
                      <td className="px-3 py-3 text-center text-lottie-zinc-500 font-mono">
                        {renderDiscussionCell(row.discussions.b)}
                      </td>

                      {/* Emosi */}
                      <td className="px-3 py-3 text-center border-l border-lottie-mist text-lottie-zinc-600">
                        {renderEmotionCell(row.packages.a?.emotionMode)}
                      </td>
                      <td className="px-3 py-3 text-center text-lottie-zinc-600">
                        {renderEmotionCell(row.packages.b?.emotionMode)}
                      </td>
                      <td className="px-3 py-3 text-center text-lottie-zinc-600">
                        {renderEmotionCell(row.packages.c?.emotionMode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-lottie-zinc-500">
              * Durasi A/B bertanda bintang (*) merupakan estimasi berdasarkan
              selisih waktu pengerjaan soal paket berikutnya (historical data).
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-5 text-center text-lottie-zinc-500 text-sm">
            Sesi remedial belum dimulai.
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-lottie-teal/20 bg-lottie-teal/5 p-4 text-center text-lottie-teal text-sm font-medium flex items-center justify-center gap-2">
          <span>🎉</span>
          <span>
            {studentId
              ? "Siswa tidak masuk sesi remedial karena telah lulus KKM pada Tes Diagnostik."
              : "Anda tidak masuk sesi remedial karena telah lulus KKM pada Tes Diagnostik."}
          </span>
        </div>
      )}
    </div>
  );
}

interface IDiagnosticAccordionItemProps {
  module: GsCourseModule | any;
  studentId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function DiagnosticAccordionItem({
  module,
  studentId,
  isOpen,
  onToggle,
}: IDiagnosticAccordionItemProps) {
  const [hasOpened, setHasOpened] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
    }
  }, [isOpen]);

  const testName =
    module.testName || module.diagnosticTest?.testName || "Tes Diagnostik";

  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden bg-white shadow-xs transition-all duration-300",
        isOpen
          ? "border-lottie-teal/40 ring-1 ring-lottie-teal/10"
          : "border-lottie-mist",
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left font-semibold text-sm transition-all duration-300",
          isOpen
            ? "bg-lottie-teal/5 text-lottie-teal"
            : "bg-white text-lottie-midnight hover:bg-lottie-pearl/50",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-300",
              isOpen
                ? "bg-lottie-teal/15 text-lottie-teal"
                : "bg-lottie-zinc-100 text-lottie-zinc-500",
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </span>
          <span>{testName}</span>
        </div>
        <span
          className={cn(
            "transform transition-transform duration-300",
            isOpen
              ? "rotate-180 text-lottie-teal"
              : "rotate-0 text-lottie-zinc-400",
          )}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className={cn(
              "p-4 sm:p-5 border-t border-lottie-mist bg-white transition-all duration-300",
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
            )}
          >
            {hasOpened && (
              <DiagnosticAccordionContent
                moduleId={module.id || (module as any).courseModuleId}
                studentId={studentId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClassLADPageTemplate({
  slug,
  courseId,
  studentId,
  studentName: studentNameProp,
  backHref,
  backLabel,
}: IClassLADPageTemplateProps) {
  // Parent Mode
  const { data: course, isLoading: isCourseSlugLoading } =
    useGsCourseBySlug(slug);
  const resolvedCourseId = course?.id || courseId || "";

  const { data: childCourseDetail, isLoading: isChildLoading } =
    useGsChildCourseDetail(studentId || "", resolvedCourseId);

  // Student Mode (Self)
  const { data: studentDashboard, isLoading: isStudentLoading } =
    useStudentDashboard(resolvedCourseId, {
      enabled: !studentId && !!resolvedCourseId,
    });

  // Perbaikan: Menambahkan parameter opsi { enabled: !!resolvedCourseId } agar menunggu ID didapatkan dari slug

  const {
    data: courseSummary,
    isPending: courseSummaryPending,
    error: courseSummaryError,
  } = useCourseSummary(resolvedCourseId, studentId);
  const {
    data: emotionDistribution,
    isPending: emotionDistributionPending,
    error: emotionDistributionError,
  } = useEmotionDistribution(resolvedCourseId, studentId);
  const {
    data: studyTimeByModule,
    isPending: studyTimeByModulePending,
    error: studyTimeByModuleError,
  } = useStudyTimeByModule(resolvedCourseId, studentId);

  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_LIMIT = 5;

  const { data: activityLogsData, isPending: activityLogsPending } =
    useActivityLogs(resolvedCourseId, studentId, activityPage, ACTIVITY_LIMIT);

  // Load course modules to locate diagnostic test module IDs
  const { data: modules, isLoading: isModulesLoading } =
    useGsModulesByCourse(resolvedCourseId);

  const diagnosticModules = useMemo(() => {
    if (childCourseDetail?.modules && childCourseDetail.modules.length > 0) {
      return childCourseDetail.modules
        .filter((m) => m.type === "DIAGNOSTIC_TEST")
        .map((m) => ({
          id: m.courseModuleId,
          courseModuleId: m.courseModuleId,
          type: "DIAGNOSTIC_TEST" as const,
          testName: m.testName || "Tes Diagnostik",
          title: m.testName || "Tes Diagnostik",
          order: m.order,
        }));
    }
    return (modules || []).filter((m) => m.type === "DIAGNOSTIC_TEST");
  }, [modules, childCourseDetail]);

  const [expandedDiagnosticId, setExpandedDiagnosticId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (diagnosticModules.length > 0 && expandedDiagnosticId === null) {
      setExpandedDiagnosticId(
        diagnosticModules[0].id || (diagnosticModules[0] as any).courseModuleId,
      );
    }
  }, [diagnosticModules, expandedDiagnosticId]);

  const isLoading =
    isCourseSlugLoading ||
    isChildLoading ||
    isStudentLoading ||
    courseSummaryPending ||
    emotionDistributionPending ||
    studyTimeByModulePending ||
    activityLogsPending ||
    isModulesLoading;

  const classTitle =
    childCourseDetail?.course.courseName ||
    studentDashboard?.courseName ||
    formatClassTitleFromSlug(slug);

  const studentName = studentNameProp;
  const ladTitle = studentId ? `LAD – ${studentName}` : `LAD – ${classTitle}`;
  const resolvedBackHref = backHref ?? buildClassRoute(slug);
  const resolvedBackLabel = backLabel ?? "← Kembali ke Beranda Kelas";

  const progressPercent = studentId
    ? childCourseDetail?.totalSubjectModules
      ? Math.round(
          (childCourseDetail.completedSubjectModules /
            childCourseDetail.totalSubjectModules) *
            100,
        )
      : 0
    : (studentDashboard?.progressPercent ??
       (studentDashboard as any)?.progress_percent ??
       (studentDashboard as any)?.progress ??
       (studentDashboard as any)?.averageProgress ??
       (studentDashboard as any)?.average_progress ??
       0);

  const scoreTrendData = studentId
    ? (childCourseDetail?.diagnosticResults || [])
        .map((d) => ({
          date: new Date(d.completedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          nilai: d.score,
        }))
        .reverse()
    : SCORE_TREND_DATA;

  const totalMs = courseSummary?.totalStudyTimeMs || 0;
  const totalMinutes = Math.floor(totalMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const stringTotalWaktu = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

  const rawStudyTimeList = studyTimeByModule
    ? Array.isArray(studyTimeByModule)
      ? studyTimeByModule
      : studyTimeByModule.data
    : [];

  const barChartData = rawStudyTimeList.map((item) => ({
    subject: item.subjectName,
    hours: parseFloat((item.studyTimeMs / 3600000).toFixed(2)),
    color: "#F59E0B",
  }));

  const barChartLegend = rawStudyTimeList.map((item) => ({
    label: item.subjectName,
    time: formatMsToHoursAndMinutes(item.studyTimeMs),
  }));

  return (
    <ClassPageShellTemplate slug={slug} activeKey="lad" classTitle={classTitle}>

    
      {/* ---- Hero Header ---- */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-6 text-white shadow-[0px_16px_32px_rgba(31,35,117,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/75">
              Laporan Analitik
            </p>
            <h1 className="mt-1 font-semibold text-2xl  mantap font-normal leading-tight">
              {ladTitle}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {studentName
                ? "Lihat semua data: nilai, emosi, dan waktu belajar untuk siswa ini."
                : "Lihat semua data: nilai, emosi, dan waktu belajar untukmu."}
            </p>
          </div>
        </div>
        {/* decorative circle */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      </header>
         <div className="flex justify-start">
        <Link
          href={resolvedBackHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-lottie-mist bg-white px-4 py-2.5 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl"
        >
          {resolvedBackLabel}
        </Link>
      </div>

      {/* ---- Metric Cards ---- */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {/* Card 1: Progres Belajar */}
        <LADMetricCard
          value={`${courseSummary?.progressPercent || 0}%`}
          label="Progres Belajar"
          sub="Dari materi dibaca"
          icon={TrendUpIcon}
          iconBg="bg-rose-50"
          iconFg="text-rose-600"
        />

        {/* Card 2: Waktu Belajar */}
        <LADMetricCard
          value={stringTotalWaktu}
          label={"Total Waktu Belajar"}
          sub={"Semua sesi belajar"}
          icon={ClockIcon}
          iconBg="bg-amber-50"
          iconFg="text-amber-600"
        />

        {/* Card 3: Materi Selesai */}
        <LADMetricCard
          value={`${courseSummary?.completedMaterials || 0}/${courseSummary?.totalMaterials || 0}`}
          label={"Materi Selesai"}
          sub={"Modul dibaca"}
          icon={TrophyIcon}
          iconBg="bg-emerald-50"
          iconFg="text-emerald-600"
        />

        {/* Card 4: Peringkat */}
        <LADMetricCard
          value={
            studentDashboard?.enrolledCount
              ? `#${studentDashboard.enrolledCount}`
              : "-"
          }
          label={"Peringkat"}
          sub={"Status kelas"}
          icon={StarIcon}
          iconBg="bg-blue-50"
          iconFg="text-blue-600"
        />
      </div>

      {/* ---- Diagnostic & Remedial Progress Table ---- */}
      <SectionCard
        title="Progres Tes Diagnostik & Remedial"
        subtitle="Detail pengerjaan soal diagnostik dan tabel progress remedial siswa"
        icon={
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      >
        {diagnosticModules.length === 0 ? (
          <div className="rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-5 text-center text-lottie-zinc-500 text-sm">
            Tidak ada modul Tes Diagnostik yang tersedia di kelas ini.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {diagnosticModules.map((m) => {
              const mId = m.id || (m as any).courseModuleId;
              return (
                <DiagnosticAccordionItem
                  key={mId}
                  module={m}
                  studentId={studentId}
                  isOpen={expandedDiagnosticId === mId}
                  onToggle={() => {
                    setExpandedDiagnosticId((prev) =>
                      prev === mId ? null : mId,
                    );
                  }}
                />
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ---- Emotion Charts ---- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        {/* <SectionCard
          title="Emosi saat Membaca Materi"
          icon={
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <LADDonutChart
            segments={mapDistributionToSegments(
              emotionDistribution?.moduleLearning?.distribution,
            )}
          />
        </SectionCard> */}

        <SectionCard
          title="Emosi Saat Menjawab Remedial"
          icon={
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <LADDonutChart
            segments={mapDistributionToSegments(
              emotionDistribution?.remedial?.distribution,
            )}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Waktu Belajar per Kelas"
        icon={<ClockIcon className="h-4 w-4" />}
      >
        <LADBarChart data={barChartData} />
        {barChartLegend.length === 0 ? (
          <div className="mt-3 text-center text-sm text-lottie-zinc-500 italic">
            Belum ada data waktu belajar
          </div>
        ) : (
          <div className="mt-3 space-y-1">
            {barChartLegend.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-lottie-zinc-600">{item.label}</span>
                <span className="font-semibold text-amber-600">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ---- Activity Logs Section ---- */}
      <SectionCard
        title="Log Aktivitas"
        subtitle="Riwayat aktivitas belajar siswa di platform"
        icon={
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1 1 0 100-2 1 1 0 000 2zm3.5-1a1 1 0 100 2h3a1 1 0 100-2H10zm-3.5 4a1 1 0 100-2 1 1 0 000 2zm3.5-1a1 1 0 100 2h3a1 1 0 100-2H10z"
              clipRule="evenodd"
            />
          </svg>
        }
        className="mt-4"
      >
        {activityLogsPending ? (
          <div className="flex h-32 items-center justify-center text-sm text-lottie-zinc-500">
            Memuat log aktivitas...
          </div>
        ) : !activityLogsData?.logs || activityLogsData.logs.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-sm text-lottie-zinc-500 italic">
            Belum ada aktivitas yang tercatat
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-lottie-mist/50">
              {activityLogsData.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  {getLogIcon(log.action)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-lottie-midnight">
                      {renderLogMessage(log)}
                    </div>
                    <p className="mt-0.5 text-xs text-lottie-zinc-500">
                      {formatLogDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {activityLogsData.pagination &&
              activityLogsData.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-lottie-mist/50 pt-4">
                  <button
                    onClick={() =>
                      setActivityPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={!activityLogsData.pagination.hasPrevPage}
                    className="rounded-xl border border-lottie-mist bg-white px-3 py-1.5 text-xs font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-lottie-zinc-500">
                    Halaman {activityLogsData.pagination.currentPage} dari{" "}
                    {activityLogsData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setActivityPage((prev) =>
                        Math.min(
                          prev + 1,
                          activityLogsData.pagination.totalPages,
                        ),
                      )
                    }
                    disabled={!activityLogsData.pagination.hasNextPage}
                    className="rounded-xl border border-lottie-mist bg-white px-3 py-1.5 text-xs font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
          </div>
        )}
      </SectionCard>

      {/* ---- Back link ---- */}
     
    </ClassPageShellTemplate>
  );
}
