"use client";

import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import DashboardSidebarNav from "@/components/molecules/sidebar/DashboardSidebarNav";
import {
  getDashboardSidebarRoutesByRole,
  resolveDashboardSidebarRouteKey,
} from "@/constant/dashboardSidebarRoutes";
import { useGsUnreadNotificationsCount } from "@/services";
import type { UserRole } from "@/types/auth";
import SidebarUserProfileCard from "./SidebarUserProfileCard";

interface ITeacherDashboardSidebarContentProps {
  pathname: string;
  role: UserRole | null;
  userName: string;
  roleLabel: string;
  profileUrl: string;
  onNavigate: () => void;
  onLogout: () => void;
}

export default function TeacherDashboardSidebarContent({
  pathname,
  role,
  onNavigate,
  profileUrl,
  roleLabel,
  userName,
  onLogout,
}: ITeacherDashboardSidebarContentProps) {
  const { data: unreadData } = useGsUnreadNotificationsCount();
  const menuItems = getDashboardSidebarRoutesByRole(role, {
    notificationBadgeCount: unreadData?.unreadCount ?? 0,
  });
  const activeRouteKey = resolveDashboardSidebarRouteKey(pathname);

  return (
    <div className="flex h-full w-full flex-col px-4 py-5 lg:px-5 lg:py-6">
      <div className="thinnest-scrollbar flex-1 overflow-y-auto">
        <DashboardSidebarNav
          menuTitle=""
          items={menuItems}
          activeKey={activeRouteKey}
          onNavigate={onNavigate}
          variant="teacher"
        />
      </div>
      <div className="w-full space-y-3 pb-1">
        <div className="h-px w-full bg-grey-stroke" />

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-error transition hover:bg-error/10"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Keluar</span>
        </button>

        <div className="h-px w-full bg-grey-stroke" />

        <SidebarUserProfileCard
          userName={userName}
          roleLabel={roleLabel}
          href={profileUrl}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
