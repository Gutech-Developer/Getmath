"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsPost } from "@/libs/api/gsAction";

interface AssignCourseInput {
  courseId: string;
  teacherId: string;
}

export function useGsAssignCourseToTeacher() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AssignCourseInput>({
    mutationFn: (input) => gsPost<any>("/admin/courses/assign", input),
    onSuccess: (_, variables) => {
      // Invalidate course list and specific course detail
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.myList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsCourses.detail(variables.courseId) });
    },
  });
}

interface AssignSubjectInput {
  subjectId: string;
  teacherId: string;
}

export function useGsAssignSubjectToTeacher() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AssignSubjectInput>({
    mutationFn: (input) => gsPost<any>("/admin/subjects/assign", input),
    onSuccess: (_, variables) => {
      // Invalidate all subject lists and specific subject detail
      queryClient.invalidateQueries({ queryKey: queryKeys.gsSubjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsSubjects.detail(variables.subjectId) });
    },
  });
}

interface AssignDiagnosticTestInput {
  diagnosticTestId: string;
  teacherId: string;
}

export function useGsAssignDiagnosticTestToTeacher() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AssignDiagnosticTestInput>({
    mutationFn: (input) => gsPost<any>("/admin/diagnostic-tests/assign", input),
    onSuccess: (_, variables) => {
      // Invalidate diagnostic tests lists and specific test detail
      queryClient.invalidateQueries({ queryKey: queryKeys.gsDiagnosticTests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsDiagnosticTests.detail(variables.diagnosticTestId) });
    },
  });
}

interface AssignRemedialTestInput {
  remedialTestId: string;
  teacherId: string;
}

export function useGsAssignRemedialTestToTeacher() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AssignRemedialTestInput>({
    mutationFn: (input) => gsPost<any>("/admin/remedial-tests/assign", input),
    onSuccess: (_, variables) => {
      // Invalidate remedial tests lists and specific test detail
      queryClient.invalidateQueries({ queryKey: queryKeys.gsRemedialTests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.gsRemedialTests.detail(variables.remedialTestId) });
    },
  });
}
