/**
 * GetSmart API — Subject (Materi) Types
 */

import type { GsPaginationMeta, GsPaginationParams } from "./gs-course";

export type { GsPaginationMeta, GsPaginationParams };

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface GsELKPD {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GsSubject {
  id: string;
  teacherId: string;
  subjectName: string;
  description: string | null;
  subjectFileUrl: string;
  videoUrl: string | null;
  eLKPD?: GsELKPD | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated result ─────────────────────────────────────────────────────────

export interface GsPaginatedSubjects {
  subjects: GsSubject[];
  pagination: GsPaginationMeta;
}

// ─── Input: Subject ───────────────────────────────────────────────────────────

export interface GsCreateELKPDInput {
  title: string;
  description?: string;
  fileUrl: string;
}

export interface GsCreateSubjectInput {
  subjectName: string;
  description?: string;
  subjectFileUrl: string;
  videoUrl?: string;
  eLKPD?: GsCreateELKPDInput;
}

export interface GsUpdateSubjectInput {
  subjectName?: string;
  description?: string;
  subjectFileUrl?: string;
  videoUrl?: string;
}

// ─── Input: E-LKPD ───────────────────────────────────────────────────────────

export interface GsUpdateELKPDInput {
  title?: string;
  description?: string;
  fileUrl?: string;
}
