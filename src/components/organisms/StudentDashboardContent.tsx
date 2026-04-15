"use client";

import { ReactNode } from "react";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { ClassSearchBar } from "@/components/molecules/searchBar/ClassSearchBar";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { FilterTabs } from "@/components/molecules/FilterTabs";
import { EnrolledClassCard } from "@/components/molecules/cards/EnrolledClassCard";
import { AvailableClassCard } from "@/components/molecules/cards/AvailableClassCard";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";

// ============ TYPES ============

export interface EnrolledClass {
  id: string;
  slug: string;
  title: string;
  teacher: string;
  institution: string;
  academicYear: string;
  progress: number;
  totalMaterials: number;
  totalStudents: number;
  symbol: ReactNode;
  symbolColor: string;
  progressVariant: "primary" | "success" | "warning" | "info";
  activeTests?: number;
}

export interface AvailableClass {
  id: string;
  title: string;
  teacher: string;
  institution: string;
  academicYear: string;
  totalMaterials: number;
  totalStudents: number;
  symbol: ReactNode;
  symbolColor: string;
}

interface StudentDashboardContentProps {
  studentName: string;
  streakDays: number;
  level: number;
  xp: number;
  rank: number;
  totalClassesFollowed: number;
  enrolledClasses: EnrolledClass[];
  availableClasses: AvailableClass[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (key: string) => void;
  onJoinClass?: () => void;
  onClassClick?: (classId: string) => void;
  onJoinWithCode?: (classId: string) => void;
}

const CLASS_FILTER_TABS = [
  { key: "all", label: "Semua" },
  { key: "in_progress", label: "Dalam Proses" },
  { key: "completed", label: "Selesai" },
];

export const StudentDashboardContent: React.FC<
  StudentDashboardContentProps
> = ({
  studentName,
  streakDays,
  level,
  xp,
  rank,
  totalClassesFollowed,
  enrolledClasses,
  availableClasses,
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  onJoinClass,
  onClassClick,
  onJoinWithCode,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Welcome Banner */}
      <WelcomeBanner
        name={studentName}
        streakDays={streakDays}
        level={level}
        xp={xp}
        rank={rank}
        totalClassesFollowed={totalClassesFollowed}
      />

      {/* Search & Join Class */}
      <ClassSearchBar
        value={searchValue}
        onChange={onSearchChange}
        onJoinClass={onJoinClass}
      />

      {/* Enrolled Classes Section */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Kelas yang Diikuti"
          icon={
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 text-grey" />
              </button>
            </div>
          }
          action={
            <FilterTabs
              tabs={CLASS_FILTER_TABS}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          }
        />

        {enrolledClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledClasses.map((cls) => (
              <EnrolledClassCard
                key={cls.id}
                slug={cls.slug}
                title={cls.title}
                teacher={cls.teacher}
                institution={cls.institution}
                academicYear={cls.academicYear}
                progress={cls.progress}
                totalMaterials={cls.totalMaterials}
                totalStudents={cls.totalStudents}
                symbol={cls.symbol}
                symbolColor={cls.symbolColor}
                progressVariant={cls.progressVariant}
                activeTests={cls.activeTests}
                onClick={() => onClassClick?.(cls.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-grey-stroke rounded-2xl p-8 text-center">
            <p className="text-grey text-sm">Belum ada kelas yang diikuti.</p>
          </div>
        )}
      </section>

      {/* Available Classes Section */}
      {availableClasses.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Kelas Tersedia di Sekolahmu" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableClasses.map((cls) => (
              <AvailableClassCard
                key={cls.id}
                title={cls.title}
                teacher={cls.teacher}
                institution={cls.institution}
                academicYear={cls.academicYear}
                totalMaterials={cls.totalMaterials}
                totalStudents={cls.totalStudents}
                symbol={cls.symbol}
                symbolColor={cls.symbolColor}
                onJoin={() => onJoinWithCode?.(cls.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
