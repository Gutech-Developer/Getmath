"use client";

/**
 * GetSmart API — Student Progress Hooks
 * TanStack Query hooks untuk student progress tracking,
 * test attempts (diagnostik), dan ELKPD grading.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPut, gsDel } from "@/libs/api/gsAction";
import { gsLogger } from "@/utils/logger";
import type { EmotionInput } from "@/libs/emotion/types";

// ─── Types ────────────────────────────────────────────────────────────────

export interface StudentModuleProgress {
  fileReadAt?: string;
  videoWatchedAt?: string;
  eLKPDSubmittedAt?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ELKPDSubmission {
  id: string;
  studentId: string;
  eLKPDId: string;
  content: string;
  submittedAt: string;
  gradedAt?: string;
  grade?: number;
  feedback?: string;
  status: "draft" | "submitted" | "graded";
}

export interface ModuleProgressResponse {
  progress: StudentModuleProgress;
  submissions: ELKPDSubmission[];
  module?: {
    id: string;
    title: string;
    description?: string;
    type: "SUBJECT" | "DIAGNOSTIC_TEST";
  };
}

// ─── Test Attempt Types ───────────────────────────────────────────────────

export interface TestAttemptAnswer {
  testQuestionId: string;
  selectedOptionId: string | null;
}

// Returned by GET /test-attempts/me (DiagnosticAttemptItem from backend)
export interface DiagnosticAttemptItem {
  attemptId: string;
  attemptNumber: number;
  score?: number;
  isPassed: boolean;
  startedAt?: string;
  completedAt?: string;
}

// Returned by POST /test-attempts/start (StartTestAttemptResult from backend)
export interface StartTestAttemptResult {
  attemptId: string;
  attemptNumber: number;
  testQuestionPackageId?: string;
  passingScore: number;
  durationMinutes: number;
  startedAt: string;
  deadlineAt?: string;
  remainingSeconds?: number;
  questions: Array<{
    id: string;
    questionNumber: number;
    textQuestion: string | null;
    imageQuestionUrl: string | null;
    options: Array<{
      id: string;
      option: string;
      textAnswer: string | null;
      imageAnswerUrl: string | null;
    }>;
  }>;
}

export interface StartTestAttemptInput {
  packageId?: string;
}

export interface SubmitTestAttemptInput {
  answers: TestAttemptAnswer[];
}

export interface SubmitTestAttemptResult {
  attemptId: string;
  attemptNumber: number;
  score: number;
  passingScore: number;
  isPassed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  remainingAttempts: number;
  completedAt: string;
}

// ─── Remedial Test Types ──────────────────────────────────────────────────

export interface RemedialOption {
  id: string;
  option: string;
  textAnswer: string | null;
  imageAnswerUrl: string | null;
}

export interface RemedialVariant {
  variantId: string;
  questionNumber: number;
  packageLabel: "A" | "B" | "C";
  textQuestion: string | null;
  imageQuestionUrl: string | null;
  options: RemedialOption[];
}

export interface StartRemedialAttemptResult {
  attemptId: string;
  testName: string;
  durationMinutes: number;
  passingScore: number;
  totalQuestions: number;
  startedAt: string;
  deadlineAt: string;
  remainingSeconds: number;
  currentVariant: RemedialVariant | null;
}

export interface SubmitRemedialVariantInput {
  variantId: string;
  selectedOptionId: string | null;
  startedAt?: string;
  completedAt?: string;
  emotion?: EmotionInput;
}

export interface SubmitRemedialVariantResult {
  isCorrect: boolean;
  isCompleted: boolean;
  discussion?: {
    text: string;
    videoUrl: string;
  } | null;
  nextVariant?: RemedialVariant | null;
  summary?: {
    attemptId: string;
    score: number;
    passingScore: number;
    isPassed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    completedAt: string;
  } | null;
}

export interface DiagnosticAnswerReviewQuestion {
  id: string;
  questionNumber: number;
  textQuestion: string | null;
  imageQuestionUrl?: string | null;
  options: Array<{
    id: string;
    option: string;
    textAnswer: string | null;
    isCorrect: boolean;
    imageAnswerUrl?: string | null;
  }>;
  selectedOptionId: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
}

export interface DiagnosticAnswersReviewResponse {
  courseModuleId: string;
  diagnosticTestId: string;
  testName: string;
  attemptId: string;
  attemptNumber: number;
  score: number;
  isPassed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  questions: DiagnosticAnswerReviewQuestion[];
}

export interface RemedialAnswerReviewVariant {
  id: string;
  packageLabel: "A" | "B" | "C";
  textQuestion: string | null;
  imageQuestionUrl?: string | null;
  options: Array<{
    id: string;
    option: string;
    textAnswer: string | null;
    isCorrect: boolean;
    imageAnswerUrl?: string | null;
  }>;
  selectedOptionId: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
}

export interface RemedialAnswerReviewQuestion {
  id: string;
  questionNumber: number;
  discussionText: string | null;
  discussionVideoUrl: string | null;
  discussionImageUrl?: string | null;
  variants: RemedialAnswerReviewVariant[];
}

export interface RemedialAnswersReviewResponse {
  courseModuleId: string;
  remedialTestId: string;
  testName: string;
  attemptId: string;
  score: number;
  isPassed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  questions: RemedialAnswerReviewQuestion[];
}

// ─── ELKPD Grading Types ──────────────────────────────────────────────────

export interface ELKPDGradeEntry {
  studentId: string;
  fullName: string;
  NIS: string;
  graded: boolean;
  submissionId: string | null;
  score: number | null;
  teacherNote: string | null;
  gradedAt: string | null;
}

export interface IELKPDDetail {
  eLKPDId: string;
  title: string;
  fileUrl: string;
  grades: ELKPDGradeEntry[];
}

export interface ELKPDGradesByModuleResponse {
  courseModuleId: string;
  subjectId: string;
  eLKPDs: IELKPDDetail[];
}

export interface GradeELKPDInput {
  score: number;
  teacherNote?: string;
}

// ── AVAILABLE ENDPOINTS (verified working) ───────────────────────────────────

export function useMarkFileRead(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { target: "SUBJECT" | "ELKPD" }>({
    mutationFn: async ({ target }) => {
      const body = { target };
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/mark-file-read`,
        body,
      );
      const response = await gsPost(
        `/progress/modules/${courseModuleId}/mark-file-read`,
        body,
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/mark-file-read`,
        200,
        response,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      // Invalidate module list so sidebar/list page reflect new fileRead status
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      // When ELKPD is read, also invalidate ELKPD submission queries
      if (variables.target === "ELKPD") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.gsELkpdSubmissions.byModule(courseModuleId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.gsSubjects.moduleSubmissions(courseModuleId),
        });
      }
      gsLogger.info("File marked as read", {
        courseModuleId,
        target: variables.target,
      });
    },
  });
}

// ─── POST /api/subjects/modules/:courseModuleId/mark-video-watched ─────────────

export function useMarkVideoWatched(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/mark-video-watched`,
        {},
      );
      const response = await gsPost(
        `/progress/modules/${courseModuleId}/mark-video-watched`,
        {},
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/mark-video-watched`,
        200,
        response,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      // Invalidate module list so sidebar/list page reflect new videoWatched status
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      gsLogger.info("Video marked as watched", { courseModuleId });
    },
  });
}

// ─── POST /api/progress/modules/:courseModuleId/test-attempts/start ────────────

export function useStartTestAttempt(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartTestAttemptInput) => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/start`,
        {},
        input,
      );
      const response = await gsPost<StartTestAttemptResult>(
        `/progress/modules/${courseModuleId}/test-attempts/start`,
        input,
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/start`,
        201,
        response,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      // Invalidate module list so diagnostic step status updates in sidebar/list page
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.detail(courseModuleId),
      });
      gsLogger.info("Test attempt started", { attemptId: data?.attemptId });
    },
  });
}

// ─── POST /api/progress/modules/:courseModuleId/test-attempts/:attemptId/submit ─

export function useSubmitTestAttempt(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      input,
    }: {
      attemptId: string;
      input: SubmitTestAttemptInput;
    }) => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/${attemptId}/submit`,
        {},
        input,
      );
      const response = await gsPost<SubmitTestAttemptResult>(
        `/progress/modules/${courseModuleId}/test-attempts/${attemptId}/submit`,
        input,
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/${attemptId}/submit`,
        200,
        response,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsRemediations.all,
      });
      // Invalidate module list so diagnostic step shows completed/passed in sidebar/list page
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.detail(courseModuleId),
      });
      gsLogger.info("Test attempt submitted", {
        attemptId: data?.attemptId,
        score: data?.score,
        isPassed: data?.isPassed,
      });
    },
  });
}

// ─── POST /api/progress/modules/:courseModuleId/remedial/start ──────────────────

export function useStartRemedialAttempt(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/start`,
        {},
      );
      const response = await gsPost<StartRemedialAttemptResult>(
        `/progress/modules/${courseModuleId}/remedial/start`,
        {},
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/start`,
        200,
        response,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.detail(courseModuleId),
      });
      gsLogger.info("Remedial attempt started", { attemptId: data?.attemptId });
    },
  });
}

// ─── POST /api/progress/modules/:courseModuleId/remedial/attempts/:remedialAttemptId/variants/submit ───

export function useSubmitRemedialVariant(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      remedialAttemptId,
      input,
    }: {
      remedialAttemptId: string;
      input: SubmitRemedialVariantInput;
    }) => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/variants/submit`,
        {},
        input,
      );
      const response = await gsPost<SubmitRemedialVariantResult>(
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/variants/submit`,
        input,
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/variants/submit`,
        200,
        response,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.detail(courseModuleId),
      });
      // Invalidate remediations list when a remedial attempt is completed
      if (data?.isCompleted) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.gsRemediations.all,
        });
      }
      gsLogger.info("Remedial variant submitted", {
        isCorrect: data?.isCorrect,
        isCompleted: data?.isCompleted,
      });
    },
  });
}

// ─── POST /api/progress/modules/:courseModuleId/remedial/attempts/:remedialAttemptId/submit ─

export function useSubmitRemedialBulk(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      remedialAttemptId,
      input,
    }: {
      remedialAttemptId: string;
      input: {
        answers: Array<{
          variantId: string;
          selectedOptionId?: string | null;
        }>;
      };
    }) => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/submit`,
        {},
        input,
      );
      const response = await gsPost<SubmitTestAttemptResult>(
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/submit`,
        input,
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/remedial/attempts/${remedialAttemptId}/submit`,
        200,
        response,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.detail(courseModuleId),
      });
      if (data?.isPassed !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.gsRemediations.all,
        });
      }
      gsLogger.info("Remedial bulk submitted", {
        attemptId: data?.attemptId,
        score: data?.score,
        isPassed: data?.isPassed,
      });
    },
  });
}

// ─── GET /api/progress/modules/:courseModuleId/diagnostic-answers ────────────

export function useDiagnosticAnswersReview(
  courseModuleId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["gs-progress", "diagnostic-answers", courseModuleId],
    queryFn: async () => {
      gsLogger.info(`Fetching diagnostic answers for ${courseModuleId}`, {});
      const response = await gsGet<DiagnosticAnswersReviewResponse>(
        `/progress/modules/${courseModuleId}/diagnostic-answers`,
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/diagnostic-answers`,
        200,
        response,
      );
      return response;
    },
    enabled: !!courseModuleId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── GET /api/progress/modules/:courseModuleId/remedial-answers ──────────────

export function useRemedialAnswersReview(
  courseModuleId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["gs-progress", "remedial-answers", courseModuleId],
    queryFn: async () => {
      gsLogger.info(`Fetching remedial answers for ${courseModuleId}`, {});
      const response = await gsGet<RemedialAnswersReviewResponse>(
        `/progress/modules/${courseModuleId}/remedial-answers`,
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/remedial-answers`,
        200,
        response,
      );
      return response;
    },
    enabled: !!courseModuleId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── GET /api/progress/modules/:courseModuleId/test-attempts/me ────────────────

export function useMyTestAttempts(
  courseModuleId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
    queryFn: async () => {
      gsLogger.info(`Fetching my test attempts for ${courseModuleId}`, {});
      const response = await gsGet<{ attempts: DiagnosticAttemptItem[] }>(
        `/progress/modules/${courseModuleId}/test-attempts/me`,
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/test-attempts/me`,
        200,
        response,
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!courseModuleId,
    ...options,
  });
}

// ─── Diagnostic / Remedial Scores Types ──────────────────────────────────

export interface DiagnosticScoreItem {
  studentId: string;
  fullName: string;
  NIS: string;
  bestScore: number | null;
  bestAttemptId: string | null;
  totalAttempts: number;
  isPassed: boolean;
  lastCompletedAt: string | null;
}

export interface GetDiagnosticScoresResult {
  courseModuleId: string;
  diagnosticTestId: string;
  testName: string;
  passingScore: number;
  scores: DiagnosticScoreItem[];
}

export interface RemedialScoreItem {
  studentId: string;
  fullName: string;
  NIS: string;
  score: number | null;
  attemptId: string | null;
  isPassed: boolean;
  completedAt: string | null;
}

export interface GetRemedialScoresResult {
  courseModuleId: string;
  remedialTestId: string;
  testName: string;
  passingScore: number;
  scores: RemedialScoreItem[];
}

// ─── GET /api/progress/modules/:courseModuleId/elkpd-grades ────────────────────

export function useELKPDGradesByModule(
  courseModuleId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.gsProgress.elkpdGrades(courseModuleId),
    queryFn: async () => {
      gsLogger.info(`Fetching ELKPD grades for module ${courseModuleId}`, {});
      const response = await gsGet<ELKPDGradesByModuleResponse>(
        `/progress/modules/${courseModuleId}/elkpd-grades`,
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/elkpd-grades`,
        200,
        response,
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!courseModuleId,
    ...options,
  });
}

// ─── PUT /api/progress/modules/:courseModuleId/elkpd/student/:studentId/grade ──

export function useGradeELKPD(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      input,
    }: {
      studentId: string;
      input: GradeELKPDInput;
    }) => {
      gsLogger.request(
        "PUT",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        {},
        input,
      );
      const response = await gsPut<ELKPDGradeEntry>(
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        input,
      );
      gsLogger.response(
        "PUT",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        200,
        response,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.elkpdGrades(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.moduleSubmissions(courseModuleId),
      });
      gsLogger.info("E-LKPD graded successfully", { courseModuleId });
    },
  });
}

// ─── DELETE /api/progress/modules/:courseModuleId/elkpd/student/:studentId/grade

export function useResetELKPDGrade(courseModuleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      gsLogger.request(
        "DELETE",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        {},
      );
      const response = await gsDel(
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
      );
      gsLogger.response(
        "DELETE",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        200,
        response,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.elkpdGrades(courseModuleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsSubjects.moduleSubmissions(courseModuleId),
      });
      gsLogger.info("E-LKPD grade reset successfully", { courseModuleId });
    },
  });
}

// ─── GET /api/progress/modules/:courseModuleId/diagnostic-scores ─────────────

export function useGsDiagnosticScores(courseModuleId: string) {
  return useQuery<GetDiagnosticScoresResult, Error>({
    queryKey: queryKeys.gsProgress.diagnosticScores(courseModuleId),
    queryFn: () => {
      gsLogger.info(`Fetching diagnostic scores for ${courseModuleId}`, {});
      return gsGet<GetDiagnosticScoresResult>(
        `/progress/modules/${courseModuleId}/diagnostic-scores`,
      );
    },
    enabled: !!courseModuleId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── GET /api/progress/modules/:courseModuleId/remedial-scores ───────────────

export function useGsRemedialScores(courseModuleId: string) {
  return useQuery<GetRemedialScoresResult, Error>({
    queryKey: queryKeys.gsProgress.remedialScores(courseModuleId),
    queryFn: () => {
      gsLogger.info(`Fetching remedial scores for ${courseModuleId}`, {});
      return gsGet<GetRemedialScoresResult>(
        `/progress/modules/${courseModuleId}/remedial-scores`,
      );
    },
    enabled: !!courseModuleId,
    staleTime: 5 * 60 * 1000,
  });
}
