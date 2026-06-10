import type { ComponentType } from "react";
import type { IconProps } from "@/types/iconProps";
import { cn } from "@/libs/utils";

export interface ILADMetricCardProps {
  value: string;
  label: string;
  sub?: string;
  icon: ComponentType<IconProps>;
  iconBg: string;
  iconFg: string;
}

export default function LADMetricCard({
  value,
  label,
  sub,
  icon: Icon,
  iconBg,
  iconFg,
}: ILADMetricCardProps) {
  return (
    <article className="flex flex-col gap-1 rounded-2xl border border-lottie-mist bg-white px-4 py-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            iconBg,
          )}
        >
          <Icon className={cn("h-4 w-4", iconFg)} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl  font-normal leading-6 text-lottie-midnight">{value}</p>
          <p className="truncate text-xs font-medium text-lottie-zinc-500">{label}</p>
        </div>
      </div>
      {sub && <p className="mt-1 truncate text-[11px] text-lottie-zinc-500/80">{sub}</p>}
    </article>
  );
}
