"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import FireIcon from "@/components/atoms/icons/FireIcon";
import TrophyIcon from "@/components/atoms/icons/TrophyIcon";
import { cn } from "@/libs/utils";

type BannerRole = "student" | "teacher" | "parent";

interface WelcomeBannerBaseProps {
  name: string;
  role?: BannerRole;
}

interface StudentBannerProps extends WelcomeBannerBaseProps {
  role?: "student";
  streakDays?: number;
  level?: number;
  xp?: number;
  rank?: number;
  totalClassesFollowed?: number;
}

interface ITeacherBannerChip {
  label: string;
  className?: string;
}

interface TeacherBannerProps extends WelcomeBannerBaseProps {
  role: "teacher";
  roleLabel?: string;
  subtitle?: string;
  showGreeting?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  leadingIcon?: ReactNode;
  metadata?: string[];
  chips?: ITeacherBannerChip[];
  actionNode?: ReactNode;
}

interface ParentBannerProps extends WelcomeBannerBaseProps {
  role: "parent";
  childName: string;
  onManageChild?: () => void;
}

export type WelcomeBannerProps =
  | StudentBannerProps
  | TeacherBannerProps
  | ParentBannerProps;

export const WelcomeBanner: React.FC<WelcomeBannerProps> = (props) => {
  const { name, role = "student" } = props;

  if (role === "parent") {
    const { childName, onManageChild } = props as ParentBannerProps;
    return (
      <div className="relative w-full rounded-2xl bg-[#1F2375] p-6 md:p-8 overflow-hidden">
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge
              variant="ghost"
              className="self-start bg-white/20 text-white text-xs"
            >
              Orang Tua / Wali
            </Badge>
            <h2 className="text-white text-2xl md:text-3xl font-bold">
              Halo, {name}
            </h2>
            <p className="text-indigo-200 text-sm">
              Pantau perkembangan belajar{" "}
              <span className="font-semibold text-white">{childName}</span>
            </p>
          </div>
          {onManageChild && (
            <button
              onClick={onManageChild}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white text-[#1F2375] rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              <span>👤</span>
              Manajemen Anak
            </button>
          )}
        </div>
      </div>
    );
  }

  if (role === "teacher") {
    const {
      roleLabel = "Guru Matematika",
      subtitle,
      showGreeting = true,
      actionLabel = "Buat Kelas",
      onAction,
      leadingIcon,
      metadata,
      chips,
      actionNode,
    } = props as TeacherBannerProps;

    return (
      <div className="relative w-full rounded-2xl bg-[#1F2375] p-6 md:p-8 overflow-hidden">
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex items-start gap-3">
            {leadingIcon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                {leadingIcon}
              </div>
            )}

            <div className="min-w-0 flex flex-col gap-1.5">
              {showGreeting && (
                <p className="text-indigo-200 text-sm">
                  Selamat datang kembali,
                </p>
              )}
              <h2 className="truncate text-white text-2xl md:text-3xl font-bold">
                {name}
              </h2>
              {subtitle && (
                <p className="text-indigo-200 text-sm mt-0.5">{subtitle}</p>
              )}
              {metadata && metadata.length > 0 && (
                <p className="text-indigo-200 text-xs md:text-sm">
                  {metadata.join(" • ")}
                </p>
              )}
            </div>
          </div>

          {actionNode}

          {!actionNode && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="shrink-0 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {chips && chips.length > 0 && (
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className={cn(
                  "inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90",
                  chip.className,
                )}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {!subtitle && roleLabel && (
          <p className="relative mt-1 text-indigo-200 text-sm">{roleLabel}</p>
        )}
      </div>
    );
  }

  // Student variant
  const {
    streakDays = 0,
    rank,
    totalClassesFollowed = 0,
  } = props as StudentBannerProps;

  return (
    <div className="relative w-full rounded-2xl bg-[#1F2375] p-6 md:p-8 overflow-hidden">
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <p className="text-indigo-200 text-sm">Selamat datang kembali,</p>
            <h2 className="text-white text-xl md:text-2xl font-bold mt-1">
              {name} 👋
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {streakDays > 0 && (
              <Badge
                variant="ghost"
                icon={<FireIcon className="w-3.5 h-3.5" />}
                className="bg-orange-500/20 text-orange-200 backdrop-blur-sm"
              >
                {streakDays} Hari Berturut
              </Badge>
            )}
            {rank && (
              <Badge
                variant="ghost"
                icon={<TrophyIcon className="w-3.5 h-3.5" />}
                className="bg-emerald-500/20 text-emerald-200 backdrop-blur-sm"
              >
                Peringkat #{rank}
              </Badge>
            )}
          </div>
        </div>

        {/* Classes Count */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <p className="text-indigo-200 text-xs">Kelas yang diikuti</p>
          <span className="text-white text-4xl font-bold">
            {totalClassesFollowed}
          </span>
        </div>
      </div>
    </div>
  );
};
