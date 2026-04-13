import { cn } from "@/libs/utils";
import type { ReactNode } from "react";

type ProfileActionButtonVariant = "primary" | "warm" | "danger";

interface IProfileActionButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ProfileActionButtonVariant;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick: () => void | Promise<void>;
}

const variantClassNames: Record<ProfileActionButtonVariant, string> = {
  primary:
    "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] focus-visible:ring-[#93C5FD]",
  warm:
    "border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5] focus-visible:ring-[#FDBA74]",
  danger:
    "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] focus-visible:ring-[#FCA5A5]",
};

export default function ProfileActionButton({
  children,
  icon,
  variant = "primary",
  className,
  disabled = false,
  fullWidth = false,
  onClick,
}: IProfileActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClassNames[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
