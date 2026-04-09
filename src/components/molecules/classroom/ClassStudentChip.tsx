import { cn } from "@/libs/utils";

interface IClassStudentChipProps {
  name: string;
  initial: string;
  toneClassName: string;
}

export default function ClassStudentChip({
  name,
  initial,
  toneClassName,
}: IClassStudentChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
          toneClassName,
        )}
      >
        {initial}
      </span>
      <span className="truncate text-xs font-medium text-[#334155]">
        {name}
      </span>
    </div>
  );
}
