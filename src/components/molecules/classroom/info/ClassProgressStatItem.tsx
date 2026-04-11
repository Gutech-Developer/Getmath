import { cn } from "@/libs/utils";
import type { ClassInfoProgressTone } from "@/types";

interface IClassProgressStatItemProps {
  label: string;
  value: string;
  tone: ClassInfoProgressTone;
}

const toneClassNameMap: Record<ClassInfoProgressTone, string> = {
  success: "border-[#1F2375]/40 bg-[#1F2375]/10 text-[#1F2375]",
  danger: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  neutral: "border-[#1F2375]/40 bg-[#1F2375]/10 text-[#1F2375]",
};

export default function ClassProgressStatItem({
  label,
  value,
  tone,
}: IClassProgressStatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-3xl border px-5 py-5",
        toneClassNameMap[tone],
      )}
    >
      <p className="text-base text-[#1F2375]/70">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  );
}
