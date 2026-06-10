import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPut, gsDel } from "@/libs/api/gsAction";
import { buildQuery } from "./helper";
import { GsPaginationParams } from "@/types";
import {
  CreateUserInput,
  GsPaginatedUser,
  GsUserData,
  UpdateUserInput,
} from "@/types/user";

export function useSearchUser(params?: GsPaginationParams & { search?: string; role?: string }) {
  return useQuery<GsPaginatedUser, Error>({
    queryKey: queryKeys.userMangement.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedUser>(`/users${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllUsers(params?: GsPaginationParams & { search?: string; role?: string }) {
  return useQuery<GsPaginatedUser, Error>({
    queryKey: queryKeys.userMangement.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedUser>(`/users${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserById(id: string, options?: { enabled?: boolean }) {
  return useQuery<GsUserData, Error>({
    queryKey: queryKeys.userMangement.detail(id),
    queryFn: () => gsGet<GsUserData>(`/users/${id}`),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUserStats() {
  return useQuery<any, Error>({
    queryKey: queryKeys.userMangement.stats(),
    queryFn: () => gsGet<any>("/users/stats"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<GsUserData, Error, CreateUserInput>({
    mutationFn: (input) => gsPost<GsUserData>("/users", input),
    onSuccess: () => {
      // Invalidate list milik teacher dan list admin
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.stats(),
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<GsUserData, Error, { id: string; data: UpdateUserInput }>({
    mutationFn: ({ id, data }) => gsPut<GsUserData>(`/users/${id}`, data),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
      queryClient.setQueryData(
        queryKeys.userMangement.detail(id),
        updated,
      );
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/users/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.stats(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.userMangement.detail(id),
      });
    },
  });
}
