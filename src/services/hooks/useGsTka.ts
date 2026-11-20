"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GsApiError, queryKeys } from "@/libs/api";
import {
  gsDel,
  gsGet,
  gsPatch,
  gsPost,
  gsPut,
  gsTkaRequest,
} from "@/libs/api/gsAction";
import { buildQuery } from "./helper";
import type {
  AssignTKATestInput,
  CreateTKATestInput,
  DuplicateTKATestInput,
  ListStudentTKAsQuery,
  ListTKATestsQuery,
  SaveTKAAnswerInput,
  StartTKAAttemptInput,
  SubmitTKAAttemptInput,
  SubmitTKAEmotionBucketInput,
  TKAAnalyticsQuery,
  TKAAnalyticsResponse,
  TKAQuestionInput,
  TKAStudentAttemptDetailResponse,
  TKAStudentListResult,
  TKAStudentResultSummary,
  TKAStudentSaveAnswerResponse,
  TKAStudentSessionResponse,
  TKATestDetailResult,
  TKATestListResult,
  TKATestSummary,
  UpdateTKATestInput,
} from "@/types/tka";

export function useCreateTka() {
  const queryClient = useQueryClient();

  return useMutation<TKATestDetailResult, Error, CreateTKATestInput>({
    mutationFn: (input) => gsPost<TKATestDetailResult>("/tka", input),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useTkaList(params?: ListTKATestsQuery) {
  return useQuery<TKATestListResult, Error>({
    queryKey: queryKeys.gsTka.list(params),
    queryFn: () => gsGet<TKATestListResult>(`/tka${buildQuery(params)}`),
    staleTime: 30 * 1000,
  });
}

export function useTkaDetail(testId: string, enabled = true) {
  return useQuery<TKATestDetailResult, Error>({
    queryKey: queryKeys.gsTka.detail(testId),
    queryFn: () => gsGet<TKATestDetailResult>(`/tka/${testId}`),
    enabled: enabled && Boolean(testId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateTka(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKATestDetailResult, Error, UpdateTKATestInput>({
    mutationFn: (input) =>
      gsPatch<TKATestDetailResult>(`/tka/${testId}`, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(testId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsTka.analyticsRoot(testId),
      });
    },
  });
}

export function useDeleteTka() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (testId) => gsDel<void>(`/tka/${testId}`),
    onSuccess: (_data, testId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.gsTka.detail(testId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useAddTkaQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKATestDetailResult, Error, TKAQuestionInput>({
    mutationFn: (input) =>
      gsPost<TKATestDetailResult>(`/tka/${testId}/questions`, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(testId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useUpdateTkaQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    TKATestDetailResult,
    Error,
    { questionId: string; input: TKAQuestionInput }
  >({
    mutationFn: ({ questionId, input }) =>
      gsPut<TKATestDetailResult>(
        `/tka/${testId}/questions/${questionId}`,
        input,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(testId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useDeleteTkaQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKATestDetailResult, Error, string>({
    mutationFn: (questionId) =>
      gsDel<TKATestDetailResult>(`/tka/${testId}/questions/${questionId}`),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(testId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useAssignTka(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKATestDetailResult, Error, AssignTKATestInput>({
    mutationFn: (input) =>
      gsPost<TKATestDetailResult>(`/tka/${testId}/assign`, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.gsTka.detail(testId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsTka.analyticsRoot(testId),
      });
    },
  });
}

export function useDuplicateTka(sourceTestId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKATestSummary[], Error, DuplicateTKATestInput>({
    mutationFn: (input) =>
      gsPost<TKATestSummary[]>(`/tka/${sourceTestId}/duplicate`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gsTka.lists() });
    },
  });
}

export function useStudentTkaList(params?: ListStudentTKAsQuery) {
  return useQuery<TKAStudentListResult, Error>({
    queryKey: queryKeys.gsTka.studentList(params),
    queryFn: () =>
      gsGet<TKAStudentListResult>(`/tka/student${buildQuery(params)}`),
    staleTime: 30 * 1000,
  });
}

export function useStartOrResumeTka(testId: string) {
  const queryClient = useQueryClient();

  return useMutation<TKAStudentSessionResponse, Error, StartTKAAttemptInput>({
    mutationFn: (input) =>
      gsTkaRequest<TKAStudentSessionResponse>(`/tka/${testId}/start`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsTka.studentLists(),
      });
    },
  });
}

export function useSaveTkaAnswer(testId: string, attemptId: string) {
  return useMutation<TKAStudentSaveAnswerResponse, Error, SaveTKAAnswerInput>({
    mutationFn: (input) =>
      gsTkaRequest<TKAStudentSaveAnswerResponse>(
        `/tka/${testId}/attempts/${attemptId}/answers`,
        {
          method: "PUT",
          body: input,
        },
      ),
    retry: 1,
  });
}

export function useSubmitTkaAttempt(testId: string, attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    TKAStudentResultSummary,
    Error,
    SubmitTKAAttemptInput | undefined
  >({
    mutationFn: (input) =>
      gsTkaRequest<TKAStudentResultSummary>(
        `/tka/${testId}/attempts/${attemptId}/submit`,
        {
          method: "POST",
          body: input ?? {},
        },
      ),
    onSuccess: (summary) => {
      queryClient.setQueryData(
        queryKeys.gsTka.studentResult(testId),
        summary,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsTka.studentLists(),
      });
    },
  });
}

export function useSubmitTkaEmotionBucket(
  testId: string,
  attemptId: string,
  options?: { onTerminalError?: (error: GsApiError) => void },
) {
  return useMutation<void, Error, SubmitTKAEmotionBucketInput>({
    mutationFn: async (input) => {
      const { sampleCount, distribution } = input.emotion;
      const hasPositive = Object.values(distribution).some(
        (value) => value > 0,
      );
      if (sampleCount <= 0 || !hasPositive) return;

      await gsPost<void>(
        `/tka/${testId}/attempts/${attemptId}/emotion-bucket`,
        input,
      );
    },
    retry: 0,
    onError: (error) => {
      if (
        error instanceof GsApiError &&
        [403, 404, 409, 410].includes(error.status)
      ) {
        options?.onTerminalError?.(error);
      }
    },
  });
}

export function useStudentTkaResult(testId: string, enabled = true) {
  return useQuery<TKAStudentResultSummary, Error>({
    queryKey: queryKeys.gsTka.studentResult(testId),
    queryFn: () =>
      gsGet<TKAStudentResultSummary>(`/tka/${testId}/my-result`),
    enabled: enabled && Boolean(testId),
    staleTime: 0,
  });
}

export function useTkaAnalytics(
  testId: string,
  params?: TKAAnalyticsQuery,
  enabled = true,
) {
  return useQuery<TKAAnalyticsResponse, Error>({
    queryKey: queryKeys.gsTka.analytics(testId, params),
    queryFn: () =>
      gsGet<TKAAnalyticsResponse>(
        `/tka/${testId}/analytics${buildQuery(params)}`,
      ),
    enabled: enabled && Boolean(testId),
    staleTime: 30 * 1000,
  });
}

export function useTkaAttemptDetail(
  testId: string,
  attemptId: string,
  enabled = true,
) {
  return useQuery<TKAStudentAttemptDetailResponse, Error>({
    queryKey: queryKeys.gsTka.attemptDetail(testId, attemptId),
    queryFn: () =>
      gsGet<TKAStudentAttemptDetailResponse>(
        `/tka/${testId}/analytics/attempts/${attemptId}`,
      ),
    enabled: enabled && Boolean(testId) && Boolean(attemptId),
    staleTime: 30 * 1000,
  });
}
