"use client";

import { ReactNode } from "react";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { AdminStatCard } from "@/components/molecules/cards/AdminStatCard";
import { ScoreTrendChart } from "@/components/molecules/charts/ScoreTrendChart";
import { TeacherActivityCard } from "@/components/molecules/cards/TeacherActivityCard";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ActivityIcon from "@/components/atoms/icons/ActivityIcon";

// ============ TYPES ============

export interface AdminStat {
  icon: ReactNode;
  iconColor?: string;
  value: string | number;
  label: string;
  delta?: number;
}

export interface AdminChartLine {
  label: string;
  color: string;
  data: number[];
}

export interface TeacherActivity {
  id: string;
  name: string;
  initials: string;
  avatarColor?: string;
  subject: string;
  lastActivity: string;
  totalStudents: number;
  totalClasses: number;
}

interface AdminDashboardContentProps {
  stats: AdminStat[];
  chartLabels: string[];
  chartLines: AdminChartLine[];
  chartTitle?: string;
  teacherActivities: TeacherActivity[];
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  stats,
  chartLabels,
  chartLines,
  chartTitle = "Tren Pertumbuhan Platform",
  teacherActivities,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AdminStatCard
            key={index}
            icon={stat.icon}
            iconColor={stat.iconColor}
            value={stat.value}
            label={stat.label}
            delta={stat.delta}
          />
        ))}
      </div>

      {/* Platform Growth Chart */}
      <div className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <SectionHeader title={chartTitle} />
        <ScoreTrendChart labels={chartLabels} lines={chartLines} />
      </div>

      {/* Teacher Activity */}
      {teacherActivities.length > 0 && (
        <div className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
          <SectionHeader title="Aktivitas Guru" />
          <div className="flex flex-col">
            {teacherActivities.map((teacher) => (
              <TeacherActivityCard
                key={teacher.id}
                name={teacher.name}
                initials={teacher.initials}
                avatarColor={teacher.avatarColor}
                subject={teacher.subject}
                lastActivity={teacher.lastActivity}
                totalStudents={teacher.totalStudents}
                totalClasses={teacher.totalClasses}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
