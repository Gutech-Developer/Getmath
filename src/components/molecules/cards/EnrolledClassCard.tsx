"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { cn } from "@/libs/utils";
import BookIcon from "@/components/atoms/icons/BookIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import ArrowIcon from "@/components/atoms/icons/ArrowIcon";

type ProgressVariant = "primary" | "success" | "warning" | "info";

interface ClassCardProps {
  title: string;
  teacher: string;
  institution: string;
  academicYear: string;
  progress: number;
  totalMaterials: number;
  totalStudents: number;
  symbol: ReactNode;
  symbolColor?: string;
  progressVariant?: ProgressVariant;
  activeTests?: number;
  onClick?: () => void;
  className?: string;
}

export const EnrolledClassCard: React.FC<ClassCardProps> = ({
  title,
  teacher,
  institution,
  academicYear,
  progress,
  totalMaterials,
  totalStudents,
  symbol,
  symbolColor = "bg-indigo-100 text-indigo-600",
  progressVariant = "primary",
  activeTests,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-grey-stroke rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow duration-200 group relative z-0",
        className,
      )}
    >
      <div className="absolute z-1 right-5 top-5">
        {activeTests && activeTests > 0 && (
          <Badge
            variant="info"
            icon={<span className="w-1.5 h-1.5 rounded-full bg-transparent " />}
          >
            {activeTests} Tes Aktif
          </Badge>
        )}
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

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-grey">Progress Belajar</span>
          <span className="text-xs font-semibold text-neutral-02">
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} variant={"primary"} size="sm" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-grey-stroke">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-grey">
            <BookIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{totalMaterials} Materi</span>
          </div>
          <div className="flex items-center gap-1.5 text-grey">
            <UsersIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{totalStudents}</span>
          </div>
        </div>
        <ArrowIcon className="w-4 h-4 text-grey group-hover:text-neutral-02 transition-colors" />
      </div>
    </div>
  );
};
