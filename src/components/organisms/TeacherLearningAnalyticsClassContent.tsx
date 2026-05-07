"use client";

import ChatIcon from "@/components/atoms/icons/ChatIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import {
  BaseKelolaELKPDSection,
  BaseLaporanSection,
  BaseMateriSection,
  BaseSiswaSection,
  LearningAnalyticsClassHeaderCard,
  LearningAnalyticsViewSwitcher,
  TeacherOverviewSection,
} from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import type { IBaseMateriSectionProps } from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import { useGsKickStudentFromCourse } from "@/services/hooks/useGsCourseEnrollment";
import type {
  ClassAnalyticsViewType,
  IClassAnalyticsReportSummaryCard,
  ILearningAnalyticsEmotionSegment,
  ILearningAnalyticsHeaderCardData,
  ILearningAnalyticsScoreBucket,
  ITeacherClassLearningAnalyticsDetail,
  ITeacherStudentAnalyticsItem,
} from "@/types/learningAnalytics";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ForumSection from "@/components/organisms/ForumSection";

export type {
  ITeacherClassLearningAnalyticsDetail,
  ITeacherStudentAnalyticsItem,
};

interface ITeacherLearningAnalyticsClassContentProps {
  classDetail: ITeacherClassLearningAnalyticsDetail;
  buildStudentDetailHref?: (studentId: string) => string;
  materiSectionProps?: Omit<IBaseMateriSectionProps, "materials">;
}

interface ITeacherSidebarItem {
  type: ClassAnalyticsViewType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
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
  {
    type: "Forum",
    label: "Forum",
    icon: ChatIcon,
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
  materiSectionProps,
}: ITeacherLearningAnalyticsClassContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate: kickStudent, isPending: isKickingStudent } =
    useGsKickStudentFromCourse();
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
  const materials = classDetail.materials ?? [];
  const elkpdItems = classDetail.elkpdItems ?? [];
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
  const elkpdScoreHrefBuilder = (elkpdId: string) =>
    `/teacher/dashboard/class-list/${classDetail.slug}/elkpd/${elkpdId}`;
  const handleKickStudent = (studentId: string) => {
    kickStudent({ courseId: classDetail.id ?? classDetail.slug, studentId });
  };

  const renderedByType: Record<ClassAnalyticsViewType, ReactNode> = {
    Beranda: (
      <TeacherOverviewSection classDetail={classDetail} materials={materials} />
    ),
    Siswa: (
      <BaseSiswaSection
        students={classDetail.students}
        onKickStudent={(student) => handleKickStudent(student.id)}
        isKickingStudent={isKickingStudent}
      />
    ),
    Materi: (
      <BaseMateriSection
        materials={materials}
        courseId={classDetail.id}
        students={classDetail.students}
        {...materiSectionProps}
      />
    ),
    "Kelola E-LKPD": (
      <BaseKelolaELKPDSection
        elkpdItems={elkpdItems}
        buildELKPDScoreHref={elkpdScoreHrefBuilder}
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
    // seharusnya disini bukan di showforum 
    Forum: (
      <ForumSection
        courseId={classDetail.id ?? classDetail.slug}
        slug={classDetail.slug}
        role="teacher"
        materials={materials}
      />
    ),  
  };

  return (
    <div className="space-y-4">
      <LearningAnalyticsClassHeaderCard data={headerData} />
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <LearningAnalyticsViewSwitcher
            activeType={activeViewType}
            onChange={(key) => {
              router.push(
                `${pathname.split("?")[0]}?view=${encodeURIComponent(key)}`,
              );
            }}
            badgeByType={{
              Siswa: classDetail.studentCount,
              Materi: materials.length,
              "Kelola E-LKPD": elkpdItems.length,
            }}
          />
        </div>
      </div>
      {renderedByType[activeViewType]}
    </div>
  );
}
