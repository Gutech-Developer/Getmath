import { describe, expect, it } from "vitest";

import {
  getDashboardSidebarRoutesByRole,
  resolveDashboardSidebarRouteKey,
} from "../constant/dashboardSidebarRoutes";
import { resolveTopbarTitle } from "../constant/topbarTitle";

describe("TKA navigation", () => {
  it("shows TKA for students and Kelola TKA for teacher/admin", () => {
    expect(getDashboardSidebarRoutesByRole("student")).toContainEqual(
      expect.objectContaining({
        key: "tka",
        label: "TKA",
        href: "/student/dashboard/tka",
      }),
    );
    expect(getDashboardSidebarRoutesByRole("teacher")).toContainEqual(
      expect.objectContaining({
        key: "manage-tka",
        label: "Kelola TKA",
        href: "/teacher/dashboard/manage-tka",
      }),
    );
    expect(getDashboardSidebarRoutesByRole("admin")).toContainEqual(
      expect.objectContaining({
        key: "manage-tka",
        label: "Kelola TKA",
        href: "/admin/dashboard/manage-tka",
      }),
    );
  });

  it("marks TKA routes as active and titles them consistently", () => {
    expect(resolveDashboardSidebarRouteKey("/student/dashboard/tka")).toBe(
      "tka",
    );
    expect(
      resolveDashboardSidebarRouteKey("/teacher/dashboard/manage-tka"),
    ).toBe("manage-tka");
    expect(
      resolveDashboardSidebarRouteKey("/admin/dashboard/manage-tka"),
    ).toBe("manage-tka");

    expect(resolveTopbarTitle({ pathname: "/student/dashboard/tka" })).toBe(
      "TKA",
    );
    expect(
      resolveTopbarTitle({ pathname: "/teacher/dashboard/manage-tka" }),
    ).toBe("Kelola TKA");
    expect(
      resolveTopbarTitle({ pathname: "/admin/dashboard/manage-tka" }),
    ).toBe("Kelola TKA");
  });

  it("keeps TKA active and titles nested management routes", () => {
    expect(
      resolveDashboardSidebarRouteKey("/teacher/dashboard/manage-tka/create"),
    ).toBe("manage-tka");
    expect(
      resolveDashboardSidebarRouteKey(
        "/admin/dashboard/manage-tka/abc/analytics",
      ),
    ).toBe("manage-tka");
    expect(
      resolveDashboardSidebarRouteKey(
        "/teacher/dashboard/manage-tka/abc/analytics/attempt-1",
      ),
    ).toBe("manage-tka");

    expect(
      resolveTopbarTitle({
        pathname: "/teacher/dashboard/manage-tka/create",
      }),
    ).toBe("Buat TKA");
    expect(
      resolveTopbarTitle({
        pathname: "/admin/dashboard/manage-tka/abc/edit",
      }),
    ).toBe("Edit TKA");
    expect(
      resolveTopbarTitle({
        pathname: "/admin/dashboard/manage-tka/abc/analytics",
      }),
    ).toBe("Analitik TKA");
    expect(
      resolveTopbarTitle({
        pathname: "/admin/dashboard/manage-tka/abc/analytics/attempt-1",
      }),
    ).toBe("Detail Hasil TKA");
  });
});
