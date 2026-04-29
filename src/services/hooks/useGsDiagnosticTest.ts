"use client";

/**
 * GetSmart API — Diagnostic Test Hooks
 *
 * Role breakdown:
 *  - ADMIN         : GET / (semua tes), GET /:id
 *  - TEACHER       : POST (buat), GET /my (milik sendiri), PATCH /:id (edit), DELETE /:id
 *  - TEACHER/ADMIN : GET /teacher/:teacherId, GET /:id
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPatch, gsDel } from "@/libs/api/getsmart";
import type {
  GsDiagnosticTest,
  GsCreateDiagnosticTestInput,
  GsUpdateDiagnosticTestInput,
  GsPaginatedDiagnosticTests,
  GsPaginationParams,
} from "@/types/gs-diagnostic-test";

interface IGsMyDiagnosticTestsQueryOptions {
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

// ─── ADMIN/TEACHER: GET /diagnostic-tests ────────────────────────────────────

export function useGsAllDiagnosticTests(params?: GsPaginationParams) {
  return useQuery<GsPaginatedDiagnosticTests, Error>({
    queryKey: queryKeys.gsDiagnosticTests.list(
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedDiagnosticTests>(
        `/diagnostic-tests${buildQuery(params)}`,
      ),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER: GET /diagnostic-tests/my ───────────────────────────────────────

export function useGsMyDiagnosticTests(
  params?: GsPaginationParams,
  options?: IGsMyDiagnosticTestsQueryOptions,
) {
  return useQuery<GsPaginatedDiagnosticTests, Error>({
    queryKey: queryKeys.gsDiagnosticTests.myList(
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedDiagnosticTests>(
        `/diagnostic-tests/my${buildQuery(params)}`,
      ),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 2 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN: GET /diagnostic-tests/teacher/:teacherId ─────────────────

export function useGsDiagnosticTestsByTeacher(
  teacherId: string,
  params?: GsPaginationParams,
) {
  return useQuery<GsPaginatedDiagnosticTests, Error>({
    queryKey: queryKeys.gsDiagnosticTests.byTeacher(
      teacherId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedDiagnosticTests>(
        `/diagnostic-tests/teacher/${teacherId}${buildQuery(params)}`,
      ),
    enabled: !!teacherId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN: GET /diagnostic-tests/:id ────────────────────────────────

export function useGsDiagnosticTestById(id: string) {
  return useQuery<GsDiagnosticTest, Error>({
    queryKey: queryKeys.gsDiagnosticTests.detail(id),
    queryFn: () => gsGet<GsDiagnosticTest>(`/diagnostic-tests/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── TEACHER: POST /diagnostic-tests ─────────────────────────────────────────

export function useGsCreateDiagnosticTest() {
  const queryClient = useQueryClient();

  return useMutation<GsDiagnosticTest, Error, GsCreateDiagnosticTestInput>({
    mutationFn: (input) => gsPost<GsDiagnosticTest>("/diagnostic-tests", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.myList(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.lists(),
      });
    },
  });
}

// ─── TEACHER: PATCH /diagnostic-tests/:id ────────────────────────────────────

export function useGsUpdateDiagnosticTest() {
  const queryClient = useQueryClient();

  return useMutation<
    GsDiagnosticTest,
    Error,
    { id: string; data: GsUpdateDiagnosticTestInput }
  >({
    mutationFn: ({ id, data }) =>
      gsPatch<GsDiagnosticTest>(`/diagnostic-tests/${id}`, data),
    onSuccess: async (_updated, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.myList(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.detail(variables.id),
      });
    },
  });
}

// ─── TEACHER: DELETE /diagnostic-tests/:id ───────────────────────────────────

export function useGsDeleteDiagnosticTest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/diagnostic-tests/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.myList(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsDiagnosticTests.lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.gsDiagnosticTests.detail(id),
      });
    },
  });
}
