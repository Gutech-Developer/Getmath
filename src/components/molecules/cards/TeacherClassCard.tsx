"use client";

import { Badge } from "@/components/atoms/Badge";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { cn } from "@/libs/utils";

type ProgressVariant = "primary" | "success" | "warning" | "info";

interface TeacherClassCardProps {
  title: string;
  classCode: string;
  totalStudents: number;
  progress: number;
  progressVariant?: ProgressVariant;
  isActive?: boolean;
  activeTests?: number;
  onManage?: () => void;
  className?: string;
}

export const TeacherClassCard: React.FC<TeacherClassCardProps> = ({
  title,
  classCode,
  totalStudents,
  progress,
  progressVariant = "primary",
  isActive = true,
  activeTests,
  onManage,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 border-b border-grey-stroke last:border-b-0 cursor-pointer group",
        className,
      )}
      onClick={onManage}
    >
      {/* Row 1: Title + badge + chevron */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-02 truncate">
              {title}
            </h3>
          </div>
          <p className="text-xs text-grey font-medium">{classCode}</p>
        </div>
        <ChevronLeftIcon className="w-4 h-4 text-grey rotate-180 shrink-0 group-hover:text-neutral-02 transition-colors" />
      </div>

      {/* Row 2: Inline stats */}
      <div className="flex items-center gap-2 text-xs text-grey flex-wrap">
        <span>{totalStudents} siswa</span>
        <span className="w-1 h-1 rounded-full bg-grey-stroke" />
        <span>{progress}% selesai</span>
        <span className="w-1 h-1 rounded-full bg-grey-stroke" />
        {isActive && (
          <span className="font-semibold text-emerald-600">Aktif</span>
        )}
      </div>

      {/* Row 3: Progress bar */}
      <ProgressBar value={progress} variant={"primary"} size="sm" />
    </div>
  );
};
