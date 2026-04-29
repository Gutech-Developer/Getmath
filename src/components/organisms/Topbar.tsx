"use client";

import { SearchBar } from "../molecules/searchBar/SearchBar";
import { useSidebar } from "@/providers/SidebarProvider";
import ChevronSquareIcon from "../atoms/icons/ChevronSquareIcon";
import NotificationIcon from "../atoms/icons/NotificationIcon";
import { resolveTopbarTitle } from "@/constant/topbarTitle";
import { useGsUnreadNotificationsCount } from "@/services";
import {
  formatNotificationBadgeCount,
  resolveNotificationPathFromPathname,
} from "@/utils/gs-notification";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

const Topbar = () => {
  const { isOpen, isMobile, toggle } = useSidebar();
  const pathname = usePathname();
  const params = useParams();
  const [currentDate, setCurrentDate] = useState("");
  const { data: unreadData } = useGsUnreadNotificationsCount();
  const unreadCount = unreadData?.unreadCount ?? 0;
  const notificationHref = resolveNotificationPathFromPathname(pathname);

  const topbarTitle = useMemo(
    () =>
      resolveTopbarTitle({
        pathname,
        slugParam: params?.slug,
      }),
    [params?.slug, pathname],
  );

  useEffect(() => {
    // Update date immediately
    updateDate();

    // Update date every minute
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  const updateDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = now.toLocaleDateString("id-ID", options);
    setCurrentDate(formattedDate);
  };

  return (
    <div className="w-full flex h-16 lg:h-20 fixed inset-0 bg-neutral-01 border-b border-grey-stroke z-50">
      {/* Logo Section - Responsive */}
      <div
        className={`border-r border-grey-stroke flex p-3 lg:p-5 items-center transition-[width] duration-300 ${
          isOpen && !isMobile
            ? "w-sidebar-width justify-between"
            : "w-14 lg:w-[4.2rem] justify-center lg:justify-end"
        }`}
      >
        {/* Logo - hidden on mobile when sidebar closed */}
        <div
          className={`transition-opacity duration-300 ${
            isOpen && !isMobile ? "flex" : "hidden"
          }`}
        >
          <Image
            src={"/img/logo/logo.png"}
            alt="GetMath"
            width={70}
            height={70}
            className="w-12 lg:w-[70px] h-auto"
          />
        </div>
        <button onClick={toggle} aria-label="Toggle sidebar" className="p-1">
          <ChevronSquareIcon
            className={`w-6 h-6 lg:w-8 lg:h-8 text-neutral-02 transition-transform duration-300 ease-in-out ${
              !isOpen && "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* Main Topbar Content */}
      <div className="px-3 lg:px-5 flex flex-1 h-full items-center gap-2 lg:gap-4 justify-between  min-w-0">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-02 lg:text-base">
            {topbarTitle}
          </p>
          <p className="truncate text-[11px] text-grey lg:text-xs capitalize">
            {currentDate || "Memuat tanggal..."}
          </p>
        </div>
        {/* Search Bar - Hidden on small mobile, visible on sm+ */}
        <div className="hidden sm:flex flex-1 justify-end max-w-md">
          <SearchBar />
        </div>

        <Link
          href={notificationHref ?? pathname}
          className="relative inline-flex items-center justify-center rounded-full border border-grey-stroke bg-white p-2 text-neutral-02 transition hover:bg-grey-lightest"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Buka notifikasi"
          }
        >
          <NotificationIcon className="w-5 h-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] font-semibold leading-none text-white">
              {formatNotificationBadgeCount(unreadCount)}
            </span>
          ) : null}
        </Link>

        <Image
          src="/avatars/1.png"
          alt="User avatar"
          width={210}
          height={210}
          className="w-12 h-12 lg:w-[50px] lg:h-[50px] rounded-full object-cover"
        />
      </div>
    </div>
  );
};

export default Topbar;
