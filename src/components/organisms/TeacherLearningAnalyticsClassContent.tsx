"use client";

import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import {
  BaseInitSection,
  BaseKelolaELKPDSection,
  BaseLaporanSection,
  BaseMateriSection,
  BaseSiswaSection,
  ClassAnalyticsViewType,
  IClassAnalyticsReportSummaryCard,
  ILearningAnalyticsELKPDItem,
  ILearningAnalyticsEmotionSegment,
  ILearningAnalyticsHeaderCardData,
  ILearningAnalyticsMaterialItem,
  ILearningAnalyticsScoreBucket,
  LearningAnalyticsClassHeaderCard,
  LearningAnalyticsViewSwitcher,
} from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import { cn } from "@/libs/utils";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface ITeacherStudentAnalyticsItem {
  id: string;
  fullname: string;
  nis: string;
  score: number;
  status: "Lulus" | "Remedial";
}

export interface ITeacherClassLearningAnalyticsDetail {
  slug: string;
  className: string;
  teacherName: string;
  studentCount: number;
  averageScore: number;
  passedCount: number;
  remedialCount: number;
  progress: number;
  classCode?: string;
  gradeLabel?: string;
  semesterLabel?: string;
  subjectLabel?: string;
  defaultViewType?: ClassAnalyticsViewType;
  students: ITeacherStudentAnalyticsItem[];
  materials?: ILearningAnalyticsMaterialItem[];
  elkpdItems?: ILearningAnalyticsELKPDItem[];
  reportSummaryCards?: IClassAnalyticsReportSummaryCard[];
  scoreBuckets?: ILearningAnalyticsScoreBucket[];
  emotionSegments?: ILearningAnalyticsEmotionSegment[];
}

interface ITeacherLearningAnalyticsClassContentProps {
  classDetail: ITeacherClassLearningAnalyticsDetail;
  buildStudentDetailHref?: (studentId: string) => string;
}

interface ITeacherSidebarItem {
  type: ClassAnalyticsViewType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

interface ITeacherOverviewSectionProps {
  classDetail: ITeacherClassLearningAnalyticsDetail;
  materials: ILearningAnalyticsMaterialItem[];
}

interface IRecentActivityItem {
  id: string;
  text: string;
  timeLabel: string;
}

const TEACHER_VIEW_ITEMS: ITeacherSidebarItem[] = [
  {
    type: "Beranda",
    label: "Beranda",
    icon: DashboardIcon,
  },
  {
    type: "Siswa",
    label: "Siswa",
    icon: ThreeUserGroupIcon,
  },
  {
    type: "Materi",
    label: "Materi",
    icon: NotebookIcon,
  },
  {
    type: "Kelola E-LKPD",
    label: "Kelola E-LKPD",
    icon: ClipboardIcon,
  },
  {
    type: "Laporan",
    label: "Laporan",
    icon: TrendUpIcon,
  },
];

function buildDefaultScoreBuckets(
  students: ITeacherStudentAnalyticsItem[],
): ILearningAnalyticsScoreBucket[] {
  const bucketConfig = [
    { label: "< 50", min: Number.NEGATIVE_INFINITY, max: 49, color: "#94A3B8" },
    { label: "50-64", min: 50, max: 64, color: "#F59E0B" },
    { label: "65-74", min: 65, max: 74, color: "#EAB308" },
    { label: "75-84", min: 75, max: 84, color: "#22C55E" },
    {
      label: "85-100",
      min: 85,
      max: Number.POSITIVE_INFINITY,
      color: "#3B82F6",
    },
  ];

  return bucketConfig.map((bucket) => ({
    label: bucket.label,
    color: bucket.color,
    value: students.filter(
      (student) => student.score >= bucket.min && student.score <= bucket.max,
    ).length,
  }));
}

function buildDefaultEmotionSegments(
  students: ITeacherStudentAnalyticsItem[],
): ILearningAnalyticsEmotionSegment[] {
  const totalStudents = students.length;
  const passedCount = students.filter(
    (student) => student.status === "Lulus",
  ).length;
  const remedialCount = totalStudents - passedCount;

  return [
    {
      label: "Fokus",
      value: Math.max(1, passedCount),
      color: "#3B82F6",
    },
    {
      label: "Senang",
      value: Math.max(1, Math.round(passedCount * 0.6)),
      color: "#22C55E",
    },
    {
      label: "Bingung",
      value: Math.max(1, Math.round(remedialCount * 0.8)),
      color: "#F59E0B",
    },
    {
      label: "Tegang",
      value: Math.max(1, remedialCount),
      color: "#EF4444",
    },
  ];
}

function createDefaultMaterials(
  className: string,
): ILearningAnalyticsMaterialItem[] {
  return [
    {
      id: "material-1",
      title: `Pengantar ${className}`,
      updatedAt: "12 Apr 2026",
      type: "Materi",
      status: "Aktif",
    },
    {
      id: "material-2",
      title: "Latihan Soal Terstruktur",
      updatedAt: "09 Apr 2026",
      type: "Tes",
      status: "Aktif",
    },
    {
      id: "material-3",
      title: "Video Pembahasan Konsep",
      updatedAt: "07 Apr 2026",
      type: "Video",
      status: "Draft",
    },
  ];
}

function createDefaultELKPDItems(): ILearningAnalyticsELKPDItem[] {
  return [
    {
      id: "elkpd-1",
      title: "E-LKPD 1 - Pemahaman Konsep",
      dueLabel: "18 Apr 2026",
      submittedCount: 18,
      status: "Aktif",
    },
    {
      id: "elkpd-2",
      title: "E-LKPD 2 - Soal Aplikasi",
      dueLabel: "24 Apr 2026",
      submittedCount: 9,
      status: "Aktif",
    },
    {
      id: "elkpd-3",
      title: "E-LKPD 3 - Refleksi Akhir",
      dueLabel: "31 Mar 2026",
      submittedCount: 28,
      status: "Ditutup",
    },
  ];
}

function TeacherOverviewSection({
  classDetail,
  materials,
}: ITeacherOverviewSectionProps) {
  const activeStudents = Math.max(
    Math.round(classDetail.studentCount * 0.4),
    Math.min(classDetail.studentCount, classDetail.students.length),
  );

  const moduleCount = Math.max(materials.length + 1, 4);

  const recentActivities = useMemo<IRecentActivityItem[]>(() => {
    const firstStudent = classDetail.students[0];
    const secondStudent = classDetail.students[1];
    const thirdStudent = classDetail.students[2];
    const fourthStudent = classDetail.students[3];

    return [
      {
        id: "activity-1",
        text: `${firstStudent?.fullname ?? "Siswa"} menyelesaikan Tes Diagnostik 2 dengan nilai ${firstStudent?.score ?? classDetail.averageScore}`,
        timeLabel: "5 menit lalu",
      },
      {
        id: "activity-2",
        text: `${secondStudent?.fullname ?? "Siswa"} bertanya di Forum Diskusi ${classDetail.classCode ?? classDetail.className}`,
        timeLabel: "12 menit lalu",
      },
      {
        id: "activity-3",
        text: `${thirdStudent?.fullname ?? "Siswa"} bergabung ke kelas ${classDetail.className}`,
        timeLabel: "1 jam lalu",
      },
      {
        id: "activity-4",
        text: `${fourthStudent?.fullname ?? "Siswa"} memerlukan video remedial di soal no. 4`,
        timeLabel: "3 jam lalu",
      },
    ];
  }, [
    classDetail.averageScore,
    classDetail.classCode,
    classDetail.className,
    classDetail.students,
  ]);

  return (
    <section className="space-y-4">
      <article className="overflow-hidden rounded-2xl bg-linear-to-r from-[#2563EB] to-[#2563EB]/90 px-4 py-4 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] md:px-5 md:py-5">
        <p className="text-sm font-medium text-white/75">Dashboard Analitik</p>
        <h2 className="mt-1 text-xl font-bold leading-tight md:text-2xl">
          Mau lihat hasil analisis siswa kelas {classDetail.className}?
        </h2>
        <p className="mt-1.5 text-sm text-white/80">
          Pantau perkembangan nilai, emosi belajar, dan progres seluruh siswa di
          kelas ini sekarang.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="?view=Laporan"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Analisis Keseluruhan Kelas
          </Link>
          <Link
            href="?view=Siswa"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1E40AF]"
          >
            Analisis Per Siswa
          </Link>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#2563EB]">
            {activeStudents}/{classDetail.studentCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Siswa Aktif</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#16A34A]">
            {moduleCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Modul Tersusun</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#4F46E5]">
            {Math.round(classDetail.averageScore)}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Rata-Rata Nilai</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#DC2626]">
            {classDetail.remedialCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Butuh Remedial</p>
        </article>
      </div>

      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
        <h3 className="text-sm font-semibold text-[#111827]">
          Aktivitas Terkini
        </h3>
        <div className="mt-3 space-y-2.5">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2.5">
              <span className="mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border border-[#D1D5DB] bg-[#F3F4F6]" />
              <div>
                <p className="text-sm text-[#334155]">{activity.text}</p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  {activity.timeLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function resolveTeacherViewType(
  value: string | null,
): ClassAnalyticsViewType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return TEACHER_VIEW_ITEMS.some((item) => item.type === normalized)
    ? (normalized as ClassAnalyticsViewType)
    : undefined;
}

const TEACHER_VIEW_TABS = TEACHER_VIEW_ITEMS.map((item) => ({
  key: item.type,
  label: item.label,
}));

export default function TeacherLearningAnalyticsClassContent({
  classDetail,
  buildStudentDetailHref,
}: ITeacherLearningAnalyticsClassContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryView = searchParams?.get("view");
  const activeViewType =
    resolveTeacherViewType(queryView) ??
    classDetail.defaultViewType ??
    "Beranda";

  const defaultSummaryCards: IClassAnalyticsReportSummaryCard[] =
    useMemo(() => {
      const finishedTests = classDetail.students.length;
      const passRate = Math.round(
        (classDetail.passedCount / Math.max(classDetail.studentCount, 1)) * 100,
      );

      return [
        {
          label: "Total Siswa",
          value: String(classDetail.studentCount),
        },
        {
          label: "Sudah Masuk Kelas",
          value: String(classDetail.studentCount),
          hint: `dari ${classDetail.studentCount}`,
        },
        {
          label: "Selesai Tes",
          value: String(finishedTests),
          hint: `dari ${classDetail.studentCount}`,
        },
        {
          label: "Tingkat Kelulusan",
          value: `${passRate}%`,
          valueClassName: "text-[#F97316]",
        },
      ];
    }, [
      classDetail.passedCount,
      classDetail.studentCount,
      classDetail.students.length,
    ]);

  const reportSummaryCards =
    classDetail.reportSummaryCards ?? defaultSummaryCards;
  const materials =
    classDetail.materials ?? createDefaultMaterials(classDetail.className);
  const elkpdItems = classDetail.elkpdItems ?? createDefaultELKPDItems();
  const scoreBuckets =
    classDetail.scoreBuckets ?? buildDefaultScoreBuckets(classDetail.students);
  const emotionSegments =
    classDetail.emotionSegments ??
    buildDefaultEmotionSegments(classDetail.students);

  const headerData: ILearningAnalyticsHeaderCardData = {
    className: classDetail.className,
    classCode: classDetail.classCode ?? "MATH-X-001",
    subjectLabel: classDetail.subjectLabel ?? "Matematika",
    metadata: [
      classDetail.gradeLabel ?? "Umum",
      classDetail.semesterLabel ?? "Ganjil 2024/2025",
      `${classDetail.studentCount} Siswa`,
    ],
  };

  const studentDetailHrefBuilder =
    buildStudentDetailHref ??
    ((studentId: string) =>
      `/teacher/dashboard/class-list/${classDetail.slug}/${studentId}`);

  const renderedByType: Record<ClassAnalyticsViewType, ReactNode> = {
    Beranda: (
      <TeacherOverviewSection classDetail={classDetail} materials={materials} />
    ),
    Siswa: <BaseSiswaSection students={classDetail.students} />,
    Materi: <BaseMateriSection materials={materials} />,
    "Kelola E-LKPD": (
      <BaseInitSection
        title="Kelola E-LKPD"
        description="Fitur pengelolaan E-LKPD sedang disiapkan. Fokuskan analitik kelas di tab Laporan."
      />
    ),
    Laporan: (
      <BaseLaporanSection
        reportSummaryCards={reportSummaryCards}
        scoreBuckets={scoreBuckets}
        emotionSegments={emotionSegments}
        buildStudentDetailHref={studentDetailHrefBuilder}
        students={classDetail.students}
      />
    ),
  };

  return (
    <div className="space-y-4">
      <LearningAnalyticsClassHeaderCard data={headerData} />
      <LearningAnalyticsViewSwitcher
        activeType={activeViewType}
        onChange={(key) =>
          router.push(
            `${pathname.split("?")[0]}?view=${encodeURIComponent(key)}`,
          )
        }
        badgeByType={{
          Siswa: classDetail.studentCount,
          Materi: materials.length,
          "Kelola E-LKPD": elkpdItems.length,
        }}
      />
      {renderedByType[activeViewType]}
    </div>
  );
}
