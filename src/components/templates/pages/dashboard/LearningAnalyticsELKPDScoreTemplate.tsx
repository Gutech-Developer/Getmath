"use client";

import LearningAnalyticsELKPDScoreContent from "@/components/organisms/LearningAnalyticsELKPDScoreContent";
import { LEARNING_ANALYTICS_CLASS_DATA } from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";
import { useGsCourseBySlug, useELKPDGradesByModule } from "@/services";
import type { IClassLearningAnalyticsDetail } from "@/types/learningAnalytics";
import { useMemo } from "react";

type AnalyticsRole = "admin" | "teacher";

interface ILearningAnalyticsELKPDScoreTemplateProps {
  role: AnalyticsRole;
  slug: string;
  elkpdId: string;
}

function formatClassTitleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ELKPDScoreLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-[#E5E7EB]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#F1F5F9]" />
              <div className="h-6 w-2/3 animate-pulse rounded-full bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] space-y-4">
        <div className="h-6 w-1/4 animate-pulse rounded-full bg-[#E5E7EB]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#E5E7EB]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded-full bg-[#E5E7EB]" />
                <div className="h-3 w-1/4 animate-pulse rounded-full bg-[#F1F5F9]" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded-full bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearningAnalyticsELKPDScoreTemplate({
  role,
  slug,
  elkpdId,
}: ILearningAnalyticsELKPDScoreTemplateProps) {
  // ── Resolve course from slug ─────────────────────────────────────────
  const { data: course, isLoading: isCourseLoading } = useGsCourseBySlug(slug);

  // ── Fetch ELKPD submissions from API ─────────────────────────────────
  const { data: submissionsData, isLoading: isSubmissionsLoading } =
    useELKPDGradesByModule(elkpdId, {
      enabled: !!elkpdId,
    });

  // ── Build class detail from API data or fallback ─────────────────────
  const classDetail = useMemo<IClassLearningAnalyticsDetail>(() => {
    const staticDetail = LEARNING_ANALYTICS_CLASS_DATA.find(
      (item) => item.slug === slug,
    );
    const apiGrades = submissionsData?.eLKPDs?.[0]?.grades ?? [];
    const apiStudents = apiGrades.map((sub, index) => {
      const score = sub.score ?? 0;
      return {
        id: sub.studentId,
        fullname: sub.fullName || `Siswa ${index + 1}`,
        nis: sub.NIS || sub.studentId.slice(0, 7) || "-",
        score,
        status: (score >= 75 ? "Lulus" : "Remedial") as "Lulus" | "Remedial",
      };
    });

    const passedCount = apiStudents.filter((s) => s.status === "Lulus").length;
    const averageScore =
      apiStudents.length > 0
        ? Math.round(
            apiStudents.reduce((sum, student) => sum + student.score, 0) /
              apiStudents.length,
          )
        : (staticDetail?.averageScore ?? 0);

    const fallbackClassName =
      course?.courseName ??
      staticDetail?.className ??
      formatClassTitleFromSlug(slug);
    const fallbackClassCode =
      course?.courseCode ?? staticDetail?.classCode ?? "MATH-X-001";

    return {
      id: course?.id,
      slug,
      className: fallbackClassName,
      teacherName: staticDetail?.teacherName ?? "Guru Kelas",
      studentCount: apiStudents.length || staticDetail?.studentCount || 0,
      averageScore,
      passedCount: apiStudents.length
        ? passedCount
        : (staticDetail?.passedCount ?? 0),
      remedialCount: apiStudents.length
        ? apiStudents.length - passedCount
        : (staticDetail?.remedialCount ?? 0),
      progress: staticDetail?.progress ?? 0,
      classCode: fallbackClassCode,
      gradeLabel: staticDetail?.gradeLabel ?? "Umum",
      semesterLabel: staticDetail?.semesterLabel ?? "Ganjil 2024/2025",
      subjectLabel:
        staticDetail?.subjectLabel ?? course?.courseName ?? "Matematika",
      defaultViewType: staticDetail?.defaultViewType,
      students:
        apiStudents.length > 0 ? apiStudents : (staticDetail?.students ?? []),
      materials: staticDetail?.materials,
      elkpdItems:
        submissionsData?.eLKPDs?.map((item) => ({
          id: item.eLKPDId,
          title: item.title,
          dueLabel:
            staticDetail?.elkpdItems?.find((elkpd) => elkpd.id === item.eLKPDId)
              ?.dueLabel ?? "-",
          submittedCount:
            item.grades?.filter((grade) => grade.submissionId).length ?? 0,
          status: "Aktif" as const,
        })) ??
        staticDetail?.elkpdItems ??
        [],
      reportSummaryCards: staticDetail?.reportSummaryCards,
      scoreBuckets: staticDetail?.scoreBuckets,
      emotionSegments: staticDetail?.emotionSegments,
    };
  }, [slug, course, submissionsData]);

  // ── Show loading skeleton while fetching data ─────────────────────────
  if (isCourseLoading || isSubmissionsLoading) {
    return <ELKPDScoreLoadingSkeleton />;
  }

  return (
    <LearningAnalyticsELKPDScoreContent
      role={role}
      classDetail={classDetail}
      elkpdId={elkpdId}
      courseId={course?.id}
    />
  );
}
