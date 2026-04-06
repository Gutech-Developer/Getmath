/**
 * Posttest Hooks
 * Custom React Query hooks untuk Posttest (SDQ) operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posttestService } from "../posttest.service";
import { queryKeys } from "@/libs/api";
import { ICreatePosttestInput, IUpdatePosttestInput } from "@/types/posttest";

// ============ QUERIES ============

/**
 * Hook untuk get posttest by therapy ID
 */
export function usePosttestByTherapy(therapyId: string) {
  return useQuery({
    queryKey: queryKeys.posttests.byTherapy(therapyId),
    queryFn: () => posttestService.getPosttestByTherapyId(therapyId),
    enabled: !!therapyId,
  });
}

/**
 * Hook untuk get posttest by ID
 */
export function usePosttest(id: string) {
  return useQuery({
    queryKey: queryKeys.posttests.detail(id),
    queryFn: () => posttestService.getPosttestById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create posttest
 */
export function useCreatePosttest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreatePosttestInput) =>
      posttestService.createPosttest(data),
    onSuccess: (newPosttest) => {
      // Invalidate posttests
      queryClient.invalidateQueries({ queryKey: queryKeys.posttests.all });
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.posttests.byTherapy(newPosttest.therapyId),
      });
    },
  });
}

/**
 * Hook untuk update posttest
 */
export function useUpdatePosttest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePosttestInput }) =>
      posttestService.updatePosttest(id, data),
    onSuccess: (updatedPosttest) => {
      // Invalidate posttests
      queryClient.invalidateQueries({ queryKey: queryKeys.posttests.all });
      // Update specific posttest cache
      queryClient.setQueryData(
        queryKeys.posttests.detail(updatedPosttest._id),
        updatedPosttest
      );
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.posttests.byTherapy(updatedPosttest.therapyId),
      });
    },
  });
}

/**
 * Hook untuk delete posttest
 */
export function useDeletePosttest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => posttestService.deletePosttest(id),
    onSuccess: () => {
      // Invalidate all posttest queries
      queryClient.invalidateQueries({ queryKey: queryKeys.posttests.all });
    },
  });
}
