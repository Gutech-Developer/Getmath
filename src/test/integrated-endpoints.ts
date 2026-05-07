export type ApiRole = "public" | "admin" | "teacher" | "student" | "parent";
export type ApiFeature =
  | "auth"
  | "health"
  | "courses"
  | "course-modules"
  | "course-enrollments"
  | "notifications"
  | "subjects"
  | "diagnostic-tests"
  | "forum"
  | "progress"
  | "dashboard";
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface IntegratedEndpointSchema {
  id: string;
  method: HttpMethod;
  path: string;
  feature: ApiFeature;
  roles: readonly ApiRole[];
  notes?: string;
}

export const integratedEndpoints: IntegratedEndpointSchema[] = [
  // Auth
  {
    id: "auth.login.google",
    method: "POST",
    path: "/auth/login/google",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.me",
    method: "GET",
    path: "/auth/me",
    feature: "auth",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "auth.login",
    method: "POST",
    path: "/auth/login",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.register",
    method: "POST",
    path: "/auth/register",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.logout",
    method: "POST",
    path: "/auth/logout",
    feature: "auth",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "auth.forgot-password",
    method: "POST",
    path: "/auth/forgot-password",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.reset-password",
    method: "POST",
    path: "/auth/reset-password",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.activation-resend",
    method: "POST",
    path: "/auth/activation/resend",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.activation-verify",
    method: "GET",
    path: "/auth/activation/verify",
    feature: "auth",
    roles: ["public"],
    notes: "Token is passed as a query string.",
  },
  {
    id: "auth.forgot-password-verify",
    method: "GET",
    path: "/auth/forgot-password/verify",
    feature: "auth",
    roles: ["public"],
    notes: "Token is passed as a query string.",
  },
  {
    id: "auth.refresh",
    method: "POST",
    path: "/auth/refresh",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.google-url",
    method: "GET",
    path: "/auth/google/url",
    feature: "auth",
    roles: ["public"],
    notes: "redirectUri is passed as a query string.",
  },
  {
    id: "auth.google-callback",
    method: "POST",
    path: "/auth/google/callback",
    feature: "auth",
    roles: ["public"],
  },
  {
    id: "auth.google-complete-profile",
    method: "POST",
    path: "/auth/google/complete-profile",
    feature: "auth",
    roles: ["public"],
  },

  // Health
  {
    id: "health.status",
    method: "GET",
    path: "/",
    feature: "health",
    roles: ["public"],
  },

  // Courses
  {
    id: "courses.list",
    method: "GET",
    path: "/courses",
    feature: "courses",
    roles: ["admin"],
  },
  {
    id: "courses.my",
    method: "GET",
    path: "/courses/my",
    feature: "courses",
    roles: ["teacher"],
  },
  {
    id: "courses.by-teacher",
    method: "GET",
    path: "/courses/teacher/:teacherId",
    feature: "courses",
    roles: ["admin", "teacher"],
  },
  {
    id: "courses.by-slug",
    method: "GET",
    path: "/courses/slug/:slug",
    feature: "courses",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "courses.detail",
    method: "GET",
    path: "/courses/:id",
    feature: "courses",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "courses.create",
    method: "POST",
    path: "/courses",
    feature: "courses",
    roles: ["admin", "teacher"],
  },
  {
    id: "courses.update",
    method: "PATCH",
    path: "/courses/:id",
    feature: "courses",
    roles: ["admin", "teacher"],
  },
  {
    id: "courses.archive",
    method: "PATCH",
    path: "/courses/:id/archive",
    feature: "courses",
    roles: ["admin", "teacher"],
  },
  {
    id: "courses.unarchive",
    method: "PATCH",
    path: "/courses/:id/unarchive",
    feature: "courses",
    roles: ["admin", "teacher"],
  },
  {
    id: "courses.delete",
    method: "DELETE",
    path: "/courses/:id",
    feature: "courses",
    roles: ["admin", "teacher"],
  },

  // Course modules
  {
    id: "course-modules.by-course",
    method: "GET",
    path: "/course-modules/course/:courseId",
    feature: "course-modules",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "course-modules.detail",
    method: "GET",
    path: "/course-modules/:id",
    feature: "course-modules",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "course-modules.create",
    method: "POST",
    path: "/course-modules/:courseId",
    feature: "course-modules",
    roles: ["admin", "teacher"],
  },
  {
    id: "course-modules.update",
    method: "PATCH",
    path: "/course-modules/:id",
    feature: "course-modules",
    roles: ["admin", "teacher"],
  },
  {
    id: "course-modules.reorder",
    method: "PATCH",
    path: "/course-modules/course/:courseId/reorder",
    feature: "course-modules",
    roles: ["admin", "teacher"],
  },
  {
    id: "course-modules.delete",
    method: "DELETE",
    path: "/course-modules/:id",
    feature: "course-modules",
    roles: ["admin", "teacher"],
  },

  // Enrollments
  {
    id: "course-enrollments.my",
    method: "GET",
    path: "/course-enrollments/my",
    feature: "course-enrollments",
    roles: ["student"],
  },
  {
    id: "course-enrollments.by-course",
    method: "GET",
    path: "/course-enrollments/course/:courseId",
    feature: "course-enrollments",
    roles: ["admin", "teacher"],
  },
  {
    id: "course-enrollments.kick-student",
    method: "DELETE",
    path: "/course-enrollments/:courseId/students/:studentId",
    feature: "course-enrollments",
    roles: ["admin", "teacher"],
  },
  {
    id: "course-enrollments.enroll",
    method: "POST",
    path: "/course-enrollments",
    feature: "course-enrollments",
    roles: ["student"],
  },
  {
    id: "course-enrollments.unenroll",
    method: "DELETE",
    path: "/course-enrollments/:courseId",
    feature: "course-enrollments",
    roles: ["student"],
  },

  // Notifications
  {
    id: "notifications.list",
    method: "GET",
    path: "/notifications",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
    notes: "page, limit, and optional isRead are passed as query strings.",
  },
  {
    id: "notifications.unread-count",
    method: "GET",
    path: "/notifications/unread-count",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "notifications.mark-all-read",
    method: "PATCH",
    path: "/notifications/read-all",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "notifications.delete-all",
    method: "DELETE",
    path: "/notifications",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "notifications.mark-read",
    method: "PATCH",
    path: "/notifications/:id/read",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "notifications.delete",
    method: "DELETE",
    path: "/notifications/:id",
    feature: "notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },

  // Subjects
  {
    id: "subjects.list",
    method: "GET",
    path: "/subjects",
    feature: "subjects",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "subjects.my",
    method: "GET",
    path: "/subjects/my",
    feature: "subjects",
    roles: ["teacher"],
  },
  {
    id: "subjects.by-teacher",
    method: "GET",
    path: "/subjects/teacher/:teacherId",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.detail",
    method: "GET",
    path: "/subjects/:id",
    feature: "subjects",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "subjects.create",
    method: "POST",
    path: "/subjects",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.update",
    method: "PUT",
    path: "/subjects/:id",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.delete",
    method: "DELETE",
    path: "/subjects/:id",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.elkpd.create",
    method: "POST",
    path: "/subjects/:subjectId/elkpd",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.elkpd.update",
    method: "PUT",
    path: "/subjects/:subjectId/elkpd/:elkpdId",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.elkpd.delete",
    method: "DELETE",
    path: "/subjects/:subjectId/elkpd/:elkpdId",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.module-progress",
    method: "GET",
    path: "/subjects/modules/:courseModuleId/progress",
    feature: "subjects",
    roles: ["student", "admin", "teacher"],
  },
  {
    id: "subjects.module-mark-file-read",
    method: "POST",
    path: "/subjects/modules/:courseModuleId/mark-file-read",
    feature: "subjects",
    roles: ["student"],
  },
  {
    id: "subjects.module-mark-video-watched",
    method: "POST",
    path: "/subjects/modules/:courseModuleId/mark-video-watched",
    feature: "subjects",
    roles: ["student"],
  },
  {
    id: "subjects.module-elkpd-submit",
    method: "POST",
    path: "/subjects/modules/:courseModuleId/elkpd/submit",
    feature: "subjects",
    roles: ["student"],
  },
  {
    id: "subjects.module-elkpd-submissions",
    method: "GET",
    path: "/subjects/modules/:courseModuleId/submissions",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },
  {
    id: "subjects.module-elkpd-grade",
    method: "PUT",
    path: "/subjects/modules/:courseModuleId/submissions/:submissionId/grade",
    feature: "subjects",
    roles: ["admin", "teacher"],
  },

  // Diagnostic tests
  {
    id: "diagnostic-tests.list",
    method: "GET",
    path: "/diagnostic-tests",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher"],
  },
  {
    id: "diagnostic-tests.my",
    method: "GET",
    path: "/diagnostic-tests/my",
    feature: "diagnostic-tests",
    roles: ["teacher"],
  },
  {
    id: "diagnostic-tests.by-teacher",
    method: "GET",
    path: "/diagnostic-tests/teacher/:teacherId",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher"],
  },
  {
    id: "diagnostic-tests.detail",
    method: "GET",
    path: "/diagnostic-tests/:id",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    id: "diagnostic-tests.create",
    method: "POST",
    path: "/diagnostic-tests",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher"],
  },
  {
    id: "diagnostic-tests.update",
    method: "PATCH",
    path: "/diagnostic-tests/:id",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher"],
  },
  {
    id: "diagnostic-tests.delete",
    method: "DELETE",
    path: "/diagnostic-tests/:id",
    feature: "diagnostic-tests",
    roles: ["admin", "teacher"],
  },

  // Forum Discussions
  {
    id: "forum.discussions.list-by-course",
    method: "GET",
    path: "/forum/course/:courseId/discussions",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.discussions.detail",
    method: "GET",
    path: "/forum/discussions/:id",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.discussions.create",
    method: "POST",
    path: "/forum/course/:courseId/discussions",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.discussions.update",
    method: "PATCH",
    path: "/forum/discussions/:id",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.discussions.delete",
    method: "DELETE",
    path: "/forum/discussions/:id",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.discussions.like",
    method: "POST",
    path: "/forum/discussions/:id/like",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.comments.create",
    method: "POST",
    path: "/forum/discussions/:id/comments",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.comments.list",
    method: "GET",
    path: "/forum/discussions/:id/comments",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.comments.update",
    method: "PATCH",
    path: "/forum/comments/:commentId",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.comments.delete",
    method: "DELETE",
    path: "/forum/comments/:commentId",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },
  {
    id: "forum.comments.like",
    method: "POST",
    path: "/forum/comments/:commentId/like",
    feature: "forum",
    roles: ["admin", "teacher", "student"],
  },

  // Progress Tracking
  {
    id: "progress.mark-file-read",
    method: "POST",
    path: "/progress/modules/:courseModuleId/mark-file-read",
    feature: "progress",
    roles: ["student"],
  },
  {
    id: "progress.mark-video-watched",
    method: "POST",
    path: "/progress/modules/:courseModuleId/mark-video-watched",
    feature: "progress",
    roles: ["student"],
  },
  {
    id: "progress.module-detail",
    method: "GET",
    path: "/progress/modules/:courseModuleId/me",
    feature: "progress",
    roles: ["student"],
  },
  {
    id: "progress.elkpd-grades",
    method: "GET",
    path: "/progress/modules/:courseModuleId/elkpd-grades",
    feature: "progress",
    roles: ["teacher"],
  },
  {
    id: "progress.grade-elkpd",
    method: "PUT",
    path: "/progress/modules/:courseModuleId/elkpd/student/:studentId/grade",
    feature: "progress",
    roles: ["teacher"],
  },
  {
    id: "progress.reset-elkpd-grade",
    method: "DELETE",
    path: "/progress/modules/:courseModuleId/elkpd/student/:studentId/grade",
    feature: "progress",
    roles: ["teacher"],
  },
  {
    id: "progress.start-test-attempt",
    method: "POST",
    path: "/progress/modules/:courseModuleId/test-attempts/start",
    feature: "progress",
    roles: ["student"],
  },
  {
    id: "progress.submit-test-attempt",
    method: "POST",
    path: "/progress/modules/:courseModuleId/test-attempts/:attemptId/submit",
    feature: "progress",
    roles: ["student"],
  },
  {
    id: "progress.my-attempts",
    method: "GET",
    path: "/progress/modules/:courseModuleId/test-attempts/me",
    feature: "progress",
    roles: ["student"],
  },

  // Dashboard
  {
    id: "dashboard.student",
    method: "GET",
    path: "/courses/:id/dashboard/student",
    feature: "dashboard",
    roles: ["student"],
  },
];
