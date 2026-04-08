import { cn } from "@/libs/utils";

type ProgressBarVariant = "primary" | "success" | "warning" | "info";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<ProgressBarVariant, string> = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "primary",
  showLabel = false,
  size = "md",
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-gray-100 overflow-hidden",
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
