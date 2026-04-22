/**
 * GetSmart API — Course & Course Enrollment Types
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

// ── Course ────────────────────────────────────────────────────────────────────

export interface GsCourse {
  id: string;
  courseName: string;
  teacherId: string;
  schoolId: string;
  schoolName: string;
  isArchived: boolean;
  slug: string;
  courseCode: string;
  joinLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface GsCreateCourseInput {
  courseName: string;
}

export interface GsUpdateCourseInput {
  courseName?: string;
}

export interface GsPaginatedCourses {
  courses: GsCourse[];
  pagination: GsPaginationMeta;
}

// ── Course Enrollment ─────────────────────────────────────────────────────────

export interface GsCourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  course?: GsCourse;
}

export interface GsEnrollCourseInput {
  courseId: string;
}

export interface GsPaginatedEnrollments {
  enrollments: GsCourseEnrollment[];
  pagination: GsPaginationMeta;
}
