import { ReactNode } from "react";
import { cn } from "@/libs/utils";

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-grey">{icon}</span>}
        <h2 className="text-base font-semibold text-neutral-02">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
