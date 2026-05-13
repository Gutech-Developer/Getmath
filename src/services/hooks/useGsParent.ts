"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsPost, gsDel } from "@/libs/api/gsAction";
import { gsLogger } from "@/utils/logger";
import {
  GsChildBasic,
  GsAddChildInput,
  GsChildDashboard,
  GsChildCourseDetail,
} from "@/types/gs-parent";
import { GsMessageResponse } from "@/types/gs-auth";

/**
 * GetSmart API — Parent Monitoring Hooks
 */

// ─── GET /parent/children ────────────────────────────────────────────────────

export function useGsChildren() {
  return useQuery({
    queryKey: queryKeys.gsParents.children(),
    queryFn: async () => {
      gsLogger.request("GET", "/parent/children", {});
      const response = await gsGet<GsChildBasic[]>("/parent/children");
      gsLogger.response("GET", "/parent/children", 200, response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── POST /parent/children ───────────────────────────────────────────────────

export function useGsAddChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GsAddChildInput) => {
      gsLogger.request("POST", "/parent/children", {}, data);
      const response = await gsPost<GsMessageResponse>(
        "/parent/children",
        data
      );
      gsLogger.response("POST", "/parent/children", 201, response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsParents.all,
      });
    },
  });
}

// ─── DELETE /parent/children/:childStudentId ─────────────────────────────────

export function useGsRemoveChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childStudentId: string) => {
      gsLogger.request("DELETE", `/parent/children/${childStudentId}`, {});
      const response = await gsDel<GsMessageResponse>(
        `/parent/children/${childStudentId}`
      );
      gsLogger.response(
        "DELETE",
        `/parent/children/${childStudentId}`,
        200,
        response
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsParents.all,
      });
    },
  });
}

// ─── GET /parent/children/:childStudentId/dashboard ──────────────────────────

export function useGsChildDashboard(childStudentId: string) {
  return useQuery({
    queryKey: queryKeys.gsParents.childDashboard(childStudentId),
    queryFn: async () => {
      gsLogger.request("GET", `/parent/children/${childStudentId}/dashboard`, {});
      const response = await gsGet<GsChildDashboard>(
        `/parent/children/${childStudentId}/dashboard`
      );
      gsLogger.response(
        "GET",
        `/parent/children/${childStudentId}/dashboard`,
        200,
        response
      );
      return response;
    },
    enabled: !!childStudentId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── GET /parent/children/:childStudentId/courses/:childCourseId ─────────────

export function useGsChildCourseDetail(
  childStudentId: string,
  childCourseId: string
) {
  return useQuery({
    queryKey: queryKeys.gsParents.childCourseDetail(childStudentId, childCourseId),
    queryFn: async () => {
      gsLogger.request(
        "GET",
        `/parent/children/${childStudentId}/courses/${childCourseId}`,
        {}
      );
      const response = await gsGet<GsChildCourseDetail>(
        `/parent/children/${childStudentId}/courses/${childCourseId}`
      );
      gsLogger.response(
        "GET",
        `/parent/children/${childStudentId}/courses/${childCourseId}`,
        200,
        response
      );
      return response;
    },
    enabled: !!childStudentId && !!childCourseId,
    staleTime: 5 * 60 * 1000,
  });
}
