import { ReactNode } from "react";
import { Heading4, BodySmallMedium } from "@/components/atoms/Typography";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  className = "",
  trend,
}) => {
  return (
    <div
      className={`bg-white border border-grey-stroke rounded-xl p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <BodySmallMedium className="text-grey mb-2">{title}</BodySmallMedium>
          <Heading4 className="text-neutral-02 mb-1">{value}</Heading4>
          {subtitle && (
            <BodySmallMedium className="text-grey">{subtitle}</BodySmallMedium>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-success" : "text-error"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-grey">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-moss-stone/10 rounded-lg flex items-center justify-center text-moss-stone">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
