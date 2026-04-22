"use client";

/**
 * GetSmart API — Course Hooks
 *
 * Role breakdown:
 *  - ADMIN   : GET /courses (semua), archive/unarchive/delete semua course
 *  - TEACHER : POST (buat), GET /my (milik sendiri), PATCH (edit/archive/unarchive/delete milik sendiri)
 *  - STUDENT : GET /slug/:slug dan /:id (lihat detail course yang diikuti)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPatch, gsDel } from "@/libs/api/getsmart";
import type {
  GsCourse,
  GsCreateCourseInput,
  GsUpdateCourseInput,
  GsPaginatedCourses,
  GsPaginationParams,
} from "@/types/gs-course";

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

// ─── ADMIN: GET /courses — semua kelas ───────────────────────────────────────

export function useGsAllCourses(params?: GsPaginationParams) {
  return useQuery<GsPaginatedCourses, Error>({
    queryKey: queryKeys.gsCourses.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedCourses>(`/courses${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER: GET /courses/my — kelas milik teacher login ────────────────────

export function useGsMyCourses(params?: GsPaginationParams) {
  return useQuery<GsPaginatedCourses, Error>({
    queryKey: queryKeys.gsCourses.myList(params as Record<string, unknown>),
    queryFn: () =>
      gsGet<GsPaginatedCourses>(`/courses/my${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN: GET /courses/teacher/:teacherId ──────────────────────────

export function useGsCoursesByTeacher(
  teacherId: string,
  params?: GsPaginationParams,
) {
  return useQuery<GsPaginatedCourses, Error>({
    queryKey: queryKeys.gsCourses.byTeacher(
      teacherId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      gsGet<GsPaginatedCourses>(
        `/courses/teacher/${teacherId}${buildQuery(params)}`,
      ),
    enabled: !!teacherId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN/STUDENT: GET /courses/slug/:slug ──────────────────────────

export function useGsCourseBySlug(slug: string) {
  return useQuery<GsCourse, Error>({
    queryKey: queryKeys.gsCourses.bySlug(slug),
    queryFn: () => gsGet<GsCourse>(`/courses/slug/${slug}`),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── TEACHER/ADMIN/STUDENT: GET /courses/:id ─────────────────────────────────

export function useGsCourseById(id: string) {
  return useQuery<GsCourse, Error>({
    queryKey: queryKeys.gsCourses.detail(id),
    queryFn: () => gsGet<GsCourse>(`/courses/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── TEACHER: POST /courses — buat kelas baru ────────────────────────────────

export function useGsCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<GsCourse, Error, GsCreateCourseInput>({
    mutationFn: (input) => gsPost<GsCourse>("/courses", input),
    onSuccess: () => {
      // Invalidate list milik teacher dan list admin
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
    },
  });
}

// ─── TEACHER: PATCH /courses/:id — edit kelas ────────────────────────────────

export function useGsUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation<
    GsCourse,
    Error,
    { id: string; data: GsUpdateCourseInput }
  >({
    mutationFn: ({ id, data }) => gsPatch<GsCourse>(`/courses/${id}`, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
      queryClient.setQueryData(queryKeys.gsCourses.detail(updated.id), updated);
    },
  });
}

// ─── TEACHER/ADMIN: PATCH /courses/:id/archive ───────────────────────────────

export function useGsArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation<GsCourse, Error, string>({
    mutationFn: (id) => gsPatch<GsCourse>(`/courses/${id}/archive`),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
      queryClient.setQueryData(queryKeys.gsCourses.detail(updated.id), updated);
    },
  });
}

// ─── TEACHER/ADMIN: PATCH /courses/:id/unarchive ─────────────────────────────

export function useGsUnarchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation<GsCourse, Error, string>({
    mutationFn: (id) => gsPatch<GsCourse>(`/courses/${id}/unarchive`),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
      queryClient.setQueryData(queryKeys.gsCourses.detail(updated.id), updated);
    },
  });
}

// ─── TEACHER/ADMIN: DELETE /courses/:id ──────────────────────────────────────

export function useGsDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/courses/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.gsCourses.detail(id) });
    },
  });
}
