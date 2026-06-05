import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPatch, gsDel } from "@/libs/api/gsAction";
import { buildQuery } from "./helper";
import { GsPaginationParams } from "@/types";
import {
  CreateUserInput,
  GsPaginatedUser,
  GsUserData,
  UpdateUserInput,
} from "@/types/user";

export function useSearchUser(params?: GsPaginationParams) {
  return useQuery<GsPaginatedUser, Error>({
    queryKey: queryKeys.userMangement.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedUser>(`/users${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllUsers(params?: GsPaginationParams) {
  return useQuery<GsPaginatedUser, Error>({
    queryKey: queryKeys.userMangement.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedUser>(`/users${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserById(id: string) {
  return useQuery<GsPaginatedUser, Error>({
    queryKey: queryKeys.userMangement.detail(id),
    queryFn: () => gsGet<GsPaginatedUser>(`/users${id}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<GsUserData, Error, CreateUserInput>({
    mutationFn: (input) => gsPost<GsUserData>("/user", input),
    onSuccess: () => {
      // Invalidate list milik teacher dan list admin
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<GsUserData, Error, { id: string; data: UpdateUserInput }>({
    mutationFn: ({ id, data }) => gsPatch<GsUserData>(`/users/${id}`, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
      queryClient.setQueryData(
        queryKeys.userMangement.detail(updated.userId),
        updated,
      );
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<GsUserData, Error, string>({
    mutationFn: (id) => gsPatch<GsUserData>(`/users/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userMangement.lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.userMangement.detail(id),
      });
    },
  });
}
