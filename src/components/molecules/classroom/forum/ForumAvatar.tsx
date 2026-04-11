import { cn } from "@/libs/utils";
import type { ForumTone } from "@/types";

type ForumAvatarSize = "md" | "lg";

interface IForumAvatarProps {
  name: string;
  tone: ForumTone;
  size?: ForumAvatarSize;
  className?: string;
}

const avatarToneMap: Record<ForumTone, string> = {
  amber: "border-[#F7D9B6] bg-[#FFF7ED] text-[#D97706]",
  emerald: "border-[#BDE5D7] bg-[#ECFDF5] text-[#059669]",
  rose: "border-[#FBCFE8] bg-[#FFF1F2] text-[#E11D48]",
  sky: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  slate: "border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]",
  violet: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
};

const avatarSizeMap: Record<ForumAvatarSize, string> = {
  md: "h-14 w-14 text-2xl",
  lg: "h-16 w-16 text-[2rem]",
};

function getForumInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function ForumAvatar({
  name,
  tone,
  size = "md",
  className,
}: IForumAvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 font-bold",
        avatarToneMap[tone],
        avatarSizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      {getForumInitial(name)}
    </div>
  );
}
