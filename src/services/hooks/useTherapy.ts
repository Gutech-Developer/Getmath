/**
 * Therapy Hooks
 * Custom React Query hooks untuk Therapy operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { therapyService } from "../therapy.service";
import { queryKeys } from "@/libs/api";
import { ICreateTherapyInput, IUpdateTherapyInput } from "@/types/therapy";

// ============ QUERIES ============

/**
 * Hook untuk get all therapies
 */
export function useTherapies() {
  return useQuery({
    queryKey: queryKeys.therapies.lists(),
    queryFn: therapyService.getAllTherapies,
  });
}

/**
 * Hook untuk get therapies by counselor (current counselor)
 */
export function useTherapiesByCounselor() {
  return useQuery({
    queryKey: queryKeys.therapies.byCounselor("current"),
    queryFn: therapyService.getTherapiesByCounselorId,
  });
}

/**
 * Hook untuk get therapies by parent (current parent - via their children)
 */
export function useTherapiesByParent() {
  return useQuery({
    queryKey: queryKeys.therapies.byParent("current"),
    queryFn: therapyService.getTherapiesByParentId,
  });
}

/**
 * Hook untuk get therapies by child ID
 */
export function useTherapiesByChild(childId: string) {
  return useQuery({
    queryKey: queryKeys.therapies.byChild(childId),
    queryFn: () => therapyService.getTherapiesByChildId(childId),
    enabled: !!childId,
  });
}

/**
 * Hook untuk get therapy by ID
 */
export function useTherapy(id: string) {
  return useQuery({
    queryKey: queryKeys.therapies.detail(id),
    queryFn: () => therapyService.getTherapyById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create therapy
 */
export function useCreateTherapy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateTherapyInput) =>
      therapyService.createTherapy(data),
    onSuccess: () => {
      // Invalidate all therapy queries
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all });
    },
  });
}

/**
 * Hook untuk update therapy
 */
export function useUpdateTherapy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateTherapyInput }) =>
      therapyService.updateTherapy(id, data),
    onSuccess: (updatedTherapy) => {
      // Invalidate therapy queries
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all });
      // Update specific therapy cache
      queryClient.setQueryData(
        queryKeys.therapies.detail(updatedTherapy._id),
        updatedTherapy
      );
    },
  });
}

/**
 * Hook untuk delete therapy
 */
export function useDeleteTherapy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => therapyService.deleteTherapy(id),
    onSuccess: () => {
      // Invalidate therapy queries
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all });
      // Also invalidate related data
      queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pretests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posttests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.screenings.all });
    },
  });
}
