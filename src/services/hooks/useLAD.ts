"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
import { gsGet, gsDownloadFile } from "@/libs/api/gsAction";
import type {
    IEmotionDistributionResponse,
    IStudyTimeByModuleResponse,
    ICourseSummaryResponse,
    IActivityLogResponse,
    IEmotionDistributionClassOverallResponse,
    IDistributionDiagnosticTestResponse,
    IDistributionRemedialResponse,
    IModuleProgressTableResponse
} from "@/types/LAD";
import { buildQuery } from "./helper";

function withStudentId(path: string, studentId?: string) {
    return studentId && studentId !== "undefined" && studentId !== "null"
        ? `${path}?studentId=${studentId}`
        : path;
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

export function useEmotionDistributionOverall(courseId: string) {
    return useQuery<IEmotionDistributionClassOverallResponse, Error>({
        queryKey: queryKeys.lad.emotionDistributionOverall(courseId),
        queryFn: () => gsGet<IEmotionDistributionClassOverallResponse>(`/learning-analytics/courses/${courseId}/class-overall-emotion`),
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

export function useDiagnosticTestDistribution(courseId: string) {
    return useQuery<IDistributionDiagnosticTestResponse, Error>({
        queryKey: queryKeys.lad.diagnosticTestDistribution(courseId),
        queryFn: () => gsGet<IDistributionDiagnosticTestResponse>(`/learning-analytics/courses/${courseId}/class-diagnostic-distribution`),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useRemedialTestDistribution(courseId: string) {
    return useQuery<IDistributionRemedialResponse, Error>({
        queryKey: queryKeys.lad.remedialTestDistribution(courseId),
        queryFn: () => gsGet<IDistributionRemedialResponse>(`/learning-analytics/courses/${courseId}/class-remedial-distribution`),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useModuleProgressTable(courseModuleId: string, studentId?: string) {
    return useQuery<IModuleProgressTableResponse, Error>({
        queryKey: queryKeys.lad.moduleProgressTable(courseModuleId, studentId || ""),
        queryFn: () => gsGet<IModuleProgressTableResponse>(withStudentId(`/learning-analytics/modules/${courseModuleId}/progress-table`, studentId)),
        enabled: !!courseModuleId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useDownloadAnalytics() {
    return useMutation<
        { base64: string; contentType: string; filename: string },
        Error,
        string
    >({
        mutationFn: (courseSlug: string) =>
            gsDownloadFile(`/learning-analytics/courses/${courseSlug}/download-analytics`),
    });
}

export function useDownloadModuleAnalytics() {
    return useMutation<
        { base64: string; contentType: string; filename: string },
        Error,
        string
    >({
        mutationFn: (courseModuleId: string) =>
            gsDownloadFile(`/learning-analytics/modules/${courseModuleId}/download-analytics`),
    });
}
