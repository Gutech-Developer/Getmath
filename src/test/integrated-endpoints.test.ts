import { describe, expect, it } from "vitest";

import { queryKeys } from "../libs/api";

import { integratedEndpoints } from "./integrated-endpoints";

describe("integrated endpoint schema", () => {
  it("keeps method and path pairs unique", () => {
    const keys = integratedEndpoints.map(
      ({ method, path }) => `${method} ${path}`,
    );
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(keys.length);
  });

  it("captures the shared admin and teacher management surface", () => {
    const sharedManagement = integratedEndpoints.filter(
      (endpoint) =>
        endpoint.roles.includes("admin") && endpoint.roles.includes("teacher"),
    );

    expect(sharedManagement.length).toBeGreaterThan(0);
    expect(sharedManagement.map((endpoint) => endpoint.id)).toEqual(
      expect.arrayContaining([
        "courses.create",
        "courses.update",
        "courses.archive",
        "course-modules.create",
        "subjects.create",
        "subjects.elkpd.update",
        "diagnostic-tests.create",
      ]),
    );
  });

  it("tracks the query key factory for the integrated hooks", () => {
    expect(queryKeys.gsAuth.me()).toEqual(["gs", "auth", "me"]);
    expect(queryKeys.gsAuth.activationVerify("activation-token")).toEqual([
      "gs",
      "auth",
      "activationVerify",
      "activation-token",
    ]);
    expect(queryKeys.gsHealth.status()).toEqual(["gs", "health", "status"]);
    expect(queryKeys.gsCourses.detail("course-1")).toEqual([
      "gs",
      "courses",
      "detail",
      "course-1",
    ]);
    expect(queryKeys.gsCourseModules.byCourse("course-1")).toEqual([
      "gs",
      "courseModules",
      "byCourse",
      "course-1",
    ]);
    expect(
      queryKeys.gsCourseEnrollments.byCourse("course-1", { page: 2 }),
    ).toEqual(["gs", "courseEnrollments", "byCourse", "course-1", { page: 2 }]);
    expect(queryKeys.gsNotifications.unreadCount()).toEqual([
      "gs",
      "notifications",
      "unreadCount",
    ]);
    expect(queryKeys.gsNotifications.list({ isRead: false, page: 1 })).toEqual([
      "gs",
      "notifications",
      "list",
      { isRead: false, page: 1 },
    ]);
    expect(queryKeys.gsSubjects.moduleProgress("module-1")).toEqual([
      "gs",
      "subjects",
      "moduleProgress",
      "module-1",
    ]);
    expect(
      queryKeys.gsSubjects.moduleSubmissions("module-1", { limit: 10 }),
    ).toEqual([
      "gs",
      "subjects",
      "moduleSubmissions",
      "module-1",
      { limit: 10 },
    ]);
    expect(
      queryKeys.gsDiagnosticTests.byTeacher("teacher-1", { search: "math" }),
    ).toEqual([
      "gs",
      "diagnosticTests",
      "byTeacher",
      "teacher-1",
      { search: "math" },
    ]);
  });
});
