"use client";

import SearchIcon from "@/components/atoms/icons/SearchIcon";
import { cn } from "@/libs/utils";

interface IForumSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ForumSearchField({
  value,
  onChange,
  placeholder = "Cari berdasarkan pertanyaan atau nama...",
  className,
}: IForumSearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-[#E2E8F0] bg-white pl-12 pr-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C7D2FE] focus:ring-2 focus:ring-[#E0E7FF]"
      />
    </div>
  );
}
