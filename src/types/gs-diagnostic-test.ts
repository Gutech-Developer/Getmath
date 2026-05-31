/**
 * GetSmart API — Diagnostic Test Types
 */

import type { GsPaginationMeta, GsPaginationParams } from "./gs-course";

export type { GsPaginationMeta, GsPaginationParams };

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface GsTestOption {
  id: string;
  questionId?: string;
  option: string;
  textAnswer: string | null;
  imageAnswerUrl: string | null;
  isCorrect: boolean;
}

export interface GsTestQuestionDiscussion {
  id?: string;
  questionId?: string;
  textDiscussion: string | null;
}

export interface GsTestQuestion {
  id: string;
  diagnosticTestId?: string;
  questionNumber: number;
  textQuestion: string | null;
  imageQuestionUrl: string | null;
  pembahasan: string;
  options: GsTestOption[];
  discussion?: GsTestQuestionDiscussion | null;
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
  questions?: GsTestQuestion[];
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
}

export interface GsCreateTestQuestionInput {
  questionNumber: number;
  textQuestion?: string;
  imageQuestionUrl?: string;
  pembahasan: string;
  options: GsCreateTestOptionInput[];
  discussion?: GsCreateTestQuestionDiscussionInput;
}

export interface GsCreateDiagnosticTestInput {
  testName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  questions: GsCreateTestQuestionInput[];
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
}

export interface GsUpsertTestQuestionInput {
  id?: string;
  questionNumber: number;
  textQuestion?: string;
  imageQuestionUrl?: string;
  pembahasan: string;
  options: GsUpsertTestOptionInput[];
  discussion?: GsUpsertTestQuestionDiscussionInput | null;
}

export interface GsUpdateDiagnosticTestInput {
  testName?: string;
  description?: string | null;
  durationMinutes?: number;
  passingScore?: number;
  questions?: GsUpsertTestQuestionInput[];
}
