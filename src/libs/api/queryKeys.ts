/**
 * Query Keys for TanStack Query - Art Therapy Application
 *
 * Best practices:
 * - Gunakan struktur hierarki untuk query keys
 * - Specific keys di akhir (detail ID, filters)
 * - Consistent naming convention
 *
 * Contoh penggunaan:
 * ```ts
 * const { data } = useApiQuery(
 *   queryKeys.children.detail(childId),
 *   `/child/${childId}`
 * );
 * ```
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },

  // Counselors
  counselors: {
    all: ["counselors"] as const,
    lists: () => [...queryKeys.counselors.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.counselors.lists(), filters] as const,
    details: () => [...queryKeys.counselors.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.counselors.details(), id] as const,
  },

  // Parents
  parents: {
    all: ["parents"] as const,
    lists: () => [...queryKeys.parents.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.parents.lists(), filters] as const,
    details: () => [...queryKeys.parents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.parents.details(), id] as const,
  },

  // Children
  children: {
    all: ["children"] as const,
    lists: () => [...queryKeys.children.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.children.lists(), filters] as const,
    details: () => [...queryKeys.children.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.children.details(), id] as const,
    byParent: (parentId: string) =>
      [...queryKeys.children.all, "byParent", parentId] as const,
  },

  // Therapies
  therapies: {
    all: ["therapies"] as const,
    lists: () => [...queryKeys.therapies.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.therapies.lists(), filters] as const,
    details: () => [...queryKeys.therapies.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.therapies.details(), id] as const,
    byCounselor: (counselorId: string) =>
      [...queryKeys.therapies.all, "byCounselor", counselorId] as const,
    byParent: (parentId: string) =>
      [...queryKeys.therapies.all, "byParent", parentId] as const,
    byChild: (childId: string) =>
      [...queryKeys.therapies.all, "byChild", childId] as const,
  },

  // Observations
  observations: {
    all: ["observations"] as const,
    details: () => [...queryKeys.observations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.observations.details(), id] as const,
    byTherapy: (therapyId: string) =>
      [...queryKeys.observations.all, "byTherapy", therapyId] as const,
  },

  // Pretests
  pretests: {
    all: ["pretests"] as const,
    details: () => [...queryKeys.pretests.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.pretests.details(), id] as const,
    byTherapy: (therapyId: string) =>
      [...queryKeys.pretests.all, "byTherapy", therapyId] as const,
  },

  // Posttests
  posttests: {
    all: ["posttests"] as const,
    details: () => [...queryKeys.posttests.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.posttests.details(), id] as const,
    byTherapy: (therapyId: string) =>
      [...queryKeys.posttests.all, "byTherapy", therapyId] as const,
  },

  // Screenings
  screenings: {
    all: ["screenings"] as const,
    details: () => [...queryKeys.screenings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.screenings.details(), id] as const,
    byTherapy: (therapyId: string) =>
      [...queryKeys.screenings.all, "byTherapy", therapyId] as const,
  },

  // ── GetSmart API ────────────────────────────────────────────────────────────

  // Auth (GetSmart)
  gsAuth: {
    all: ["gs", "auth"] as const,
    me: () => [...queryKeys.gsAuth.all, "me"] as const,
    activationVerify: (token: string) =>
      [...queryKeys.gsAuth.all, "activationVerify", token] as const,
    forgotPasswordVerify: (token: string) =>
      [...queryKeys.gsAuth.all, "forgotPasswordVerify", token] as const,
    googleAuthUrl: (redirectUri: string) =>
      [...queryKeys.gsAuth.all, "googleAuthUrl", redirectUri] as const,
  },

  // Health Check
  gsHealth: {
    all: ["gs", "health"] as const,
    status: () => [...queryKeys.gsHealth.all, "status"] as const,
  },

  // Diagnostic Tests
  gsDiagnosticTests: {
    all: ["gs", "diagnosticTests"] as const,
    lists: () => [...queryKeys.gsDiagnosticTests.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsDiagnosticTests.lists(), filters] as const,
    myList: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsDiagnosticTests.all, "my", filters] as const,
    byTeacher: (teacherId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsDiagnosticTests.all,
        "byTeacher",
        teacherId,
        filters,
      ] as const,
    details: () => [...queryKeys.gsDiagnosticTests.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsDiagnosticTests.details(), id] as const,
  },

  // Subjects
  gsSubjects: {
    all: ["gs", "subjects"] as const,
    lists: () => [...queryKeys.gsSubjects.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsSubjects.lists(), filters] as const,
    myList: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsSubjects.all, "my", filters] as const,
    byTeacher: (teacherId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.gsSubjects.all, "byTeacher", teacherId, filters] as const,
    details: () => [...queryKeys.gsSubjects.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.gsSubjects.details(), id] as const,
    elkpd: (subjectId: string) =>
      [...queryKeys.gsSubjects.all, "elkpd", subjectId] as const,
    moduleProgress: (courseModuleId: string) =>
      [...queryKeys.gsSubjects.all, "moduleProgress", courseModuleId] as const,
    moduleSubmissions: (
      courseModuleId: string,
      filters?: Record<string, unknown>,
    ) =>
      [
        ...queryKeys.gsSubjects.all,
        "moduleSubmissions",
        courseModuleId,
        filters,
      ] as const,
  },

  // Courses
  gsCourses: {
    all: ["gs", "courses"] as const,
    lists: () => [...queryKeys.gsCourses.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsCourses.lists(), filters] as const,
    myList: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsCourses.all, "my", filters] as const,
    byTeacher: (teacherId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.gsCourses.all, "byTeacher", teacherId, filters] as const,
    details: () => [...queryKeys.gsCourses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.gsCourses.details(), id] as const,
    bySlug: (slug: string) =>
      [...queryKeys.gsCourses.all, "slug", slug] as const,
  },

  // Course Enrollments
  gsCourseEnrollments: {
    all: ["gs", "courseEnrollments"] as const,
    myList: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsCourseEnrollments.all, "my", filters] as const,
    byCourse: (courseId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsCourseEnrollments.all,
        "byCourse",
        courseId,
        filters,
      ] as const,
  },

  // Notifications
  gsNotifications: {
    all: ["gs", "notifications"] as const,
    lists: () => [...queryKeys.gsNotifications.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsNotifications.lists(), filters] as const,
    unreadCount: () =>
      [...queryKeys.gsNotifications.all, "unreadCount"] as const,
  },

  // Course Modules
  gsCourseModules: {
    all: ["gs", "courseModules"] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.gsCourseModules.all, "byCourse", courseId] as const,
    details: () => [...queryKeys.gsCourseModules.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsCourseModules.details(), id] as const,
    byPackage: (packageId: string) =>
      [...queryKeys.gsCourseModules.all, "byPackage", packageId] as const,
  },

  // Forum Discussions
  gsForumDiscussions: {
    all: ["gs", "forum", "discussions"] as const,
    lists: () => [...queryKeys.gsForumDiscussions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsForumDiscussions.lists(), filters] as const,
    byModule: (courseModuleId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsForumDiscussions.all,
        "byModule",
        courseModuleId,
        filters,
      ] as const,
    byCourse: (courseId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsForumDiscussions.all,
        "byCourse",
        courseId,
        filters,
      ] as const,
    details: () => [...queryKeys.gsForumDiscussions.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsForumDiscussions.details(), id] as const,
  },

  // Forum Comments
  gsForumComments: {
    all: ["gs", "forum", "comments"] as const,
    byDiscussion: (discussionId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsForumComments.all,
        "byDiscussion",
        discussionId,
        filters,
      ] as const,
    details: () => [...queryKeys.gsForumComments.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsForumComments.details(), id] as const,
  },

  // Forum — unified convenience namespace
  gsForum: {
    all: ["gs", "forum"] as const,
    discussionsByCourse: (
      courseId: string,
      filters?: Record<string, unknown>,
    ) =>
      [
        "gs",
        "forum",
        "discussions",
        courseId,
        ...(filters ? [filters] : []),
      ] as const,
    discussionDetail: (id: string) =>
      ["gs", "forum", "discussionDetail", id] as const,
    commentsByDiscussion: (
      discussionId: string,
      filters?: Record<string, unknown>,
    ) =>
      [
        "gs",
        "forum",
        "comments",
        discussionId,
        ...(filters ? [filters] : []),
      ] as const,
  },

  // Dashboard
  gsDashboard: {
    all: ["gs", "dashboard"] as const,
    student: (courseId: string) =>
      [...queryKeys.gsDashboard.all, "student", courseId] as const,
    teacher: (courseId: string) =>
      [...queryKeys.gsDashboard.all, "teacher", courseId] as const,
    admin: (courseId: string) =>
      [...queryKeys.gsDashboard.all, "admin", courseId] as const,
    parent: (courseId: string) =>
      [...queryKeys.gsDashboard.all, "parent", courseId] as const,
  },

  // Student Progress
  gsProgress: {
    all: ["gs", "progress"] as const,
    moduleProgress: (courseModuleId: string) =>
      [...queryKeys.gsProgress.all, "module", courseModuleId] as const,
    testAttempts: (courseModuleId: string) =>
      [...queryKeys.gsProgress.all, "testAttempts", courseModuleId] as const,
    elkpdGrades: (courseModuleId: string) =>
      [...queryKeys.gsProgress.all, "elkpdGrades", courseModuleId] as const,
  },

  // Remediation / Diagnostic Tests Results
  gsRemediations: {
    all: ["gs", "remediations"] as const,
    lists: () => [...queryKeys.gsRemediations.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsRemediations.lists(), filters] as const,
    byStudent: (studentId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsRemediations.all,
        "byStudent",
        studentId,
        filters,
      ] as const,
    details: () => [...queryKeys.gsRemediations.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsRemediations.details(), id] as const,
  },

  // E-LKPD Submissions
  gsELkpdSubmissions: {
    all: ["gs", "elkpd", "submissions"] as const,
    lists: () => [...queryKeys.gsELkpdSubmissions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gsELkpdSubmissions.lists(), filters] as const,
    byModule: (courseModuleId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.gsELkpdSubmissions.all,
        "byModule",
        courseModuleId,
        filters,
      ] as const,
    details: () => [...queryKeys.gsELkpdSubmissions.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsELkpdSubmissions.details(), id] as const,
  },

  // Parents (monitoring children)
  gsParents: {
    all: ["gs", "parents"] as const,
    children: () => [...queryKeys.gsParents.all, "children"] as const,
    childDashboard: (studentId: string) =>
      [...queryKeys.gsParents.all, "child", studentId, "dashboard"] as const,
    childCourseDetail: (studentId: string, courseId: string) =>
      [
        ...queryKeys.gsParents.all,
        "child",
        studentId,
        "course",
        courseId,
      ] as const,
  },
} as const;
