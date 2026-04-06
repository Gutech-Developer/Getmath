/**
 * Screening Hooks
 * Custom React Query hooks untuk Screening (DASS) operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { screeningService } from "../screening.service";
import { queryKeys } from "@/libs/api";
import {
  ICreateScreeningInput,
  IUpdateScreeningInput,
} from "@/types/screening";

// ============ QUERIES ============

/**
 * Hook untuk get screening by therapy ID
 */
export function useScreeningByTherapy(therapyId: string) {
  return useQuery({
    queryKey: queryKeys.screenings.byTherapy(therapyId),
    queryFn: () => screeningService.getScreeningByTherapyId(therapyId),
    enabled: !!therapyId,
  });
}

/**
 * Hook untuk get screening by ID
 */
export function useScreening(id: string) {
  return useQuery({
    queryKey: queryKeys.screenings.detail(id),
    queryFn: () => screeningService.getScreeningById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create screening
 */
export function useCreateScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateScreeningInput) =>
      screeningService.createScreening(data),
    onSuccess: (newScreening) => {
      // Invalidate screenings
      queryClient.invalidateQueries({ queryKey: queryKeys.screenings.all });
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.screenings.byTherapy(newScreening.therapyId),
      });
    },
  });
}

/**
 * Hook untuk update screening
 */
export function useUpdateScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateScreeningInput }) =>
      screeningService.updateScreening(id, data),
    onSuccess: (updatedScreening) => {
      // Invalidate screenings
      queryClient.invalidateQueries({ queryKey: queryKeys.screenings.all });
      // Update specific screening cache
      queryClient.setQueryData(
        queryKeys.screenings.detail(updatedScreening._id),
        updatedScreening
      );
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.screenings.byTherapy(updatedScreening.therapyId),
      });
    },
  });
}

/**
 * Hook untuk delete screening
 */
export function useDeleteScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => screeningService.deleteScreening(id),
    onSuccess: () => {
      // Invalidate all screening queries
      queryClient.invalidateQueries({ queryKey: queryKeys.screenings.all });
    },
  });
}
