import ActivityIcon from "@/components/atoms/icons/ActivityIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ProfileIcon from "@/components/atoms/icons/ProfileIcon";
import type { UserRole } from "@/types/auth";

export type DashboardSidebarRouteKey = "dashboard" | "lad" | "profil";

export interface IDashboardSidebarRouteItem {
  key: DashboardSidebarRouteKey;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const studentDashboardSidebarRoutes: IDashboardSidebarRouteItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/student/dashboard",
    icon: DashboardIcon,
  },
  {
    key: "lad",
    label: "LAD",
    href: "/student/dashboard/lad",
    icon: ActivityIcon,
  },
  {
    key: "profil",
    label: "Profil",
    href: "/student/dashboard/profil",
    icon: ProfileIcon,
  },
];

const teacherDashboardSidebarInitRoutes: IDashboardSidebarRouteItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: DashboardIcon,
  },

  {
    key: "profil",
    label: "Profil",
    href: "/teacher/dashboard/profil",
    icon: ProfileIcon,
  },
];

const adminDashboardSidebarInitRoutes: IDashboardSidebarRouteItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: DashboardIcon,
  },

  {
    key: "profil",
    label: "Profil",
    href: "/admin/dashboard/profil",
    icon: ProfileIcon,
  },
];

const parentDashboardSidebarInitRoutes: IDashboardSidebarRouteItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/parent/dashboard",
    icon: DashboardIcon,
  },

  {
    key: "profil",
    label: "Profil",
    href: "/parent/dashboard/profil",
    icon: ProfileIcon,
  },
];

export function getStudentDashboardSidebarRoutes(): IDashboardSidebarRouteItem[] {
  return studentDashboardSidebarRoutes;
}

export function getDashboardSidebarRoutesByRole(
  role: UserRole | null,
): IDashboardSidebarRouteItem[] {
  return getDashboardSidebarInitRoutesByRole(role);
}

export function resolveDashboardSidebarRouteKey(
  pathname: string,
): DashboardSidebarRouteKey {
  const normalizedPathname = pathname.replace(/\/+$/, "");

  if (normalizedPathname.includes("/dashboard/lad")) {
    return "lad";
  }

  if (normalizedPathname.includes("/dashboard/profil")) {
    return "profil";
  }

  return "dashboard";
}

export function resolveStudentDashboardRouteKey(
  pathname: string,
): DashboardSidebarRouteKey {
  return resolveDashboardSidebarRouteKey(pathname);
}

export function getDashboardSidebarInitRoutesByRole(
  role: UserRole | null,
): IDashboardSidebarRouteItem[] {
  if (role === "student") {
    return studentDashboardSidebarRoutes;
  }

  if (role === "teacher" || role === "counselor") {
    return teacherDashboardSidebarInitRoutes;
  }

  if (role === "admin") {
    return adminDashboardSidebarInitRoutes;
  }

  if (role === "parent") {
    return parentDashboardSidebarInitRoutes;
  }

  return [];
}
