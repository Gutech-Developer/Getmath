"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { cn } from "@/libs/utils";

interface ClassModuleItem {
  id: string;
  type: "Materi" | "Video" | "E-LKPD" | "Tes Diagnostik";
  title: string;
  status: "completed" | "active" | "locked";
}

interface ParentClassItem {
  id: string;
  title: string;
  teacherName: string;
  symbol: ReactNode;
  symbolColor?: string;
  progress: number;
  score: number;
  status: "Aktif" | "Selesai" | "Tidak Aktif";
}

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
  selectedClassId: string | null;
  setSelectedClassId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedClassModules: ClassModuleItem[];
  cls: ParentClassItem;
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
  setSelectedClassId,
  onView,
  className,
  selectedClassId,
  selectedClassModules,
  cls,
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
      {selectedClassId === cls.id ? (
        <div className="rounded-2xl bg-[linear-gradient(135deg,#1F2375_0%,#3347D8_100%)] p-4 text-white shadow-[0px_14px_30px_rgba(31,35,117,0.28)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white",
                  cls.symbolColor,
                )}
              >
                {cls.symbol}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
                  Kelas Aktif Dipilih
                </p>
                <h3 className="mt-1 truncate text-lg font-bold">{cls.title}</h3>
                <p className="text-xs text-white/80">{cls.teacherName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedClassId(null);
              }}
              className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Kembali ke Ringkasan
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/15 px-3 py-2">
              <p className="text-sm font-bold">
                {
                  selectedClassModules.filter(
                    (module) => module.status === "completed",
                  ).length
                }
                /{selectedClassModules.length}
              </p>
              <p className="text-[11px] text-white/80">Modul Selesai</p>
            </div>
            <div className="rounded-lg bg-white/15 px-3 py-2">
              <p className="text-sm font-bold">{cls.score}</p>
              <p className="text-[11px] text-white/80">Nilai Terakhir</p>
            </div>
            <div className="rounded-lg bg-white/15 px-3 py-2">
              <p className="text-sm font-bold">{cls.progress}%</p>
              <p className="text-[11px] text-white/80">Progress</p>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
