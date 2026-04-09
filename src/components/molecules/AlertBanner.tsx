import { ReactNode } from "react";
import { cn } from "@/libs/utils";

type AlertBannerVariant = "warning" | "error" | "info" | "success";

interface AlertBannerProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: AlertBannerVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantStyles: Record<AlertBannerVariant, string> = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const actionVariantStyles: Record<AlertBannerVariant, string> = {
  warning: "text-amber-700 hover:text-amber-900",
  error: "text-red-700 hover:text-red-900",
  info: "text-blue-700 hover:text-blue-900",
  success: "text-emerald-700 hover:text-emerald-900",
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  icon,
  children,
  variant = "warning",
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        variantStyles[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <p className="flex-1 text-sm font-medium">{children}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-colors",
            actionVariantStyles[variant],
          )}
        >
          {action.label}
          <span className="text-xs">›</span>
        </button>
      )}
    </div>
  );
};
