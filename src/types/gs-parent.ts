import { GsCourse } from "./gs-course";

/**
 * GetSmart API — Parent & Child Monitoring Types
 */

export interface GsChildBasic {
  id: string;
  fullName: string;
  NIS: string;
  schoolName?: string;
  city?: string;
}

export interface GsAddChildInput {
  nis: string;
}

export interface GsChildDashboardCourse {
  courseId: string;
  courseName: string;
  isArchived: boolean;
  progressPercent: number;
  lastDiagnosticScore: number;
  unfinishedDiagnostics: number;
}

export interface GsRecentDiagnostic {
  attemptId: string;
  completedAt: string;
  testName: string;
  score: number;
  passingScore: number;
  isRemedial: boolean;
  courseName: string;
}

export interface GsChildDashboard {
  student: {
    id: string;
    fullName: string;
    NIS: string;
    schoolName: string;
    province: string;
    city: string;
  };
  totalSubjectModules: number;
  completedSubjectModules: number;
  avgDiagnosticScore: number;
  activeCourses: GsChildDashboardCourse[];
  recentDiagnostics: GsRecentDiagnostic[];
}

export interface GsChildCourseModule {
  courseModuleId: string;
  order: number;
  type: "SUBJECT" | "DIAGNOSTIC_TEST";
  accessible: boolean;
  completed: boolean;
  testName?: string;
  subjectName?: string;
  hasVideo?: boolean;
  hasELKPD?: boolean;
  fileRead?: boolean;
  videoWatched?: boolean;
  eLKPDGraded?: boolean;
}

export interface GsChildCourseDiagnosticResult {
  attemptId: string;
  testName: string;
  completedAt: string;
  score: number;
  passingScore: number;
  isPassed: boolean;
  attemptNumber: number;
  isRemedial: boolean;
}

export interface GsChildCourseDetail {
  course: {
    courseId: string;
    courseName: string;
    isArchived: boolean;
  };
  totalSubjectModules: number;
  completedSubjectModules: number;
  modules: GsChildCourseModule[];
  diagnosticResults: GsChildCourseDiagnosticResult[];
  lastActivity: any;
  // Computed fields (optional, but keep for compatibility if needed)
  studentFullName?: string;
  progressPercent?: number;
}
