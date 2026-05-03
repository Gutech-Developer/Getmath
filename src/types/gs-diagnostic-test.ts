/**
 * GetSmart API — Diagnostic Test Types
 */

import type { GsPaginationMeta, GsPaginationParams } from "./gs-course";

export type { GsPaginationMeta, GsPaginationParams };

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface GsTestOption {
  id: string;
  questionId: string;
  option: string;
  textAnswer: string | null;
  imageAnswerUrl: string | null;
  isCorrect: boolean;
}

export interface GsTestQuestionDiscussion {
  id: string;
  questionId: string;
  textDiscussion: string | null;
  videoUrl: string | null;
}

export interface GsTestQuestion {
  id: string;
  packageId: string;
  questionNumber: number;
  textQuestion: string | null;
  imageQuestionUrl: string | null;
  pembahasan: string;
  videoUrl: string;
  options: GsTestOption[];
  discussion?: GsTestQuestionDiscussion | null;
}

export interface GsTestQuestionPackage {
  id: string;
  diagnosticTestId: string;
  packageName: string | null;
  questions: GsTestQuestion[];
}

export interface GsDiagnosticTest {
  id: string;
  teacherId: string;
  testName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  /** Optional: precomputed total question count returned by some list endpoints */
  totalQuestions?: number;
  packages?: GsTestQuestionPackage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated result ─────────────────────────────────────────────────────────

export interface GsPaginatedDiagnosticTests {
  diagnosticTests: GsDiagnosticTest[];
  pagination: GsPaginationMeta;
}

// ─── Input: Create ────────────────────────────────────────────────────────────

export interface GsCreateTestOptionInput {
  option: string;
  textAnswer?: string;
  imageAnswerUrl?: string;
  isCorrect: boolean;
}

export interface GsCreateTestQuestionDiscussionInput {
  textDiscussion?: string;
  videoUrl?: string;
}

export interface GsCreateTestQuestionInput {
  questionNumber: number;
  textQuestion?: string;
  imageQuestionUrl?: string;
  pembahasan: string;
  videoUrl?: string;
  options: GsCreateTestOptionInput[];
  discussion?: GsCreateTestQuestionDiscussionInput;
}

export interface GsCreateTestQuestionPackageInput {
  packageName?: string;
  questions: GsCreateTestQuestionInput[];
}

export interface GsCreateDiagnosticTestInput {
  testName: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  packages: GsCreateTestQuestionPackageInput[];
}

// ─── Input: Update (upsert — id opsional) ────────────────────────────────────

export interface GsUpsertTestOptionInput {
  id?: string;
  option: string;
  textAnswer?: string;
  imageAnswerUrl?: string;
  isCorrect: boolean;
}

export interface GsUpsertTestQuestionDiscussionInput {
  textDiscussion?: string;
  videoUrl?: string;
}

export interface GsUpsertTestQuestionInput {
  id?: string;
  questionNumber: number;
  textQuestion?: string;
  imageQuestionUrl?: string;
  pembahasan: string;
  videoUrl?: string;
  options: GsUpsertTestOptionInput[];
  discussion?: GsUpsertTestQuestionDiscussionInput | null;
}

export interface GsUpsertTestQuestionPackageInput {
  id?: string;
  packageName?: string;
  questions: GsUpsertTestQuestionInput[];
}

export interface GsUpdateDiagnosticTestInput {
  testName?: string;
  description?: string | null;
  durationMinutes?: number;
  passingScore?: number;
  packages?: GsUpsertTestQuestionPackageInput[];
}
