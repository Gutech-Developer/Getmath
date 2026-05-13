"use client";

import Link from "next/link";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import StarIcon from "@/components/atoms/icons/StarIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import TrophyIcon from "@/components/atoms/icons/TrophyIcon";
import {
  LADBarChart,
  LADDonutChart,
  LADMetricCard,
  LADRadarChart,
  LADScoreTrendChart,
} from "@/components/molecules/classroom";
import { buildClassRoute } from "@/constant/classSidebarRoutes";
import { cn } from "@/libs/utils";
import { useGsChildCourseDetail } from "@/services/hooks/useGsParent";
import { useStudentDashboard } from "@/services/hooks/useGsDashboard";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";

/* ------------------------------------------------------------------ */
/*  Static data (akan diganti API)                                     */
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

const STUDY_TIME_DATA = [
  { subject: "Mat X", hours: 5, color: "#F59E0B" },
  { subject: "Mat XI", hours: 4, color: "#F59E0B" },
  { subject: "Statistika", hours: 3, color: "#F59E0B" },
];

const STUDY_TIME_LEGEND = [
  { label: "Mat X", time: "5j 25m" },
  { label: "Mat XI", time: "4j 40m" },
  { label: "Statistika", time: "3j 18m" },
];

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
/*  Props                                                              */
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
/*  Sub-components (atoms level usage)                                 */
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
        "rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0px_4px_16px_rgba(148,163,184,0.08)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-2">
        {icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-sm font-bold text-[#0F172A]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
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
  const { data: childCourseDetail, isLoading: isChildLoading } = useGsChildCourseDetail(
    studentId || "",
    courseId || ""
  );

  // Student Mode (Self)
  const { data: studentDashboard, isLoading: isStudentLoading } = useStudentDashboard(
    courseId || "",
    { enabled: !studentId && !!courseId }
  );

  const isLoading = isChildLoading || isStudentLoading;
  const classTitle = childCourseDetail?.course.courseName || studentDashboard?.courseName || formatClassTitleFromSlug(slug);
  const studentName = studentId ? studentNameProp : studentNameProp; // If parent mode, studentName is usually passed from dashboard
  const ladTitle = studentName ? `LAD – ${studentName}` : `LAD – ${classTitle}`;
  const resolvedBackHref = backHref ?? buildClassRoute(slug);
  const resolvedBackLabel = backLabel ?? "← Kembali ke Beranda Kelas";

  const progressPercent = studentId 
    ? (childCourseDetail?.totalSubjectModules ? Math.round((childCourseDetail.completedSubjectModules / childCourseDetail.totalSubjectModules) * 100) : 0)
    : studentDashboard?.progressPercent;
    
  const scoreTrendData = studentId 
    ? childCourseDetail?.diagnosticResults.map(d => ({
        date: new Date(d.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        nilai: d.score
      })).reverse() || []
    : SCORE_TREND_DATA;



  return (
    <ClassPageShellTemplate slug={slug} activeKey="lad" classTitle={classTitle}>
      {/* ---- Hero Header ---- */}
      <header className="relative overflow-hidden rounded-3xl bg-[#2563EB] p-6 text-white shadow-[0px_20px_40px_rgba(37,99,235,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Laporan Analitik Diagnostik
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">
              {ladTitle}
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {studentName
                ? "Lihat semua data: nilai, emosi, waktu belajar, dan rekomendasi AI untuk siswa ini."
                : "Lihat semua data: nilai, emosi, waktu belajar, dan rekomendasi AI untukmu."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              Peringkat Kelas
            </p>
            <p className="text-4xl font-black leading-none">#2</p>
            <p className="text-[11px] text-white/60">dari 28 siswa</p>
          </div>
        </div>
        {/* decorative circle */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      </header>

      {/* ---- Metric Cards ---- */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <LADMetricCard
          value={studentId ? `${progressPercent}%` : (studentDashboard?.progressPercent ? `${studentDashboard.progressPercent}%` : "0%")}
          label="Progres Belajar"
          sub="Dari materi dibaca"
          icon={TrendUpIcon}
          iconBg="bg-[#FEE2E2]"
          iconFg="text-[#EF4444]"
        />
        <LADMetricCard
          value={studentId ? `${childCourseDetail?.completedSubjectModules}/${childCourseDetail?.totalSubjectModules}` : "14j 35m"}
          label={studentId ? "Materi Selesai" : "Total Waktu Belajar"}
          sub={studentId ? "Modul dipelajari" : "6 sesi ini"}
          icon={ClockIcon}
          iconBg="bg-[#FEF3C7]"
          iconFg="text-[#D97706]"
        />
        <LADMetricCard
          value={studentId ? String(childCourseDetail?.diagnosticResults[0]?.score || 0) : (studentDashboard?.subjectModuleRead ? `${studentDashboard.subjectModuleRead}/${studentDashboard.subjectModuleTotal}` : "0/0")}
          label={studentId ? "Skor Terakhir" : "Materi Selesai"}
          sub={studentId ? "Tes diagnostik" : "Modul dibaca"}
          icon={TrophyIcon}
          iconBg="bg-[#D1FAE5]"
          iconFg="text-[#059669]"
        />
        <LADMetricCard
          value={studentId ? String(childCourseDetail?.diagnosticResults.length || 0) : (studentDashboard?.enrolledCount ? `#${studentDashboard.enrolledCount}` : "-")}
          label={studentId ? "Total Percobaan" : "Peringkat"}
          sub={studentId ? "Kali tes" : "Status kelas"}
          icon={StarIcon}
          iconBg="bg-[#FEF3C7]"
          iconFg="text-[#D97706]"
        />
      </div>

      {/* ---- Score Trend ---- */}
      <SectionCard
        title="Grafik Perkembangan Nilai"
        subtitle="Riwayat nilai dari semua tes diagnostik"
        icon={<TrendUpIcon className="h-4 w-4" />}
      >
        <LADScoreTrendChart data={scoreTrendData} />
      </SectionCard>

      {/* ---- Emotion Charts ---- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard
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
          <LADDonutChart segments={EMOTION_MATERI_DATA} />
        </SectionCard>

        <SectionCard
          title="Emosi saat Tes Diagnostik"
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
          <LADDonutChart segments={EMOTION_TES_DATA} />
        </SectionCard>
      </div>

      {/* ---- Study Time Bar Chart ---- */}
      <SectionCard
        title="Waktu Belajar per Kelas"
        icon={<ClockIcon className="h-4 w-4" />}
      >
        <LADBarChart data={STUDY_TIME_DATA} />
        <div className="mt-3 space-y-1">
          {STUDY_TIME_LEGEND.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[#475569]">{item.label}</span>
              <span className="font-semibold text-[#D97706]">{item.time}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ---- Radar + AI Summary ---- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Radar chart */}
        <SectionCard
          title="Radar Penguasaan Materi"
          subtitle="Berdasarkan nilai rata-rata per topik"
        >
          <LADRadarChart data={RADAR_DATA} />
        </SectionCard>

        {/* AI Summary */}
        <SectionCard
          title="Kesimpulan & Saran AI"
          icon={
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.295.02-.595.02-.9V10a4 4 0 10-8 0v3.1c0 .305.005.605.02.9H12z" />
            </svg>
          }
        >
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#334155]">
            {AI_SUMMARY}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Materi yang Perlu Diperdalam:
            </div>
            <div className="flex flex-wrap gap-2">
              {NEEDS_IMPROVEMENT.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E]"
                >
                  📚 {topic}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ---- Back link ---- */}
      <div className="flex justify-start">
        <Link
          href={resolvedBackHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
        >
          {resolvedBackLabel}
        </Link>
      </div>
    </ClassPageShellTemplate>
  );
}
