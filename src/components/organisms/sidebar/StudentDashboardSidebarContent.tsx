import DashboardSidebarNav from "@/components/molecules/sidebar/DashboardSidebarNav";
import {
  getDashboardSidebarRoutesByRole,
  resolveDashboardSidebarRouteKey,
} from "@/constant/dashboardSidebarRoutes";
import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import type { UserRole } from "@/types/auth";
import SidebarUserProfileCard from "./SidebarUserProfileCard";

interface IStudentDashboardSidebarContentProps {
  pathname: string;
  role: UserRole | null;
  userName: string;
  roleLabel: string;
  profileUrl: string;
  onNavigate: () => void;
  onLogout: () => void;
}

export default function StudentDashboardSidebarContent({
  pathname,
  role,
  userName,
  roleLabel,
  profileUrl,
  onNavigate,
  onLogout,
}: IStudentDashboardSidebarContentProps) {
  const menuItems = getDashboardSidebarRoutesByRole(role);
  const activeRouteKey = resolveDashboardSidebarRouteKey(pathname);
  const menuTitle = role === "admin" ? "Menu Admin" : "Menu Utama";

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 lg:p-5">
      <div className="thinnest-scrollbar flex-1 overflow-y-auto">
        <DashboardSidebarNav
          menuTitle={menuTitle}
          items={menuItems}
          activeKey={activeRouteKey}
          onNavigate={onNavigate}
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
