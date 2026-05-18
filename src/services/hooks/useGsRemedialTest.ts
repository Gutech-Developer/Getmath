"use client";

/**
 * GetSmart API — Remedial Test Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPatch, gsDel } from "@/libs/api/gsAction";
import type {
  GsRemedialTest,
  GsCreateRemedialTestInput,
  GsUpdateRemedialTestInput,
  GsPaginatedRemedialTests,
} from "@/types/gs-remedial";
import type { GsPaginationParams } from "@/types/gs-course";

// ─── Helper: build query string ───────────────────────────────────────────────

function buildQuery(params?: GsPaginationParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

// ─── ADMIN/TEACHER: GET /remedial-tests ──────────────────────────────────────

export function useGsAllRemedialTests(params?: GsPaginationParams) {
  return useQuery<GsPaginatedRemedialTests, Error>({
    queryKey: queryKeys.gsRemedialTests.list(params as Record<string, unknown>),
    queryFn: () =>
      gsGet<GsPaginatedRemedialTests>(`/remedial-tests${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER: GET /remedial-tests/my ─────────────────────────────────────────

export function useGsMyRemedialTests(
  params?: GsPaginationParams,
  options?: Omit<
    import("@tanstack/react-query").UseQueryOptions<
      GsPaginatedRemedialTests,
      Error
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<GsPaginatedRemedialTests, Error>({
    queryKey: queryKeys.gsRemedialTests.myList(
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedRemedialTests>(
        `/remedial-tests/my${buildQuery(params)}`,
      ),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ─── ADMIN/TEACHER: GET /remedial-tests/teacher/:teacherId ───────────────────

export function useGsRemedialTestsByTeacher(
  teacherId: string,
  params?: GsPaginationParams,
) {
  return useQuery<GsPaginatedRemedialTests, Error>({
    queryKey: queryKeys.gsRemedialTests.byTeacher(
      teacherId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedRemedialTests>(
        `/remedial-tests/teacher/${teacherId}${buildQuery(params)}`,
      ),
    enabled: !!teacherId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── ADMIN/TEACHER: GET /remedial-tests/:id ──────────────────────────────────

export function useGsRemedialTestById(id: string) {
  return useQuery<GsRemedialTest, Error>({
    queryKey: queryKeys.gsRemedialTests.detail(id),
    queryFn: () => gsGet<GsRemedialTest>(`/remedial-tests/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── TEACHER: POST /remedial-tests ───────────────────────────────────────────

export function useGsCreateRemedialTest() {
  const queryClient = useQueryClient();

  return useMutation<GsRemedialTest, Error, GsCreateRemedialTestInput>({
    mutationFn: (input) => gsPost<GsRemedialTest>("/remedial-tests", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsRemedialTests.all,
      });
    },
  });
}

// ─── TEACHER: PATCH /remedial-tests/:id ──────────────────────────────────────

export function useGsUpdateRemedialTest() {
  const queryClient = useQueryClient();

  return useMutation<
    GsRemedialTest,
    Error,
    { id: string; data: GsUpdateRemedialTestInput }
  >({
    mutationFn: ({ id, data }) =>
      gsPatch<GsRemedialTest>(`/remedial-tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsRemedialTests.all,
      });
    },
  });
}

// ─── TEACHER: DELETE /remedial-tests/:id ─────────────────────────────────────

export function useGsDeleteRemedialTest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/remedial-tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsRemedialTests.all,
      });
    },
  });
}
