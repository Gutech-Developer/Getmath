import type { ClassSidebarRouteKey } from "./classSidebarRoutes";

export const sidebarVariant = {
  class: "class",
  dashboardStudent: "dashboardStudent",
} as const;

export type SidebarVariant =
  (typeof sidebarVariant)[keyof typeof sidebarVariant];

const classSidebarSegmentToRouteKey = {
  materi: "materi",
  diagnosis: "diagnosis",
  form: "form",
  "info-kelas": "info-kelas",
} as const satisfies Record<string, Exclude<ClassSidebarRouteKey, "overview">>;

export type ClassSidebarSegment = keyof typeof classSidebarSegmentToRouteKey;

const classSidebarSegmentPattern = Object.keys(
  classSidebarSegmentToRouteKey,
).join("|");

const classSidebarRouteRegex = new RegExp(
  `^/student(?:/dashboard)?/class/([^/]+)(?:/(${classSidebarSegmentPattern}))?(?:/.*)?$`,
);

export interface IResolvedSidebarVariant {
  variant: SidebarVariant;
  classSlug?: string;
  activeClassRouteKey?: ClassSidebarRouteKey;
}

export function resolveSidebarVariant(
  pathname: string,
): IResolvedSidebarVariant {
  const classRouteMatch = pathname.match(classSidebarRouteRegex);

  if (!classRouteMatch?.[1]) {
    return { variant: sidebarVariant.dashboardStudent };
  }

  const classSlug = decodeURIComponent(classRouteMatch[1]);
  const segment = classRouteMatch[2] as ClassSidebarSegment | undefined;

  return {
    variant: sidebarVariant.class,
    classSlug,
    activeClassRouteKey: segment
      ? classSidebarSegmentToRouteKey[segment]
      : "overview",
  };
}
