"use client";

import { SearchBar } from "../molecules/searchBar/SearchBar";
import { useSidebar } from "@/providers/SidebarProvider";
import ChevronSquareIcon from "../atoms/icons/ChevronSquareIcon";
import CalendarIcon from "../atoms/icons/CalendarIcon";
import Image from "next/image";
import { useState, useEffect } from "react";

const Topbar = () => {
  const { isOpen, isMobile, toggle } = useSidebar();
  const [currentDate, setCurrentDate] = useState("");

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
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = now.toLocaleDateString("en-US", options);
    setCurrentDate(formattedDate);
  };

  return (
    <div className="w-full flex h-16 lg:h-20 fixed inset-0 bg-neutral-01 border-b border-grey-stroke z-50">
      {/* Logo Section - Responsive */}
      <div
        className={`border-r border-grey-stroke flex p-3 lg:p-5 items-center transition-[width] duration-300 ${
          isOpen && !isMobile
            ? "w-[260px] justify-between"
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
            src={"/img/logo/logo.webp"}
            alt="GetMath"
            width={70}
            height={30}
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
      <div className="px-3 lg:px-5 flex flex-1 h-full items-center gap-2 lg:gap-4 justify-end md:justify-between min-w-0">
        {/* Search Bar - Hidden on small mobile, visible on sm+ */}
        <div className="hidden sm:block flex-1 max-w-md">
          <SearchBar />
        </div>

        <Image
          src={"/img/logo/logo.webp"}
          alt="GetMath"
          width={20}
          height={20}
          className="w-12 lg:w-[70px] h-auto md:hidden"
        />

        {/* Mobile: Show hamburger menu indicator */}
        {/* <div className="sm:hidden flex-1">
          <span className="text-sm font-medium text-neutral-02 truncate">
            GetMath
          </span>
        </div> */}

        {/* Right side content */}
        <div className="flex gap-2 shrink-0">
          {/* Date - Hidden on mobile */}
          <div className="hidden md:flex gap-2 items-center rounded-lg border border-grey-stroke p-1.5 lg:p-2 font-medium hover:bg-grey-lightest transition-colors">
            <CalendarIcon className="text-neutral-02 w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-xs whitespace-nowrap">
              {currentDate || "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
