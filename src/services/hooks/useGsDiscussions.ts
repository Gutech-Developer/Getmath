"use client";

/**
 * GetSmart API — Forum Discussions Hooks
 * TanStack Query hooks untuk semua operasi forum diskusi.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsPut, gsDel } from "@/libs/api/getsmart";
import { gsLogger } from "@/utils/logger";
import { showToast, showErrorToast } from "@/libs/toast";
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
  parentCommentId?: string;
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
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ListCommentsResponse {
  comments: GsForumComment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
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
  discussionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
    queryFn: async () => {
      gsLogger.info(`Fetching discussion ${discussionId}`, {});
      const response = await gsGet<GsForumDiscussion>(
        `/forum/discussions/${discussionId}`
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
        queryKey: queryKeys.gsForumDiscussions.all,
      });
      showToast.success("Diskusi berhasil dibuat!");
      gsLogger.info("Discussion created successfully", { discussionId: data?.id });
    },
    onError: (error) => {
      showErrorToast(error);
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

export function useUpdateDiscussion(discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<CreateDiscussionInput>) => {
      gsLogger.request(
        "PUT",
        `/forum/discussions/${discussionId}`,
        {},
        input
      );
      const response = await gsPut<GsForumDiscussion>(
        `/forum/discussions/${discussionId}`,
        input
      );
      gsLogger.response(
        "PUT",
        `/forum/discussions/${discussionId}`,
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
        queryKey: queryKeys.gsForumDiscussions.all,
      });
      showToast.success("Diskusi berhasil diperbarui!");
      gsLogger.info("Discussion updated successfully", { discussionId });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
}

// ─── DELETE /api/forum/course/:courseId/discussions/:id ───────────────────────

export function useDeleteDiscussion(courseId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussionId: string) => {
      gsLogger.request(
        "DELETE",
        `/forum/discussions/${discussionId}`,
        {},
      );
      const response = await gsDel(
        `/forum/discussions/${discussionId}`
      );
      gsLogger.response(
        "DELETE",
        `/forum/discussions/${discussionId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: (_, discussionId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.all,
      });
      showToast.success("Diskusi berhasil dihapus!");
      gsLogger.info("Discussion deleted successfully", { discussionId });
    },
    onError: (error) => {
      showErrorToast(error);
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
        `/forum/discussions/${discussionId}/like`,
        {}
      );
      const response = await gsPost(
        `/forum/discussions/${discussionId}/like`,
        {}
      );
      gsLogger.response(
        "POST",
        `/forum/discussions/${discussionId}/like`,
        200,
        response
      );
      return { response, discussionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(data.discussionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.all,
      });
      gsLogger.info("Discussion liked successfully", { discussionId: data.discussionId });
    },
  });
}

// ─── Comments & Replies ───────────────────────────────────────────────────────

// POST /api/forum/discussions/:id/comments
export function useCreateComment(discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      gsLogger.request(
        "POST",
        `/forum/discussions/${discussionId}/comments`,
        {},
        input
      );
      const response = await gsPost<GsForumComment>(
        `/forum/discussions/${discussionId}/comments`,
        input
      );
      gsLogger.response(
        "POST",
        `/forum/discussions/${discussionId}/comments`,
        201,
        response
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      showToast.success("Balasan berhasil dikirim!");
      gsLogger.info("Comment/Reply created successfully", { commentId: data?.id });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
}

// DELETE /api/forum/comments/:commentId
export function useDeleteComment(discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      gsLogger.request(
        "DELETE",
        `/forum/comments/${commentId}`,
        {}
      );
      const response = await gsDel(
        `/forum/comments/${commentId}`
      );
      gsLogger.response(
        "DELETE",
        `/forum/comments/${commentId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      showToast.success("Komentar berhasil dihapus!");
      gsLogger.info("Comment deleted successfully");
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
}

// POST /api/forum/comments/:commentId/like
export function useLikeComment(discussionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      gsLogger.request(
        "POST",
        `/forum/comments/${commentId}/like`,
        {},
      );
      const response = await gsPost(
        `/forum/comments/${commentId}/like`,
        {},
      );
      gsLogger.response(
        "POST",
        `/forum/comments/${commentId}/like`,
        200,
        response,
      );
      return { response, commentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsForumDiscussions.detail(discussionId),
      });
      // Also invalidate comments list if it exists
      queryClient.invalidateQueries({
        queryKey: ["forum", "comments", discussionId],
      });
      gsLogger.info("Comment liked successfully", { commentId: data.commentId });
    },
  });
}

// ─── List Comments & Replies ──────────────────────────────────────────────────

export function useListCommentsByDiscussion(
  discussionId: string,
  params?: PaginationParams,
  options?: { enabled?: boolean }
) {
  const queryString = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
    sortBy: params?.sortBy ?? "top",
  }).toString();

  return useQuery({
    queryKey: ["forum", "comments", discussionId, params],
    queryFn: async () => {
      gsLogger.info(`Fetching comments for discussion ${discussionId}`, { params });
      const response = await gsGet<ListCommentsResponse>(
        `/forum/discussions/${discussionId}/comments?${queryString}`
      );
      return response;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useListRepliesByComment(
  discussionId: string,
  commentId: string,
  params?: PaginationParams,
  options?: { enabled?: boolean }
) {
  const queryString = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
    sortBy: params?.sortBy ?? "oldest",
    parentCommentId: commentId,
  }).toString();

  return useQuery({
    queryKey: ["forum", "replies", commentId, params],
    queryFn: async () => {
      gsLogger.info(`Fetching replies for comment ${commentId}`, { params });
      const response = await gsGet<ListCommentsResponse>(
        `/forum/discussions/${discussionId}/comments?${queryString}`
      );
      return response;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}
