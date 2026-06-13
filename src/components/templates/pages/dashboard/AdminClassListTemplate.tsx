"use client";

import AdminClassListContent from "@/components/organisms/AdminClassListContent";
import { showToast } from "@/libs/toast";
import type {
  IAdminClassListItem,
  IClassFormPayload,
  ITeacherOption,
} from "@/types/adminClassList";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { gsGet } from "@/libs/api/gsAction";
import {
  useGsAllCourses,
  useGsArchiveCourse,
  useGsCreateCourse,
  useGsDeleteCourse,
  useGsUnarchiveCourse,
  useGsUpdateCourse,
} from "@/services";
import { useSearchUser } from "@/services/hooks/useUser";
import { useGsAssignCourseToTeacher } from "@/services/hooks/useGsAdmin";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminClassListTemplate() {
  const pathname = usePathname();
  const router = useRouter();
  const isTeacherDashboard = pathname?.includes("/teacher/dashboard") ?? false;
  const [teacherName, setTeacherName] = useState<string>("");
  const [debounceQuery, setDebounceQuery] = useState<string>("");
  const { data: coursesData, isPending } = useGsAllCourses({ limit: 50 });
  const { data: teachers, isLoading } = useSearchUser({
    limit: 2,
    role: "role",
    search: debounceQuery,
  });
  const createCourse = useGsCreateCourse();
  const updateCourse = useGsUpdateCourse();
  const archiveCourse = useGsArchiveCourse();
  const unarchiveCourse = useGsUnarchiveCourse();
  const deleteCourse = useGsDeleteCourse();
  const assignCourse = useGsAssignCourseToTeacher();

  const teacherOptions = useMemo(() => {
    if (!teachers?.users) return [];

    return teachers.users.map((user) => ({
      value: user.profileId,
      label: `${user.fullName} (${user.schoolName ?? "Tanpa Sekolah"})`,
    }));
  }, [teachers]);

  const classes: IAdminClassListItem[] = useMemo(
    () =>
      (coursesData?.courses ?? []).map((course) => ({
        id: course.id,
        name: course.courseName,
        teacherName: course.teacher?.fullName ?? "Belum ditentukan",
        createdAt: formatDate(course.createdAt),
        studentCount: course.enrolledCount ?? 0,
        testCount: course.diagnosticTestCount ?? 0,
        code: course.courseCode,
        status: course.isArchived ? "Nonaktif" : "Aktif",
        progress:
          course.progressPercent ??
          (course as any).averageProgress ??
          course.averageProgressPercent ??
          (course as any).progress ??
          (course as any).average_progress ??
          (course as any).average_progress_percent ??
          (course as any).progress_percent ??
          0,
      })),
    [coursesData],
  );

  const handleCreateClass = useCallback(
    (payload: IClassFormPayload) => {
      createCourse.mutate(
        {
          courseName: payload.className.trim(),
          ...(payload.teacherId ? { teacherId: payload.teacherId } : {}),
        },
        {
          onSuccess: () => showToast.success("Kelas baru berhasil ditambahkan"),
          onError: (error) =>
            showToast.error(error.message ?? "Gagal menambahkan kelas"),
        },
      );
    },
    [createCourse],
  );

  const handleUpdateClass = useCallback(
    (classId: string, payload: IClassFormPayload) => {
      const existingCourse = coursesData?.courses.find((c) => c.id === classId);
      const isTeacherChanged =
        payload.teacherId && existingCourse?.teacher?.id !== payload.teacherId;

      updateCourse.mutate(
        {
          id: classId,
          data: {
            courseName: payload.className.trim(),
            ...(payload.teacherId ? { teacherId: payload.teacherId } : {}),
          },
        },
        {
          onSuccess: () => {
            if (isTeacherChanged) {
              assignCourse.mutate(
                { courseId: classId, teacherId: payload.teacherId },
                {
                  onSuccess: () =>
                    showToast.success("Perubahan kelas dan guru berhasil disimpan"),
                  onError: (error) =>
                    showToast.error(error.message ?? "Gagal menugaskan kelas ke guru"),
                }
              );
            } else {
              showToast.success("Perubahan kelas berhasil disimpan");
            }
          },
          onError: (error) =>
            showToast.error(error.message ?? "Gagal memperbarui kelas"),
        },
      );
    },
    [updateCourse, assignCourse, coursesData],
  );

  const handleDeleteClass = useCallback(
    (classId: string) => {
      deleteCourse.mutate(classId, {
        onSuccess: () => showToast.success("Kelas berhasil dihapus"),
        onError: (error) =>
          showToast.error(error.message ?? "Gagal menghapus kelas"),
      });
    },
    [deleteCourse],
  );

  const handleToggleClassStatus = useCallback(
    (classId: string) => {
      const course = coursesData?.courses.find((item) => item.id === classId);

      if (!course) {
        return;
      }

      if (course.isArchived) {
        unarchiveCourse.mutate(classId, {
          onSuccess: () => showToast.success("Kelas diaktifkan kembali"),
          onError: (error) =>
            showToast.error(error.message ?? "Gagal mengaktifkan kelas"),
        });
        return;
      }

      archiveCourse.mutate(classId, {
        onSuccess: () => showToast.success("Kelas diarsipkan"),
        onError: (error) =>
          showToast.error(error.message ?? "Gagal mengarsipkan kelas"),
      });
    },
    [archiveCourse, coursesData, unarchiveCourse],
  );

  const handleManageClass = useCallback(
    (classId: string) => {
      const course = coursesData?.courses.find((item) => item.id === classId);

      if (!course) {
        showToast.info("Kelas yang dipilih tidak ditemukan");
        return;
      }

      const slug = course.slug || toSlug(course.courseName);
      const targetHref = isTeacherDashboard
        ? `/teacher/dashboard/class-list/${slug}`
        : `/admin/dashboard/learning-analytics/${slug}`;

      router.push(targetHref);
    },
    [coursesData, isTeacherDashboard, router],
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
        Memuat data kelas...
      </div>
    );
  }

  return (
    <AdminClassListContent
      classes={classes}
      // teacherOptions={teacherOptions}
      showTeacherSelection={!isTeacherDashboard}
      onCreateClass={handleCreateClass}
      onUpdateClass={handleUpdateClass}
      onDeleteClass={handleDeleteClass}
      onToggleClassStatus={handleToggleClassStatus}
      onManageClass={handleManageClass}
    />
  );
}
