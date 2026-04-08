"use client";

import { ReactNode } from "react";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { cn } from "@/libs/utils";
import BookIcon from "@/components/atoms/icons/BookIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";

interface AvailableClassCardProps {
  title: string;
  teacher: string;
  institution: string;
  academicYear: string;
  totalMaterials: number;
  totalStudents: number;
  symbol: ReactNode;
  symbolColor?: string;
  onJoin?: () => void;
  className?: string;
}

export const AvailableClassCard: React.FC<AvailableClassCardProps> = ({
  title,
  teacher,
  institution,
  academicYear,
  totalMaterials,
  totalStudents,
  symbol,
  symbolColor = "bg-indigo-100 text-indigo-600",
  onJoin,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-grey-stroke rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 relative z-0",
        className,
      )}
    >
      {/* Header */}
      <div className="absolute z-1 right-5 top-5">
        <span className="text-xs text-grey font-medium">Belum Bergabung</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-neutral-02 line-clamp-2 leading-snug">
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-grey truncate">{teacher}</p>
        </div>
        <p className="text-xs text-grey">
          {institution} · {academicYear}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-grey">
          <BookIcon className="w-3.5 h-3.5" />
          <span className="text-xs">{totalMaterials} Materi</span>
        </div>
        <div className="flex items-center gap-1.5 text-grey">
          <UsersIcon className="w-3.5 h-3.5" />
          <span className="text-xs">{totalStudents} Siswa</span>
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={onJoin}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-emerald-400 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors duration-200"
      >
        <PlusIcon className="w-4 h-4" />
        Gabung dengan Kode
      </button>
    </div>
  );
};
