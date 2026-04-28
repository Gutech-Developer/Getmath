import {
  CLASS_SIDEBAR_ROUTE_BASE,
  type ClassSidebarRouteKey,
} from "./classSidebarRoutes";
import { resolveSidebarVariant, sidebarVariant } from "./sidebarVariant";

const explicitTopbarTitleMap: Record<string, string> = {
  "/admin/dashboard": "Dashboard Admin",
  "/admin/dashboard/learning-analytics": "Learning Analytics",
  "/admin/dashboard/class-list": "Daftar Kelas",
  "/admin/dashboard/material-management": "Manajemen Materi",
  "/admin/dashboard/test-management": "Manajemen Tes",
  "/admin/dashboard/profil": "Profil Admin",
  "/parent/dashboard": "Dashboard Orang Tua",
  "/parent/dashboard/lad": "LAD Orang Tua",
  "/parent/dashboard/profil": "Profil Orang Tua",
  "/profile": "Profil",
  "/student/dashboard": "Dashboard Siswa",
  "/student/dashboard/lad": "LAD Siswa",
  "/student/dashboard/profil": "Profil Siswa",
  "/teacher/dashboard": "Teacher Dashboard",
  "/teacher/dashboard/manage-diagnostics": "Kelola Tes Diagnostik",
  "/teacher/dashboard/manage-diagnostics/create": "Buat Tes Diagnostik",
  "/teacher/dashboard/manage-material": "Manage Material",
  "/teacher/dashboard/lad": "Teacher LAD",
  "/teacher/dashboard/notifikasi": "Notifications",
  "/teacher/dashboard/profil": "Teacher Profile",
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

function stripTrailingClassCode(value: string): string {
  const normalizedValue = value.trim();
  const classCodeMatch = normalizedValue.match(
    /^(.*?)(?:\s+([0-9a-f]{6,}|[0-9a-f]{4,8}-[0-9a-f]{4,8}))$/i,
  );

  if (!classCodeMatch?.[1]) {
    return normalizedValue;
  }

  const className = classCodeMatch[1].trim();
  return className || normalizedValue;
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
    const classTitle = stripTrailingClassCode(humanizeSegment(slug));
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

  return stripTrailingClassCode(humanizeSegment(fallbackSegment));
}
