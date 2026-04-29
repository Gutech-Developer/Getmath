import ArrowIcon from "@/components/atoms/icons/ArrowIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";
import type { GsNotification } from "@/types/gs-notification";
import {
  formatNotificationRelativeTime,
  getNotificationDescription,
  getNotificationTitle,
} from "@/utils/gs-notification";

interface NotificationListItemProps {
  notification: GsNotification;
  disabled?: boolean;
  isDeleting?: boolean;
  onOpen: (notification: GsNotification) => void;
  onDelete: (notification: GsNotification) => void;
}

export default function NotificationListItem({
  notification,
  disabled = false,
  isDeleting = false,
  onOpen,
  onDelete,
}: NotificationListItemProps) {
  const title = getNotificationTitle(notification);
  const description = getNotificationDescription(notification);
  const isUnread = !notification.isRead;
  const isInteractive =
    !disabled && (isUnread || Boolean(notification.url?.trim()));

  return (
    <article
      className={cn(
        "rounded-[26px] border transition-all duration-200",
        isUnread
          ? "border-[#BFD7FF] bg-[#F4F8FF] shadow-[0px_16px_32px_rgba(37,99,235,0.08)]"
          : "border-grey-stroke bg-white",
      )}
    >
      <div className="flex items-start gap-3 px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => onOpen(notification)}
          disabled={!isInteractive}
          className={cn(
            "flex min-w-0 flex-1 items-start gap-4 text-left",
            isInteractive ? "cursor-pointer" : "cursor-default",
          )}
        >
          <span
            className={cn(
              "mt-2 h-2.5 w-2.5 shrink-0 rounded-full border",
              isUnread
                ? "border-[#2563EB] bg-[#2563EB]"
                : "border-[#D1D5DB] bg-white",
            )}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-base leading-7 text-[#1F2937]",
                    isUnread ? "font-semibold" : "font-medium",
                  )}
                >
                  {title}
                </p>

                {description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#64748B]">
                    {description}
                  </p>
                ) : null}

                <p className="mt-2 text-sm text-[#94A3B8]">
                  {formatNotificationRelativeTime(notification.createdAt)}
                </p>
              </div>

              {notification.url ? (
                <span
                  className={cn(
                    "mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                    isUnread
                      ? "border-[#D7E5FF] bg-white text-[#2563EB]"
                      : "border-grey-stroke bg-[#F8FAFC] text-[#64748B]",
                  )}
                >
                  <ArrowIcon className="h-4 w-4" />
                </span>
              ) : null}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onDelete(notification)}
          disabled={disabled || isDeleting}
          aria-label={`Hapus notifikasi: ${title}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F3D6D2] bg-white text-[#D14343] transition hover:bg-[#FFF5F3] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:text-[#94A3B8]"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
