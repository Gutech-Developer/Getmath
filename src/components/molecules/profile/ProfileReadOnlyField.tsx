import { cn } from "@/libs/utils";
import { EMPTY_PROFILE_FIELD } from "@/utils/profile";

interface IProfileReadOnlyFieldProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export default function ProfileReadOnlyField({
  label,
  value,
  fullWidth = false,
}: IProfileReadOnlyFieldProps) {
  const isEmptyValue = value === EMPTY_PROFILE_FIELD;

  return (
    <div className={cn("space-y-2", fullWidth && "sm:col-span-2")}>
      <label className="block text-sm font-semibold text-[#4B5563]">
        {label}
      </label>
      <input
        readOnly
        value={value}
        className={cn(
          "h-12 w-full rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.03)] px-4 text-sm text-[#334155] outline-none",
          isEmptyValue && "text-[#94A3B8]",
        )}
      />
    </div>
  );
}
