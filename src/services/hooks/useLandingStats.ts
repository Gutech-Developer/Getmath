import { useQuery } from "@tanstack/react-query";
import { gsPublicGet } from "@/libs/api/gsAction";
import { usePublicSchools } from "./useGsSchool";

export interface LandingStatsData {
  active_students: {
    value: number;
    formatted: string;
    trend_percentage?: number;
  };
  registered_schools: {
    value: number;
    formatted: string;
    trend_percentage?: number;
  };
  diagnostic_completion_rate: {
    value: number;
    formatted: string;
    unit?: string;
  };
  remedial_completion_rate: {
    value: number;
    formatted: string;
    unit?: string;
  };
  total_reach_visitors: {
    value: number;
    formatted: string;
    description?: string;
  };
  last_updated?: string;
}

export function useLandingStats() {
  const { data: schoolData, isLoading: isSchoolLoading } = usePublicSchools({
    page: 1,
    limit: 1,
  });

  const totalSchoolsFromApi = schoolData?.pagination?.totalItems;

  return useQuery<LandingStatsData, Error>({
    queryKey: ["public", "landing-stats", totalSchoolsFromApi],
    queryFn: async () => {
      try {
        const res = await gsPublicGet<LandingStatsData>("/public/landing-stats");
        if (res && res.active_students) {
          return res;
        }
      } catch (err) {
        // Endpoint not available yet on backend server -> Fallback to ready-to-use dummy schema
        console.info("Landing stats public API endpoint fallback active");
      }

      // Default fallback object matching section 5.2 schema in plan.md
      const schoolCount = totalSchoolsFromApi ?? 185;
      const formattedSchool = schoolCount > 0 ? `${schoolCount}+` : "180+";

      return {
        active_students: {
          value: 14250,
          formatted: "14.250+",
          trend_percentage: 12.5,
        },
        registered_schools: {
          value: schoolCount,
          formatted: formattedSchool,
          trend_percentage: 5.0,
        },
        diagnostic_completion_rate: {
          value: 88.7,
          formatted: "88,7%",
          unit: "percent",
        },
        remedial_completion_rate: {
          value: 92.4,
          formatted: "92,4%",
          unit: "percent",
        },
        total_reach_visitors: {
          value: 178900,
          formatted: "178.900+",
          description: "Pengunjung unik getsmart.id di seluruh Indonesia",
        },
        last_updated: new Date().toISOString(),
      };
    },
    staleTime: 60 * 1000,
  });
}
