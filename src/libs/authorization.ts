/**
 * Authorization utilities
 * Functions to check user permissions for various actions
 */

import { ITherapy } from "@/types/therapy";
import { ICurrentUser } from "@/types/auth";

/**
 * Check if the current counselor can edit/create assessments for a therapy session
 * Only the counselor who created the therapy session can create/edit assessments
 */
export function canEditTherapyAssessment(
  therapy: ITherapy | undefined,
  currentUser: ICurrentUser | undefined
): boolean {
  if (!therapy || !currentUser) {
    return false;
  }

  // Check if current user is the counselor who created this therapy
  return therapy.counselorId === currentUser._id;
}

/**
 * Check if user can only view (read-only mode)
 */
export function isReadOnlyMode(
  therapy: ITherapy | undefined,
  currentUser: ICurrentUser | undefined
): boolean {
  return !canEditTherapyAssessment(therapy, currentUser);
}
