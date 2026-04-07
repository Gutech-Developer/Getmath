import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
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

/**
 * Sidebar Menu untuk Teacher (termasuk backward compatibility role counselor)
 */
export const teacherSidebarMenu: ISidebarMenu[] = [
  {
    name: "Dashboard",
    url: "/teacher/dashboard",
    icon: DashboardIcon,
    subMenu: [],
    roles: ["teacher", "counselor"],
  },
];

/**
 * Sidebar Menu untuk Student
 */
export const studentSidebarMenu: ISidebarMenu[] = [
  {
    name: "Dashboard",
    url: "/student/dashboard",
    icon: DashboardIcon,
    subMenu: [],
    roles: ["student"],
  },
];

/**
 * Sidebar Menu untuk Admin
 */
export const adminSidebarMenu: ISidebarMenu[] = [
  {
    name: "Dashboard",
    url: "/admin/dashboard",
    icon: DashboardIcon,
    subMenu: [],
    roles: ["admin"],
  },
];

/**
 * Sidebar Menu untuk Parent
 */
export const parentSidebarMenu: ISidebarMenu[] = [
  {
    name: "Dashboard",
    url: "/parent/dashboard",
    icon: DashboardIcon,
    subMenu: [],
    roles: ["parent"],
  },
  {
    name: "Anak Saya",
    url: "/parent/children",
    icon: ThreeUserGroupIcon,
    subMenu: [],
    roles: ["parent"],
  },
  {
    name: "Terapi",
    url: "/parent/therapy",
    icon: NotebookIcon,
    subMenu: [],
    roles: ["parent"],
  },
  {
    name: "Laporan",
    url: "/parent/reports",
    icon: DocumentIcon,
    subMenu: [],
    roles: ["parent"],
  },
];

/**
 * Get sidebar menu based on user role
 */
export function getSidebarMenuByRole(role: UserRole | null): ISidebarMenu[] {
  if (role === "counselor" || role === "teacher") {
    return teacherSidebarMenu;
  }

  if (role === "parent") {
    return parentSidebarMenu;
  }

  if (role === "student") {
    return studentSidebarMenu;
  }

  if (role === "admin") {
    return adminSidebarMenu;
  }

  return [];
}
