"use client";

/**
 * GetSmart API — Course Enrollment Hooks
 *
 * Role breakdown:
 *  - STUDENT : GET /my (daftar course yg diikuti), POST (daftar kelas), DELETE /:courseId (keluar kelas)
 *  - TEACHER/ADMIN: GET /course/:courseId (lihat peserta), DELETE /:courseId/students/:studentId
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsDel } from "@/libs/api/gsAction";
import { showToast, showErrorToast } from "@/libs/toast";
import type {
  GsCourseEnrollment,
  GsEnrollCourseInput,
  GsPaginatedEnrollments,
  GsPaginationParams,
} from "@/types/gs-course";

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildQuery(params?: GsPaginationParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

// ─── STUDENT: GET /course-enrollments/my ─────────────────────────────────────

export function useGsMyEnrollments(params?: GsPaginationParams) {
  return useQuery<GsPaginatedEnrollments, Error>({
    queryKey: queryKeys.gsCourseEnrollments.myList(
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedEnrollments>(
        `/course-enrollments/my${buildQuery(params)}`,
      ),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN: GET /course-enrollments/course/:courseId ─────────────────

export function useGsEnrollmentsByCourse(
  courseId: string,
  params?: GsPaginationParams,
) {
  return useQuery<GsPaginatedEnrollments, Error>({
    queryKey: queryKeys.gsCourseEnrollments.byCourse(
      courseId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedEnrollments>(
        `/course-enrollments/course/${courseId}${buildQuery(params)}`,
      ),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── STUDENT: POST /course-enrollments — daftar kelas ────────────────────────

export function useGsEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation<GsCourseEnrollment, Error, GsEnrollCourseInput>({
    mutationFn: (input) =>
      gsPost<GsCourseEnrollment>("/course-enrollments", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseEnrollments.all,
      });
    },
  });
}

// ─── STUDENT: DELETE /course-enrollments/:courseId — keluar kelas ────────────

export function useGsUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (courseId) => gsDel<void>(`/course-enrollments/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseEnrollments.all,
      });
    },
  });
}

// ─── TEACHER/ADMIN: DELETE /course-enrollments/:courseId/students/:studentId ─

export function useGsKickStudentFromCourse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { courseId: string; studentId: string }>({
    mutationFn: ({ courseId, studentId }) =>
      gsDel<void>(`/course-enrollments/${courseId}/students/${studentId}`),
    onSuccess: (_, { courseId }) => {
      showToast.success("Siswa berhasil dikeluarkan dari kelas");
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseEnrollments.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseEnrollments.byCourse(courseId),
      });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
}
