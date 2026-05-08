"use client";

/**
 * GetSmart API — Subject (Materi) Hooks
 *
 * Role breakdown:
 *  - ALL roles      : GET / (semua materi), GET /teacher/:teacherId, GET /:id
 *  - TEACHER        : POST (buat), GET /my, PUT /:id (edit), DELETE /:id
 *  - TEACHER        : POST /:subjectId/elkpd (tambah), PUT /:subjectId/elkpd/:elkpdId (edit),
 *                     DELETE /:subjectId/elkpd/:elkpdId (hapus)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsDel } from "@/libs/api/gsAction";
import { gsPut } from "@/libs/api/gsAction";
import type {
  GsSubject,
  GsELKPD,
  GsCreateSubjectResponse,
  GsCreateSubjectInput,
  GsUpdateSubjectInput,
  GsCreateELKPDInput,
  GsUpdateELKPDInput,
  GsPaginatedSubjects,
  GsPaginationParams,
  GsModuleProgressResponse,
  GsMarkModuleReadResponse,
  GsSubmitELKPDResponse,
  GsModuleELKPDSubmissionsResponse,
  GsGradeELKPDSubmissionInput,
  GsGradeELKPDSubmissionResponse,
} from "@/types/gs-subject";

interface IGsMySubjectsQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

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

// ─── ALL: GET /subjects ───────────────────────────────────────────────────────

export function useGsAllSubjects(params?: GsPaginationParams) {
  return useQuery<GsPaginatedSubjects, Error>({
    queryKey: queryKeys.gsSubjects.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedSubjects>(`/subjects${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER: GET /subjects/my ────────────────────────────────────────────────

export function useGsMySubjects(
  params?: GsPaginationParams,
  options?: IGsMySubjectsQueryOptions,
) {
  return useQuery<GsPaginatedSubjects, Error>({
    queryKey: queryKeys.gsSubjects.myList(params as Record<string, unknown>),
    queryFn: () =>
      gsGet<GsPaginatedSubjects>(`/subjects/my${buildQuery(params)}`),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 2 * 60 * 1000,
  });
}

// ─── ALL: GET /subjects/teacher/:teacherId ────────────────────────────────────

export function useGsSubjectsByTeacher(
  teacherId: string,
  params?: GsPaginationParams,
) {
  return useQuery<GsPaginatedSubjects, Error>({
    queryKey: queryKeys.gsSubjects.byTeacher(
      teacherId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedSubjects>(
        `/subjects/teacher/${teacherId}${buildQuery(params)}`,
      ),
    enabled: !!teacherId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── ALL: GET /subjects/:id ───────────────────────────────────────────────────

export function useGsSubjectById(id: string) {
  return useQuery<GsSubject, Error>({
    queryKey: queryKeys.gsSubjects.detail(id),
    queryFn: () => gsGet<GsSubject>(`/subjects/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── TEACHER: POST /subjects ──────────────────────────────────────────────────

export function useGsCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation<GsCreateSubjectResponse, Error, GsCreateSubjectInput>({
    mutationFn: (input) => gsPost<GsCreateSubjectResponse>("/subjects", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gs", "subjects", "my"],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.lists(),
      });

      queryClient.refetchQueries({
        queryKey: ["gs", "subjects", "my"],
        type: "active",
      });
    },
  });
}

// ─── TEACHER: PUT /subjects/:id ───────────────────────────────────────────────

export function useGsUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation<
    GsSubject,
    Error,
    { id: string; data: GsUpdateSubjectInput }
  >({
    mutationFn: ({ id, data }) => gsPut<GsSubject>(`/subjects/${id}`, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["gs", "subjects", "my"],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.lists(),
      });

      queryClient.setQueryData(
        queryKeys.gsSubjects.detail(updated.id),
        updated,
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.detail(updated.id),
      });
    },
  });
}

// ─── TEACHER: DELETE /subjects/:id ────────────────────────────────────────────

export function useGsDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/subjects/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.myList(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsSubjects.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.gsSubjects.detail(id) });
    },
  });
}

/**
 * ELKPD creation endpoints removed.
 * Use useGsProgress hooks instead for progress tracking:
 * - useMarkFileRead() from useGsProgress.ts
 * - useMarkVideoWatched() from useGsProgress.ts
 * - useGradeELKPD() from useGsProgress.ts
 */
