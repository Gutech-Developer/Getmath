import { ReactNode } from "react";
import { cn } from "@/libs/utils";

interface TeacherStatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({
  icon,
  value,
  label,
  subtitle,
  highlight = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-grey-stroke rounded-2xl px-5 py-4 flex items-center gap-4 relative",
        className,
      )}
    >
      {highlight && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
      )}
      {/* Icon */}
      {/* Text */}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-neutral-02 leading-tight">
          {value}
        </span>
        <span className="text-xs text-grey mt-0.5">{label}</span>
        {subtitle && (
          <span className="text-[11px] text-grey/70">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
