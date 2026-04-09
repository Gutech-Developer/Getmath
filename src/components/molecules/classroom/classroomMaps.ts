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
  "info-class": ThreeUserGroupIcon,
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
    iconBackgroundClassName: "bg-[#F1F5F9]",
    iconClassName: "text-[#64748B]",
    activeClassName: "bg-[#E9EEFF] text-[#1D4ED8] border-[#C7D2FE]",
  },
  materi: {
    iconBackgroundClassName: "bg-[#F1F5F9]",
    iconClassName: "text-[#64748B]",
    activeClassName: "bg-[#E9EEFF] text-[#1D4ED8] border-[#C7D2FE]",
  },
  diagnosis: {
    iconBackgroundClassName: "bg-[#F1F5F9]",
    iconClassName: "text-[#64748B]",
    activeClassName: "bg-[#E9EEFF] text-[#1D4ED8] border-[#C7D2FE]",
  },
  form: {
    iconBackgroundClassName: "bg-[#F1F5F9]",
    iconClassName: "text-[#64748B]",
    activeClassName: "bg-[#E9EEFF] text-[#1D4ED8] border-[#C7D2FE]",
  },
  "info-class": {
    iconBackgroundClassName: "bg-[#F1F5F9]",
    iconClassName: "text-[#64748B]",
    activeClassName: "bg-[#E9EEFF] text-[#1D4ED8] border-[#C7D2FE]",
  },
};
