import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { apiRequest, apiPublicRequest, FetchRequestConfig } from "./client";

/**
 * Generic hook for API queries WITH auth
 */
export function useApiQuery<TData>(
  queryKey: QueryKey,
  url: string,
  config?: FetchRequestConfig,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => apiRequest<TData>(url, { ...config, method: "GET" }),
    ...options,
  });
}

/**
 * Generic hook for API queries WITHOUT auth (Public)
 */
export function useApiPublicQuery<TData>(
  queryKey: QueryKey,
  url: string,
  config?: FetchRequestConfig,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => apiPublicRequest<TData>(url, { ...config, method: "GET" }),
    ...options,
  });
}

/**
 * Generic hook for API mutations WITH auth
 */
export function useApiMutation<TData, TVariables = unknown>(
  options?: Omit<
    UseMutationOptions<
      TData,
      Error,
      { url: string; data?: TVariables; config?: FetchRequestConfig }
    >,
    "mutationFn"
  >
) {
  return useMutation<
    TData,
    Error,
    { url: string; data?: TVariables; config?: FetchRequestConfig }
  >({
    mutationFn: ({ url, data, config }) =>
      apiRequest<TData>(url, { ...config, method: "POST", body: data }),
    ...options,
  });
}

/**
 * Generic hook for POST WITH auth
 */
export function usePost<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => apiRequest<TData>(url, { method: "POST", body: data }),
    ...options,
  });
}

/**
 * Generic hook for PUT WITH auth
 */
export function usePut<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => apiRequest<TData>(url, { method: "PUT", body: data }),
    ...options,
  });
}

/**
 * Generic hook for PATCH WITH auth
 */
export function usePatch<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) =>
      apiRequest<TData>(url, { method: "PATCH", body: data }),
    ...options,
  });
}

/**
 * Generic hook for DELETE WITH auth
 */
export function useDelete<TData>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, void>, "mutationFn">
) {
  return useMutation<TData, Error, void>({
    mutationFn: () => apiRequest<TData>(url, { method: "DELETE" }),
    ...options,
  });
}

/**
 * Generic hook for API mutations WITHOUT auth (Public)
 */
export function useApiPublicMutation<TData, TVariables = unknown>(
  options?: Omit<
    UseMutationOptions<
      TData,
      Error,
      { url: string; data?: TVariables; config?: FetchRequestConfig }
    >,
    "mutationFn"
  >
) {
  return useMutation<
    TData,
    Error,
    { url: string; data?: TVariables; config?: FetchRequestConfig }
  >({
    mutationFn: ({ url, data, config }) =>
      apiPublicRequest<TData>(url, { ...config, method: "POST", body: data }),
    ...options,
  });
}

/**
 * Generic hook for POST WITHOUT auth (Public)
 */
export function usePublicPost<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) =>
      apiPublicRequest<TData>(url, { method: "POST", body: data }),
    ...options,
  });
}
