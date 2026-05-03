import type { ReactNode } from "react";
import type { ClassSidebarRouteKey } from "@/constant/classSidebarRoutes";

interface IClassPageShellTemplateProps {
  slug: string;
  activeKey: ClassSidebarRouteKey;
  children: ReactNode;
  classTitle?: string;
  teacherName?: string;
}

function toTitleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatClassTitleFromSlug(slug: string): string {
  const decodedSlug = decodeURIComponent(slug);
  // Remove trailing id/uuid if present in slug (e.g. "kalkulus-1-7ea4ef87")
  const parts = decodedSlug.split("-").filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const isLikelyId = /^[0-9a-f]{6,32}$/.test(last);
    if (isLikelyId) {
      return toTitleCase(parts.slice(0, -1).join("-"));
    }
  }
  return toTitleCase(decodedSlug);
}

export default function ClassPageShellTemplate({
  slug: _slug,
  activeKey: _activeKey,
  children,
  classTitle: _classTitle,
  teacherName: _teacherName,
}: IClassPageShellTemplateProps) {
  return (
    <div className="mx-auto w-full max-w-[1562px]">
      <section className="space-y-5">{children}</section>
    </div>
  );
}
