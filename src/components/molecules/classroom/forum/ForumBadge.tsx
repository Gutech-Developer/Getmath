import type { ReactNode } from "react";
import StarIcon from "@/components/atoms/icons/StarIcon";
import { cn } from "@/libs/utils";

type ForumBadgeTone =
  | "pinned"
  | "teacher"
  | "student"
  | "material"
  | "inactive"
  | "mine";

interface IForumBadgeProps {
  tone: ForumBadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const toneClassMap: Record<ForumBadgeTone, string> = {
  pinned: "border-[#FDE68A] bg-[#FFF7ED] text-[#D97706]",
  teacher: "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669]",
  student: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  material: "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]",
  inactive: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
  mine: "border-[#FBCFE8] bg-[#FFF1F2] text-[#E11D48]",
};

export function ForumPinnedBadge({ className }: { className?: string }) {
  return (
    <ForumBadge
      tone="pinned"
      icon={<StarIcon className="h-3.5 w-3.5" />}
      className={className}
    >
      Sematkan
    </ForumBadge>
  );
}

export default function ForumBadge({
  tone,
  children,
  icon,
  className,
}: IForumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        toneClassMap[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
