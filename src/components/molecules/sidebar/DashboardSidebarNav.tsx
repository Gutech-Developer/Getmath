"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const keysToOpen = items
      .filter((item) => item.key === activeKey || (item.subMenu && item.subMenu.some((sub) => pathname.startsWith(sub.url))))
      .map((item) => item.key);
    setOpenKeys(keysToOpen);
  }, [activeKey, items, pathname]);

  const toggleKey = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

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

          const hasSubmenu = item.subMenu && item.subMenu.length > 0;
          const isOpen = openKeys.includes(item.key);

          const linkContent = isTeacherVariant ? (
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
                <span className="ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-lottie-teal px-1.5 text-[11px] font-semibold text-white">
                  {item.badgeCount}
                </span>
              )}
              {hasSubmenu && (
                <svg
                  className={cn(
                    "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </>
          ) : (
            <>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5E7EB] text-[#6B7280]",
                  isActive && "bg-[#DCE3FF] text-lottie-teal",
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
              {hasSubmenu && (
                <svg
                  className={cn(
                    "ml-auto h-5 w-5 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </>
          );

          return (
            <li key={item.key}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleKey(item.key)}
                  className={cn(
                    "w-full",
                    isTeacherVariant
                      ? "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[#6B7280] transition hover:bg-[#F3F4F6]"
                      : "relative flex items-center gap-4 rounded-2xl px-3 py-3 text-[#6B7280] transition hover:bg-[#F3F4F6]",
                    isTeacherVariant
                      ? isActive && "bg-[#E9EEFF] text-lottie-teal"
                      : isActive &&
                          "bg-[#E9EEFF] pr-4 text-lottie-teal before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r-full before:bg-lottie-teal",
                  )}
                >
                  {linkContent}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    isTeacherVariant
                      ? "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[#6B7280] transition hover:bg-[#F3F4F6]"
                      : "relative flex items-center gap-4 rounded-2xl px-3 py-3 text-[#6B7280] transition hover:bg-[#F3F4F6]",
                    isTeacherVariant
                      ? isActive && "bg-[#E9EEFF] text-lottie-teal"
                      : isActive &&
                          "bg-[#E9EEFF] pr-4 text-lottie-teal before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r-full before:bg-lottie-teal",
                  )}
                >
                  {linkContent}
                </Link>
              )}

              {hasSubmenu && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0",
                  )}
                >
                  <ul className="ml-10 border-l-2 border-[#E5E7EB] pl-3 flex flex-col gap-1">
                    {item.subMenu!.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.url);
                      return (
                        <li key={sub.name}>
                          <Link
                            href={sub.url}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-[0.9rem] font-medium transition",
                              isSubActive
                                ? "bg-[#E9EEFF] text-lottie-teal"
                                : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]",
                            )}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
