"use client";

import ClassSidebarContent from "@/components/organisms/sidebar/ClassSidebarContent";
import DefaultSidebarContent from "@/components/organisms/sidebar/DefaultSidebarContent";
import StudentDashboardSidebarContent from "@/components/organisms/sidebar/StudentDashboardSidebarContent";
import TeacherDashboardSidebarContent from "@/components/organisms/sidebar/TeacherDashboardSidebarContent";
import {
  resolveSidebarContent,
  type SidebarContentType,
} from "@/constant/sidebarContentResolver";
import {
  getSidebarMenuByRole,
  type StudentSidebarContentType,
} from "@/constant/roleBasedSidebarMenu";
import { getUserRole } from "@/libs/jwt";
import { showErrorToast, showToast } from "@/libs/toast";
import { isActiveMenu } from "@/libs/utils";
import { useSidebar } from "@/providers/SidebarProvider";
import { useCurrentUser, useLogout } from "@/services";
import type { UserRole } from "@/types/auth";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const roleLabelByRole = {
  admin: "Admin",
  teacher: "Guru",
  student: "Siswa",
  parent: "Orang Tua",
  counselor: "Konselor",
} as const;

const profilePathByRole: Record<UserRole, string> = {
  admin: "/admin/dashboard/profil",
  teacher: "/teacher/dashboard/profil",
  student: "/student/dashboard/profil",
  parent: "/parent/dashboard/profil",
  counselor: "/teacher/dashboard/profil",
};

function resolveRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith("/student")) {
    return "student";
  }

  if (pathname.startsWith("/parent")) {
    return "parent";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/teacher")) {
    return "teacher";
  }

  return null;
}

function resolveSidebarRole(
  pathname: string,
  authRole: UserRole | null,
): UserRole | null {
  const pathnameRole = resolveRoleFromPathname(pathname);

  // Fallback ke pathname saat role token belum tersedia.
  if (!authRole) {
    return pathnameRole;
  }

  if (!pathnameRole) {
    return authRole;
  }

  // Counselor tetap dianggap varian teacher untuk route teacher.
  if (authRole === "counselor" && pathnameRole === "teacher") {
    return "counselor";
  }

  // Jika role token dan pathname beda, pakai pathname untuk konteks UI sidebar.
  if (authRole !== pathnameRole) {
    return pathnameRole;
  }

  return authRole;
}

export const Sidebar = () => {
  const { data: user } = useCurrentUser();
  const authRole = getUserRole();
  const { isOpen, isMobile, close } = useSidebar();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const logout = useLogout();

  const role = useMemo(
    () => resolveSidebarRole(pathname, authRole),
    [authRole, pathname],
  );

  const resolvedSidebarContent = useMemo(
    () => resolveSidebarContent(pathname),
    [pathname],
  );

  const {
    contentType,
    sidebarVariant: {
      classSlug,
      activeClassRouteKey = "overview",
      variant: studentContentType,
    },
  } = resolvedSidebarContent;

  const studentSidebarContentType: StudentSidebarContentType =
    studentContentType;

  const userName = user?.fullname ?? "Guest User";
  const roleLabel = role ? roleLabelByRole[role] : "Loading...";
  const profileUrl = role ? profilePathByRole[role] : "/";

  const sidebarMenu = useMemo(
    () =>
      getSidebarMenuByRole(role, {
        studentContentType: studentSidebarContentType,
        classSlug,
      }),
    [classSlug, role, studentSidebarContentType],
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
      profileUrl={profileUrl}
      sidebarMenu={sidebarMenu}
      openMenus={openMenus}
      onToggleMenu={toggleMenu}
      onNavigate={handleLinkClick}
      onLogout={handleLogout}
    />
  );

  const useTeacherDashboardSidebar =
    role === "teacher" ||
    role === "counselor" ||
    role === "admin" ||
    role === "student";

  const sidebarContentRenderers: Record<SidebarContentType, ReactNode> = {
    default: defaultSidebarContent,
    classDashboard: classSlug ? (
      <ClassSidebarContent
        classSlug={classSlug}
        activeClassRouteKey={activeClassRouteKey}
        userName={userName}
        roleLabel={roleLabel}
        profileUrl={profileUrl}
        onNavigate={handleLinkClick}
        onLogout={handleLogout}
      />
    ) : (
      defaultSidebarContent
    ),
    dashboardInit: role ? (
      useTeacherDashboardSidebar ? (
        <TeacherDashboardSidebarContent
          pathname={pathname}
          role={role}
          onLogout={handleLogout}
          profileUrl={profileUrl}
          roleLabel={roleLabel}
          userName={userName}
          onNavigate={handleLinkClick}
        />
      ) : (
        <StudentDashboardSidebarContent
          pathname={pathname}
          role={role}
          userName={userName}
          roleLabel={roleLabel}
          profileUrl={profileUrl}
          onNavigate={handleLinkClick}
          onLogout={handleLogout}
        />
      )
    ) : (
      defaultSidebarContent
    ),
  };

  const sidebarContent =
    sidebarContentRenderers[contentType] ?? sidebarContentRenderers.default;

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
