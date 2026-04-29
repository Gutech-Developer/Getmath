/**
 * GetSmart API — Course, Course Module & Course Enrollment Types
 */

// ── Pagination ────────────────────────────────────────────────────────────────

export interface GsPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GsPaginatedResult<T> {
  data: T[];
  pagination: GsPaginationMeta;
}

export interface GsPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ── Shared nested types ───────────────────────────────────────────────────────

/** Info guru yang di-embed dalam response kelas */
export interface GsTeacherBasic {
  id: string;
  fullName: string;
  NIP?: string | null;
  schoolName: string;
}

// ── Course ────────────────────────────────────────────────────────────────────

export interface GsCourse {
  id: string;
  courseName: string;
  teacherId: string;
  schoolId: string;
  schoolName: string;
  /** Tahun ajaran — dapat null */
  schoolYear?: string | null;
  /** Batas maksimal siswa — dapat null (tidak terbatas) */
  totalStudentLimit?: number | null;
  isArchived: boolean;
  slug: string;
  courseCode: string;
  joinLink: string;
  createdAt: string;
  updatedAt: string;
  // ── Computed attributes (dari SQL COUNT, ada di list endpoints) ───────────
  enrolledCount?: number;
  diagnosticTestCount?: number;
  subjectCount?: number;
  // ── Nested ────────────────────────────────────────────────────────────────
  /** Info guru — tersedia di semua course endpoints */
  teacher?: GsTeacherBasic;
  /** Modul — hanya tersedia di GET /courses/:id dan GET /courses/slug/:slug */
  modules?: GsCourseModule[];
}

export interface GsCreateCourseInput {
  /** Hanya courseName yang diterima backend; info sekolah diambil dari profil guru */
  courseName: string;
}

export interface GsUpdateCourseInput {
  courseName?: string;
}

export interface GsPaginatedCourses {
  courses: GsCourse[];
  pagination: GsPaginationMeta;
}

// ── Course Module ─────────────────────────────────────────────────────────────

/** Subset subject yang di-embed dalam modul */
export interface GsCourseModuleSubject {
  id: string;
  subjectName: string;
  description: string | null;
  subjectFileUrl: string;
  videoUrl: string | null;
  eLKPDs?: Array<{
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    createdAt: string;
  }>;
}

/** Subset diagnostic test yang di-embed dalam modul */
export interface GsCourseModuleDiagnosticTest {
  id: string;
  testName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
}

export type GsModuleType = "SUBJECT" | "DIAGNOSTIC_TEST";

export interface GsCourseModule {
  id: string;
  order: number | null;
  type: GsModuleType | null;
  courseId: string;
  subjectId: string | null;
  diagnosticTestId: string | null;
  /** ISO datetime string atau null */
  deadline: string | null;
  subject?: GsCourseModuleSubject;
  diagnosticTest?: GsCourseModuleDiagnosticTest;
}

/**
 * Backend docs saat ini menunjukkan response create module berupa array modul.
 * Beberapa implementasi bisa mengembalikan object tunggal.
 */
export type GsCreateCourseModuleResponse = GsCourseModule | GsCourseModule[];

/** Input untuk POST /course-modules/:courseId */
export interface GsCreateCourseModuleInput {
  order: number;
  type: GsModuleType;
  /** Wajib jika type === "SUBJECT" */
  subjectId?: string;
  /** Wajib jika type === "DIAGNOSTIC_TEST" */
  diagnosticTestId?: string;
  /** ISO datetime string opsional */
  deadline?: string;
}

/** Input untuk PATCH /course-modules/:id */
export interface GsUpdateCourseModuleInput {
  order?: number;
  /** null untuk hapus deadline */
  deadline?: string | null;
}

/** Input untuk PATCH /course-modules/course/:courseId/reorder */
export interface GsReorderCourseModulesInput {
  modules: { id: string; order: number }[];
}

// ── Course Enrollment ─────────────────────────────────────────────────────────

/**
 * Subset course yang di-embed dalam enrollment
 * (hanya atribut yang dikembalikan oleh CourseEnrollmentService.getEnrollmentsByStudent)
 */
export interface GsEnrollmentCourse {
  id: string;
  courseName: string;
  courseCode: string;
  joinLink: string;
  slug: string;
  isArchived: boolean;
  schoolName: string;
  teacher?: GsTeacherBasic;
}

/**
 * Subset student yang di-embed dalam enrollment
 * (dikembalikan oleh CourseEnrollmentService.getEnrollmentsByCourse — endpoint teacher/admin)
 */
export interface GsStudentBasic {
  id: string;
  fullName: string;
  NIS?: string | null;
  schoolName?: string | null;
  city?: string | null;
}

export interface GsCourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  isActive?: boolean;
  /** Tersedia di GET /course-enrollments/my (student endpoint) */
  course?: GsEnrollmentCourse;
  /** Tersedia di GET /course-enrollments/course/:courseId (teacher/admin endpoint) */
  student?: GsStudentBasic;
}

export interface GsEnrollCourseInput {
  /** Kode kelas yang diberikan guru */
  courseCode: string;
}

export interface GsPaginatedEnrollments {
  enrollments: GsCourseEnrollment[];
  pagination: GsPaginationMeta;
}
