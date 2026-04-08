"use client";

import { ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  iconColor?: string;
  message: ReactNode;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  className,
}) => {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-grey">Belum ada aktivitas terbaru.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            "flex items-start gap-3 py-3.5",
            index < activities.length - 1 && "border-b border-grey-stroke",
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              activity.iconColor || "bg-gray-100 text-grey",
            )}
          >
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-02 leading-relaxed">
              {activity.message}
            </p>
            <p className="text-xs text-grey mt-0.5">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
