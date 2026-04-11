import { cn } from "@/libs/utils";

interface IForumFilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export default function ForumFilterChip({
  label,
  isActive = false,
  onClick,
}: IForumFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-semibold transition ",
        isActive
          ? "border-[#1F2375]/40 bg-[#1F2375]/10 text-[#1F2375]"
          : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
      )}
    >
      {label}
    </button>
  );
}
