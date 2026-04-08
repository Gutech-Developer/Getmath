import {
  CLASS_SIDEBAR_ROUTE_BASE,
  type ClassSidebarRouteKey,
} from "./classSidebarRoutes";
import { resolveSidebarVariant, sidebarVariant } from "./sidebarVariant";

const explicitTopbarTitleMap: Record<string, string> = {
  "/admin/dashboard": "Dashboard Admin",
  "/parent/dashboard": "Dashboard Orang Tua",
  "/profile": "Profil",
  "/student/dashboard": "Dashboard Siswa",
  "/teacher/dashboard": "Dashboard Guru",
};

const ignoredPathSegments = new Set([
  "admin",
  "class",
  "dashboard",
  "parent",
  "student",
  "teacher",
]);

const classRouteTitleMap = Object.fromEntries(
  CLASS_SIDEBAR_ROUTE_BASE.map((route) => [route.key, route.label]),
) as Record<ClassSidebarRouteKey, string>;

function normalizePathname(pathname: string): string {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  if (cleanPath === "/") {
    return cleanPath;
  }

  return cleanPath.replace(/\/+$/, "");
}

function capitalizeWords(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function humanizeSegment(segment: string): string {
  const decodedSegment = decodeURIComponent(segment);
  const normalizedSegment = decodedSegment.replace(/[-_]+/g, " ").trim();
  return capitalizeWords(normalizedSegment);
}

function pickSlug(slugParam?: string | string[]): string | undefined {
  if (Array.isArray(slugParam)) {
    return slugParam[0];
  }

  return slugParam;
}

export interface IResolveTopbarTitleOptions {
  pathname: string;
  slugParam?: string | string[];
}

export function resolveTopbarTitle({
  pathname,
  slugParam,
}: IResolveTopbarTitleOptions): string {
  const normalizedPathname = normalizePathname(pathname);

  const explicitTitle = explicitTopbarTitleMap[normalizedPathname];
  if (explicitTitle) {
    return explicitTitle;
  }

  const resolvedSidebar = resolveSidebarVariant(normalizedPathname);
  const slug = pickSlug(slugParam) ?? resolvedSidebar.classSlug;

  if (resolvedSidebar.variant === sidebarVariant.class && slug) {
    const classTitle = humanizeSegment(slug);
    const activeRouteKey = resolvedSidebar.activeClassRouteKey ?? "overview";

    if (activeRouteKey === "overview") {
      return classTitle;
    }

    return `${classTitle} - ${classRouteTitleMap[activeRouteKey]}`;
  }

  const fallbackSegment = normalizedPathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !ignoredPathSegments.has(segment))
    .at(-1);

  if (!fallbackSegment) {
    return "GetMath";
  }

  return humanizeSegment(fallbackSegment);
}
