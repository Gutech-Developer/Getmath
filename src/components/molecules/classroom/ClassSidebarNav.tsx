import Link from "next/link";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import type { ClassSidebarRouteKey } from "@/constant/classSidebarRoutes";
import { getClassSidebarRoutes } from "@/constant/classSidebarRoutes";
import { cn } from "@/libs/utils";
import { classRouteIconMap, classRouteToneMap } from "./classroomMaps";
import {
  useGsCourseBySlug,
  useGsModulesByCourse,
  useStudentDashboard,
} from "@/services";
import { useMemo } from "react";

interface IClassSidebarNavProps {
  slug: string;
  activeKey: ClassSidebarRouteKey;
  classTitle: string;
  teacherName: string;
  onNavigate?: () => void;
}

export default function ClassSidebarNav({
  slug,
  activeKey,
  classTitle,
  teacherName,
  onNavigate,
}: IClassSidebarNavProps) {
  const { data: course } = useGsCourseBySlug(slug);
  const { data: modules } = useGsModulesByCourse(course?.id ?? "");
  const { data: dashboardMetrics } = useStudentDashboard(course?.id ?? "", {
    enabled: !!course?.id,
  });

  const totalSubjects =
    dashboardMetrics?.subjectModuleTotal ??
    (modules ?? []).filter((m) => m.type === "SUBJECT").length;

  const totalDiagnosticTests =
    dashboardMetrics?.diagnosticTestTotal ??
    (modules ?? []).filter((m) => m.type === "DIAGNOSTIC_TEST").length;

  const menuItems = useMemo(() => {
    return getClassSidebarRoutes(slug).map((item) => {
      if (item.key === "materi") {
        return {
          ...item,
          description: `${totalSubjects} materi tersedia`,
        };
      }
      if (item.key === "diagnosis") {
        return {
          ...item,
          description: `${totalDiagnosticTests} tes tersedia`,
        };
      }
      return item;
    });
  }, [slug, totalSubjects, totalDiagnosticTests]);

  return (
    <aside className="h-full rounded-[20px]  bg-white  shadow-[0px_10px_32px_rgba(17,24,39,0.06)] xl:sticky xl:top-[92px] xl:h-full">
      <Link
        href="/student/dashboard"
        onClick={onNavigate}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-[#6B7280] transition hover:bg-[#F9FAFB]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Kembali
      </Link>

      <div className="mt-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
        <p className="text-sm font-bold text-[#1E3A8A]">{classTitle}</p>
        <p className="mt-1 text-xs text-[#64748B]">{teacherName}</p>
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = classRouteIconMap[item.key];
          const tone = classRouteToneMap[item.key];
          const isActive = activeKey === item.key;

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                "border-transparent text-[#475569] hover:border-[#E2E8F0] hover:bg-[#F8FAFC]",
                isActive && tone.activeClassName,
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  tone.iconBackgroundClassName,
                )}
              >
                <Icon className={cn("h-4 w-4", tone.iconClassName)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                <p className="truncate text-xs opacity-70">
                  {item.description}
                </p>
              </div>
              {item.badge && (
                <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold text-[#B91C1C]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
