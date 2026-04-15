import Link from "next/link";
import { cn } from "@/libs/utils";
import type { IDashboardSidebarRouteItem } from "@/constant/dashboardSidebarRoutes";

interface IDashboardSidebarNavProps {
  menuTitle?: string;
  items: IDashboardSidebarRouteItem[];
  activeKey: IDashboardSidebarRouteItem["key"];
  onNavigate?: () => void;
  variant?: "default" | "teacher";
}

export default function DashboardSidebarNav({
  menuTitle = "Menu Utama",
  items,
  activeKey,
  onNavigate,
  variant = "default",
}: IDashboardSidebarNavProps) {
  const isTeacherVariant = variant === "teacher";

  return (
    <nav>
      {menuTitle && (
        <p className="px-1 text-xs font-medium uppercase tracking-[0.24em] text-[#9CA3AF]">
          {menuTitle}
        </p>
      )}

      <ul
        className={cn(
          "flex flex-col",
          menuTitle ? "mt-3" : "mt-0",
          isTeacherVariant ? "gap-1.5" : "gap-2",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  isTeacherVariant
                    ? "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[#6B7280] transition hover:bg-[#F3F4F6]"
                    : "relative flex items-center gap-4 rounded-2xl px-3 py-3 text-[#6B7280] transition hover:bg-[#F3F4F6]",
                  isTeacherVariant
                    ? isActive && "bg-[#E9EEFF] text-[#2563EB]"
                    : isActive &&
                        "bg-[#E9EEFF] pr-4 text-[#2563EB] before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[#2563EB]",
                )}
              >
                {isTeacherVariant ? (
                  <>
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span
                      className={cn(
                        "truncate text-base leading-6",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>

                    {!!item.badgeCount && item.badgeCount > 0 && (
                      <span className="ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#2563EB] px-1.5 text-[11px] font-semibold text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5E7EB] text-[#6B7280]",
                        isActive && "bg-[#DCE3FF] text-[#2563EB]",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={cn(
                        "truncate text-[1.15rem] leading-6",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
