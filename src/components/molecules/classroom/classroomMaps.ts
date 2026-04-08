import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import LinkIcon from "@/components/atoms/icons/LinkIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import type { ClassSidebarRouteKey } from "@/constant/classSidebarRoutes";
import type { IconProps } from "@/types/iconProps";
import type { ComponentType } from "react";

export type ClassRouteIconMap = Record<
  ClassSidebarRouteKey,
  ComponentType<IconProps>
>;

export const classRouteIconMap: ClassRouteIconMap = {
  overview: DashboardIcon,
  materi: NotebookIcon,
  diagnosis: DocumentIcon,
  form: LinkIcon,
  "info-kelas": ThreeUserGroupIcon,
};

export const classRouteToneMap: Record<
  ClassSidebarRouteKey,
  {
    iconBackgroundClassName: string;
    iconClassName: string;
    activeClassName: string;
  }
> = {
  overview: {
    iconBackgroundClassName: "bg-[#EEF0FF]",
    iconClassName: "text-[#3D49D6]",
    activeClassName: "bg-[#EEF0FF] text-[#1E2E8A] border-[#D8DEFF]",
  },
  materi: {
    iconBackgroundClassName: "bg-[#E9FBF3]",
    iconClassName: "text-[#11A36C]",
    activeClassName: "bg-[#E9FBF3] text-[#116F56] border-[#D1F2E2]",
  },
  diagnosis: {
    iconBackgroundClassName: "bg-[#FFF1F1]",
    iconClassName: "text-[#E04F5F]",
    activeClassName: "bg-[#FFF1F1] text-[#A62B3B] border-[#FFD8DE]",
  },
  form: {
    iconBackgroundClassName: "bg-[#FFF7EA]",
    iconClassName: "text-[#D48A1B]",
    activeClassName: "bg-[#FFF7EA] text-[#8E5A10] border-[#FFE7C2]",
  },
  "info-kelas": {
    iconBackgroundClassName: "bg-[#F4F1FF]",
    iconClassName: "text-[#7B57D1]",
    activeClassName: "bg-[#F4F1FF] text-[#5D3BB1] border-[#E1D8FF]",
  },
};
