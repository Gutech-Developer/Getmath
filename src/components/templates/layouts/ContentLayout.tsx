"use client";

import React from "react";
import { useSidebar } from "@/providers/SidebarProvider";

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div
      className={`pt-topbar-height w-screen transition-all duration-300 ease-in-out ${
        isOpen && !isMobile ? "lg:pl-sidebar-width" : "pl-0"
      }`}
    >
      <div className="w-full h-full p-5 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export default ContentLayout;
