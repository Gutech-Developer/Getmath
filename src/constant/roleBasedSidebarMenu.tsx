import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import LinkIcon from "@/components/atoms/icons/LinkIcon";
import {
  getDashboardSidebarInitRoutesByRole,
  type IDashboardSidebarRouteItem,
} from "@/constant/dashboardSidebarRoutes";
import {
  getClassSidebarRoutes,
  type ClassSidebarRouteKey,
} from "@/constant/classSidebarRoutes";
import type { SidebarVariant } from "@/constant/sidebarVariant";
import { UserRole } from "@/types/auth";

export interface ISidebarSubmenu {
  name: string;
  url: string;
}

export interface ISidebarMenu {
  name: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subMenu: ISidebarSubmenu[];
  roles?: UserRole[]; // Roles yang bisa akses menu ini
}

export type StudentSidebarContentType = SidebarVariant;

interface ISidebarMenuOptions {
  studentContentType?: StudentSidebarContentType;
  classSlug?: string;
}

const classStudentSidebarIconMap: Record<
  ClassSidebarRouteKey,
  ISidebarMenu["icon"]
> = {
  overview: DashboardIcon,
  materi: NotebookIcon,
  diagnosis: DocumentIcon,
  form: LinkIcon,
  "info-kelas": ThreeUserGroupIcon,
};

function getClassStudentSidebarMenu(slug: string): ISidebarMenu[] {
  return getClassSidebarRoutes(slug).map((route) => ({
    name: route.label,
    url: route.href,
    icon: classStudentSidebarIconMap[route.key],
    subMenu: [],
    roles: ["student"],
  }));
}

function toSidebarMenuItem(route: IDashboardSidebarRouteItem): ISidebarMenu {
  return {
    name: route.label,
    url: route.href,
    icon: route.icon,
    subMenu: [],
  };
}

/**
 * Get sidebar menu based on user role
 */
export function getSidebarMenuByRole(
  role: UserRole | null,
  options: ISidebarMenuOptions = {},
): ISidebarMenu[] {
  const { studentContentType = "dashboardStudent", classSlug } = options;

  if (role === "student") {
    if (studentContentType === "class" && classSlug) {
      return getClassStudentSidebarMenu(classSlug);
    }
  }

  return getDashboardSidebarInitRoutesByRole(role).map(toSidebarMenuItem);
}
