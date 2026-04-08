"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { cn } from "@/libs/utils";

interface ParentClassCardProps {
  title: string;
  teacherName: string;
  symbol: ReactNode;
  symbolColor?: string;
  progress: number;
  score: number;
  status: "Aktif" | "Selesai" | "Tidak Aktif";
  progressVariant?: "primary" | "success" | "warning" | "info";
  activeTests?: number;
  onView?: () => void;
  className?: string;
}

export const ParentClassCard: React.FC<ParentClassCardProps> = ({
  title,
  teacherName,
  symbol,
  symbolColor = "bg-indigo-100 text-indigo-600",
  progress,
  score,
  status,
  progressVariant = "primary",
  activeTests,
  onView,
  className,
}) => {
  const statusStyles = {
    Aktif: "text-emerald-600",
    Selesai: "text-grey",
    "Tidak Aktif": "text-amber-600",
  };

  return (
    <div
      className={cn(
        "bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4 cursor-pointer group hover:shadow-sm transition-shadow",
        className,
      )}
      onClick={onView}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-neutral-02 truncate">
              {title}
            </h3>
            <p className="text-xs text-grey">{teacherName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeTests && activeTests > 0 && (
            <Badge variant="info" className="text-[11px] px-2 py-0.5">
              {activeTests} Tes Aktif!
            </Badge>
          )}
          <ChevronLeftIcon className="w-4 h-4 text-grey rotate-180 group-hover:text-neutral-02 transition-colors" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl py-2.5 px-2">
          <p className="text-sm font-bold text-indigo-600">{progress}%</p>
          <p className="text-[11px] text-grey mt-0.5">Progress</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2.5 px-2">
          <p className="text-sm font-bold text-neutral-02">{score}</p>
          <p className="text-[11px] text-grey mt-0.5">Nilai Terakhir</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2.5 px-2">
          <p className={cn("text-sm font-bold", statusStyles[status])}>
            {status}
          </p>
          <p className="text-[11px] text-grey mt-0.5">Status</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-grey">Progress Belajar</span>
          <span className="text-[11px] font-semibold text-indigo-600">
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} variant={progressVariant} size="sm" />
      </div>
    </div>
  );
};
