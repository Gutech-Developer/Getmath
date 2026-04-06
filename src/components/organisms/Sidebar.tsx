"use client";

import SearchIcon from "../atoms/icons/SearchIcon";
import { getSidebarMenuByRole } from "@/constant/roleBasedSidebarMenu";
import { useSidebar } from "@/providers/SidebarProvider";
import ChevronLeftIcon from "../atoms/icons/ChevronLeftIcon";
import { isActiveMenu } from "@/libs/utils";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ThreeUserGroupIcon from "../atoms/icons/ThreeUserGroupIcon";
import GearIcon from "../atoms/icons/GearIcon";
import LogoutIcon from "../atoms/icons/LogoutIcon";
import { useLogout } from "@/services";
import { showErrorToast, showToast } from "@/libs/toast";
import { useCurrentUser } from "@/services";
import { getUserRole } from "@/libs/jwt";
import { tokenStorage } from "@/libs/token";

export const Sidebar = () => {
  const { data: user } = useCurrentUser();
  const role = getUserRole(); // Get role from JWT token
  const { isOpen, isMobile, close } = useSidebar();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const logout = useLogout();

  // Get sidebar menu based on role
  const sidebarMenu = useMemo(() => {
    const menu = getSidebarMenuByRole(role);
    return menu;
  }, [role]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      showToast.success("Logout success");
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    const menusToOpen: string[] = [];
    sidebarMenu.forEach((menu) => {
      if (menu.subMenu.length > 0) {
        const hasActiveSubMenu = menu.subMenu.some((sub) =>
          isActiveMenu(sub.url, pathname),
        );
        if (hasActiveSubMenu || isActiveMenu(menu.url, pathname)) {
          menusToOpen.push(menu.name);
        }
      }
    });
    setOpenMenus(menusToOpen);
  }, [pathname, sidebarMenu]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName],
    );
  };

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-sidebar-width-mobile lg:w-sidebar-width bg-neutral-01 text-neutral-02 border-r border-grey-stroke z-40 pt-16 lg:pt-20 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-grey-stroke/50 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <div className="w-full h-full flex flex-col gap-4 lg:gap-5">
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className={`px-4 lg:px-5 cursor-pointer duration-200 ${
              isActiveMenu("/profile", pathname)
                ? "bg-charcoal-green-lighter text-neutral-01"
                : "hover:bg-moss-stone/10 text-neutral-02"
            }`}
          >
            <div className="w-full flex items-center gap-3 lg:gap-4 py-4 lg:py-5 border-b border-grey-stroke">
              <div className="w-10 h-10 lg:w-[3.2rem] lg:h-[3.2rem] bg-moss-stone/20 rounded-sm flex items-center justify-center shrink-0">
                <span className="text-charcoal-green-dark font-medium text-base lg:text-lg">
                  {user?.fullname?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex flex-col gap-1 lg:gap-2 min-w-0">
                <p className="font-medium text-sm truncate line-clamp-1">
                  {user?.fullname ?? "Guest User"}
                </p>
                <p
                  className={`${
                    isActiveMenu("/profile", pathname)
                      ? "text-grey-light"
                      : "text-grey"
                  } font-normal text-xs capitalize`}
                >
                  {role ?? "Loading..."}
                </p>
              </div>
              <ChevronLeftIcon className="w-4 h-4 rotate-180 ml-auto" />
            </div>
          </Link>
          <div className="flex flex-col gap-5 w-full flex-1 overflow-hidden">
            <p className="text-moss-stone font-medium text-xs shrink-0 px-5">
              MENU
            </p>
            <div className="flex-1 overflow-y-auto thinnest-scrollbar px-5">
              <ul className="flex flex-col gap-2">
                {sidebarMenu.map((item, index) => {
                  const isActive = isActiveMenu(item.url, pathname);
                  const isMenuOpen = openMenus.includes(item.name);
                  const hasSubMenu = item.subMenu.length > 0;
                  const IconComponent = item.icon;

                  return (
                    <li key={index} className="text-xs w-full">
                      {hasSubMenu ? (
                        <button
                          className={`flex items-center w-full gap-3 py-2.5 p-3 rounded-lg ${
                            !isActive && "hover:bg-moss-stone/10"
                          } duration-200`}
                          onClick={() => toggleMenu(item.name)}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{item.name}</span>
                          <ChevronLeftIcon
                            className={`ml-auto transition-transform duration-200 text-neutal-02 ${
                              isMenuOpen ? "rotate-90" : "-rotate-90"
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.url}
                          onClick={handleLinkClick}
                          className={`flex items-center w-full gap-3 py-2.5 p-3 rounded-lg ${
                            !isActive && "hover:bg-moss-stone/10"
                          } duration-200 ${
                            isActive
                              ? "text-neutral-01 bg-charcoal-green-lighter font-medium"
                              : "text-neutral-02"
                          }`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              isActive ? "text-neutral-01" : "text-neutral-02"
                            }`}
                          />
                          <span>{item.name}</span>
                        </Link>
                      )}
                      <div
                        className={`overflow-hidden transition-all duration-400 ease-in-out ${
                          hasSubMenu && isMenuOpen
                            ? "max-h-[500px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {hasSubMenu && (
                          <ul className="mt-2 ml-4 pl-4 border-l border-grey-stroke">
                            {item.subMenu.map((sub, subIndex) => {
                              const isSubActive = isActiveMenu(
                                sub.url,
                                pathname,
                              );
                              return (
                                <li key={subIndex}>
                                  <Link
                                    href={sub.url}
                                    onClick={handleLinkClick}
                                    className={`block py-2.5 p-3 rounded-lg ${
                                      !isSubActive && "hover:bg-moss-stone/10"
                                    } duration-200 ${
                                      isSubActive
                                        ? "text-neutral-01 font-medium bg-charcoal-green-lighter"
                                        : "text-grey"
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="w-full px-5">
            <div className="w-full h-px bg-grey-stroke"></div>
          </div>
          <div className="flex flex-col gap-5 pb-5">
            <p className="text-moss-stone font-medium text-xs shrink-0 px-5">
              LAINNYA
            </p>
            <div className="px-5 flex flex-col gap-1.5">
              <button
                onClick={handleLogout}
                className={`flex w-full gap-3 py-2.5 p-3 rounded-lg hover:bg-error/10 duration-200 text-xs items-center text-error`}
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
