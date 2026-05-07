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

function createFallbackClassDetail(
  slug: string,
  elkpdId: string,
): IClassLearningAnalyticsDetail {
  return {
    slug,
    className: formatClassTitleFromSlug(slug),
    teacherName: "Ibu Rahma Johar",
    studentCount: 5,
    averageScore: 75,
    passedCount: 3,
    remedialCount: 2,
    progress: 64,
    classCode: "MATH-X-001",
    gradeLabel: "Umum",
    semesterLabel: "Ganjil 2024/2025",
    subjectLabel: "Matematika",
    students: [
      {
        id: "fallback-student-1",
        fullname: "Andi Pratama",
        nis: "2310001",
        score: 85,
        status: "Lulus",
      },
      {
        id: "fallback-student-2",
        fullname: "Siti Nurhaliza",
        nis: "2310002",
        score: 72,
        status: "Lulus",
      },
      {
        id: "fallback-student-3",
        fullname: "Budi Santoso",
        nis: "2310003",
        score: 58,
        status: "Remedial",
      },
      {
        id: "fallback-student-4",
        fullname: "Dewi Anggraini",
        nis: "2310004",
        score: 92,
        status: "Lulus",
      },
      {
        id: "fallback-student-5",
        fullname: "Eko Prasetyo",
        nis: "2310005",
        score: 65,
        status: "Remedial",
      },
    ],
    elkpdItems: [
      {
        id: elkpdId,
        title: "E-LKPD - Penilaian Kelas",
        dueLabel: "30 Apr 2026",
        submittedCount: 0,
        status: "Aktif",
      },
    ],
  };
}

export default function LearningAnalyticsELKPDScoreTemplate({
  role,
  slug,
  elkpdId,
}: ILearningAnalyticsELKPDScoreTemplateProps) {
  // ── Resolve course from slug ─────────────────────────────────────────
  const { data: course } = useGsCourseBySlug(slug);

  // ── Fetch ELKPD submissions from API ─────────────────────────────────
  const { data: submissionsData } = useELKPDGradesByModule(
    elkpdId,
    { enabled: !!elkpdId },
  );

  // ── Build class detail from API data or fallback ─────────────────────
  const classDetail = useMemo<IClassLearningAnalyticsDetail>(() => {
    const staticDetail = LEARNING_ANALYTICS_CLASS_DATA.find(
      (item) => item.slug === slug,
    );
    const fallback = staticDetail ?? createFallbackClassDetail(slug, elkpdId);

    // If we have API submissions, enrich student data with real scores
    const apiGrades = submissionsData?.eLKPDs?.[0]?.grades;
    if (apiGrades?.length) {
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

      if (apiStudents.length > 0) {
        const passedCount = apiStudents.filter(
          (s) => s.status === "Lulus",
        ).length;
        const avgScore =
          apiStudents.reduce((sum, s) => sum + s.score, 0) /
          apiStudents.length;

        return {
          ...fallback,
          className: course?.courseName ?? fallback.className,
          classCode: course?.courseCode ?? fallback.classCode,
          students: apiStudents,
          studentCount: apiStudents.length,
          averageScore: Math.round(avgScore),
          passedCount,
          remedialCount: apiStudents.length - passedCount,
        };
      }
    }

    return fallback;
  }, [slug, elkpdId, course, submissionsData]);

  return (
    <LearningAnalyticsELKPDScoreContent
      role={role}
      classDetail={classDetail}
      elkpdId={elkpdId}
      courseId={course?.id}
    />
  );
}

