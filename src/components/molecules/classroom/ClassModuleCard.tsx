import Link from "next/link";
import ArrowIcon from "@/components/atoms/icons/ArrowIcon";
import type { IClassSidebarRouteItem } from "@/constant/classSidebarRoutes";
import { cn } from "@/libs/utils";
import { classRouteIconMap, classRouteToneMap } from "./classroomMaps";

interface IClassModuleCardProps {
  item: IClassSidebarRouteItem;
}

export default function ClassModuleCard({ item }: IClassModuleCardProps) {
  const Icon = classRouteIconMap[item.key];
  const tone = classRouteToneMap[item.key];

  return (
    <Link
      href={item.href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0px_12px_24px_rgba(148,163,184,0.2)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            tone.iconBackgroundClassName,
          )}
        >
          <Icon className={cn("h-4 w-4", tone.iconClassName)} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0F172A]">
            {item.label}
          </p>
          <p className="truncate text-xs text-[#64748B]">{item.description}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.badge && (
          <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold text-[#B91C1C]">
            {item.badge}
          </span>
        )}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B] transition group-hover:bg-[#EEF2FF] group-hover:text-[#3730A3]">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
