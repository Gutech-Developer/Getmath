"use client";

/**
 * TeacherClassListTemplate
 * Menggantikan AdminClassListTemplate untuk konteks /teacher/dashboard/class-list
 * Data: useGsMyCourses + CRUD mutations (useGsCreateCourse, useGsUpdateCourse,
 *       useGsArchiveCourse, useGsUnarchiveCourse, useGsDeleteCourse)
 */

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminClassListContent from "@/components/organisms/AdminClassListContent";
import { showToast } from "@/libs/toast";
import type {
  IAdminClassListItem,
  IClassFormPayload,
} from "@/types/adminClassList";
import {
  useGsMyCourses,
  useGsCreateCourse,
  useGsUpdateCourse,
  useGsArchiveCourse,
  useGsUnarchiveCourse,
  useGsDeleteCourse,
} from "@/services";

/** teacherOptions tidak diperlukan di halaman guru (backend resolves dari token) */
const EMPTY_TEACHER_OPTIONS = [{ id: "__self__", label: "Saya" }];

/** Ubah GsCourse → IAdminClassListItem agar bisa dipakai AdminClassListContent */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TeacherClassListTemplate() {
  const router = useRouter();

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: coursesData, isLoading } = useGsMyCourses({ limit: 50 });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createCourse = useGsCreateCourse();
  const updateCourse = useGsUpdateCourse();
  const archiveCourse = useGsArchiveCourse();
  const unarchiveCourse = useGsUnarchiveCourse();
  const deleteCourse = useGsDeleteCourse();

  // ── Map GsCourse[] → IAdminClassListItem[] ─────────────────────────────────
  const classes: IAdminClassListItem[] = useMemo(
    () =>
      (coursesData?.courses ?? []).map((c) => ({
        id: c.id,
        name: c.courseName,
        teacherName: c.teacher?.fullName ?? "–",
        createdAt: formatDate(c.createdAt),
        studentCount: c.enrolledCount ?? 0,
        testCount: c.diagnosticTestCount ?? 0,
        code: c.courseCode,
        status: c.isArchived ? "Nonaktif" : "Aktif",
      })),
    [coursesData],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateClass = useCallback(
    (payload: IClassFormPayload) => {
      createCourse.mutate(
        { courseName: payload.className.trim() },
        {
          onSuccess: () => showToast.success("Kelas baru berhasil dibuat"),
          onError: (err) =>
            showToast.error(err.message ?? "Gagal membuat kelas"),
        },
      );
    },
    [createCourse],
  );

  const handleUpdateClass = useCallback(
    (courseId: string, payload: IClassFormPayload) => {
      updateCourse.mutate(
        { id: courseId, data: { courseName: payload.className.trim() } },
        {
          onSuccess: () => showToast.success("Kelas berhasil diperbarui"),
          onError: (err) =>
            showToast.error(err.message ?? "Gagal memperbarui kelas"),
        },
      );
    },
    [updateCourse],
  );

  const handleDeleteClass = useCallback(
    (courseId: string) => {
      deleteCourse.mutate(courseId, {
        onSuccess: () => showToast.success("Kelas berhasil dihapus"),
        onError: (err) =>
          showToast.error(err.message ?? "Gagal menghapus kelas"),
      });
    },
    [deleteCourse],
  );

  const handleToggleClassStatus = useCallback(
    (courseId: string) => {
      const course = coursesData?.courses.find((c) => c.id === courseId);
      if (!course) return;

      if (course.isArchived) {
        unarchiveCourse.mutate(courseId, {
          onSuccess: () => showToast.success("Kelas diaktifkan kembali"),
          onError: (err) =>
            showToast.error(err.message ?? "Gagal mengaktifkan kelas"),
        });
      } else {
        archiveCourse.mutate(courseId, {
          onSuccess: () => showToast.success("Kelas diarsipkan"),
          onError: (err) =>
            showToast.error(err.message ?? "Gagal mengarsipkan kelas"),
        });
      }
    },
    [coursesData, archiveCourse, unarchiveCourse],
  );

  const handleManageClass = useCallback(
    (courseId: string) => {
      const course = coursesData?.courses.find((c) => c.id === courseId);
      if (!course) return;
      router.push(`/teacher/dashboard/class-list/${course.slug}`);
    },
    [coursesData, router],
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-grey text-sm">
        Memuat data kelas...
      </div>
    );
  }

  return (
    <AdminClassListContent
      classes={classes}
      teacherOptions={EMPTY_TEACHER_OPTIONS}
      onCreateClass={handleCreateClass}
      onUpdateClass={handleUpdateClass}
      onDeleteClass={handleDeleteClass}
      onToggleClassStatus={handleToggleClassStatus}
      onManageClass={handleManageClass}
    />
  );
}
