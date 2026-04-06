/**
 * Child Service
 *
 * Service untuk operasi CRUD Child
 */

"use server";

import { serverGet as get, serverPost as post, serverPut as put, serverDel as del } from "@/libs/api/server";
import { IChild, ICreateChildInput, IUpdateChildInput } from "@/types/child";

// ============ CHILD SERVICE ============

/**
 * Create child (Parent only)
 */
async function createChild(data: ICreateChildInput): Promise<IChild> {
  return await post<IChild>("/child", data);
}

/**
 * Get children by parent ID
 */
async function getChildrenByParentId(parentId: string): Promise<IChild[]> {
  return await get<IChild[]>(`/child/parent/${parentId}`);
}

/**
 * Get child by ID
 */
async function getChildById(id: string): Promise<IChild> {
  return await get<IChild>(`/child/${id}`);
}

/**
 * Update child (Parent only)
 */
async function updateChild(
  id: string,
  data: IUpdateChildInput
): Promise<IChild> {
  return await put<IChild>(`/child/${id}`, data);
}

/**
 * Delete child (Parent only)
 */
async function deleteChild(id: string): Promise<void> {
  return await del<void>(`/child/${id}`);
}

// Export child service
export const childService = {
  createChild,
  getChildrenByParentId,
  getChildById,
  updateChild,
  deleteChild,
};
