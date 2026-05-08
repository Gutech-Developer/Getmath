"use client";

/**
 * GetSmart API — Dashboard Hooks
 * TanStack Query hooks untuk dashboard API (semua role).
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet } from "@/libs/api/gsAction";
import { gsLogger } from "@/utils/logger";

// ─── Types ────────────────────────────────────────────────────────────────

export interface StudentDashboardData {
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

export interface TeacherDashboardData {
  courseId: string;
  courseName: string;
  courseCode: string;
  enrolledStudentCount: number;
  subjectModuleCount: number;
  diagnosticTestCount: number;
  averageProgress: number;
  recentActivity?: {
    discussionCount: number;
    submissionCount: number;
  };
}

export interface AdminDashboardData {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubmissions: number;
  averageCompletion: number;
  recentActivity?: {
    newEnrollments: number;
    discussionCount: number;
  };
}

export interface ParentDashboardData {
  children: Array<{
    id: string;
    fullName: string;
    courses: Array<{
      courseId: string;
      courseName: string;
      progressPercent: number;
    }>;
  }>;
  generalProgress: number;
}

// ─── GET /api/courses/:courseId/dashboard/student ──────────────────────────────

export function useStudentDashboard(
  courseId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.gsDashboard.student(courseId),
    queryFn: async () => {
      gsLogger.info(`Fetching student dashboard for course ${courseId}`, {});
      const response = await gsGet<StudentDashboardData>(
        `/courses/${courseId}/dashboard/student`,
      );
      gsLogger.response(
        "GET",
        `/courses/${courseId}/dashboard/student`,
        200,
        response,
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 menit
    ...options,
  });
}

// ─── GET /api/courses/:courseId/dashboard/teacher ─────────────────────────────

export function useTeacherDashboard(
  courseId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.gsDashboard.teacher(courseId),
    queryFn: async () => {
      gsLogger.info(`Fetching teacher dashboard for course ${courseId}`, {});
      const response = await gsGet<TeacherDashboardData>(
        `/courses/${courseId}/dashboard/teacher`
      );
      gsLogger.response(
        "GET",
        `/courses/${courseId}/dashboard/teacher`,
        200,
        response
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// // ─── GET /api/courses/:courseId/dashboard/admin ───────────────────────────────

// export function useAdminDashboard(
//   courseId: string,
//   options?: { enabled?: boolean }
// ) {
//   return useQuery({
//     queryKey: queryKeys.gsDashboard.admin(courseId),
//     queryFn: async () => {
//       gsLogger.info(`Fetching admin dashboard for course ${courseId}`, {});
//       const response = await gsGet<AdminDashboardData>(
//         `/courses/${courseId}/dashboard/admin`
//       );
//       gsLogger.response(
//         "GET",
//         `/courses/${courseId}/dashboard/admin`,
//         200,
//         response
//       );
//       return response;
//     },
//     staleTime: 5 * 60 * 1000,
//     ...options,
//   });
// }

// // ─── GET /api/courses/:courseId/dashboard/parent ──────────────────────────────

// export function useParentDashboard(
//   courseId: string,
//   options?: { enabled?: boolean }
// ) {
//   return useQuery({
//     queryKey: queryKeys.gsDashboard.parent(courseId),
//     queryFn: async () => {
//       gsLogger.info(`Fetching parent dashboard for course ${courseId}`, {});
//       const response = await gsGet<ParentDashboardData>(
//         `/courses/${courseId}/dashboard/parent`
//       );
//       gsLogger.response(
//         "GET",
//         `/courses/${courseId}/dashboard/parent`,
//         200,
//         response
//       );
//       return response;
//     },
//     staleTime: 5 * 60 * 1000,
//     ...options,
//   });
// }
