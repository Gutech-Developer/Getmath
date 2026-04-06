/**
 * Pretest Hooks
 * Custom React Query hooks untuk Pretest (SDQ) operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pretestService } from "../pretest.service";
import { queryKeys } from "@/libs/api";
import { ICreatePretestInput, IUpdatePretestInput } from "@/types/pretest";

// ============ QUERIES ============

/**
 * Hook untuk get pretest by therapy ID
 */
export function usePretestByTherapy(therapyId: string) {
  return useQuery({
    queryKey: queryKeys.pretests.byTherapy(therapyId),
    queryFn: () => pretestService.getPretestByTherapyId(therapyId),
    enabled: !!therapyId,
  });
}

/**
 * Hook untuk get pretest by ID
 */
export function usePretest(id: string) {
  return useQuery({
    queryKey: queryKeys.pretests.detail(id),
    queryFn: () => pretestService.getPretestById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create pretest
 */
export function useCreatePretest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreatePretestInput) =>
      pretestService.createPretest(data),
    onSuccess: (newPretest) => {
      // Invalidate pretests
      queryClient.invalidateQueries({ queryKey: queryKeys.pretests.all });
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.pretests.byTherapy(newPretest.therapyId),
      });
    },
  });
}

/**
 * Hook untuk update pretest
 */
export function useUpdatePretest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePretestInput }) =>
      pretestService.updatePretest(id, data),
    onSuccess: (updatedPretest) => {
      // Invalidate pretests
      queryClient.invalidateQueries({ queryKey: queryKeys.pretests.all });
      // Update specific pretest cache
      queryClient.setQueryData(
        queryKeys.pretests.detail(updatedPretest._id),
        updatedPretest
      );
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.pretests.byTherapy(updatedPretest.therapyId),
      });
    },
  });
}

/**
 * Hook untuk delete pretest
 */
export function useDeletePretest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pretestService.deletePretest(id),
    onSuccess: () => {
      // Invalidate all pretest queries
      queryClient.invalidateQueries({ queryKey: queryKeys.pretests.all });
    },
  });
}
