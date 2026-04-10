import ActivityIcon from "@/components/atoms/icons/ActivityIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import NotificationIcon from "@/components/atoms/icons/NotificationIcon";
import ProfileIcon from "@/components/atoms/icons/ProfileIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import type { UserRole } from "@/types/auth";

export type DashboardSidebarRouteKey =
  | "dashboard"
  | "lad"
  | "profil"
  | "manage-material"
  | "manage-diagnostics"
  | "notifications"
  | "profile"
  | "learning analytics"
  | "class list"
  | "material management"
  | "test management";

export interface IDashboardSidebarRouteItem {
  key: DashboardSidebarRouteKey;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badgeCount?: number;
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
    key: "manage-material",
    label: "Kelola Materi",
    href: "/teacher/dashboard/manage-material",
    icon: NotebookIcon,
  },
  {
    key: "manage-diagnostics",
    label: "Kelola Diagnostik",
    href: "/teacher/dashboard/manage-diagnostics",
    icon: DocumentIcon,
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/teacher/dashboard/notifikasi",
    icon: NotificationIcon,
    badgeCount: 3,
  },

  {
    key: "profile",
    label: "My Profile",
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
    key: "learning analytics",
    label: "Learning Analytics",
    href: "/admin/dashboard/learning-analytics",
    icon: TrendUpIcon,
  },
  {
    key: "class list",
    label: "Daftar Kelas",
    href: "/admin/dashboard/class-list",
    icon: ActivityIcon,
  },
  {
    key: "material management",
    label: "Manajemen Materi",
    href: "/admin/dashboard/material-management",
    icon: NotebookIcon,
  },
  {
    key: "test management",
    label: "Manajemen Tes",
    href: "/admin/dashboard/test-management",
    icon: DocumentIcon,
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
  const isAdminDashboard = normalizedPathname.startsWith("/admin/dashboard");
  const isTeacherDashboard =
    normalizedPathname.startsWith("/teacher/dashboard");

  if (isAdminDashboard) {
    if (normalizedPathname.includes("/dashboard/learning-analytics")) {
      return "learning analytics";
    }

    if (normalizedPathname.includes("/dashboard/class-list")) {
      return "class list";
    }

    if (normalizedPathname.includes("/dashboard/material-management")) {
      return "material management";
    }

    if (normalizedPathname.includes("/dashboard/test-management")) {
      return "test management";
    }

    return "dashboard";
  }

  if (isTeacherDashboard) {
    if (normalizedPathname.includes("/dashboard/manage-material")) {
      return "manage-material";
    }

    if (
      normalizedPathname.includes("/dashboard/manage-diagnostics") ||
      normalizedPathname.includes("/dashboard/lad")
    ) {
      return "manage-diagnostics";
    }

    if (normalizedPathname.includes("/dashboard/notifikasi")) {
      return "notifications";
    }

    if (normalizedPathname.includes("/dashboard/profil")) {
      return "profile";
    }

    return "dashboard";
  }

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
