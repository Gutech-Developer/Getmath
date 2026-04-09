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
