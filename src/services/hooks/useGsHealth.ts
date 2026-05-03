"use client";

import { useQuery } from "@tanstack/react-query";
import { gsPublicGet } from "@/libs/api/getsmart";
import { queryKeys } from "@/libs/api";
import type { GsHealthCheckResponse } from "@/types/gs-health";

/**
 * GET /
 * Health-check endpoint untuk memastikan API GetSmart reachable.
 */
export function useGsHealthCheck() {
  return useQuery<GsHealthCheckResponse, Error>({
    queryKey: queryKeys.gsHealth.status(),
    queryFn: () => gsPublicGet<GsHealthCheckResponse>("/"),
    retry: 1,
    staleTime: 30 * 1000,
  });
}
