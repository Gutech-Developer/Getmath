"use client";

/**
 * GetSmart API — Course Module Hooks
 * 
 * ⚠️ MIGRATED TO GO BACKEND
 * All endpoints verified against Go routes in:
 * getsmart_api_services_go/internal/routes/course_module_router.go
 *
 * Role breakdown:
 *  - TEACHER/ADMIN : POST (tambah modul), PATCH (update/reorder), DELETE
 *  - ALL (authenticated, enrolled) : GET (lihat modul)
 *
 * Module type:
 *  - SUBJECT         → subjectId wajib
 *  - DIAGNOSTIC_TEST → diagnosticTestId wajib
 *
 * Response Format (via utils.SendSuccess):
 * ```json
 * {
 *   "success": true,
 *   "status": 200|201,
 *   "message": "...",
 *   "data": object | array | null
 * }
 * ```
 * The hooks extract only the `data` field via @tanstack/react-query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPatch, gsDel } from "@/libs/api/getsmart";
import type {
  GsCourseModule,
  GsCreateCourseModuleResponse,
  GsCreateCourseModuleInput,
  GsUpdateCourseModuleInput,
  GsReorderCourseModulesInput,
} from "@/types/gs-course";

// ─── GET /course-modules/course/:courseId ─────────────────────────────────────

export function useGsModulesByCourse(courseId: string) {
  return useQuery<GsCourseModule[], Error>({
    queryKey: queryKeys.gsCourseModules.byCourse(courseId),
    queryFn: () =>
      gsGet<GsCourseModule[]>(`/course-modules/course/${courseId}`),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── GET /course-modules/:id ──────────────────────────────────────────────────

export function useGsModuleById(id: string) {
  return useQuery<GsCourseModule, Error>({
    queryKey: queryKeys.gsCourseModules.detail(id),
    queryFn: () => gsGet<GsCourseModule>(`/course-modules/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── POST /course-modules/:courseId ──────────────────────────────────────────

export function useGsCreateCourseModule() {
  const queryClient = useQueryClient();

  return useMutation<
    GsCreateCourseModuleResponse,
    Error,
    { courseId: string; data: GsCreateCourseModuleInput }
  >({
    mutationFn: ({ courseId, data }) =>
      gsPost<GsCreateCourseModuleResponse>(`/course-modules/${courseId}`, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.byCourse(courseId),
      });
      // Juga invalidate detail course karena modules di-embed di getCourseById
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourses.details(),
      });
    },
  });
}

// ─── PATCH /course-modules/:id ────────────────────────────────────────────────

export function useGsUpdateCourseModule() {
  const queryClient = useQueryClient();

  return useMutation<
    GsCourseModule,
    Error,
    { id: string; courseId: string; data: GsUpdateCourseModuleInput }
  >({
    mutationFn: ({ id, data }) =>
      gsPatch<GsCourseModule>(`/course-modules/${id}`, data),
    onSuccess: (updated, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.byCourse(courseId),
      });
      queryClient.setQueryData(
        queryKeys.gsCourseModules.detail(updated.id),
        updated,
      );
    },
  });
}

// ─── PATCH /course-modules/course/:courseId/reorder ──────────────────────────

export function useGsReorderCourseModules() {
  const queryClient = useQueryClient();

  return useMutation<
    GsCourseModule[],
    Error,
    { courseId: string; data: GsReorderCourseModulesInput }
  >({
    mutationFn: ({ courseId, data }) =>
      gsPatch<GsCourseModule[]>(
        `/course-modules/course/${courseId}/reorder`,
        data,
      ),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.byCourse(courseId),
      });
    },
  });
}

// ─── DELETE /course-modules/:id ───────────────────────────────────────────────

export function useGsDeleteCourseModule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; courseId: string }>({
    mutationFn: ({ id }) => gsDel<void>(`/course-modules/${id}`),
    onSuccess: (_, { courseId, id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.byCourse(courseId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.gsCourseModules.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourses.details(),
      });
    },
  });
}
