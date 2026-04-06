/**
 * Observation Hooks
 * Custom React Query hooks untuk Observation operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observationService } from "../observation.service";
import { queryKeys } from "@/libs/api";
import {
  ICreateObservationInput,
  IUpdateObservationInput,
} from "@/types/observation";

// ============ QUERIES ============

/**
 * Hook untuk get observation by therapy ID
 */
export function useObservationByTherapy(therapyId: string) {
  return useQuery({
    queryKey: queryKeys.observations.byTherapy(therapyId),
    queryFn: () => observationService.getObservationByTherapyId(therapyId),
    enabled: !!therapyId,
  });
}

/**
 * Hook untuk get observation by ID
 */
export function useObservation(id: string) {
  return useQuery({
    queryKey: queryKeys.observations.detail(id),
    queryFn: () => observationService.getObservationById(id),
    enabled: !!id,
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk create observation
 */
export function useCreateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateObservationInput) =>
      observationService.createObservation(data),
    onSuccess: (newObservation) => {
      // Invalidate observations
      queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.observations.byTherapy(newObservation.therapyId),
      });
    },
  });
}

/**
 * Hook untuk update observation
 */
export function useUpdateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateObservationInput }) =>
      observationService.updateObservation(id, data),
    onSuccess: (updatedObservation) => {
      // Invalidate observations
      queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
      // Update specific observation cache
      queryClient.setQueryData(
        queryKeys.observations.detail(updatedObservation._id),
        updatedObservation
      );
      // Invalidate therapy-specific query
      queryClient.invalidateQueries({
        queryKey: queryKeys.observations.byTherapy(
          updatedObservation.therapyId
        ),
      });
    },
  });
}

/**
 * Hook untuk delete observation
 */
export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => observationService.deleteObservation(id),
    onSuccess: () => {
      // Invalidate all observation queries
      queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
    },
  });
}
