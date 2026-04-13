"use client";

import { ReactNode } from "react";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { TeacherStatCard } from "@/components/molecules/cards/TeacherStatCard";
import { AlertBanner } from "@/components/molecules/AlertBanner";
import { ParentClassCard } from "@/components/molecules/cards/ParentClassCard";
import { ScoreTrendChart } from "@/components/molecules/charts/ScoreTrendChart";
import { DonutChart } from "@/components/molecules/charts/DonutChart";
import { TestResultCard } from "@/components/molecules/cards/TestResultCard";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import HeartIcon from "@/components/atoms/icons/HeartIcon";

// ============ TYPES ============

export interface ParentStat {
  icon: ReactNode;
  value: string | number;
  label: string;
  subtitle?: string;
}

export interface ParentClass {
  id: string;
  title: string;
  teacherName: string;
  symbol: ReactNode;
  symbolColor?: string;
  progress: number;
  score: number;
  status: "Aktif" | "Selesai" | "Tidak Aktif";
  progressVariant?: "primary" | "success" | "warning" | "info";
  activeTests?: number;
}

export interface TrendLine {
  label: string;
  color: string;
  data: number[];
}

export interface EmotionSegment {
  label: string;
  value: number;
  color: string;
}

export interface TestResult {
  id: string;
  title: string;
  date: string;
  score: number;
  maxScore?: number;
  status: "Lulus" | "Remedial";
  type?: "diagnostic" | "other";
  remedialNote?: string;
  subject?: string;
}

interface ParentDashboardContentProps {
  parentName: string;
  childName: string;
  stats: ParentStat[];
  alertMessage?: string;
  onAlertClick?: () => void;
  classes: ParentClass[];
  onViewClass?: (classId: string) => void;
  trendChartLabels: string[];
  trendChartLines: TrendLine[];
  trendChartTitle?: string;
  emotionSegments: EmotionSegment[];
  testResults: TestResult[];
  onManageChild?: () => void;
}

export const ParentDashboardContent: React.FC<ParentDashboardContentProps> = ({
  parentName,
  childName,
  stats,
  alertMessage,
  onAlertClick,
  classes,
  onViewClass,
  trendChartLabels,
  trendChartLines,
  trendChartTitle,
  emotionSegments,
  testResults,
  onManageChild,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Welcome Banner (Parent variant) */}
      <WelcomeBanner
        role="parent"
        name={parentName}
        childName={childName}
        onManageChild={onManageChild}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <TeacherStatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Alert Banner */}
      {alertMessage && (
        <AlertBanner
          variant="warning"
          icon={<AlertIcon className="w-5 h-5 text-amber-600" />}
          action={
            onAlertClick
              ? { label: "Lihat Detail", onClick: onAlertClick }
              : undefined
          }
        >
          {alertMessage}
        </AlertBanner>
      )}

      {/* Kelas yang Diikuti Anak */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={`Kelas yang Diikuti ${childName}`} />
        {classes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {classes.map((cls) => (
              <ParentClassCard
                key={cls.id}
                title={cls.title}
                teacherName={cls.teacherName}
                symbol={cls.symbol}
                symbolColor={cls.symbolColor}
                progress={cls.progress}
                score={cls.score}
                status={cls.status}
                progressVariant={cls.progressVariant}
                activeTests={cls.activeTests}
                onView={() => onViewClass?.(cls.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-grey-stroke rounded-2xl p-8 text-center">
            <p className="text-grey text-sm">Belum ada kelas yang diikuti.</p>
          </div>
        )}
      </section>

      {/* Tren Nilai + Emosi side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (takes 2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
          <SectionHeader title={trendChartTitle ?? `Tren Nilai ${childName}`} />
          <ScoreTrendChart labels={trendChartLabels} lines={trendChartLines} />
        </div>

        {/* Emotion Chart (takes 1/3 width) */}
        <div className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
          <SectionHeader title="Emosi Saat Belajar" />
          <DonutChart
            segments={emotionSegments}
            size={160}
            className="flex-1 justify-center"
          />
        </div>
      </div>

      {/* Hasil Tes Terbaru */}
      {testResults.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Hasil Tes Terbaru" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.map((test) => (
              <TestResultCard
                key={test.id}
                title={test.title}
                date={test.date}
                score={test.score}
                maxScore={test.maxScore}
                status={test.status}
                type={test.type}
                remedialNote={test.remedialNote}
                subject={test.subject}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
