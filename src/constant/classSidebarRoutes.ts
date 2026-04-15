export type ClassSidebarRouteKey =
  | "overview"
  | "materi"
  | "diagnosis"
  | "forum"
  | "lad"
  | "info-class";

export interface IClassSidebarRouteBase {
  key: ClassSidebarRouteKey;
  label: string;
  description: string;
  segment?: Exclude<ClassSidebarRouteKey, "overview">;
  badge?: string;
}

export interface IClassSidebarRouteItem extends IClassSidebarRouteBase {
  href: string;
}

export const CLASS_SIDEBAR_ROUTE_BASE: IClassSidebarRouteBase[] = [
  {
    key: "overview",
    label: "Beranda Kelas",
    description: "Ringkasan aktivitas kelas",
  },
  {
    key: "materi",
    label: "Materi",
    description: "6 materi tersedia",
    segment: "materi",
  },
  // {
  //   key: "diagnosis",
  //   label: "Tes Diagnostik",
  //   description: "1 tes aktif",
  //   segment: "diagnosis",
  //   badge: "1 Aktif",
  // },
  {
    key: "forum",
    label: "Forum Diskusi",
    description: "Diskusi kelas aktif",
    segment: "forum",
  },
  {
    key: "lad",
    label: "LAD",
    description: "Laporan Analitik Diagnostik",
    segment: "lad",
  },
  {
    key: "info-class",
    label: "Info Kelas",
    description: "Data kelas dan siswa",
    segment: "info-class",
  },
];

export function buildClassRoute(
  slug: string,
  segment?: Exclude<ClassSidebarRouteKey, "overview">,
): string {
  const safeSlug = encodeURIComponent(slug);
  const baseRoute = `/student/dashboard/class/${safeSlug}`;

  if (!segment) {
    return baseRoute;
  }

  return `${baseRoute}/${segment}`;
}

export function getClassSidebarRoutes(slug: string): IClassSidebarRouteItem[] {
  return CLASS_SIDEBAR_ROUTE_BASE.map((route) => ({
    ...route,
    href: buildClassRoute(slug, route.segment),
  }));
}

export function getClassSidebarRouteByKey(
  slug: string,
  key: ClassSidebarRouteKey,
): IClassSidebarRouteItem | undefined {
  return getClassSidebarRoutes(slug).find((route) => route.key === key);
}
