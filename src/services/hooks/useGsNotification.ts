"use client";

/**
 * GetSmart API — Notification Hooks
 *
 * Semua endpoint di backend bersifat "my notifications", jadi hook ini
 * selalu bekerja terhadap notifikasi user yang sedang login.
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPatch, gsDel } from "@/libs/api/getsmart";
import type {
  GsNotificationListParams,
  GsPaginatedNotifications,
  GsUnreadNotificationsResponse,
} from "@/types/gs-notification";

function buildQuery(params?: GsNotificationListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.isRead !== undefined) q.set("isRead", String(params.isRead));
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

interface GsNotificationQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
}

// ─── GET /notifications ──────────────────────────────────────────────────────

export function useGsNotifications(
  params?: GsNotificationListParams,
  options?: GsNotificationQueryOptions,
) {
  return useQuery<GsPaginatedNotifications, Error>({
    queryKey: queryKeys.gsNotifications.list(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: () =>
      gsGet<GsPaginatedNotifications>(`/notifications${buildQuery(params)}`),
    staleTime: options?.staleTime ?? 30 * 1000,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    placeholderData: keepPreviousData,
  });
}

// ─── GET /notifications/unread-count ────────────────────────────────────────

export function useGsUnreadNotificationsCount(
  options?: GsNotificationQueryOptions,
) {
  return useQuery<GsUnreadNotificationsResponse, Error>({
    queryKey: queryKeys.gsNotifications.unreadCount(),
    queryFn: () =>
      gsGet<GsUnreadNotificationsResponse>("/notifications/unread-count"),
    staleTime: options?.staleTime ?? 30 * 1000,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval ?? 30 * 1000,
    refetchIntervalInBackground: true,
  });
}

// ─── PATCH /notifications/:id/read ──────────────────────────────────────────

export function useGsMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsPatch<void>(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsNotifications.all,
      });
    },
  });
}

// ─── PATCH /notifications/read-all ──────────────────────────────────────────

export function useGsMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => gsPatch<void>("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsNotifications.all,
      });
    },
  });
}

// ─── DELETE /notifications/:id ──────────────────────────────────────────────

export function useGsDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => gsDel<void>(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsNotifications.all,
      });
    },
  });
}

// ─── DELETE /notifications ──────────────────────────────────────────────────

export function useGsDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => gsDel<void>("/notifications"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsNotifications.all,
      });
    },
  });
}
