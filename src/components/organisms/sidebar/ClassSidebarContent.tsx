import { ClassSidebarNav } from "@/components/molecules/classroom";
import type { ClassSidebarRouteKey } from "@/constant/classSidebarRoutes";
import LogoutIcon from "../../atoms/icons/LogoutIcon";
import SidebarUserProfileCard from "./SidebarUserProfileCard";

interface IClassSidebarContentProps {
  classSlug: string;
  activeClassRouteKey: ClassSidebarRouteKey;
  userName: string;
  roleLabel: string;
  profileUrl: string;
  onNavigate: () => void;
  onLogout: () => void;
  teacherName?: string;
}

function formatClassTitle(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ClassSidebarContent({
  classSlug,
  activeClassRouteKey,
  userName,
  roleLabel,
  profileUrl,
  onNavigate,
  onLogout,
  teacherName = "Guru Kelas",
}: IClassSidebarContentProps) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 lg:p-5">
      <div className="flex-1 overflow-y-auto thinnest-scrollbar">
        <ClassSidebarNav
          slug={classSlug}
          activeKey={activeClassRouteKey}
          classTitle={formatClassTitle(classSlug)}
          teacherName={teacherName}
          onNavigate={onNavigate}
        />
      </div>

      <div className="w-full space-y-3 pb-1">
        <div className="w-full h-px bg-grey-stroke"></div>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-error transition hover:bg-error/10"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Keluar</span>
        </button>

        <div className="w-full h-px bg-grey-stroke"></div>

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
