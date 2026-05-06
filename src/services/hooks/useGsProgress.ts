"use client";

/**
 * GetSmart API — Student Progress Hooks
 * TanStack Query hooks untuk student progress tracking,
 * test attempts (diagnostik), dan ELKPD grading.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPut, gsDel } from "@/libs/api/getsmart";
import { gsLogger } from "@/utils/logger";

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
  questionId: string;
  selectedOptionId: string;
}

export interface TestAttemptResult {
  id: string;
  courseModuleId: string;
  studentId: string;
  packageId: string;
  startedAt: string;
  finishedAt?: string;
  score?: number;
  totalCorrect?: number;
  totalQuestions?: number;
  isPassed?: boolean;
  answers?: TestAttemptAnswer[];
}

export interface StartTestAttemptInput {
  packageId: string;
}

export interface SubmitTestAttemptInput {
  answers: TestAttemptAnswer[];
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

  return useMutation({
    mutationFn: async () => {
      gsLogger.request(
        "POST",
        `/progress/modules/${courseModuleId}/mark-file-read`,
        {}
      );
      const response = await gsPost(
        `/progress/modules/${courseModuleId}/mark-file-read`,
        {}
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/mark-file-read`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
      });
      gsLogger.info("File marked as read", { courseModuleId });
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
        {}
      );
      const response = await gsPost(
        `/progress/modules/${courseModuleId}/mark-video-watched`,
        {}
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/mark-video-watched`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsProgress.moduleProgress(courseModuleId),
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
        input
      );
      const response = await gsPost<TestAttemptResult>(
        `/progress/modules/${courseModuleId}/test-attempts/start`,
        input
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/start`,
        201,
        response
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
      gsLogger.info("Test attempt started", { attemptId: data?.id });
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
        input
      );
      const response = await gsPost<TestAttemptResult>(
        `/progress/modules/${courseModuleId}/test-attempts/${attemptId}/submit`,
        input
      );
      gsLogger.response(
        "POST",
        `/progress/modules/${courseModuleId}/test-attempts/${attemptId}/submit`,
        200,
        response
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
      gsLogger.info("Test attempt submitted", {
        attemptId: data?.id,
        score: data?.score,
        isPassed: data?.isPassed,
      });
    },
  });
}

// ─── GET /api/progress/modules/:courseModuleId/test-attempts/me ────────────────

export function useMyTestAttempts(
  courseModuleId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.gsProgress.testAttempts(courseModuleId),
    queryFn: async () => {
      gsLogger.info(`Fetching my test attempts for ${courseModuleId}`, {});
      const response = await gsGet<{ attempts: TestAttemptResult[] }>(
        `/progress/modules/${courseModuleId}/test-attempts/me`
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/test-attempts/me`,
        200,
        response
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!courseModuleId,
    ...options,
  });
}

// ─── GET /api/progress/modules/:courseModuleId/elkpd-grades ────────────────────

export function useELKPDGradesByModule(
  courseModuleId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.gsProgress.elkpdGrades(courseModuleId),
    queryFn: async () => {
      gsLogger.info(`Fetching ELKPD grades for module ${courseModuleId}`, {});
      const response = await gsGet<ELKPDGradesByModuleResponse>(
        `/progress/modules/${courseModuleId}/elkpd-grades`
      );
      gsLogger.response(
        "GET",
        `/progress/modules/${courseModuleId}/elkpd-grades`,
        200,
        response
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
        input
      );
      const response = await gsPut<ELKPDGradeEntry>(
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        input
      );
      gsLogger.response(
        "PUT",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        200,
        response
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
        {}
      );
      const response = await gsDel(
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`
      );
      gsLogger.response(
        "DELETE",
        `/progress/modules/${courseModuleId}/elkpd/student/${studentId}/grade`,
        200,
        response
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
