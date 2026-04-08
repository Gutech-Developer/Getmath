import { ReactNode } from "react";
import { cn } from "@/libs/utils";

interface AdminStatCardProps {
  icon: ReactNode;
  iconColor?: string;
  value: string | number;
  label: string;
  delta?: number;
  className?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon,
  iconColor = "bg-indigo-100 text-indigo-500",
  value,
  label,
  delta,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-grey-stroke rounded-2xl p-5 flex flex-col gap-3",
        className,
      )}
    >
      {/* Value + label */}
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-neutral-02 leading-tight">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        <span className="text-sm text-grey">{label}</span>
      </div>
    </div>
  );
};
