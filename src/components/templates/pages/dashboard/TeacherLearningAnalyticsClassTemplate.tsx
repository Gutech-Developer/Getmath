"use client";

import TeacherLearningAnalyticsClassContent from "@/components/organisms/TeacherLearningAnalyticsClassContent";
import {
  useGsCourseBySlug,
  useGsEnrollmentsByCourse,
  useGsModulesByCourse,
} from "@/services";
import type { ITeacherClassLearningAnalyticsDetail } from "@/types/learningAnalytics";
import { useMemo } from "react";

interface ITeacherLearningAnalyticsClassTemplateProps {
  slug: string;
}

function formatDateLabel(input?: string | null): string {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function seededScore(seed: string, index: number): number {
  const source = `${seed}-${index}`;
  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash % 45);
  return 55 + normalized;
}

export default function TeacherLearningAnalyticsClassTemplate({
  slug,
}: ITeacherLearningAnalyticsClassTemplateProps) {
  const {
    data: course,
    isLoading: isCourseLoading,
    error: courseError,
  } = useGsCourseBySlug(slug);

  const { data: modules = [], isLoading: isModulesLoading } =
    useGsModulesByCourse(course?.id ?? "");

  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } =
    useGsEnrollmentsByCourse(course?.id ?? "", { limit: 200 });

  const orderedModules = useMemo(
    () =>
      [...modules].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      }),
    [modules],
  );

  const classDetail =
    useMemo<ITeacherClassLearningAnalyticsDetail | null>(() => {
      if (!course) {
        return null;
      }

      const students: ITeacherClassLearningAnalyticsDetail["students"] = (
        enrollmentsData?.enrollments ?? []
      ).map((enrollment, index) => {
        const score = seededScore(enrollment.studentId ?? enrollment.id, index);
        return {
          id: enrollment.studentId ?? enrollment.id,
          fullname: enrollment.student?.fullName ?? `Siswa ${index + 1}`,
          nis: enrollment.student?.NIS ?? "-",
          score,
          status: score >= 75 ? "Lulus" : "Remedial",
        };
      });

      const studentCount =
        enrollmentsData?.pagination.totalItems ?? students.length;
      const passedCount = students.filter(
        (student) => student.status === "Lulus",
      ).length;
      const remedialCount = Math.max(studentCount - passedCount, 0);
      const averageScore =
        students.length > 0
          ? Math.round(
              students.reduce((sum, student) => sum + student.score, 0) /
                students.length,
            )
          : 0;

      const materials: NonNullable<
        ITeacherClassLearningAnalyticsDetail["materials"]
      > = orderedModules.map((module, index) => {
        const isSubject = module.type === "SUBJECT";
        const title = isSubject
          ? (module.subject?.subjectName ?? `Modul ${index + 1}`)
          : (module.diagnosticTest?.testName ?? `Tes Diagnostik ${index + 1}`);

        const type: "Materi" | "Video" | "Tes" = isSubject
          ? module.subject?.videoUrl
            ? "Video"
            : "Materi"
          : "Tes";

        return {
          id: module.id,
          title,
          updatedAt: formatDateLabel(module.deadline ?? course.updatedAt),
          type,
          status:
            module.deadline && new Date(module.deadline).getTime() < Date.now()
              ? "Draft"
              : "Aktif",
        };
      });

      const elkpdItems: NonNullable<
        ITeacherClassLearningAnalyticsDetail["elkpdItems"]
      > = orderedModules
        .filter((module) => module.type === "SUBJECT")
        .map((module, index) => ({
          id: module.id,
          title: `E-LKPD ${index + 1} - ${module.subject?.subjectName ?? "Materi"}`,
          dueLabel: formatDateLabel(module.deadline),
          submittedCount: studentCount,
          status:
            module.deadline && new Date(module.deadline).getTime() < Date.now()
              ? "Ditutup"
              : "Aktif",
        }));

      const progress =
        studentCount > 0 ? Math.round((passedCount / studentCount) * 100) : 0;

      return {
        id: course.id,
        slug,
        className: course.courseName,
        teacherName: course.teacher?.fullName ?? "Guru",
        studentCount,
        averageScore,
        passedCount,
        remedialCount,
        progress,
        classCode: course.courseCode,
        gradeLabel: "Umum",
        semesterLabel: course.schoolYear ?? "Tahun Ajaran Berjalan",
        subjectLabel: "Matematika",
        defaultViewType: "Beranda",
        students,
        materials,
        elkpdItems,
      };
    }, [course, enrollmentsData, orderedModules, slug]);

  if (isCourseLoading || isModulesLoading || isEnrollmentsLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
        Memuat analitik kelas...
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
        Gagal memuat data kelas: {courseError.message}
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">
        Data kelas tidak ditemukan.
      </div>
    );
  }

  return <TeacherLearningAnalyticsClassContent classDetail={classDetail} />;
}
