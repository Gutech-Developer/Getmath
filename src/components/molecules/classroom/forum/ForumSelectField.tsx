"use client";

import { cn } from "@/libs/utils";
import type { IForumOption } from "@/types";

interface IForumSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: IForumOption<string>[];
  className?: string;
}

export default function ForumSelectField({
  value,
  onChange,
  options,
  className,
}: IForumSelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-12 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 text-xs font-medium text-[#334155] outline-none transition focus:border-[#C7D2FE] focus:ring-2 focus:ring-[#E0E7FF]",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
