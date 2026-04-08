"use client";

import SearchIcon from "@/components/atoms/icons/SearchIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import { cn } from "@/libs/utils";

interface ClassSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onJoinClass?: () => void;
  placeholder?: string;
  className?: string;
}

export const ClassSearchBar: React.FC<ClassSearchBarProps> = ({
  value,
  onChange,
  onJoinClass,
  placeholder = "Cari nama kelas atau guru...",
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-1">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-grey-stroke rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-grey"
        />
      </div>
      {onJoinClass && (
        <button
          onClick={onJoinClass}
          className="flex items-center gap-2 px-5 py-3 bg-[#1F2375] text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200 whitespace-nowrap shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          Gabung Kelas
        </button>
      )}
    </div>
  );
};
