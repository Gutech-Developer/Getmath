"use client";

/**
 * GetSmart API — Forum Discussions Hooks
 * TanStack Query hooks untuk semua operasi forum diskusi.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPut, gsDel } from "@/libs/api/getsmart";
import { gsLogger } from "@/utils/logger";
import type {
  GsForumDiscussion,
  GsForumComment,
  GsForumReply,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CreateDiscussionInput {
  content: string;
  courseModuleId?: string;
  imageUrl?: string;
}

export interface CreateCommentInput {
  content: string;
  imageUrl?: string;
}

export interface CreateReplyInput {
  content: string;
  imageUrl?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  courseModuleId?: string;
  search?: string;
}

export interface ListDiscussionsResponse {
  discussions: GsForumDiscussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── GET /api/forum/course/:courseId/discussions ─────────────────────────────

export function useListDiscussionsByCourse(
  courseId: string,
  params?: PaginationParams,
  options?: { enabled?: boolean }
) {
  const queryString = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
    sortBy: params?.sortBy ?? "latest",
    ...(params?.courseModuleId && {
      courseModuleId: params.courseModuleId,
    }),
    ...(params?.search && {
      search: params.search,
    }),
  }).toString();

  return useQuery({
    queryKey: queryKeys.gsForumDiscussions.byCourse(courseId, params as Record<string, unknown> | undefined),
    queryFn: async () => {
      gsLogger.info(`Fetching discussions for course ${courseId}`, {
        params,
      });
      const response = await gsGet<ListDiscussionsResponse>(
        `/forum/course/${courseId}/discussions?${queryString}`
      );
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 menit
    ...options,
  });
}

// ─── GET /api/forum/course/:courseId/discussions/:id ──────────────────────────

export function useGetDiscussion(
  courseId: string,
  discussionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
    queryFn: async () => {
      gsLogger.info(`Fetching discussion ${discussionId}`, {});
      const response = await gsGet<GsForumDiscussion>(
        `/forum/course/${courseId}/discussions/${discussionId}`
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ─── POST /api/forum/course/:courseId/discussions ──────────────────────────────

export function useCreateDiscussion(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiscussionInput) => {
      gsLogger.request("POST", `/forum/course/${courseId}/discussions`, {}, input);
      
      if (!input.content || !input.content.trim()) {
        throw new Error("Konten diskusi tidak boleh kosong");
      }
      
      const response = await gsPost<GsForumDiscussion>(
        `/forum/course/${courseId}/discussions`,
        input
      );
      gsLogger.response("POST", `/forum/course/${courseId}/discussions`, 201, response);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.byCourse(courseId),
      });
      gsLogger.info("Discussion created successfully", { discussionId: data?.id });
    },
    retry: (failureCount, error: any) => {
      // Retry max 3 times for transient errors (5xx)
      if (failureCount < 3 && error?.status >= 500) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
  });
}

// ─── PUT /api/forum/course/:courseId/discussions/:id ──────────────────────────

export function useUpdateDiscussion(courseId: string, discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<CreateDiscussionInput>) => {
      gsLogger.request(
        "PUT",
        `/forum/course/${courseId}/discussions/${discussionId}`,
        {},
        input
      );
      const response = await gsPut<GsForumDiscussion>(
        `/forum/course/${courseId}/discussions/${discussionId}`,
        input
      );
      gsLogger.response(
        "PUT",
        `/forum/course/${courseId}/discussions/${discussionId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.byCourse(courseId),
      });
      gsLogger.info("Discussion updated successfully", { discussionId });
    },
  });
}

// ─── DELETE /api/forum/course/:courseId/discussions/:id ───────────────────────

export function useDeleteDiscussion(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussionId: string) => {
      gsLogger.request(
        "DELETE",
        `/forum/course/${courseId}/discussions/${discussionId}`,
        {},
      );
      const response = await gsDel(
        `/forum/course/${courseId}/discussions/${discussionId}`
      );
      gsLogger.response(
        "DELETE",
        `/forum/course/${courseId}/discussions/${discussionId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: (_, discussionId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.byCourse(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      gsLogger.info("Discussion deleted successfully", { discussionId });
    },
  });
}

// ─── POST /api/forum/course/:courseId/discussions/:id/like ─────────────────────

export function useLikeDiscussion(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussionId: string) => {
      gsLogger.request(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/like`,
        {}
      );
      const response = await gsPost(
        `/forum/course/${courseId}/discussions/${discussionId}/like`,
        {}
      );
      gsLogger.response(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/like`,
        200,
        response
      );
      return { response, discussionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(data.discussionId),
      });
      // Invalidate the discussions list to update the like count there too
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.byCourse(courseId),
      });
      gsLogger.info("Discussion liked successfully", { discussionId: data.discussionId });
    },
  });
}

// ─── Comments & Replies ───────────────────────────────────────────────────────

// POST /api/forum/course/:courseId/discussions/:id/comments
export function useCreateComment(courseId: string, discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      gsLogger.request(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/comments`,
        {},
        input
      );
      const response = await gsPost<GsForumComment>(
        `/forum/course/${courseId}/discussions/${discussionId}/comments`,
        input
      );
      gsLogger.response(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/comments`,
        201,
        response
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      gsLogger.info("Comment created successfully", { commentId: data?.id });
    },
  });
}

// DELETE /api/forum/course/:courseId/discussions/:id/comments/:commentId
export function useDeleteComment(
  courseId: string,
  discussionId: string,
  commentId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      gsLogger.request(
        "DELETE",
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}`,
        {}
      );
      const response = await gsDel(
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}`
      );
      gsLogger.response(
        "DELETE",
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      gsLogger.info("Comment deleted successfully", { commentId });
    },
  });
}

// POST /api/forum/course/:courseId/discussions/:id/comments/:commentId/like
export function useLikeComment(
  courseId: string,
  discussionId: string,
  commentId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      gsLogger.request(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}/like`,
        {}
      );
      const response = await gsPost(
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}/like`,
        {}
      );
      gsLogger.response(
        "POST",
        `/forum/course/${courseId}/discussions/${discussionId}/comments/${commentId}/like`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      gsLogger.info("Comment liked successfully", { commentId });
    },
  });
}
