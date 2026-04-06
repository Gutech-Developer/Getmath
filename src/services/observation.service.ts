/**
 * Observation Service
 *
 * Service untuk operasi CRUD Observation
 */

"use server";

import { serverGet as get, serverPost as post, serverPut as put, serverDel as del } from "@/libs/api/server";
import {
  IObservation,
  ICreateObservationInput,
  IUpdateObservationInput,
} from "@/types/observation";

// ============ OBSERVATION SERVICE ============

/**
 * Create observation (Counselor only)
 */
async function createObservation(
  data: ICreateObservationInput
): Promise<IObservation> {
  return await post<IObservation>("/observation", data);
}

/**
 * Get observation by therapy ID
 */
async function getObservationByTherapyId(
  therapyId: string
): Promise<IObservation> {
  return await get<IObservation>(`/observation/therapy/${therapyId}`);
}

/**
 * Get observation by ID
 */
async function getObservationById(id: string): Promise<IObservation> {
  return await get<IObservation>(`/observation/${id}`);
}

/**
 * Update observation (Counselor only)
 */
async function updateObservation(
  id: string,
  data: IUpdateObservationInput
): Promise<IObservation> {
  return await put<IObservation>(`/observation/${id}`, data);
}

/**
 * Delete observation (Counselor only)
 */
async function deleteObservation(id: string): Promise<void> {
  return await del<void>(`/observation/${id}`);
}

// Export observation service
export const observationService = {
  createObservation,
  getObservationByTherapyId,
  getObservationById,
  updateObservation,
  deleteObservation,
};
