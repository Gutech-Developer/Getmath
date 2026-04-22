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
import { gsGet, gsPost, gsDel } from "@/libs/api/getsmart";
import { gsPut } from "@/libs/api/getsmart";
import type {
  GsSubject,
  GsELKPD,
  GsCreateSubjectInput,
  GsUpdateSubjectInput,
  GsCreateELKPDInput,
  GsUpdateELKPDInput,
  GsPaginatedSubjects,
  GsPaginationParams,
} from "@/types/gs-subject";

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

export function useGsMySubjects(params?: GsPaginationParams) {
  return useQuery<GsPaginatedSubjects, Error>({
    queryKey: queryKeys.gsSubjects.myList(params as Record<string, unknown>),
    queryFn: () =>
      gsGet<GsPaginatedSubjects>(`/subjects/my${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
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

  return useMutation<GsSubject, Error, GsCreateSubjectInput>({
    mutationFn: (input) => gsPost<GsSubject>("/subjects", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.myList(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsSubjects.lists() });
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
        queryKey: queryKeys.gsSubjects.myList(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsSubjects.lists() });
      queryClient.setQueryData(
        queryKeys.gsSubjects.detail(updated.id),
        updated,
      );
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

// ─── TEACHER: POST /subjects/:subjectId/elkpd ────────────────────────────────

export function useGsAddELKPD() {
  const queryClient = useQueryClient();

  return useMutation<
    GsELKPD,
    Error,
    { subjectId: string; data: GsCreateELKPDInput }
  >({
    mutationFn: ({ subjectId, data }) =>
      gsPost<GsELKPD>(`/subjects/${subjectId}/elkpd`, data),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.detail(subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.elkpd(subjectId),
      });
    },
  });
}

// ─── TEACHER: PUT /subjects/:subjectId/elkpd/:elkpdId ────────────────────────

export function useGsUpdateELKPD() {
  const queryClient = useQueryClient();

  return useMutation<
    GsELKPD,
    Error,
    { subjectId: string; elkpdId: string; data: GsUpdateELKPDInput }
  >({
    mutationFn: ({ subjectId, elkpdId, data }) =>
      gsPut<GsELKPD>(`/subjects/${subjectId}/elkpd/${elkpdId}`, data),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.detail(subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.elkpd(subjectId),
      });
    },
  });
}

// ─── TEACHER: DELETE /subjects/:subjectId/elkpd/:elkpdId ─────────────────────

export function useGsDeleteELKPD() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { subjectId: string; elkpdId: string }>({
    mutationFn: ({ subjectId, elkpdId }) =>
      gsDel<void>(`/subjects/${subjectId}/elkpd/${elkpdId}`),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.detail(subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.elkpd(subjectId),
      });
    },
  });
}
