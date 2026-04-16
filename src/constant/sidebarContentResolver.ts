import {
  resolveSidebarVariant,
  sidebarVariant,
  type IResolvedSidebarVariant,
} from "@/constant/sidebarVariant";

export const sidebarContentType = {
  default: "default",
  classDashboard: "classDashboard",
  teacherClassDashboard: "teacherClassDashboard",
  dashboardInit: "dashboardInit",
} as const;

export type SidebarContentType =
  (typeof sidebarContentType)[keyof typeof sidebarContentType];

export interface IResolvedSidebarContent {
  contentType: SidebarContentType;
  sidebarVariant: IResolvedSidebarVariant;
}

export function resolveSidebarContent(
  pathname: string,
): IResolvedSidebarContent {
  const sidebarVariantResult = resolveSidebarVariant(pathname);
  const normalizedPathname = pathname.replace(/\/+$/, "");

  if (sidebarVariantResult.variant === sidebarVariant.teacherClass) {
    return {
      contentType: sidebarContentType.teacherClassDashboard,
      sidebarVariant: sidebarVariantResult,
    };
  }

  if (sidebarVariantResult.variant === sidebarVariant.class) {
    return {
      contentType: sidebarContentType.classDashboard,
      sidebarVariant: sidebarVariantResult,
    };
  }

  const isDashboardRoute =
    /^\/(student|teacher|admin|parent)\/dashboard(?:\/|$)/.test(
      normalizedPathname,
    );

  if (isDashboardRoute) {
    return {
      contentType: sidebarContentType.dashboardInit,
      sidebarVariant: sidebarVariantResult,
    };
  }

  return {
    contentType: sidebarContentType.default,
    sidebarVariant: sidebarVariantResult,
  };
}
