import {
  GS_NOTIFICATION_PATH,
  type GsUserRole,
} from "@/types/gs-auth";
import type {
  GsNotification,
  GsNotificationListParams,
  GsNotificationType,
} from "@/types/gs-notification";

export type NotificationFilterKey = "all" | "unread" | "read";

export const GS_NOTIFICATION_PAGE_SIZE = 10;

export const NOTIFICATION_FILTER_TABS: Array<{
  key: NotificationFilterKey;
  label: string;
}> = [
  { key: "all", label: "Semua" },
  { key: "unread", label: "Belum Dibaca" },
  { key: "read", label: "Sudah Dibaca" },
];

const NOTIFICATION_TYPE_LABELS: Record<GsNotificationType, string> = {
  NEW_LEARNING_MODULE: "Modul belajar baru",
  MODULE_DEADLINE_SOON: "Deadline modul segera tiba",
  MODULE_DEADLINE_PASSED: "Deadline modul terlewat",
  STUDENT_FINISHED_COURSE_MODULE: "Siswa menyelesaikan modul",
  ELKPD_SUBMITTED: "E-LKPD dikumpulkan",
  ELKPD_GRADED: "E-LKPD sudah dinilai",
  STUDENT_ENROLLED: "Siswa baru bergabung",
  COURSE_ARCHIVED: "Kelas diarsipkan",
  FORUM_REPLY_TO_QUESTION: "Balasan forum untuk pertanyaan",
  FORUM_REPLY_TO_ANSWER: "Balasan forum untuk jawaban",
  PARENT_MODULE_COMPLETED: "Anak menyelesaikan modul",
  PARENT_ELKPD_GRADED: "Nilai E-LKPD anak tersedia",
  PARENT_DEADLINE_SOON: "Deadline modul anak mendekat",
};

function humanizeNotificationType(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function buildNotificationListParams(
  filter: NotificationFilterKey,
  page = 1,
  limit = GS_NOTIFICATION_PAGE_SIZE,
): GsNotificationListParams {
  const params: GsNotificationListParams = { page, limit };

  if (filter === "unread") {
    return { ...params, isRead: false };
  }

  if (filter === "read") {
    return { ...params, isRead: true };
  }

  return params;
}

export function formatNotificationRelativeTime(
  value: string | Date | number,
  now = Date.now(),
): string {
  const createdAt =
    value instanceof Date
      ? value.getTime()
      : typeof value === "number"
        ? value
        : new Date(value).getTime();

  if (!Number.isFinite(createdAt)) {
    return "Waktu tidak tersedia";
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - createdAt) / (60 * 1000)),
  );

  if (elapsedMinutes < 1) {
    return "Baru saja";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} menit lalu`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} jam lalu`;
  }

  if (elapsedHours < 48) {
    return "Kemarin";
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays < 7) {
    return `${elapsedDays} hari lalu`;
  }

  const createdDate = new Date(createdAt);
  const includeYear = createdDate.getFullYear() !== new Date(now).getFullYear();

  return createdDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

export function formatNotificationBadgeCount(count: number): string {
  if (count > 99) {
    return "99+";
  }

  return String(Math.max(0, count));
}

export function getNotificationSummaryText(unreadCount: number): string {
  if (unreadCount <= 0) {
    return "Tidak ada notifikasi baru saat ini.";
  }

  if (unreadCount === 1) {
    return "1 notifikasi baru menunggu untuk dibaca.";
  }

  return `${unreadCount} notifikasi baru menunggu untuk dibaca.`;
}

export function countUnreadNotifications(notifications: GsNotification[]): number {
  return notifications.filter((notification) => !notification.isRead).length;
}

export function getNotificationTypeLabel(
  type?: GsNotificationType,
): string {
  if (!type) {
    return "Notifikasi baru";
  }

  return NOTIFICATION_TYPE_LABELS[type] ?? humanizeNotificationType(type);
}

export function getNotificationTitle(notification: GsNotification): string {
  const title = notification.title?.trim();

  if (title) {
    return title;
  }

  return getNotificationTypeLabel(notification.notificationType?.type);
}

export function getNotificationDescription(
  notification: GsNotification,
): string | null {
  const description = notification.description?.trim();
  return description ? description : null;
}

export function resolveGsRoleFromPathname(
  pathname: string,
): GsUserRole | null {
  if (pathname.startsWith("/admin")) {
    return "ADMIN";
  }

  if (pathname.startsWith("/teacher")) {
    return "TEACHER";
  }

  if (pathname.startsWith("/student")) {
    return "STUDENT";
  }

  if (pathname.startsWith("/parent")) {
    return "PARENT";
  }

  return null;
}

export function resolveNotificationPathFromPathname(
  pathname: string,
): string | null {
  const role = resolveGsRoleFromPathname(pathname);

  if (!role) {
    return null;
  }

  return GS_NOTIFICATION_PATH[role];
}
