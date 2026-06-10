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
  iconColor = "bg-lottie-teal/5 text-lottie-teal",
  value,
  label,
  delta,
  className,
}) => {
  return (
    <div
      className={cn(
        "getmath-card px-5 py-4 flex items-center gap-4 relative",
        className,
      )}
    >
      {icon && (
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconColor)}>
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-neutral-02 leading-tight">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        <span className="text-xs text-grey mt-0.5">{label}</span>
      </div>
    </div>
  );
};
