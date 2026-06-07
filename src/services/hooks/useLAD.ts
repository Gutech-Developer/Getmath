"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet } from "@/libs/api/gsAction";
import type {
    IEmotionDistributionResponse,
    IStudyTimeByModuleResponse,
    ICourseSummaryResponse,
    IActivityLogResponse
} from "@/types/LAD";
import { buildQuery } from "./helper";

function withStudentId(path: string, studentId?: string) {
    return studentId ? `${path}?studentId=${studentId}` : path;
}

export function useCourseSummary(courseId: string, studentId?: string) {
    return useQuery<ICourseSummaryResponse, Error>({
        queryKey: queryKeys.lad.courseSummary(courseId, studentId || ""),
        queryFn: () => gsGet<ICourseSummaryResponse>(withStudentId(`/learning-analytics/courses/${courseId}/summary`, studentId)),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useEmotionDistribution(courseId: string, studentId?: string) {
    return useQuery<IEmotionDistributionResponse, Error>({
        queryKey: queryKeys.lad.emotionDistribution(courseId, studentId || ""),
        queryFn: () => gsGet<IEmotionDistributionResponse>(withStudentId(`/learning-analytics/courses/${courseId}/emotion-distributions`, studentId)),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useStudyTimeByModule(courseId: string, studentId?: string) {
    return useQuery<IStudyTimeByModuleResponse, Error>({
        queryKey: queryKeys.lad.studyTimeByModule(courseId, studentId || ""),
        queryFn: () => gsGet<IStudyTimeByModuleResponse>(withStudentId(`/learning-analytics/courses/${courseId}/material-study-times`, studentId)),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useActivityLogs(courseId: string, studentId?: string, page = 1, limit = 10) {
    const q = buildQuery({ page, limit });
    const separator = q ? "&" : "?";
    const path = `/learning-analytics/courses/${courseId}/activity-logs${q}${studentId ? `${separator}studentId=${studentId}` : ""}`;
    return useQuery<IActivityLogResponse, Error>({
        queryKey: queryKeys.lad.activityLogs(courseId, studentId || "", page, limit),
        queryFn: () => gsGet<IActivityLogResponse>(path),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}
