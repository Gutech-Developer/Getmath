import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPublicGet, gsPost, gsPut, gsDel } from "@/libs/api/gsAction";
import { buildQuery } from "./helper";
import { GsPaginationParams } from "@/types";
import {
  GsPaginatedSchools,
  GsSchoolWithCounts,
  GsSchool,
  CreateSchoolInput,
  UpdateSchoolInput,
} from "@/types/gs-school";

// Admin, Teacher, Student
export function useSchools(params?: GsPaginationParams & { search?: string }) {
  return useQuery<GsPaginatedSchools, Error>({
    queryKey: queryKeys.gsSchools.list(params as Record<string, unknown>),
    queryFn: () => gsGet<GsPaginatedSchools>(`/schools${buildQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

// Public (No Auth required)
export function usePublicSchools(params?: GsPaginationParams & { search?: string }) {
  return useQuery<GsPaginatedSchools, Error>({
    queryKey: queryKeys.gsSchools.publicList(params as Record<string, unknown>),
    queryFn: () => gsPublicGet<GsPaginatedSchools>(`/schools/public${buildQuery(params)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolById(id: string) {
  return useQuery<GsSchoolWithCounts, Error>({
    queryKey: queryKeys.gsSchools.detail(id),
    queryFn: () => gsGet<GsSchoolWithCounts>(`/schools/${id}`),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

// Admin Only
export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation<GsSchool, Error, CreateSchoolInput>({
    mutationFn: (input) => gsPost<GsSchool>("/schools", input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.publicLists(),
      });
    },
  });
}

// Admin Only
export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation<GsSchool, Error, { id: string; data: UpdateSchoolInput }>({
    mutationFn: ({ id, data }) => gsPut<GsSchool>(`/schools/${id}`, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.publicLists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.detail(updated.id),
      });
    },
  });
}

// Admin Only
export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/schools/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSchools.publicLists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.gsSchools.detail(id),
      });
    },
  });
}
