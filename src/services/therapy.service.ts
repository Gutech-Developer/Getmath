/**
 * Therapy Service
 *
 * Service untuk operasi CRUD Therapy
 */

"use server";

import { serverGet as get, serverPost as post, serverPut as put, serverDel as del } from "@/libs/api/server";
import {
  ITherapy,
  ICreateTherapyInput,
  IUpdateTherapyInput,
} from "@/types/therapy";

// ============ THERAPY SERVICE ============

/**
 * Create therapy session (Counselor only)
 */
async function createTherapy(data: ICreateTherapyInput): Promise<ITherapy> {
  return await post<ITherapy>("/therapy", data);
}

/**
 * Get all therapy sessions (Counselor only)
 */
async function getAllTherapies(): Promise<ITherapy[]> {
  return await get<ITherapy[]>("/therapy");
}

/**
 * Get therapies by counselor ID (Counselor only)
 */
async function getTherapiesByCounselorId(): Promise<ITherapy[]> {
  return await get<ITherapy[]>("/therapy/counselor");
}

/**
 * Get therapies by parent ID (Parent only - current parent)
 */
async function getTherapiesByParentId(): Promise<ITherapy[]> {
  return await get<ITherapy[]>("/therapy/parent");
}

/**
 * Get therapies by child ID
 */
async function getTherapiesByChildId(childId: string): Promise<ITherapy[]> {
  return await get<ITherapy[]>(`/therapy/child/${childId}`);
}

/**
 * Get therapy by ID
 */
async function getTherapyById(id: string): Promise<ITherapy> {
  return await get<ITherapy>(`/therapy/${id}`);
}

/**
 * Update therapy (Counselor only)
 */
async function updateTherapy(
  id: string,
  data: IUpdateTherapyInput,
): Promise<ITherapy> {
  return await put<ITherapy>(`/therapy/${id}`, data);
}

/**
 * Delete therapy (Counselor only)
 */
async function deleteTherapy(id: string): Promise<void> {
  return await del<void>(`/therapy/${id}`);
}

// Export therapy service
export const therapyService = {
  createTherapy,
  getAllTherapies,
  getTherapiesByCounselorId,
  getTherapiesByParentId,
  getTherapiesByChildId,
  getTherapyById,
  updateTherapy,
  deleteTherapy,
};
