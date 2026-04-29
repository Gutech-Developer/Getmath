/**
 * GetSmart API — Notification Types
 */

import type { GsPaginationMeta } from "./gs-course";

export type GsNotificationType =
  | "NEW_LEARNING_MODULE"
  | "MODULE_DEADLINE_SOON"
  | "MODULE_DEADLINE_PASSED"
  | "STUDENT_FINISHED_COURSE_MODULE"
  | "ELKPD_SUBMITTED"
  | "ELKPD_GRADED"
  | "STUDENT_ENROLLED"
  | "COURSE_ARCHIVED"
  | "FORUM_REPLY_TO_QUESTION"
  | "FORUM_REPLY_TO_ANSWER"
  | "PARENT_MODULE_COMPLETED"
  | "PARENT_ELKPD_GRADED"
  | "PARENT_DEADLINE_SOON";

export interface GsNotificationTypeInfo {
  type: GsNotificationType;
}

export interface GsNotification {
  id: string;
  userId: string;
  notificationTypeId: string;
  title: string | null;
  description: string | null;
  url: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  notificationType?: GsNotificationTypeInfo;
}

export interface GsPaginatedNotifications {
  notifications: GsNotification[];
  unreadCount: number;
  pagination: GsPaginationMeta;
}

export interface GsNotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface GsUnreadNotificationsResponse {
  unreadCount: number;
}
