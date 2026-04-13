"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { TeacherStatCard } from "@/components/molecules/cards/TeacherStatCard";
import { AlertBanner } from "@/components/molecules/AlertBanner";
import { ParentClassCard } from "@/components/molecules/cards/ParentClassCard";
import { ScoreTrendChart } from "@/components/molecules/charts/ScoreTrendChart";
import { DonutChart } from "@/components/molecules/charts/DonutChart";
import { TestResultCard } from "@/components/molecules/cards/TestResultCard";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import { cn } from "@/libs/utils";
import ParentClassDetailCard from "../molecules/cards/ParentClassDetailCard";

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

type ModuleStatus = "completed" | "active" | "locked";
type ActivityType = "materi" | "video" | "diagnostic" | "forum";

interface ClassModuleItem {
  id: string;
  type: "Materi" | "Video" | "E-LKPD" | "Tes Diagnostik";
  title: string;
  status: ModuleStatus;
}

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: ActivityType;
}

const MODULE_BLUEPRINT: Array<Pick<ClassModuleItem, "type" | "title">> = [
  { type: "Materi", title: "Pengenalan Variabel" },
  { type: "Video", title: "Pengantar Aljabar" },
  { type: "E-LKPD", title: "Persamaan Linier" },
  { type: "Tes Diagnostik", title: "Modul 1" },
  { type: "Materi", title: "Persamaan Kuadrat" },
  { type: "Video", title: "Grafik Fungsi" },
];

function buildModuleProgress(progress: number): ClassModuleItem[] {
  const totalModules = MODULE_BLUEPRINT.length;
  const completedCount = Math.floor(
    (Math.max(0, progress) / 100) * totalModules,
  );

  return MODULE_BLUEPRINT.map((module, index) => {
    let status: ModuleStatus = "locked";

    if (index < completedCount) {
      status = "completed";
    } else if (index === completedCount && completedCount < totalModules) {
      status = "active";
    }

    return {
      id: `${module.type}-${index}`,
      type: module.type,
      title: module.title,
      status,
    };
  });
}

function getActivityIcon(type: ActivityType) {
  if (type === "video") {
    return <VideoIcon className="h-3.5 w-3.5 text-[#6B7280]" />;
  }

  if (type === "diagnostic") {
    return <ClipboardIcon className="h-3.5 w-3.5 text-[#D97706]" />;
  }

  if (type === "forum") {
    return <AlertIcon className="h-3.5 w-3.5 text-[#4B5563]" />;
  }

  return <BookIcon className="h-3.5 w-3.5 text-[#4B5563]" />;
}

function buildClassActivities(classTitle: string): ActivityItem[] {
  return [
    {
      id: "class-activity-1",
      title: `Menyelesaikan Tes Diagnostik 1 - ${classTitle}`,
      time: "Kemarin, 09:12",
      type: "diagnostic",
    },
    {
      id: "class-activity-2",
      title: "Membaca materi Fungsi Kuadrat & Grafiknya selama 10 menit",
      time: "Kemarin, 08:45",
      type: "materi",
    },
    {
      id: "class-activity-3",
      title: "Aktif di Forum Diskusi - bertanya tentang faktorisasi",
      time: "2 hari lalu",
      type: "forum",
    },
  ];
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
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    if (
      selectedClassId &&
      !classes.some((classItem) => classItem.id === selectedClassId)
    ) {
      setSelectedClassId(null);
    }
  }, [classes, selectedClassId]);

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const selectedClassModules = useMemo(
    () => buildModuleProgress(selectedClass?.progress ?? 0),
    [selectedClass?.id, selectedClass?.progress],
  );

  const classDiagnosticResults = useMemo(() => {
    const diagnostics = testResults
      .filter((result) => result.type === "diagnostic")
      .slice(0, 2);

    if (diagnostics.length > 0) {
      return diagnostics;
    }

    if (!selectedClass) {
      return [];
    }

    const fallbackDiagnosticResult: TestResult = {
      id: `${selectedClass.id}-diagnostic-fallback`,
      title: `Tes Diagnostik 1 - ${selectedClass.title}`,
      date: "Hari ini",
      score: selectedClass.score,
      maxScore: 100,
      status: selectedClass.score >= 75 ? "Lulus" : "Remedial",
      type: "diagnostic",
    };

    return [fallbackDiagnosticResult];
  }, [selectedClass, testResults]);

  const classActivities = useMemo(
    () => buildClassActivities(selectedClass?.title ?? "Kelas Ini"),
    [selectedClass?.id, selectedClass?.title],
  );

  const latestActivities = useMemo<ActivityItem[]>(() => {
    const testActivities: ActivityItem[] = testResults
      .slice(0, 3)
      .map((test, index) => ({
        id: `latest-test-${test.id}`,
        title:
          test.status === "Lulus"
            ? `Menyelesaikan ${test.title} dengan nilai ${test.score}`
            : `Mengulang ${test.title} karena belum tuntas`,
        time:
          index === 0
            ? "Kemarin, 09:12"
            : index === 1
              ? "Kemarin, 08:45"
              : "2 hari lalu",
        type: (test.type === "diagnostic"
          ? "diagnostic"
          : "materi") as ActivityType,
      }));

    return [
      ...testActivities,
      {
        id: "latest-video-remedial",
        title: "Menonton video remedial soal No. 4 - Fungsi Kuadrat",
        time: "3 hari lalu",
        type: "video" as ActivityType,
      },
      {
        id: "latest-statistics",
        title: "Bergabung ke kelas Statistika & Probabilitas",
        time: "1 minggu lalu",
        type: "materi" as ActivityType,
      },
    ].slice(0, 5);
  }, [testResults]);

  const handleClassClick = (classId: string) => {
    setSelectedClassId(classId);
    onViewClass?.(classId);
  };

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
              <div key={cls.id} className="space-y-4">
                <ParentClassCard
                  title={cls.title}
                  teacherName={cls.teacherName}
                  symbol={cls.symbol}
                  cls={cls}
                  selectedClassId={selectedClassId}
                  selectedClassModules={selectedClassModules}
                  setSelectedClassId={setSelectedClassId}
                  symbolColor={cls.symbolColor}
                  progress={cls.progress}
                  score={cls.score}
                  status={cls.status}
                  progressVariant={cls.progressVariant}
                  activeTests={cls.activeTests}
                  onView={() => handleClassClick(cls.id)}
                  className={cn(
                    selectedClassId === cls.id &&
                      "border-indigo-200 ring-1 ring-indigo-200 shadow-[0px_8px_20px_rgba(79,70,229,0.15)]",
                  )}
                />

                {selectedClassId === cls.id && (
                  <ParentClassDetailCard
                    key={cls.id}
                    classActivities={classActivities}
                    classDiagnosticResults={classDiagnosticResults}
                    selectedClassModules={selectedClassModules}
                  />
                )}
              </div>
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
