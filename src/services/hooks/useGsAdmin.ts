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
