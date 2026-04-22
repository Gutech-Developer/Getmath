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

  // Course Modules
  gsCourseModules: {
    all: ["gs", "courseModules"] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.gsCourseModules.all, "byCourse", courseId] as const,
    details: () => [...queryKeys.gsCourseModules.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.gsCourseModules.details(), id] as const,
  },
} as const;
