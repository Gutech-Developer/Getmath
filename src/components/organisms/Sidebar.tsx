"use client";

import ClassSidebarContent from "@/components/organisms/sidebar/ClassSidebarContent";
import DefaultSidebarContent from "@/components/organisms/sidebar/DefaultSidebarContent";
import {
  getSidebarMenuByRole,
  type StudentSidebarContentType,
} from "@/constant/roleBasedSidebarMenu";
import {
  resolveSidebarVariant,
  type SidebarVariant,
} from "@/constant/sidebarVariant";
import { getUserRole } from "@/libs/jwt";
import { showErrorToast, showToast } from "@/libs/toast";
import { isActiveMenu } from "@/libs/utils";
import { useSidebar } from "@/providers/SidebarProvider";
import { useCurrentUser, useLogout } from "@/services";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const roleLabelByRole = {
  admin: "Admin",
  teacher: "Guru",
  student: "Siswa",
  parent: "Orang Tua",
  counselor: "Konselor",
} as const;

export const Sidebar = () => {
  const { data: user } = useCurrentUser();
  const role = getUserRole();
  const { isOpen, isMobile, close } = useSidebar();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const logout = useLogout();

  const resolvedSidebarVariant = useMemo(
    () => resolveSidebarVariant(pathname),
    [pathname],
  );

  const isStudentArea = pathname.startsWith("/student");
  const { classSlug, activeClassRouteKey = "overview" } =
    resolvedSidebarVariant;

  const studentContentType: StudentSidebarContentType =
    resolvedSidebarVariant.variant;

  const userName = user?.fullname ?? "Guest User";
  const roleLabel = role ? roleLabelByRole[role] : "Loading...";

  const sidebarMenu = useMemo(
    () =>
      getSidebarMenuByRole(role, {
        studentContentType,
        classSlug,
      }),
    [classSlug, role, studentContentType],
  );

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

  const handleLinkClick = () => {
    if (isMobile) {
      close();
    }
  };

  const defaultSidebarContent = (
    <DefaultSidebarContent
      pathname={pathname}
      userName={userName}
      roleLabel={roleLabel}
      sidebarMenu={sidebarMenu}
      openMenus={openMenus}
      onToggleMenu={toggleMenu}
      onNavigate={handleLinkClick}
      onLogout={handleLogout}
    />
  );

  const studentSidebarRenderers: Record<SidebarVariant, ReactNode> = {
    dashboardStudent: defaultSidebarContent,
    class: classSlug ? (
      <ClassSidebarContent
        classSlug={classSlug}
        activeClassRouteKey={activeClassRouteKey}
        userName={userName}
        roleLabel={roleLabel}
        onNavigate={handleLinkClick}
        onLogout={handleLogout}
      />
    ) : (
      defaultSidebarContent
    ),
  };

  const sidebarContent = isStudentArea
    ? studentSidebarRenderers[studentContentType]
    : defaultSidebarContent;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-sidebar-width-mobile lg:w-sidebar-width bg-neutral-01 text-neutral-02 border-r border-grey-stroke z-40 pt-16 lg:pt-20 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

        {sidebarContent}
      </div>
    </>
  );
};
