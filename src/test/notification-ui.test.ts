import { describe, expect, it } from "vitest";

import {
  getDashboardSidebarRoutesByRole,
  resolveDashboardSidebarRouteKey,
} from "../constant/dashboardSidebarRoutes";
import { resolveTopbarTitle } from "../constant/topbarTitle";
import {
  buildNotificationListParams,
  formatNotificationBadgeCount,
  formatNotificationRelativeTime,
  getNotificationSummaryText,
  resolveNotificationPathFromPathname,
} from "../utils/gs-notification";

describe("notification UI helpers", () => {
  it("builds read filters for notification queries", () => {
    expect(buildNotificationListParams("all", 2, 10)).toEqual({
      page: 2,
      limit: 10,
    });
    expect(buildNotificationListParams("unread", 1, 20)).toEqual({
      page: 1,
      limit: 20,
      isRead: false,
    });
    expect(buildNotificationListParams("read", 3, 5)).toEqual({
      page: 3,
      limit: 5,
      isRead: true,
    });
  });

  it("formats notification copy and badge counts", () => {
    expect(getNotificationSummaryText(0)).toBe(
      "Tidak ada notifikasi baru saat ini.",
    );
    expect(getNotificationSummaryText(1)).toBe(
      "1 notifikasi baru menunggu untuk dibaca.",
    );
    expect(getNotificationSummaryText(4)).toBe(
      "4 notifikasi baru menunggu untuk dibaca.",
    );
    expect(formatNotificationBadgeCount(0)).toBe("0");
    expect(formatNotificationBadgeCount(9)).toBe("9");
    expect(formatNotificationBadgeCount(140)).toBe("99+");
  });

  it("formats relative notification timestamps in Indonesian", () => {
    const now = new Date("2026-04-29T12:00:00.000Z").getTime();

    expect(
      formatNotificationRelativeTime(
        new Date(now - 5 * 60 * 1000).toISOString(),
        now,
      ),
    ).toBe("5 menit lalu");
    expect(
      formatNotificationRelativeTime(
        new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        now,
      ),
    ).toBe("2 jam lalu");
    expect(
      formatNotificationRelativeTime(
        new Date(now - 30 * 60 * 60 * 1000).toISOString(),
        now,
      ),
    ).toBe("Kemarin");
  });

  it("resolves notification destinations for each private role", () => {
    expect(resolveNotificationPathFromPathname("/teacher/dashboard")).toBe(
      "/teacher/dashboard/notifikasi",
    );
    expect(resolveNotificationPathFromPathname("/admin/dashboard")).toBe(
      "/admin/dashboard/notifikasi",
    );
    expect(resolveNotificationPathFromPathname("/student/dashboard/lad")).toBe(
      "/student/dashboard/notifikasi",
    );
    expect(
      resolveNotificationPathFromPathname("/parent/dashboard/profil"),
    ).toBe("/parent/dashboard/notifikasi");
  });

  it("injects live unread badges into sidebar notification routes", () => {
    const teacherRoutes = getDashboardSidebarRoutesByRole("teacher", {
      notificationBadgeCount: 7,
    });
    const parentRoutes = getDashboardSidebarRoutesByRole("parent", {
      notificationBadgeCount: 2,
    });

    expect(teacherRoutes.find((item) => item.key === "notifications")).toEqual(
      expect.objectContaining({
        href: "/teacher/dashboard/notifikasi",
        badgeCount: 7,
      }),
    );
    expect(parentRoutes.find((item) => item.key === "notifications")).toEqual(
      expect.objectContaining({
        href: "/parent/dashboard/notifikasi",
        badgeCount: 2,
      }),
    );
  });

  it("marks notification routes as active and titles them consistently", () => {
    expect(resolveDashboardSidebarRouteKey("/admin/dashboard/notifikasi")).toBe(
      "notifications",
    );
    expect(
      resolveDashboardSidebarRouteKey("/student/dashboard/notifikasi"),
    ).toBe("notifications");
    expect(
      resolveDashboardSidebarRouteKey("/parent/dashboard/notifikasi"),
    ).toBe("notifications");

    expect(
      resolveTopbarTitle({ pathname: "/teacher/dashboard/notifikasi" }),
    ).toBe("Notifikasi");
    expect(
      resolveTopbarTitle({ pathname: "/admin/dashboard/notifikasi" }),
    ).toBe("Notifikasi");
    expect(
      resolveTopbarTitle({ pathname: "/student/dashboard/notifikasi" }),
    ).toBe("Notifikasi");
    expect(
      resolveTopbarTitle({ pathname: "/parent/dashboard/notifikasi" }),
    ).toBe("Notifikasi");
  });
});
