"use client";

import { cn } from "@/libs/utils";

interface FilterTab {
  key: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-gray-100 rounded-xl p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            activeTab === tab.key
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-grey hover:text-neutral-02",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
