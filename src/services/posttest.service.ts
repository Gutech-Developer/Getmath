/**
 * Posttest Service
 *
 * Service untuk operasi CRUD Posttest (SDQ)
 */

"use server";

import { serverGet as get, serverPost as post, serverPut as put, serverDel as del } from "@/libs/api/server";
import {
  IPosttest,
  ICreatePosttestInput,
  IUpdatePosttestInput,
} from "@/types/posttest";

// ============ POSTTEST SERVICE ============

/**
 * Create posttest (Counselor only)
 */
async function createPosttest(data: ICreatePosttestInput): Promise<IPosttest> {
  return await post<IPosttest>("/posttest", data);
}

/**
 * Get posttest by therapy ID
 */
async function getPosttestByTherapyId(therapyId: string): Promise<IPosttest> {
  return await get<IPosttest>(`/posttest/therapy/${therapyId}`);
}

/**
 * Get posttest by ID
 */
async function getPosttestById(id: string): Promise<IPosttest> {
  return await get<IPosttest>(`/posttest/${id}`);
}

/**
 * Update posttest (Counselor only)
 */
async function updatePosttest(
  id: string,
  data: IUpdatePosttestInput
): Promise<IPosttest> {
  return await put<IPosttest>(`/posttest/${id}`, data);
}

/**
 * Delete posttest (Counselor only)
 */
async function deletePosttest(id: string): Promise<void> {
  return await del<void>(`/posttest/${id}`);
}

// Export posttest service
export const posttestService = {
  createPosttest,
  getPosttestByTherapyId,
  getPosttestById,
  updatePosttest,
  deletePosttest,
};
