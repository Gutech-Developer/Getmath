"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import FireIcon from "@/components/atoms/icons/FireIcon";
import StarIcon from "@/components/atoms/icons/StarIcon";
import TrophyIcon from "@/components/atoms/icons/TrophyIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";

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

interface TeacherBannerProps extends WelcomeBannerBaseProps {
  role: "teacher";
  roleLabel?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
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
      actionLabel = "Buat Kelas",
      onAction,
    } = props as TeacherBannerProps;

    return (
      <div className="relative w-full rounded-2xl bg-[#1F2375] p-6 md:p-8 overflow-hidden">
        <div className="relative flex flex-col gap-1.5">
          <p className="text-indigo-200 text-sm">Selamat datang kembali,</p>
          <h2 className="text-white text-2xl md:text-3xl font-bold">{name}</h2>
          {subtitle && (
            <p className="text-indigo-200 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
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
