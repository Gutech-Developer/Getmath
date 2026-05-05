"use client";

import ForumSection from "@/components/organisms/ForumSection";

import {
  BaseKelolaELKPDSection,
  BaseLaporanSection,
  BaseMateriSection,
  BaseSiswaSection,
  LearningAnalyticsClassHeaderCard,
  LearningAnalyticsViewSwitcher,
  TeacherOverviewSection,
} from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import { useGsKickStudentFromCourse } from "@/services/hooks/useGsCourseEnrollment";
import type {
  ClassAnalyticsViewType,
  IClassAnalyticsReportSummaryCard,
  IClassLearningAnalyticsDetail,
  ILearningAnalyticsELKPDItem,
  ILearningAnalyticsEmotionSegment,
  ILearningAnalyticsHeaderCardData,
  ILearningAnalyticsMaterialItem,
  ILearningAnalyticsScoreBucket,
  IStudentAnalyticsItem,
} from "@/types/learningAnalytics";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export type { IClassLearningAnalyticsDetail, IStudentAnalyticsItem };

interface AdminLearningAnalyticsClassContentProps {
  classDetail: IClassLearningAnalyticsDetail;
  initialViewType?: ClassAnalyticsViewType;
  buildStudentDetailHref?: (studentId: string) => string;
}

function buildDefaultScoreBuckets(
  students: IStudentAnalyticsItem[],
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
  students: IStudentAnalyticsItem[],
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

export default function AdminLearningAnalyticsClassContent({
  classDetail,
  initialViewType,
  buildStudentDetailHref,
}: AdminLearningAnalyticsClassContentProps) {
  const [activeViewType, setActiveViewType] = useState<ClassAnalyticsViewType>(
    initialViewType ?? classDetail.defaultViewType ?? "Laporan",
  );
  const { mutate: kickStudent, isPending: isKickingStudent } =
    useGsKickStudentFromCourse();

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
      `/admin/dashboard/learning-analytics/${classDetail.slug}/${studentId}`);
  const elkpdScoreHrefBuilder = (elkpdId: string) =>
    `/admin/dashboard/learning-analytics/${classDetail.slug}/elkpd/${elkpdId}`;
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
        buildStudentDetailHref={studentDetailHrefBuilder}
        onKickStudent={(student) => handleKickStudent(student.id)}
        isKickingStudent={isKickingStudent}
      />
    ),
    Materi: (
      <BaseMateriSection
        materials={materials}
        students={classDetail.students}
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
        students={classDetail.students}
        buildStudentDetailHref={studentDetailHrefBuilder}
      />
    ),
  };

  const [showForum, setShowForum] = useState(false);

  return (
    <div className="w-full space-y-4">
      <LearningAnalyticsClassHeaderCard data={headerData} />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <LearningAnalyticsViewSwitcher
            activeType={activeViewType}
            onChange={(key) => {
              setShowForum(false);
              setActiveViewType(key);
            }}
            badgeByType={{
              Siswa: classDetail.studentCount,
              Materi: materials.length,
              "Kelola E-LKPD": elkpdItems.length,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowForum((v) => !v)}
          className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            showForum
              ? "border-[#1F2375] bg-[#1F2375] text-white"
              : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#1F2375]/40 hover:text-[#1F2375]"
          }`}
        >
          💬 Forum
        </button>
      </div>

      {showForum ? (
        <ForumSection
          courseId={classDetail.id ?? classDetail.slug}
          slug={classDetail.slug}
          role="admin"
        />
      ) : (
        renderedByType[activeViewType]
      )}
    </div>
  );
}
