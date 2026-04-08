import type { IconProps } from "@/types/iconProps";
import type { ComponentType } from "react";
import { cn } from "@/libs/utils";

interface IClassMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<IconProps>;
  iconBackgroundClassName: string;
  iconClassName: string;
}

export default function ClassMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBackgroundClassName,
  iconClassName,
}: IClassMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0px_8px_24px_rgba(148,163,184,0.14)]">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            iconBackgroundClassName,
          )}
        >
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-5 text-[#0F172A]">{value}</p>
          <p className="truncate text-xs font-medium text-[#64748B]">{label}</p>
          {hint && (
            <p className="truncate text-[11px] text-[#94A3B8]">{hint}</p>
          )}
        </div>
      </div>
    </article>
  );
}
