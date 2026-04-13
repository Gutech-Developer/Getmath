/**
 * Screening Service
 *
 * Service untuk operasi CRUD Screening (CSTQ - Child Screening Trauma Questionnaire)
 */

import {
  serverGet as get,
  serverPost as post,
  serverPut as put,
  serverDel as del,
} from "@/libs/api/server";
import {
  IScreening,
  ICreateScreeningInput,
  IUpdateScreeningInput,
} from "@/types/screening";

// ============ SCREENING SERVICE ============

/**
 * Create screening (Counselor only)
 */
async function createScreening(
  data: ICreateScreeningInput,
): Promise<IScreening> {
  return await post<IScreening>("/screening", data);
}

/**
 * Get screening by therapy ID
 */
async function getScreeningByTherapyId(therapyId: string): Promise<IScreening> {
  return await get<IScreening>(`/screening/therapy/${therapyId}`);
}

/**
 * Get screening by ID
 */
async function getScreeningById(id: string): Promise<IScreening> {
  return await get<IScreening>(`/screening/${id}`);
}

/**
 * Update screening (Counselor only)
 */
async function updateScreening(
  id: string,
  data: IUpdateScreeningInput,
): Promise<IScreening> {
  return await put<IScreening>(`/screening/${id}`, data);
}

/**
 * Delete screening (Counselor only)
 */
async function deleteScreening(id: string): Promise<void> {
  return await del<void>(`/screening/${id}`);
}

// Export screening service
export const screeningService = {
  createScreening,
  getScreeningByTherapyId,
  getScreeningById,
  updateScreening,
  deleteScreening,
};
