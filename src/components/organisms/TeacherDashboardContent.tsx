"use client";

import { ReactNode } from "react";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { TeacherStatCard } from "@/components/molecules/cards/TeacherStatCard";
import { TeacherClassCard } from "@/components/molecules/cards/TeacherClassCard";
import PlusIcon from "@/components/atoms/icons/PlusIcon";

// ============ TYPES ============

export interface TeacherStat {
  icon: ReactNode;
  value: string | number;
  label: string;
  highlight?: boolean;
}

export interface TeacherClass {
  id: string;
  title: string;
  classCode: string;
  totalStudents: number;
  progress: number;
  progressVariant?: "primary" | "success" | "warning" | "info";
  isActive?: boolean;
  activeTests?: number;
}

export interface RecentItem {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}

interface TeacherDashboardContentProps {
  teacherName: string;
  subtitle?: string;
  stats: TeacherStat[];
  classes: TeacherClass[];
  recentMaterials: RecentItem[];
  recentDiagnostics: RecentItem[];
  onCreateClass?: () => void;
  onManageClass?: (classId: string) => void;
}

export const TeacherDashboardContent: React.FC<
  TeacherDashboardContentProps
> = ({
  teacherName,
  subtitle,
  stats,
  classes,
  recentMaterials,
  recentDiagnostics,
  onCreateClass,
  onManageClass,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Welcome Banner */}
      <WelcomeBanner role="teacher" name={teacherName} subtitle={subtitle} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <TeacherStatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            highlight={stat.highlight}
          />
        ))}
      </div>

      {/* Kelas yang Diampu */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Kelas yang Diampu"
          action={
            onCreateClass && (
              <button
                onClick={onCreateClass}
                className="flex items-center gap-2 px-4 py-3 bg-[#1F2375] text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Buat Kelas
              </button>
            )
          }
        />

        <div className="bg-white border border-grey-stroke rounded-2xl px-5 md:px-6">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <TeacherClassCard
                key={cls.id}
                title={cls.title}
                classCode={cls.classCode}
                totalStudents={cls.totalStudents}
                progress={cls.progress}
                progressVariant={cls.progressVariant}
                isActive={cls.isActive}
                activeTests={cls.activeTests}
                onManage={() => onManageClass?.(cls.id)}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-grey text-sm">Belum ada kelas yang diampu.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Panels: Materi Terbaru + Tes Diagnostik Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materi Terbaru */}
        <section className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
          <SectionHeader
            title={`Materi Terbaru (${recentMaterials.length} total)`}
          />
          <div className="flex flex-col divide-y divide-grey-stroke">
            {recentMaterials.length > 0 ? (
              recentMaterials.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-02 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-grey">{item.subtitle}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-grey text-sm py-4 text-center">
                Belum ada materi.
              </p>
            )}
          </div>
        </section>

        {/* Tes Diagnostik Terbaru */}
        <section className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
          <SectionHeader
            title={`Tes Diagnostik Terbaru (${recentDiagnostics.length} total)`}
          />
          <div className="flex flex-col divide-y divide-grey-stroke">
            {recentDiagnostics.length > 0 ? (
              recentDiagnostics.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-02 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-grey">{item.subtitle}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-grey text-sm py-4 text-center">
                Belum ada tes diagnostik.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
