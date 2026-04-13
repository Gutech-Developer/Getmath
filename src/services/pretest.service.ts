/**
 * Pretest Service
 *
 * Service untuk operasi CRUD Pretest (SDQ)
 */

import {
  serverGet as get,
  serverPost as post,
  serverPut as put,
  serverDel as del,
} from "@/libs/api/server";
import {
  IPretest,
  ICreatePretestInput,
  IUpdatePretestInput,
} from "@/types/pretest";

// ============ PRETEST SERVICE ============

/**
 * Create pretest (Counselor only)
 */
async function createPretest(data: ICreatePretestInput): Promise<IPretest> {
  return await post<IPretest>("/pretest", data);
}

/**
 * Get pretest by therapy ID
 */
async function getPretestByTherapyId(therapyId: string): Promise<IPretest> {
  return await get<IPretest>(`/pretest/therapy/${therapyId}`);
}

/**
 * Get pretest by ID
 */
async function getPretestById(id: string): Promise<IPretest> {
  return await get<IPretest>(`/pretest/${id}`);
}

/**
 * Update pretest (Counselor only)
 */
async function updatePretest(
  id: string,
  data: IUpdatePretestInput,
): Promise<IPretest> {
  return await put<IPretest>(`/pretest/${id}`, data);
}

/**
 * Delete pretest (Counselor only)
 */
async function deletePretest(id: string): Promise<void> {
  return await del<void>(`/pretest/${id}`);
}

// Export pretest service
export const pretestService = {
  createPretest,
  getPretestByTherapyId,
  getPretestById,
  updatePretest,
  deletePretest,
};
