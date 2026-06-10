"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { cn } from "@/libs/utils";
import BookIcon from "@/components/atoms/icons/BookIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import ArrowIcon from "@/components/atoms/icons/ArrowIcon";
import Link from "next/link";

type ProgressVariant = "primary" | "success" | "warning" | "info";

interface ClassCardProps {
  slug: string;
  title: string;
  teacher: string;
  institution: string;
  academicYear: string;
  progressPercent: number;
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
  slug,
  title,
  teacher,
  institution,
  academicYear,
  progressPercent,
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
    <Link
      href={`/student/dashboard/class/${slug}`}
      className={cn(
        "getmath-card p-5 flex flex-col gap-4 cursor-pointer group relative z-0",
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
        <h3 className="text-xl font-bold text-lottie-teal line-clamp-2 leading-snug">
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-lottie-zinc-500 truncate">{teacher}</p>
        </div>
        <p className="text-xs text-lottie-zinc-500">
          {institution} · {academicYear}
        </p>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-lottie-zinc-500">Progress Belajar</span>
          <span className="text-xs font-semibold text-lottie-midnight">
            {progressPercent}%
          </span>
        </div>
        <ProgressBar value={progressPercent} variant={"primary"} size="sm" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-lottie-mist">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-lottie-zinc-500">
            <BookIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{totalMaterials} Materi</span>
          </div>
          <div className="flex items-center gap-1.5 text-lottie-zinc-500">
            <UsersIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{totalStudents}</span>
          </div>
        </div>
        <ArrowIcon className="w-4 h-4 text-lottie-zinc-500 group-hover:text-lottie-teal transition-colors" />
      </div>
    </Link>
  );
};
