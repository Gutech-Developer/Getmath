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
  role?: string;
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
  progressPercent: number;
  slug: string;
  courseCode: string;
  joinLink: string;
  createdAt: string;
  updatedAt: string;
  // ── Computed attributes (dari SQL COUNT, ada di list endpoints) ───────────
  enrolledCount?: number;
  diagnosticTestCount?: number;
  subjectCount?: number;
  averageProgressPercent?: number;
  // ── Nested ────────────────────────────────────────────────────────────────
  /** Info guru — tersedia di semua course endpoints */
  teacher?: GsTeacherBasic;
  /** Modul — hanya tersedia di GET /courses/:id dan GET /courses/slug/:slug */
  modules?: GsCourseModule[];
}

export interface GsCreateCourseInput {
  /** Hanya courseName yang diterima backend; info sekolah diambil dari profil guru */
  courseName: string;
  teacherId?: string;
}

export interface GsUpdateCourseInput {
  courseName?: string;
  teacherId?: string;
}

export interface GsPaginatedCourses {
  courses: GsCourse[];
  pagination: GsPaginationMeta;
}

export interface GsStudentDashboardResponse {
  courseId: string;
  courseName: string;
  courseCode: string;
  progressPercent: number;
  enrolledCount: number;
  subjectModuleTotal: number;
  subjectModuleRead: number;
  diagnosticTestTotal: number;
  enrolledStudentNames: Array<{
    id: string;
    fullName: string;
  }>;
}

// ── Course Module ─────────────────────────────────────────────────────────────

/** Subset subject yang di-embed dalam modul */
export interface GsCourseModuleSubject {
  id: string;
  subjectName: string;
  description: string | null;
  subjectFileUrl: string;
  eLKPDTitle: string | null;
  hasPDF?: boolean | null;
  eLKPDDescription: string | null;
  eLKPDFileUrl: string | null;
  videoUrl: string | null;
}

/** Subset diagnostic test yang di-embed dalam modul */
export interface GsCourseModuleDiagnosticTest {
  id: string;
  testName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  totalQuestions?: number;
}

export type GsModuleType = "SUBJECT" | "DIAGNOSTIC_TEST" | "REMEDIAL";

export interface GsModuleNextPackage {
  packageId: string;
  totalQuestions: number;
}

// ─── GET /course-modules/package/:packageId ───────────────────────────────────

export interface GsModulePackageOption {
  id: string;
  option: string;
  textAnswer: string | null;
  imageAnswerUrl: string | null;
}

export interface GsModulePackageQuestion {
  id: string;
  questionNumber: number;
  textQuestion: string | null;
  imageQuestionUrl: string | null;
  pembahasan: string;
  videoUrl: string;
  options: GsModulePackageOption[];
}

export interface GsModulePackageDetail {
  packageId: string;
  packageName: string | null;
  totalQuestions: number;
  questions: GsModulePackageQuestion[];
}

export interface GsModuleByPackageResponse {
  id: string;
  courseId: string;
  order: number;
  type: string;
  diagnosticTestId?: string;
  remedialTestId?: string;
  testName: string;
  durationMinutes: number;
  passingScore: number;
  canAttempt: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  attemptHistory: Array<{
    attemptId: string;
    attemptNumber: number;
    score?: number;
    isPassed: boolean;
    startedAt?: string;
    completedAt?: string;
  }>;
  nextPackage?: GsModuleNextPackage | null;
  package: GsModulePackageDetail;
}

export interface GsCourseModule {
  id: string;
  order: number | null;
  type: GsModuleType | null;
  courseId: string;
  subjectId: string | null;
  diagnosticTestId: string | null;
  remedialTestId?: string | null;
  /** ISO datetime string atau null */
  deadline: string | null;

  // Diagnostic Test / Remedial Test Extra Info (Expanded)
  testName?: string;
  description?: string | null;
  durationMinutes?: number;
  passingScore?: number;
  totalQuestions?: number;
  canAttempt?: boolean;
  attemptsUsed?: number;
  maxAttempts?: number;
  nextPackage?: GsModuleNextPackage | null;
  hasAttempted?: boolean;
  attemptId?: string | null;
  attemptHistory?: Array<{
    attemptId: string;
    attemptNumber: number;
    score?: number;
    isPassed: boolean;
    startedAt?: string;
    completedAt?: string;
  }>;

  subject?: GsCourseModuleSubject;
  diagnosticTest?: GsCourseModuleDiagnosticTest;
  remedialTest?: GsCourseModuleDiagnosticTest;
}

// Tambahkan tipe ini tepat di atas komponen Anda
export type ExtendedGsCourseModule = GsCourseModule & {
  hasPDF?: boolean;
  hasVideo?: boolean;
  hasELKPD?: boolean;
  // Tambahkan juga field flat dari API jika dibutuhkan
  accessible?: boolean;
  fileRead?: boolean;
  videoWatched?: boolean;
  eLKPDGraded?: boolean;
  eLKPDSubmitted?: boolean;
  completed?: boolean;
  remedialCompleted?: boolean;
};
/**
 * POST /course-modules/:courseId returns single module yang baru dibuat.
 * Caller harus invalidate query byCourse untuk mendapatkan list terbaru.
 */
export type GsCreateCourseModuleResponse = GsCourseModule;

/** Input untuk POST /course-modules/:courseId */
export interface GsCreateCourseModuleInput {
  order: number;
  type: GsModuleType;
  /** Wajib jika type === "SUBJECT" */
  subjectId?: string;
  /** Wajib jika type === "DIAGNOSTIC_TEST" */
  diagnosticTestId?: string;
  /** Wajib jika type === "REMEDIAL" */
  remedialTestId?: string;
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
  birthDate?: string | null;
  gender?: string | null;
}

export interface GsCourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  isActive?: boolean;
  progressPercent?: number;
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
