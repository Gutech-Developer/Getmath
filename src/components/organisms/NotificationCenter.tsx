"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterTabs } from "@/components/molecules/FilterTabs";
import { Modal } from "@/components/molecules/Modal";
import { Badge } from "@/components/atoms/Badge";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import FilterIcon from "@/components/atoms/icons/FilterIcon";
import RefreshIcon from "@/components/atoms/icons/RefreshIcon";
import InfoCircleIcon from "@/components/atoms/icons/InfoCircleIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import NotificationListItem from "@/components/molecules/notifications/NotificationListItem";
import { showErrorToast, showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type { GsNotification } from "@/types/gs-notification";
import {
  useGsDeleteAllNotifications,
  useGsDeleteNotification,
  useGsMarkAllNotificationsAsRead,
  useGsMarkNotificationAsRead,
  useGsNotifications,
} from "@/services";
import {
  GS_NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_FILTER_TABS,
  buildNotificationListParams,
  countUnreadNotifications,
  getNotificationSummaryText,
  type NotificationFilterKey,
} from "@/utils/gs-notification";

const EMPTY_STATE_MESSAGE: Record<NotificationFilterKey, string> = {
  all: "Belum ada notifikasi untuk akun ini.",
  unread: "Semua notifikasi sudah dibaca.",
  read: "Belum ada notifikasi yang sudah dibaca.",
};

function NotificationSkeletonCard() {
  return (
    <div className="rounded-[26px] border border-[#E5E7EB] bg-white px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#E5E7EB]" />
        <div className="min-w-0 flex-1">
          <div className="h-5 w-4/5 animate-pulse rounded-full bg-[#E5E7EB]" />
          <div className="mt-3 h-4 w-2/5 animate-pulse rounded-full bg-[#F1F5F9]" />
        </div>
      </div>
    </div>
  );
}

function navigateToNotification(
  router: ReturnType<typeof useRouter>,
  url: string,
) {
  if (/^https?:\/\//i.test(url)) {
    window.location.assign(url);
    return;
  }

  router.push(url);
}

export default function NotificationCenter() {
  const router = useRouter();
  const [filterKey, setFilterKey] = useState<NotificationFilterKey>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<GsNotification | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const queryParams = useMemo(
    () =>
      buildNotificationListParams(filterKey, page, GS_NOTIFICATION_PAGE_SIZE),
    [filterKey, page],
  );

  const { data, isLoading, isFetching, error, refetch } =
    useGsNotifications(queryParams);
  const markAsRead = useGsMarkNotificationAsRead();
  const markAllAsRead = useGsMarkAllNotificationsAsRead();
  const deleteNotification = useGsDeleteNotification();
  const deleteAllNotifications = useGsDeleteAllNotifications();

  const notifications = data?.notifications ?? [];
  const unreadCount =
    data?.unreadCount ?? countUnreadNotifications(notifications);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalItems = pagination?.totalItems ?? notifications.length;
  const markAsReadTarget = markAsRead.variables;
  const deleteTargetId = deleteTarget?.id;
  const isBusy =
    markAllAsRead.isPending ||
    deleteAllNotifications.isPending ||
    deleteNotification.isPending;

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages === 0 && page !== 1) {
      setPage(1);
      return;
    }

    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination]);

  const handleFilterChange = (nextFilter: string) => {
    setFilterKey(nextFilter as NotificationFilterKey);
    setPage(1);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (refreshError) {
      showErrorToast(refreshError);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      showToast.success("Semua notifikasi berhasil ditandai sudah dibaca.");
    } catch (markAllError) {
      showErrorToast(markAllError);
    }
  };

  const handleDeleteNotificationRequest = (notification: GsNotification) => {
    if (isBusy) {
      return;
    }

    setDeleteTarget(notification);
  };

  const handleDeleteNotificationConfirm = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await deleteNotification.mutateAsync(deleteTargetId);
      showToast.success("Notifikasi berhasil dihapus.");
      setDeleteTarget(null);
    } catch (deleteError) {
      showErrorToast(deleteError);
    }
  };

  const handleDeleteAllConfirm = async () => {
    try {
      await deleteAllNotifications.mutateAsync();
      showToast.success("Semua notifikasi berhasil dihapus.");
      setIsDeleteAllModalOpen(false);
    } catch (deleteAllError) {
      showErrorToast(deleteAllError);
    }
  };

  const handleOpenNotification = async (notification: GsNotification) => {
    if (isBusy) {
      return;
    }

    try {
      if (!notification.isRead) {
        await markAsRead.mutateAsync(notification.id);
      }
    } catch (markError) {
      showErrorToast(markError);
      return;
    }

    const targetUrl = notification.url?.trim();

    if (targetUrl) {
      navigateToNotification(router, targetUrl);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-[30px] border border-[#D9E5FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)] p-6 shadow-[0px_20px_45px_rgba(148,163,184,0.12)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Notifikasi
              </h1>
              <Badge
                variant={unreadCount > 0 ? "primary" : "info"}
                className={cn(
                  unreadCount > 0
                    ? "bg-[#E8F0FF] text-[#2563EB]"
                    : "bg-[#EEF2F7] text-[#64748B]",
                )}
              >
                {unreadCount > 0 ? `${unreadCount} baru` : "Semua terbaca"}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-[#64748B]">
              {getNotificationSummaryText(unreadCount)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D8E1F5] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:border-[#C1D4FF] hover:bg-[#F8FBFF]"
            >
              <RefreshIcon
                className={cn("h-4 w-4", isFetching && "animate-spin")}
              />
              Segarkan
            </button>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#BFD1F7]"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {markAllAsRead.isPending ? "Memproses..." : "Tandai semua dibaca"}
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(true)}
              disabled={totalItems === 0 || isBusy}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F3D6D2] bg-white px-4 py-2.5 text-sm font-semibold text-[#D14343] transition hover:bg-[#FFF5F3] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:text-[#94A3B8]"
            >
              <TrashIcon className="h-4 w-4" />
              {deleteAllNotifications.isPending
                ? "Menghapus..."
                : "Hapus semua"}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8E1F5] bg-white text-[#2563EB]">
              <FilterIcon className="h-4 w-4" />
            </span>
            <FilterTabs
              tabs={NOTIFICATION_FILTER_TABS}
              activeTab={filterKey}
              onTabChange={handleFilterChange}
              className="rounded-2xl bg-[#EAF1FF] p-1.5"
            />
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[26px] border border-[#F1C4BF] bg-white p-6">
          <p className="text-base font-semibold text-[#7F1D1D]">
            Gagal memuat notifikasi
          </p>
          <p className="mt-2 text-sm text-[#7C6A6A]">{error.message}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#F1C4BF] px-4 py-2.5 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2]"
          >
            Coba lagi
          </button>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <NotificationSkeletonCard key={index} />
            ))
          : null}

        {!isLoading && notifications.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">
            <p className="text-lg font-semibold text-[#0F172A]">
              Belum ada yang perlu ditampilkan
            </p>
            <p className="mt-2 text-sm text-[#64748B]">
              {EMPTY_STATE_MESSAGE[filterKey]}
            </p>
          </div>
        ) : null}

        {!isLoading
          ? notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                disabled={
                  markAllAsRead.isPending ||
                  deleteNotification.isPending ||
                  deleteAllNotifications.isPending ||
                  (markAsRead.isPending && markAsReadTarget === notification.id)
                }
                isDeleting={
                  deleteNotification.isPending &&
                  deleteNotification.variables === notification.id
                }
                onOpen={handleOpenNotification}
                onDelete={handleDeleteNotificationRequest}
              />
            ))
          : null}
      </section>

      {!isLoading && totalPages > 1 ? (
        <section className="flex flex-col gap-3 rounded-[24px] border border-grey-stroke bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Halaman {pagination?.currentPage} dari {totalPages}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              Total {totalItems} notifikasi tersedia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={!pagination?.hasPrevPage}
              className="rounded-2xl border border-[#D8E1F5] px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:text-[#94A3B8]"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              disabled={!pagination?.hasNextPage}
              className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#BFD1F7]"
            >
              Berikutnya
            </button>
          </div>
        </section>
      ) : null}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus notifikasi"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-sm leading-6 text-[#475569]">
              Notifikasi ini akan dihapus permanen dari akun Anda.
            </p>
            {deleteTarget ? (
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {deleteTarget.title?.trim() || "Notifikasi tanpa judul"}
                </p>
                {deleteTarget.description?.trim() ? (
                  <p className="mt-1 text-sm text-[#64748B]">
                    {deleteTarget.description.trim()}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteNotification.isPending}
              className="rounded-2xl border border-[#D8E1F5] px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteNotificationConfirm}
              disabled={deleteNotification.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D14343] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B62F2F] disabled:cursor-not-allowed disabled:bg-[#E9A6A6]"
            >
              <TrashIcon className="h-4 w-4" />
              {deleteNotification.isPending ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Hapus semua notifikasi"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-sm leading-6 text-[#475569]">
              Semua notifikasi akan dihapus permanen untuk akun yang sedang
              login.
            </p>
            <div className="rounded-2xl border border-[#FBE2DD] bg-[#FFF7F5] px-4 py-3 text-sm text-[#9F3A2C]">
              Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(false)}
              disabled={deleteAllNotifications.isPending}
              className="rounded-2xl border border-[#D8E1F5] px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteAllConfirm}
              disabled={deleteAllNotifications.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D14343] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B62F2F] disabled:cursor-not-allowed disabled:bg-[#E9A6A6]"
            >
              <TrashIcon className="h-4 w-4" />
              {deleteAllNotifications.isPending
                ? "Menghapus..."
                : "Hapus semua"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
