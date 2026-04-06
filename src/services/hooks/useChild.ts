/**
 * Child Hooks
 * Custom React Query hooks untuk Child operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { childService } from "../child.service";
import { queryKeys } from "@/libs/api";
import { ICreateChildInput, IUpdateChildInput } from "@/types/child";

// ============ QUERIES ============

/**
 * Hook untuk get children by parent ID
 */
export function useChildrenByParent(parentId: string) {
  return useQuery({
    queryKey: queryKeys.children.byParent(parentId),
    queryFn: () => childService.getChildrenByParentId(parentId),
    enabled: !!parentId,
  });
}

/**
 * Hook untuk get child by ID
 */
export function useChild(id: string) {
  return useQuery({
    queryKey: queryKeys.children.detail(id),
    queryFn: () => childService.getChildById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create child
 */
export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateChildInput) => childService.createChild(data),
    onSuccess: () => {
      // Invalidate children queries
      queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
    },
  });
}

/**
 * Hook untuk update child
 */
export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateChildInput }) =>
      childService.updateChild(id, data),
    onSuccess: (updatedChild) => {
      // Invalidate children queries
      queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      // Update specific child cache
      queryClient.setQueryData(
        queryKeys.children.detail(updatedChild._id),
        updatedChild
      );
    },
  });
}

/**
 * Hook untuk delete child
 */
export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => childService.deleteChild(id),
    onSuccess: () => {
      // Invalidate children queries
      queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      // Also invalidate related therapies
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all });
    },
  });
}
