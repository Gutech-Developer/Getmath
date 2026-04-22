"use client";

/**
 * GetSmart API — TanStack Query Hooks
 *
 * Hooks ini menjembatani antara TanStack Query (client) dan
 * server actions di getsmart.ts (server).
 *
 * Pola:
 *  - useGs*Query  → useQuery  (GET / read)
 *  - useGs*Mutation → useMutation (POST / PUT / PATCH / DELETE)
 *
 * queryFn selalu memanggil server action dari getsmart.ts,
 * sehingga fetch tetap berjalan di server dan INTERNAL_API_KEY
 * tidak pernah bocor ke browser.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  gsGet,
  gsPost,
  gsPut,
  gsPatch,
  gsDel,
  gsPublicGet,
  gsPublicPost,
  type GsRequestConfig,
} from "./getsmart";

// ─── Generic Query (GET protected) ───────────────────────────────────────────

/**
 * Generic hook untuk GET request yang memerlukan auth.
 *
 * @example
 * const { data } = useGsQuery(queryKeys.courses.list(), "/courses");
 */
export function useGsQuery<TData>(
  queryKey: QueryKey,
  path: string,
  next?: NextFetchRequestConfig,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => gsGet<TData>(path, next),
    ...options,
  });
}

/**
 * Generic hook untuk GET request publik (tanpa auth).
 *
 * @example
 * const { data } = useGsPublicQuery(["google-url"], "/auth/google/url");
 */
export function useGsPublicQuery<TData>(
  queryKey: QueryKey,
  path: string,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => gsPublicGet<TData>(path),
    ...options,
  });
}

// ─── Generic Mutations ────────────────────────────────────────────────────────

/**
 * Generic POST mutation (protected).
 *
 * @example
 * const { mutate } = useGsPost<ICourse, CreateCourseInput>("/courses", {
 *   onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() }),
 * });
 */
export function useGsPost<TData, TVariables = unknown>(
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => gsPost<TData>(path, data),
    ...options,
  });
}

/**
 * Generic POST mutation — path dinamis (path berubah per item).
 *
 * @example
 * const { mutate } = useGsDynamicPost<ICourse, { courseId: string; body: unknown }>({
 *   mutationFn: ({ courseId, body }) => gsPost(`/courses/${courseId}/enroll`, body),
 * });
 */
export function useGsDynamicPost<TData, TVariables = unknown>(
  options: UseMutationOptions<TData, Error, TVariables>,
) {
  return useMutation<TData, Error, TVariables>(options);
}

/**
 * Generic PUT mutation (protected).
 */
export function useGsPut<TData, TVariables = unknown>(
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => gsPut<TData>(path, data),
    ...options,
  });
}

/**
 * Generic PATCH mutation (protected).
 *
 * @example
 * const { mutate } = useGsPatch<ICourse, UpdateCourseInput>(`/courses/${id}`);
 */
export function useGsPatch<TData, TVariables = unknown>(
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => gsPatch<TData>(path, data),
    ...options,
  });
}

/**
 * Generic DELETE mutation (protected).
 *
 * @example
 * const { mutate } = useGsDelete(`/courses/${id}`, {
 *   onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() }),
 * });
 */
export function useGsDelete<TData = void>(
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, void>, "mutationFn">,
) {
  return useMutation<TData, Error, void>({
    mutationFn: () => gsDel<TData>(path),
    ...options,
  });
}

/**
 * Generic POST mutation publik (tanpa auth).
 * Cocok untuk: login, register, forgot-password.
 *
 * @example
 * const { mutate: login } = useGsPublicPost<LoginResponse, LoginInput>("/auth/login", {
 *   onSuccess: async (data) => { await saveTokens(data); router.push("/dashboard"); },
 * });
 */
export function useGsPublicPost<TData, TVariables = unknown>(
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => gsPublicPost<TData>(path, data),
    ...options,
  });
}

// ─── Specialised: Invalidate Helper ──────────────────────────────────────────

/**
 * Mengembalikan helper `invalidate` untuk memudahkan invalidasi query setelah mutasi.
 *
 * @example
 * const invalidate = useGsInvalidate();
 * // di dalam onSuccess:
 * invalidate(queryKeys.courses.lists());
 */
export function useGsInvalidate() {
  const queryClient = useQueryClient();
  return (queryKey: QueryKey) =>
    queryClient.invalidateQueries({ queryKey: queryKey as readonly unknown[] });
}
