"use client";

import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DownloadIcon from "@/components/atoms/icons/DownloadIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { DonutChart } from "@/components/molecules/charts/DonutChart";
import InitTemplate from "@/components/templates/init/InitTemplate";
import { cn } from "@/libs/utils";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";

export type ClassAnalyticsViewType =
  | "Beranda"
  | "Siswa"
  | "Materi"
  | "Kelola E-LKPD"
  | "Laporan";

export interface ILearningAnalyticsStudentListItem {
  id: string;
  fullname: string;
  nis: string;
  score: number;
  status: "Lulus" | "Remedial";
}

export interface ILearningAnalyticsMaterialItem {
  id: string;
  title: string;
  updatedAt: string;
  type: "Materi" | "Video" | "Tes";
  status: "Aktif" | "Draft";
}

export interface ILearningAnalyticsELKPDItem {
  id: string;
  title: string;
  dueLabel: string;
  submittedCount: number;
  status: "Aktif" | "Ditutup";
}

export interface IClassAnalyticsReportSummaryCard {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}

export interface ILearningAnalyticsScoreBucket {
  label: string;
  value: number;
  color: string;
}

export interface ILearningAnalyticsEmotionSegment {
  label: string;
  value: number;
  color: string;
}

export interface ILearningAnalyticsHeaderCardData {
  className: string;
  classCode: string;
  subjectLabel: string;
  metadata: string[];
  symbol?: string;
}

interface ILearningAnalyticsViewSwitcherProps {
  activeType: ClassAnalyticsViewType;
  onChange: (nextType: ClassAnalyticsViewType) => void;
  badgeByType?: Partial<Record<ClassAnalyticsViewType, number>>;
}

interface ILearningAnalyticsClassHeaderCardProps {
  data: ILearningAnalyticsHeaderCardData;
}

interface IBaseBerandaSectionProps {
  reportSummaryCards: IClassAnalyticsReportSummaryCard[];
  materials: ILearningAnalyticsMaterialItem[];
  students: ILearningAnalyticsStudentListItem[];
}

interface IBaseSiswaSectionProps {
  students: ILearningAnalyticsStudentListItem[];
  buildStudentDetailHref?: (studentId: string) => string;
}

interface IBaseMateriSectionProps {
  materials: ILearningAnalyticsMaterialItem[];
}

interface IBaseKelolaELKPDSectionProps {
  elkpdItems: ILearningAnalyticsELKPDItem[];
}

interface IBaseLaporanSectionProps {
  reportSummaryCards: IClassAnalyticsReportSummaryCard[];
  scoreBuckets: ILearningAnalyticsScoreBucket[];
  emotionSegments: ILearningAnalyticsEmotionSegment[];
  students: ILearningAnalyticsStudentListItem[];
  buildStudentDetailHref?: (studentId: string) => string;
}

interface IBaseInitSectionProps {
  title: string;
  description: string;
}

interface IForumWordCloudItem {
  label: string;
  className: string;
}

interface IForumPostListItem {
  id: string;
  authorName: string;
  dateLabel: string;
  content: string;
}

const VIEW_ITEMS: Array<{
  type: ClassAnalyticsViewType;
  icon: ComponentType<{ className?: string }>;
}> = [
  { type: "Beranda", icon: DashboardIcon },
  { type: "Siswa", icon: ThreeUserGroupIcon },
  { type: "Materi", icon: NotebookIcon },
  { type: "Kelola E-LKPD", icon: ClipboardIcon },
  { type: "Laporan", icon: TrendUpIcon },
];

const REPORT_MODES = ["Analisis Nilai & Emosi", "Word Cloud Forum"] as const;

const FORUM_WORD_CLOUD_ITEMS: IForumWordCloudItem[] = [
  {
    label: "persamaan",
    className:
      "text-[clamp(1.8rem,4.8vw,3.2rem)] font-extrabold text-[#2563EB]",
  },
  {
    label: "kuadrat",
    className:
      "text-[clamp(1.8rem,4.8vw,3.2rem)] font-extrabold text-[#2563EB]",
  },
  {
    label: "cara",
    className:
      "text-[clamp(1.8rem,4.8vw,3.2rem)] font-extrabold text-[#2563EB]",
  },
  {
    label: "rumus",
    className: "text-[clamp(1.5rem,3.8vw,2.3rem)] font-bold text-[#4F46E5]",
  },
  {
    label: "diskriminan",
    className: "text-[clamp(1.5rem,3.8vw,2.3rem)] font-bold text-[#7C3AED]",
  },
  {
    label: "latihan",
    className: "text-[clamp(1.45rem,3.5vw,2.1rem)] font-bold text-[#38BDF8]",
  },
  {
    label: "menyelesaikan",
    className:
      "text-[clamp(1.15rem,2.6vw,1.8rem)] font-semibold text-[#4BA3DA]",
  },
  {
    label: "membantu",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#5A7ED8]",
  },
  {
    label: "pemahaman",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#7C88E6]",
  },
  {
    label: "tentang",
    className:
      "text-[clamp(1.05rem,2.2vw,1.55rem)] font-semibold text-[#6D8DE3]",
  },
  {
    label: "materi",
    className:
      "text-[clamp(1.05rem,2.2vw,1.55rem)] font-semibold text-[#6088DA]",
  },
  {
    label: "fungsi",
    className:
      "text-[clamp(1.05rem,2.2vw,1.55rem)] font-semibold text-[#5A75C8]",
  },
  {
    label: "mudah",
    className:
      "text-[clamp(1.05rem,2.2vw,1.55rem)] font-semibold text-[#6F63E8]",
  },
  {
    label: "dipahami",
    className:
      "text-[clamp(1.05rem,2.2vw,1.55rem)] font-semibold text-[#695EE6]",
  },
  {
    label: "video",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#3BA7E8]",
  },
  {
    label: "tutorial",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#5B8BE0]",
  },
  {
    label: "tersedia",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#6C7CE0]",
  },
  {
    label: "masih",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#7E87EE]",
  },
  {
    label: "bingung",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#5F8FEF]",
  },
  {
    label: "menentukan",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#5B9FE9]",
  },
  {
    label: "jenis",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#5D86D7]",
  },
  {
    label: "akar",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#8464E7]",
  },
  {
    label: "berbeda",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#7B68EA]",
  },
  {
    label: "soal",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#3FA3E6]",
  },
  {
    label: "lkpd",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#4D90DA]",
  },
  {
    label: "bermanfaat",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#607FCC]",
  },
  {
    label: "mempersiapkan",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#8393F0]",
  },
  {
    label: "diri",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#6793E5]",
  },
  {
    label: "menghadapi",
    className: "text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold text-[#61A7EA]",
  },
  {
    label: "diagnostik",
    className: "text-[clamp(1.45rem,3.5vw,2.1rem)] font-bold text-[#4A75D1]",
  },
];

const FORUM_POST_ITEMS: IForumPostListItem[] = [
  {
    id: "forum-1",
    authorName: "Ahmad Rizki",
    dateLabel: "1 Apr 2026",
    content:
      "Cara menyelesaikan persamaan kuadrat dengan rumus ABC sangat membantu pemahaman saya tentang diskriminan",
  },
  {
    id: "forum-2",
    authorName: "Budi Santoso",
    dateLabel: "2 Apr 2026",
    content:
      "Materi fungsi kuadrat cukup mudah dipahami dengan video tutorial yang tersedia di kelas ini",
  },
  {
    id: "forum-3",
    authorName: "Citra Dewi",
    dateLabel: "3 Apr 2026",
    content:
      "Saya masih bingung dengan cara diskriminan untuk menentukan jenis akar persamaan kuadrat yang berbeda",
  },
  {
    id: "forum-4",
    authorName: "Dimas Prasetyo",
    dateLabel: "4 Apr 2026",
    content:
      "Latihan soal di E-LKPD sangat bermanfaat untuk mempersiapkan diri menghadapi tes diagnostik persamaan",
  },
  {
    id: "forum-5",
    authorName: "Eka Putri",
    dateLabel: "5 Apr 2026",
    content:
      "Video pembahasan membantu saya memahami langkah faktorisasi sebelum mengerjakan soal tes",
  },
];

type ReportMode = (typeof REPORT_MODES)[number];

export function LearningAnalyticsClassHeaderCard({
  data,
}: ILearningAnalyticsClassHeaderCardProps) {
  return (
    <WelcomeBanner
      role="teacher"
      name={data.className}
      showGreeting={false}
      leadingIcon={
        <MathSymbolAvatar
          symbol={data.symbol ?? "Σ"}
          color="bg-white/20 text-white"
          size="sm"
        />
      }
      metadata={data.metadata}
      chips={[
        { label: `Kode: ${data.classCode}` },
        { label: `Mata Pelajaran: ${data.subjectLabel}` },
      ]}
    />
  );
}

export function LearningAnalyticsViewSwitcher({
  activeType,
  onChange,
  badgeByType,
}: ILearningAnalyticsViewSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {VIEW_ITEMS.map((item) => {
        const isActive = item.type === activeType;
        const badgeCount = badgeByType?.[item.type];

        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
              isActive
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E5E7EB] bg-white text-[#475569] hover:bg-[#F8FAFC]",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>
              {item.type}
              {typeof badgeCount === "number" ? ` (${badgeCount})` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BaseInitSection({ title, description }: IBaseInitSectionProps) {
  return <InitTemplate title={title} description={description} />;
}

export function BaseBerandaSection({
  reportSummaryCards,
  materials,
  students,
}: IBaseBerandaSectionProps) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportSummaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5"
          >
            <p
              className={cn(
                "text-2xl font-extrabold leading-none text-[#2563EB]",
                card.valueClassName,
              )}
            >
              {card.value}
            </p>
            <p className="mt-2 text-xs font-medium text-[#9CA3AF]">
              {card.label}
            </p>
            {card.hint && (
              <p className="mt-1 text-xs text-[#9CA3AF]">{card.hint}</p>
            )}
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#111827]">
            Materi Terbaru
          </h2>
          <div className="mt-3 space-y-2">
            {materials.slice(0, 4).map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {material.title}
                  </p>
                  <p className="text-xs text-[#94A3B8]">{material.updatedAt}</p>
                </div>
                <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                  {material.type}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#111827]">
            Ringkasan Siswa
          </h2>
          <div className="mt-3 space-y-2">
            {students.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {student.fullname}
                  </p>
                  <p className="text-xs text-[#94A3B8]">NIS: {student.nis}</p>
                </div>
                <p className="text-sm font-semibold text-[#2563EB]">
                  {student.score}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function BaseSiswaSection({
  students,
  buildStudentDetailHref,
}: IBaseSiswaSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">Daftar Siswa</h2>
        <p className="text-xs text-[#94A3B8]">Total {students.length} siswa</p>
      </div>

      <div className="space-y-2">
        {students.map((student, index) => (
          <article
            key={student.id}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  {student.fullname.charAt(0).toUpperCase() ||
                    String(index + 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    {student.fullname}
                  </p>
                  <p className="text-xs text-[#94A3B8]">NIS: {student.nis}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    student.status === "Lulus"
                      ? "text-[#16A34A]"
                      : "text-[#DC2626]",
                  )}
                >
                  {student.score}
                </p>
                {buildStudentDetailHref ? (
                  <Link
                    href={buildStudentDetailHref(student.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F3F4F6]"
                    aria-label={`Lihat detail ${student.fullname}`}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF]">
                    <EyeIcon className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BaseMateriSection({ materials }: IBaseMateriSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">Daftar Materi</h2>
        <p className="text-xs text-[#94A3B8]">{materials.length} materi</p>
      </div>

      <div className="space-y-2">
        {materials.map((material) => (
          <article
            key={material.id}
            className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {material.title}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Update: {material.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                  {material.type}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    material.status === "Aktif"
                      ? "bg-[#ECFDF5] text-[#16A34A]"
                      : "bg-[#F3F4F6] text-[#64748B]",
                  )}
                >
                  {material.status}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BaseKelolaELKPDSection({
  elkpdItems,
}: IBaseKelolaELKPDSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">Kelola E-LKPD</h2>
        <p className="text-xs text-[#94A3B8]">{elkpdItems.length} aktivitas</p>
      </div>

      <div className="space-y-2">
        {elkpdItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {item.title}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Batas waktu: {item.dueLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                  {item.submittedCount} terkumpul
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    item.status === "Aktif"
                      ? "bg-[#ECFDF5] text-[#16A34A]"
                      : "bg-[#F3F4F6] text-[#64748B]",
                  )}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportScoreChart({
  scoreBuckets,
}: {
  scoreBuckets: ILearningAnalyticsScoreBucket[];
}) {
  const maxScore = useMemo(
    () => Math.max(...scoreBuckets.map((bucket) => bucket.value), 1),
    [scoreBuckets],
  );

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <h3 className="text-sm font-semibold text-[#111827]">Distribusi Nilai</h3>

      <div className="mt-4 rounded-xl border border-[#F0F2F5] bg-[#FCFCFD] px-3 pb-2 pt-3">
        <div className="relative h-40">
          <div className="absolute inset-x-0 bottom-7 top-0">
            {[0, 0.5, 1].map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-dashed border-[#E5E7EB]"
                style={{ bottom: `${tick * 100}%` }}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-7 top-0 flex items-end gap-2">
            {scoreBuckets.map((bucket) => (
              <div key={bucket.label} className="flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(bucket.value / maxScore) * 100}%`,
                    backgroundColor: bucket.color,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 text-[10px] text-[#9CA3AF]">
            {scoreBuckets.map((bucket) => (
              <span key={bucket.label} className="flex-1 text-center">
                {bucket.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReportEmotionChart({
  emotionSegments,
}: {
  emotionSegments: ILearningAnalyticsEmotionSegment[];
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <h3 className="text-sm font-semibold text-[#111827]">
        Distribusi Emosi Siswa
      </h3>

      <div className="mt-4 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-6">
        <DonutChart
          segments={emotionSegments}
          size={146}
          strokeWidth={24}
          className="gap-3"
        />
      </div>
    </article>
  );
}

function ReportStudentRows({
  students,
  buildStudentDetailHref,
}: {
  students: ILearningAnalyticsStudentListItem[];
  buildStudentDetailHref?: (studentId: string) => string;
}) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <h3 className="text-lg font-semibold text-[#111827]">
          Analisis Per Siswa
        </h3>
        <p className="text-xs text-[#94A3B8]">Klik untuk detail individual</p>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {students.map((student) => (
          <article key={student.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  {student.fullname.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    {student.fullname}
                  </p>
                  <p className="text-xs text-[#94A3B8]">NIS: {student.nis}</p>
                </div>
              </div>

              {buildStudentDetailHref ? (
                <Link
                  href={buildStudentDetailHref(student.id)}
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-[#E5E7EB] px-2.5 text-xs font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
                >
                  Detail
                </Link>
              ) : (
                <span className="inline-flex h-8 items-center justify-center rounded-xl border border-[#E5E7EB] px-2.5 text-xs font-semibold text-[#94A3B8]">
                  Detail
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportWordCloudForum() {
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-4 py-4 md:px-6">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#2563EB]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M7 18h9a5 5 0 000-10 6.5 6.5 0 00-12.56 2.2A4.5 4.5 0 007 18z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <div>
              <h3 className="text-lg font-bold text-[#1F2937] md:text-[34px] md:leading-[1.1]">
                Word Cloud - Forum Diskusi
              </h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                Kata yang paling sering muncul dari {FORUM_POST_ITEMS.length}{" "}
                postingan forum kelas ini
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#E5ECF7] px-4 py-8 md:px-10 md:py-12">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-4 text-center md:gap-x-4 md:gap-y-5">
              {FORUM_WORD_CLOUD_ITEMS.map((item) => (
                <span key={item.label} className={item.className}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-4 py-3.5 md:px-6">
          <h3 className="text-2xl font-bold text-[#1F2937]">
            Postingan Forum ({FORUM_POST_ITEMS.length})
          </h3>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {FORUM_POST_ITEMS.map((post) => (
            <article key={post.id} className="px-4 py-3.5 md:px-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <p className="text-base font-semibold text-[#1F2937]">
                      {post.authorName}
                    </p>
                    <p className="text-sm text-[#94A3B8]">{post.dateLabel}</p>
                  </div>

                  <p className="mt-0.5 text-sm text-[#475569]">
                    {post.content}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}

export function BaseLaporanSection({
  reportSummaryCards,
  scoreBuckets,
  emotionSegments,
  students,
  buildStudentDetailHref,
}: IBaseLaporanSectionProps) {
  const [reportMode, setReportMode] = useState<ReportMode>(
    "Analisis Nilai & Emosi",
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#111827]">
          Laporan Analisis Data (LAD)
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export Kelas Ini
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export Semua Kelas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportSummaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5"
          >
            <p
              className={cn(
                "text-3xl font-extrabold leading-none text-[#2563EB]",
                card.valueClassName,
              )}
            >
              {card.value}
            </p>
            <p className="mt-2 text-[11px] font-medium text-[#9CA3AF]">
              {card.label}
            </p>
            {card.hint && (
              <p className="mt-1 text-[11px] text-[#9CA3AF]">{card.hint}</p>
            )}
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {REPORT_MODES.map((mode) => {
          const isActive = reportMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => setReportMode(mode)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                isActive
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E5E7EB] bg-white text-[#64748B] hover:bg-[#F8FAFC]",
              )}
            >
              <span>{mode}</span>
            </button>
          );
        })}
      </div>

      {reportMode === "Analisis Nilai & Emosi" ? (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportScoreChart scoreBuckets={scoreBuckets} />
            <ReportEmotionChart emotionSegments={emotionSegments} />
          </div>

          <ReportStudentRows
            students={students}
            buildStudentDetailHref={buildStudentDetailHref}
          />
        </>
      ) : (
        <ReportWordCloudForum />
      )}
    </section>
  );
}
