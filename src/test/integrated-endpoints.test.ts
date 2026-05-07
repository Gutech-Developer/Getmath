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

  // ─── Sprint 2: Progress query keys ──────────────────────────────────────

  it("tracks progress query key factories", () => {
    expect(queryKeys.gsProgress.all).toEqual(["gs", "progress"]);
    expect(queryKeys.gsProgress.moduleProgress("cm-1")).toEqual([
      "gs",
      "progress",
      "module",
      "cm-1",
    ]);
    expect(queryKeys.gsProgress.testAttempts("cm-2")).toEqual([
      "gs",
      "progress",
      "testAttempts",
      "cm-2",
    ]);
    expect(queryKeys.gsProgress.elkpdGrades("cm-3")).toEqual([
      "gs",
      "progress",
      "elkpdGrades",
      "cm-3",
    ]);
  });

  // ─── Sprint 2: Forum query keys ────────────────────────────────────────

  it("tracks forum query key factories", () => {
    expect(queryKeys.gsForum.all).toEqual(["gs", "forum"]);
    expect(queryKeys.gsForum.discussionsByCourse("course-1")).toEqual([
      "gs",
      "forum",
      "discussions",
      "course-1",
    ]);
    expect(queryKeys.gsForum.discussionDetail("disc-1")).toEqual([
      "gs",
      "forum",
      "discussionDetail",
      "disc-1",
    ]);
    expect(queryKeys.gsForum.commentsByDiscussion("disc-1")).toEqual([
      "gs",
      "forum",
      "comments",
      "disc-1",
    ]);
  });

  // ─── Sprint 2: Remediation and ELKPD query keys ────────────────────────

  it("tracks remediation query key factories", () => {
    expect(queryKeys.gsRemediations.all).toEqual(["gs", "remediations"]);
    expect(queryKeys.gsRemediations.detail("rem-1")).toEqual([
      "gs",
      "remediations",
      "detail",
      "rem-1",
    ]);
  });

  it("tracks ELKPD submissions query key factories", () => {
    expect(queryKeys.gsELkpdSubmissions.all).toEqual([
      "gs",
      "elkpd",
      "submissions",
    ]);
    expect(queryKeys.gsELkpdSubmissions.byModule("cm-1")).toEqual([
      "gs",
      "elkpd",
      "submissions",
      "byModule",
      "cm-1",
      undefined,
    ]);
  });

  // ─── Sprint 2: Feature coverage ────────────────────────────────────────

  it("registers all Sprint 2 features in endpoint schema", () => {
    const features = new Set(integratedEndpoints.map((e) => e.feature));

    expect(features).toContain("forum");
    expect(features).toContain("progress");
    expect(features).toContain("dashboard");
  });

  it("registers forum endpoints for student, teacher, and admin", () => {
    const forumEndpoints = integratedEndpoints.filter(
      (e) => e.feature === "forum",
    );
    expect(forumEndpoints.length).toBeGreaterThanOrEqual(8);

    const forumIds = forumEndpoints.map((e) => e.id);
    expect(forumIds).toEqual(
      expect.arrayContaining([
        "forum.discussions.list-by-course",
        "forum.discussions.create",
        "forum.discussions.detail",
        "forum.discussions.like",
        "forum.comments.create",
        "forum.comments.list",
      ]),
    );
  });

  it("registers progress tracking endpoints for student and teacher", () => {
    const progressEndpoints = integratedEndpoints.filter(
      (e) => e.feature === "progress",
    );
    expect(progressEndpoints.length).toBeGreaterThanOrEqual(6);

    const progressIds = progressEndpoints.map((e) => e.id);
    expect(progressIds).toEqual(
      expect.arrayContaining([
        "progress.mark-file-read",
        "progress.mark-video-watched",
        "progress.start-test-attempt",
        "progress.submit-test-attempt",
        "progress.my-attempts",
        "progress.elkpd-grades",
        "progress.grade-elkpd",
        "progress.reset-elkpd-grade",
      ]),
    );
  });

  it("registers student dashboard endpoint", () => {
    const dashboardEndpoints = integratedEndpoints.filter(
      (e) => e.feature === "dashboard",
    );
    expect(dashboardEndpoints.length).toBeGreaterThanOrEqual(1);
    expect(dashboardEndpoints.map((e) => e.id)).toContain("dashboard.student");
  });
});
