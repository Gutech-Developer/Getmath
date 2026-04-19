"use client";

import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import { cn } from "@/libs/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";

interface ITeacherClassSidebarContentProps {
  classSlug: string;
  teacherName: string;
  roleLabel: string;
  profileUrl: string;
  onNavigate: () => void;
  onLogout: () => void;
}

interface ITeacherClassSidebarItem {
  type: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const TEACHER_CLASS_SIDEBAR_ITEMS: ITeacherClassSidebarItem[] = [
  { type: "Beranda", label: "Beranda", icon: DashboardIcon },
  { type: "Siswa", label: "Siswa", icon: ThreeUserGroupIcon },
  { type: "Materi", label: "Materi", icon: NotebookIcon },
  { type: "Kelola E-LKPD", label: "Kelola E-LKPD", icon: ClipboardIcon },
  { type: "Laporan", label: "Laporan", icon: TrendUpIcon },
];

function validViewType(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return TEACHER_CLASS_SIDEBAR_ITEMS.some((item) => item.type === normalized)
    ? normalized
    : null;
}

export default function TeacherClassSidebarContent({
  classSlug,
  teacherName,
  roleLabel,
  profileUrl,
  onNavigate,
  onLogout,
}: ITeacherClassSidebarContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = validViewType(searchParams.get("view")) ?? "Beranda";

  return (
    <aside className="h-full rounded-[20px] bg-white shadow-[0px_10px_32px_rgba(17,24,39,0.06)] xl:sticky xl:top-[92px] xl:h-full">
      <div className="px-4 py-4">
        <Link
          href="/teacher/dashboard/class-list"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-[#6B7280] transition hover:bg-[#F9FAFB]"
        >
          <span className="text-lg">←</span>
          Kembali
        </Link>

        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-sm font-bold text-[#1E3A8A]">{classSlug}</p>
          <p className="mt-1 text-xs text-[#64748B]">{teacherName}</p>
        </div>
      </div>

      <nav className="space-y-2 px-3 pb-4">
        {TEACHER_CLASS_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.type === currentView;
          const href = `${pathname.split("?")[0]}?view=${encodeURIComponent(
            item.type,
          )}`;

          return (
            <Link
              key={item.type}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                isActive
                  ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-transparent bg-white text-[#475569] hover:border-[#E5E7EB] hover:bg-[#F8FAFC]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-[#DBEAFE] text-[#1D4ED8]"
                    : "bg-[#F1F5F9] text-[#64748B]",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#E5E7EB] px-4 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEE2E2]"
        >
          Keluar
        </button>
        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-xs font-semibold text-[#6B7280]">{roleLabel}</p>
          <p className="mt-1 text-sm text-[#111827] truncate">{teacherName}</p>
          <Link
            href={profileUrl}
            onClick={onNavigate}
            className="mt-2 block text-xs font-semibold text-[#2563EB]"
          >
            Lihat Profil
          </Link>
        </div>
      </div>
    </aside>
  );
}
