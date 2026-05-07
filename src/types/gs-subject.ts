/**
 * GetSmart API — Subject (Materi) Types
 */

import type { GsPaginationMeta, GsPaginationParams } from "./gs-course";
import type { GsTeacherBasic } from "./gs-course";

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

export interface GsStudentModuleProgress {
  fileReadAt: string | null;
  videoWatchedAt: string | null;
  eLKPDSubmittedAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface GsELKPDSubmissionStudent {
  id: string;
  fullName: string;
}

export interface GsModuleELKPDSubmission {
  id: string;
  studentId: string;
  eLKPDId: string;
  submissionFileUrl: string;
  score: number | null;
  teacherNote: string | null;
  submittedAt: string;
  gradedAt: string | null;
  gradedBy?: GsTeacherBasic | null;
  student?: GsELKPDSubmissionStudent;
  eLKPD?: GsELKPD;
}

export interface GsSubject {
  id: string;
  teacherId: string;
  subjectName: string;
  description: string | null;
  subjectFileUrl: string;
  eLKPDTitle: string | null;
  eLKPDDescription: string | null;
  eLKPDFileUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response dari POST /subjects */
export interface GsCreateSubjectResponse {
  subject: GsSubject;
  eLKPD?: GsELKPD;
}

export interface GsModuleProgressResponse {
  progress: GsStudentModuleProgress | null;
  submissions: GsModuleELKPDSubmission[];
}

export interface GsModuleELKPDSubmissionsResponse {
  submissions: GsModuleELKPDSubmission[];
  pagination: GsPaginationMeta;
}

export interface GsMarkModuleReadResponse {
  fileReadAt: string | null;
  videoWatchedAt: string | null;
  eLKPDSubmittedAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface GsSubmitELKPDResponse {
  submission: GsModuleELKPDSubmission;
  progress: GsStudentModuleProgress | null;
}

export interface GsGradeELKPDSubmissionInput {
  score: number;
  teacherNote?: string;
}

export interface GsGradeELKPDSubmissionResponse {
  id: string;
  score: number | null;
  teacherNote: string | null;
  gradedAt: string | null;
  gradedBy?: GsTeacherBasic | null;
  submittedAt: string;
  studentId: string;
  eLKPDId: string;
  submissionFileUrl: string;
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
