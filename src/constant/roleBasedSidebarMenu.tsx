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
 * Sidebar Menu untuk Counselor
 */
export const counselorSidebarMenu: ISidebarMenu[] = [
  {
    name: "Dashboard",
    url: "/counselor/dashboard",
    icon: DashboardIcon,
    subMenu: [],
    roles: ["counselor"],
  },
  {
    name: "Manajemen Anak",
    url: "/counselor/children",
    icon: ThreeUserGroupIcon,
    subMenu: [],
    roles: ["counselor"],
  },
  {
    name: "Sesi Terapi",
    url: "/counselor/therapy",
    icon: NotebookIcon,
    subMenu: [],
    roles: ["counselor"],
  },
  {
    name: "Asesmen",
    url: "/counselor/assessments",
    icon: DocumentIcon,
    subMenu: [
      {
        name: "Screening",
        url: "/counselor/assessments/screening",
      },
      {
        name: "Pretest",
        url: "/counselor/assessments/pretest",
      },
      {
        name: "Posttest",
        url: "/counselor/assessments/posttest",
      },
      {
        name: "Observasi",
        url: "/counselor/assessments/observation",
      },
    ],
    roles: ["counselor"],
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
  if (role === "counselor") {
    return counselorSidebarMenu;
  } else if (role === "parent") {
    return parentSidebarMenu;
  }
  return [];
}
