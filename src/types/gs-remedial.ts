/**
 * GetSmart API — Remedial Test Types
 */

import { GsPaginationMeta } from "./gs-course";
import { GsTeacherBasic } from "./gs-course";

export interface GsRemedialOption {
  id: string;
  option: string;
  textAnswer?: string | null;
  imageAnswerUrl?: string | null;
  isCorrect: boolean;
}

export interface GsRemedialVariant {
  id: string;
  packageLabel: string;
  textQuestion?: string | null;
  imageQuestionUrl?: string | null;
  discussionText?: string | null;
  discussionVideoUrl?: string | null;
  options: GsRemedialOption[];
}

export interface GsRemedialQuestion {
  id: string;
  questionNumber: number;
  discussionText?: string | null;
  discussionVideoUrl?: string | null;
  discussionImageUrl?: string | null;
  variants: GsRemedialVariant[];
}

export interface GsRemedialTest {
  id: string;
  testName: string;
  description?: string | null;
  durationMinutes: number;
  passingScore: number;
  teacherId: string;
  teacher?: GsTeacherBasic;
  schoolId: string;
  questions?: GsRemedialQuestion[];
  totalQuestions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GsPaginatedRemedialTests {
  remedialTests: GsRemedialTest[];
  pagination: GsPaginationMeta;
}

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface GsCreateRemedialOptionInput {
  option: string;
  textAnswer?: string;
  imageAnswerUrl?: string;
  isCorrect: boolean;
}

export interface GsCreateRemedialVariantInput {
  packageLabel: string;
  textQuestion?: string;
  imageQuestionUrl?: string;
  discussionText?: string;
  discussionVideoUrl?: string;
  options: GsCreateRemedialOptionInput[];
}

export interface GsCreateRemedialQuestionInput {
  questionNumber: number;
  variants: GsCreateRemedialVariantInput[];
}

export interface GsCreateRemedialTestInput {
  testName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  questions: GsCreateRemedialQuestionInput[];
}

export interface GsUpsertRemedialOptionInput {
  id?: string;
  option: string;
  textAnswer?: string;
  imageAnswerUrl?: string;
  isCorrect: boolean;
}

export interface GsUpsertRemedialVariantInput {
  id?: string;
  packageLabel: string;
  textQuestion?: string;
  imageQuestionUrl?: string;
  discussionText?: string;
  discussionVideoUrl?: string;
  options: GsUpsertRemedialOptionInput[];
}

export interface GsUpsertRemedialQuestionInput {
  id?: string;
  questionNumber: number;
  variants: GsUpsertRemedialVariantInput[];
}

export interface GsUpdateRemedialTestInput {
  testName?: string;
  description?: string | null;
  durationMinutes?: number;
  passingScore?: number;
  questions?: GsUpsertRemedialQuestionInput[];
}
