"use client";

import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DownloadIcon from "@/components/atoms/icons/DownloadIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import FilterIcon from "@/components/atoms/icons/FilterIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { DonutChart } from "@/components/molecules/charts/DonutChart";
import { MateriModuleDetailModal } from "@/components/organisms/learningAnalytics/MateriModuleDetailModal";
import { Modal } from "@/components/molecules/Modal";
import {
  DiagnosticPreviewBody,
  MateriSequenceItemCard,
  MaterialPreviewPanel,
} from "@/components/organisms/learningAnalytics/ClassAnalyticsSequenceComponents";
import InitTemplate from "@/components/templates/init/InitTemplate";
import { showErrorToast, showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import {
  useGsCreateCourseModule,
  useGsDeleteCourseModule,
  useGsDiagnosticTestById,
  useGsModuleById,
  useGsModulesByCourse,
  useGsMyDiagnosticTests,
  useGsMySubjects,
  useGsReorderCourseModules,
  useGsUpdateCourseModule,
} from "@/services";
import type { GsCourseModule } from "@/types/gs-course";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  ClassAnalyticsViewType,
  IClassAnalyticsReportSummaryCard,
  ILearningAnalyticsDiagnosticOption,
  IMateriAssetItem,
  IMateriSequenceItem,
  ILearningAnalyticsELKPDItem,
  ILearningAnalyticsEmotionSegment,
  ILearningAnalyticsHeaderCardData,
  ILearningAnalyticsMaterialItem,
  ILearningAnalyticsScoreBucket,
  ILearningAnalyticsStudentListItem,
  MateriAssetKind,
  ITeacherClassLearningAnalyticsDetail,
} from "@/types/learningAnalytics";
import { LADDonutChart } from "../classroom";

interface ITeacherOverviewSectionProps {
  classDetail: ITeacherClassLearningAnalyticsDetail;
  materials: ILearningAnalyticsMaterialItem[];
}

interface IRecentActivityItem {
  id: string;
  text: string;
  timeLabel: string;
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
  onKickStudent?: (student: ILearningAnalyticsStudentListItem) => void;
  isKickingStudent?: boolean;
}

export interface IBaseMateriSectionProps {
  materials: ILearningAnalyticsMaterialItem[];
  courseId?: string;
  sequenceItems?: IMateriSequenceItem[];
  assetOptions?: IMateriAssetItem[];
  diagnosticOptions?: ILearningAnalyticsDiagnosticOption[];
  students?: ILearningAnalyticsStudentListItem[];
  onCreateModuleFromAsset?: (assetId: string) => void;
  onCreateDiagnosticFromOption?: (diagnosticId: string) => void;
  onMoveSequenceItem?: (itemId: string, direction: -1 | 1) => void;
  onDeleteSequenceItem?: (itemId: string) => void;
  onViewSequenceItem?: (itemId: string) => void;
}

interface IBaseKelolaELKPDSectionProps {
  elkpdItems: ILearningAnalyticsELKPDItem[];
  buildELKPDScoreHref?: (elkpdId: string) => string;
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
type StudentStatusFilter =
  | "Semua"
  | ILearningAnalyticsStudentListItem["status"];

const STUDENT_AVATAR_ACCENTS = [
  "bg-[#CA8A04]",
  "bg-[#94A3B8]",
  "bg-[#22C55E]",
  "bg-[#64748B]",
  "bg-[#0EA5E9]",
  "bg-[#A855F7]",
  "bg-[#84CC16]",
  "bg-[#EC4899]",
] as const;

function inferStudentProgress(
  student: ILearningAnalyticsStudentListItem,
  index: number,
): number {
  const statusBias = student.status === "Lulus" ? 6 : -8;
  const indexVariance = ((index % 5) - 2) * 5;
  const score = Math.round(student.score + statusBias + indexVariance);

  return Math.max(10, Math.min(100, score));
}

function inferStudentEmotion(
  student: ILearningAnalyticsStudentListItem,
): "Fokus" | "Senang" | "Bingung" | "Tegang" | "Netral" {
  if (student.score >= 85) {
    return "Senang";
  }

  if (student.score >= 75) {
    return "Fokus";
  }

  if (student.score >= 65) {
    return "Netral";
  }

  if (student.score >= 50) {
    return "Bingung";
  }

  return "Tegang";
}

function inferStudentOnlineState(
  student: ILearningAnalyticsStudentListItem,
  index: number,
): boolean {
  return (student.fullname.length + index) % 3 !== 1;
}

const MODULE_ASSET_OPTIONS: IMateriAssetItem[] = [
  {
    id: "asset-pdf-pk",
    kind: "PDF",
    label: "Persamaan Kuadrat",
  },
  {
    id: "asset-video-fk",
    kind: "Video",
    label: "Fungsi Kuadrat",
  },
  {
    id: "asset-elkpd-pk",
    kind: "E-LKPD",
    label: "E-LKPD Persamaan",
  },
  {
    id: "asset-elkpd-aljabar",
    kind: "E-LKPD",
    label: "E-LKPD Aljabar",
  },
  {
    id: "asset-pdf-spl",
    kind: "PDF",
    label: "Sistem Persamaan Linear",
  },
];

const DIAGNOSTIC_TEST_OPTIONS: ILearningAnalyticsDiagnosticOption[] = [
  {
    id: "diagnostic-1",
    title: "Tes Diagnostik 1 - Persamaan Kuadrat",
    questionCount: 2,
    durationMinutes: 60,
  },
  {
    id: "diagnostic-2",
    title: "Tes Diagnostik 2 - Fungsi Kuadrat",
    questionCount: 1,
    durationMinutes: 45,
  },
];

const MATERI_ASSET_GROUPS = [
  [0, 1, 2, 3],
  [0, 2],
  [0, 1, 4],
] as const;

function getAssetIconComponent(
  kind: MateriAssetKind,
): ComponentType<{ className?: string }> {
  if (kind === "PDF") {
    return DocumentIcon;
  }

  if (kind === "Video") {
    return VideoIcon;
  }

  return NotebookIcon;
}

function getAssetTextClassName(kind: MateriAssetKind): string {
  if (kind === "PDF") {
    return "text-[#2563EB]";
  }

  if (kind === "Video") {
    return "text-[#16A34A]";
  }

  return "text-[#EA580C]";
}

function buildModuleDescription(title: string): string {
  return `Kumpulan materi tentang ${title.toLowerCase()} dan terapannya`;
}

function buildDiagnosticDescription(title: string): string {
  const topic = title.split("-").slice(1).join("-").trim() || title;
  return `Tes untuk mengukur pemahaman siswa tentang ${topic.toLowerCase()}`;
}

function formatCourseModuleDateLabel(input?: string | null): string {
  if (!input) {
    return "-";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(input?: string | null): string {
  if (!input) {
    return "";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCourseModuleAssets(
  module: GsCourseModule,
  index: number,
): IMateriAssetItem[] {
  if (module.type !== "SUBJECT") {
    return [];
  }

  const assets: IMateriAssetItem[] = [];
  const subjectName = module.subject?.subjectName ?? `Modul ${index + 1}`;

  if (module.subject?.subjectFileUrl) {
    assets.push({
      id: `${module.id}-pdf`,
      kind: "PDF",
      label: subjectName,
    });
  }

  if (module.subject?.videoUrl) {
    assets.push({
      id: `${module.id}-video`,
      kind: "Video",
      label: `${subjectName} (Video)`,
    });
  }

  if (assets.length === 0) {
    assets.push({
      id: `${module.id}-default`,
      kind: "PDF",
      label: subjectName,
    });
  }

  return assets;
}

function buildCourseModuleSequenceItems(
  modules: GsCourseModule[],
): IMateriSequenceItem[] {
  return modules.map((module, index) => {
    const deadlineLabel = module.deadline
      ? `Deadline: ${formatCourseModuleDateLabel(module.deadline)}`
      : "Tanpa deadline";

    if (module.type === "DIAGNOSTIC_TEST") {
      const diagnosticTitle =
        module.diagnosticTest?.testName ?? `Tes Diagnostik ${index + 1}`;
      const diagnosticDescription = module.diagnosticTest?.description?.trim();

      return {
        id: module.id,
        type: "Tes Diagnostik",
        title: diagnosticTitle,
        description: diagnosticDescription
          ? `${diagnosticDescription} · ${deadlineLabel}`
          : deadlineLabel,
        assets: [],
        durationMinutes: module.diagnosticTest?.durationMinutes,
      } satisfies IMateriSequenceItem;
    }

    const subjectTitle = module.subject?.subjectName ?? `Modul ${index + 1}`;
    const subjectDescription = module.subject?.description?.trim();
    const assets = buildCourseModuleAssets(module, index);

    return {
      id: module.id,
      type: "Modul",
      title: subjectTitle,
      description: subjectDescription
        ? `${subjectDescription} · ${deadlineLabel}`
        : deadlineLabel,
      formatLabel: assets[0]?.kind,
      assets,
    } satisfies IMateriSequenceItem;
  });
}

function buildInitialMateriSequence(
  materials: ILearningAnalyticsMaterialItem[],
): IMateriSequenceItem[] {
  if (materials.length === 0) {
    return [
      {
        id: "materi-sequence-modul-1",
        type: "Modul",
        title: "Modul Aljabar",
        description: "Kumpulan materi tentang aljabar dasar dan terapannya",
        formatLabel: "PDF",
        assets: MODULE_ASSET_OPTIONS.slice(0, 4),
      },
      {
        id: "materi-sequence-test-1",
        type: "Tes Diagnostik",
        title: "Tes Diagnostik 1 - Persamaan Kuadrat",
        description:
          "Tes untuk mengukur pemahaman siswa tentang persamaan kuadrat",
        assets: [],
        questionCount: 5,
        durationMinutes: 80,
      },
    ];
  }

  return materials.map((material, index) => {
    if (material.type === "Tes") {
      return {
        id: `materi-sequence-${material.id}`,
        type: "Tes Diagnostik",
        title: material.title,
        description: buildDiagnosticDescription(material.title),
        assets: [],
        questionCount: 4 + (index % 3),
        durationMinutes: 60 + (index % 2) * 20,
      } satisfies IMateriSequenceItem;
    }

    const assetIndexes =
      MATERI_ASSET_GROUPS[index % MATERI_ASSET_GROUPS.length];
    const assets = assetIndexes.map((assetIndex) => {
      const option = MODULE_ASSET_OPTIONS[assetIndex];

      return {
        ...option,
        id: `${material.id}-${option.id}`,
      };
    });

    return {
      id: `materi-sequence-${material.id}`,
      type: "Modul",
      title: material.title,
      description: buildModuleDescription(material.title),
      formatLabel: material.type === "Video" ? "Video" : "PDF",
      assets,
    } satisfies IMateriSequenceItem;
  });
}

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
  onKickStudent,
  isKickingStudent = false,
}: IBaseSiswaSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StudentStatusFilter>("Semua");
  const [pendingKickStudent, setPendingKickStudent] =
    useState<ILearningAnalyticsStudentListItem | null>(null);

  const studentRows = useMemo(
    () =>
      students.map((student, index) => ({
        ...student,
        avatarTone:
          STUDENT_AVATAR_ACCENTS[index % STUDENT_AVATAR_ACCENTS.length],
        initial: student.fullname.trim().charAt(0).toUpperCase() || "?",
        progress: inferStudentProgress(student, index),
        emotion: inferStudentEmotion(student),
        isOnline: inferStudentOnlineState(student, index),
      })),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return studentRows.filter((student) => {
      if (statusFilter !== "Semua" && student.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        student.fullname.toLowerCase().includes(normalizedSearch) ||
        student.nis.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchValue, statusFilter, studentRows]);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-2.5 border-b border-[#E5E7EB] bg-[#FCFCFD] p-3 md:flex-row md:items-center md:justify-between md:p-4">
        <label className="relative block w-full ">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Cari nama atau NIS..."
            className="h-11 w-full rounded-2xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#DBEAFE]"
            aria-label="Cari siswa"
          />
        </label>

        <div className="relative w-full md:w-auto">
          <FilterIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StudentStatusFilter)
            }
            className="h-11 w-full appearance-none rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] pl-9 pr-9 text-sm font-semibold text-[#475569] outline-none transition focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#DBEAFE] md:min-w-[190px]"
            aria-label="Filter status siswa"
          >
            <option value="Semua">Filter: Semua</option>
            <option value="Lulus">Filter: Lulus</option>
            <option value="Remedial">Filter: Remedial</option>
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#FCFCFD]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Nama Siswa
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                NIS
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Nilai Terakhir
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Emosi
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[#94A3B8]"
                >
                  Tidak ada data siswa yang sesuai dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-[#E5E7EB] transition-colors hover:bg-[#F8FAFC]"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          student.avatarTone,
                        )}
                      >
                        {student.initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[#1F2937]">
                          {student.fullname}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            student.isOnline
                              ? "text-[#22C55E]"
                              : "text-[#9CA3AF]",
                          )}
                        >
                          {student.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-[#94A3B8]">
                    {student.nis}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-[88px] rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {student.progress}%
                      </span>
                    </div>
                  </td>

                  <td
                    className={cn(
                      "px-4 py-3 text-sm font-bold",
                      student.score >= 75 ? "text-[#059669]" : "text-[#DC2626]",
                    )}
                  >
                    {student.score}
                  </td>

                  <td className="px-4 py-3 text-sm text-[#475569]">
                    {student.emotion}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                        student.status === "Lulus"
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-[#FEE2E2] text-[#DC2626]",
                      )}
                    >
                      {student.status === "Lulus" ? (
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                      ) : (
                        <AlertIcon className="h-3.5 w-3.5" />
                      )}
                      {student.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      {/* {buildStudentDetailHref ? (
                        <Link
                          href={buildStudentDetailHref(student.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#9CA3AF] transition hover:bg-[#F1F5F9]"
                          aria-label={`Lihat detail ${student.fullname}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#9CA3AF]">
                          <EyeIcon className="h-4 w-4" />
                        </span>
                      )} */}

                      {onKickStudent ? (
                        <button
                          type="button"
                          onClick={() => setPendingKickStudent(student)}
                          disabled={isKickingStudent}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Keluarkan ${student.fullname} dari kelas`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!pendingKickStudent}
        onClose={() => setPendingKickStudent(null)}
        title="Keluarkan Siswa"
        size="md"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm font-semibold text-[#991B1B]">
              Yakin ingin mengeluarkan siswa ini dari kelas?
            </p>
            <p className="mt-1 text-sm text-[#B91C1C]">
              {pendingKickStudent?.fullname} · NIS {pendingKickStudent?.nis}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setPendingKickStudent(null)}
              className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (!pendingKickStudent) {
                  return;
                }

                onKickStudent?.(pendingKickStudent);
                setPendingKickStudent(null);
              }}
              disabled={!pendingKickStudent || isKickingStudent}
              className="h-12 flex-1 rounded-2xl bg-[#DC2626] px-5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isKickingStudent ? "Memproses..." : "Keluarkan"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export function BaseMateriSection({
  materials,
  courseId,
  sequenceItems: sequenceItemsProp,
  assetOptions,
  diagnosticOptions,
  students = [],
  onCreateModuleFromAsset,
  onCreateDiagnosticFromOption,
  onMoveSequenceItem: onMoveSequenceItemProp,
  onDeleteSequenceItem: onDeleteSequenceItemProp,
  onViewSequenceItem,
}: IBaseMateriSectionProps) {
  const isApiMode = Boolean(courseId);
  const isControlled = !isApiMode && Array.isArray(sequenceItemsProp);
  const [localSequenceItems, setLocalSequenceItems] = useState<
    IMateriSequenceItem[]
  >(() => buildInitialMateriSequence(materials));
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModuleId, setDetailModuleId] = useState("");
  const [deadlineDraft, setDeadlineDraft] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  const {
    data: courseModules = [],
    isLoading: isCourseModulesLoading,
    error: courseModulesError,
  } = useGsModulesByCourse(courseId ?? "");
  const { data: subjectsData, isLoading: isSubjectsLoading } = useGsMySubjects(
    { limit: 200 },
    { enabled: isApiMode },
  );
  const { data: diagnosticTestsData, isLoading: isDiagnosticTestsLoading } =
    useGsMyDiagnosticTests({ limit: 200 }, { enabled: isApiMode });
  const createCourseModuleMutation = useGsCreateCourseModule();
  const updateCourseModuleMutation = useGsUpdateCourseModule();
  const reorderCourseModulesMutation = useGsReorderCourseModules();
  const deleteCourseModuleMutation = useGsDeleteCourseModule();
  const {
    data: selectedModule,
    isLoading: isSelectedModuleLoading,
    error: selectedModuleError,
  } = useGsModuleById(isApiMode ? detailModuleId : "");
  const {
    data: selectedDiagnosticTest,
    isLoading: isSelectedDiagnosticTestLoading,
  } = useGsDiagnosticTestById(selectedModule?.diagnosticTestId ?? "");

  const orderedCourseModules = useMemo(
    () =>
      [...courseModules].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      }),
    [courseModules],
  );

  const apiSequenceItems = useMemo(
    () => buildCourseModuleSequenceItems(orderedCourseModules),
    [orderedCourseModules],
  );

  const apiAssetOptions = useMemo<IMateriAssetItem[]>(
    () =>
      (subjectsData?.subjects ?? []).map((subject) => ({
        id: subject.id,
        kind: subject.videoUrl ? "Video" : "PDF",
        label: subject.subjectName,
      })),
    [subjectsData],
  );

  const apiDiagnosticOptions = useMemo<ILearningAnalyticsDiagnosticOption[]>(
    () =>
      (diagnosticTestsData?.diagnosticTests ?? []).map((test) => ({
        id: test.id,
        title: test.testName,
        questionCount:
          test.packages?.reduce(
            (count, diagnosticPackage) =>
              count + diagnosticPackage.questions.length,
            0,
          ) ?? 0,
        durationMinutes: test.durationMinutes,
      })),
    [diagnosticTestsData],
  );

  const usedSubjectIds = useMemo(
    () =>
      new Set(
        orderedCourseModules
          .filter((module) => module.type === "SUBJECT" && module.subjectId)
          .map((module) => module.subjectId as string),
      ),
    [orderedCourseModules],
  );

  const usedDiagnosticIds = useMemo(
    () =>
      new Set(
        orderedCourseModules
          .filter(
            (module) =>
              module.type === "DIAGNOSTIC_TEST" && module.diagnosticTestId,
          )
          .map((module) => module.diagnosticTestId as string),
      ),
    [orderedCourseModules],
  );

  const resolvedAssetOptions = isApiMode
    ? apiAssetOptions
    : (assetOptions ?? MODULE_ASSET_OPTIONS);
  const resolvedDiagnosticOptions = isApiMode
    ? apiDiagnosticOptions
    : (diagnosticOptions ?? DIAGNOSTIC_TEST_OPTIONS);
  const sequenceItems = isApiMode
    ? apiSequenceItems
    : (sequenceItemsProp ?? localSequenceItems);
  const selectedAssetId = selectedAssetIds[0] ?? "";
  const selectedAssetCount = selectedAssetIds.filter(Boolean).length;
  const availableSubjectCount = resolvedAssetOptions.filter(
    (asset) => !usedSubjectIds.has(asset.id),
  ).length;
  const isMutatingCourseModules =
    createCourseModuleMutation.isPending ||
    updateCourseModuleMutation.isPending ||
    reorderCourseModulesMutation.isPending ||
    deleteCourseModuleMutation.isPending;

  const hasOpenPopup = isModuleModalOpen || isDiagnosticModalOpen;

  useEffect(() => {
    if (!hasOpenPopup) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModuleModalOpen(false);
        setIsDiagnosticModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [hasOpenPopup]);

  useEffect(() => {
    if (!selectedModuleError || !isDetailModalOpen) {
      return;
    }

    showErrorToast(selectedModuleError);
  }, [isDetailModalOpen, selectedModuleError]);

  useEffect(() => {
    if (!selectedModule) {
      setDeadlineDraft("");
      return;
    }

    setDeadlineDraft(toDateInputValue(selectedModule.deadline));
  }, [selectedModule]);

  useEffect(() => {
    if (!isModuleModalOpen) {
      return;
    }

    const validSelectedAssetIds = selectedAssetIds.filter(
      (assetId) =>
        resolvedAssetOptions.some((asset) => asset.id === assetId) &&
        (!isApiMode || !usedSubjectIds.has(assetId)),
    );

    if (validSelectedAssetIds.length > 0) {
      return;
    }

    if (isApiMode) {
      const nextAvailableSubject = resolvedAssetOptions.find(
        (asset) => !usedSubjectIds.has(asset.id),
      );

      setSelectedAssetIds(
        nextAvailableSubject ? [nextAvailableSubject.id] : [],
      );
      return;
    }

    setSelectedAssetIds(
      resolvedAssetOptions[0]?.id ? [resolvedAssetOptions[0].id] : [],
    );
  }, [
    isApiMode,
    isModuleModalOpen,
    resolvedAssetOptions,
    selectedAssetIds,
    usedSubjectIds,
  ]);

  const resetModuleForm = () => {
    setModuleTitle("");
    setModuleDescription("");

    if (isApiMode) {
      const nextAvailableSubject = resolvedAssetOptions.find(
        (asset) => !usedSubjectIds.has(asset.id),
      );

      setSelectedAssetIds(
        nextAvailableSubject ? [nextAvailableSubject.id] : [],
      );
      return;
    }

    setSelectedAssetIds(
      resolvedAssetOptions[0]?.id ? [resolvedAssetOptions[0].id] : [],
    );
  };

  const closeModuleModal = () => {
    setIsModuleModalOpen(false);
    resetModuleForm();
  };

  const closeDiagnosticModal = () => {
    setIsDiagnosticModalOpen(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailModuleId("");
    setDeadlineDraft("");
  };

  const toggleAssetSelection = (assetId: string) => {
    if (isApiMode || isControlled || onCreateModuleFromAsset) {
      setSelectedAssetIds([assetId]);
      return;
    }

    setSelectedAssetIds((previousAssetIds) =>
      previousAssetIds.includes(assetId)
        ? previousAssetIds.filter((id) => id !== assetId)
        : [...previousAssetIds, assetId],
    );
  };

  const moveSequenceItem = async (itemIndex: number, direction: -1 | 1) => {
    const sourceItem = sequenceItems[itemIndex];
    if (!sourceItem) {
      return;
    }

    if (isApiMode && courseId) {
      const currentIndex = orderedCourseModules.findIndex(
        (module) => module.id === sourceItem.id,
      );
      const targetIndex = currentIndex + direction;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= orderedCourseModules.length
      ) {
        return;
      }

      const reorderedModules = [...orderedCourseModules];
      const currentModule = reorderedModules[currentIndex];
      reorderedModules[currentIndex] = reorderedModules[targetIndex];
      reorderedModules[targetIndex] = currentModule;

      try {
        await reorderCourseModulesMutation.mutateAsync({
          courseId,
          data: {
            modules: reorderedModules.map((module, index) => ({
              id: module.id,
              order: index + 1,
            })),
          },
        });
      } catch (error) {
        showErrorToast(error);
      }

      return;
    }

    if (onMoveSequenceItemProp) {
      onMoveSequenceItemProp(sourceItem.id, direction);
      return;
    }

    const targetIndex = itemIndex + direction;

    if (targetIndex < 0 || targetIndex >= sequenceItems.length) {
      return;
    }

    setLocalSequenceItems((previousItems) => {
      const nextItems = [...previousItems];
      const currentItem = nextItems[itemIndex];

      nextItems[itemIndex] = nextItems[targetIndex];
      nextItems[targetIndex] = currentItem;

      return nextItems;
    });
  };

  const deleteSequenceItem = async (itemId: string) => {
    if (isApiMode && courseId) {
      try {
        await deleteCourseModuleMutation.mutateAsync({
          id: itemId,
          courseId,
        });
        showToast.success("Modul berhasil dihapus");
      } catch (error) {
        showErrorToast(error);
      }

      return;
    }

    if (onDeleteSequenceItemProp) {
      onDeleteSequenceItemProp(itemId);
      return;
    }

    setLocalSequenceItems((previousItems) =>
      previousItems.filter((item) => item.id !== itemId),
    );
  };

  const saveNewModule = async () => {
    if (isApiMode && courseId) {
      if (!selectedAssetId) {
        return;
      }

      try {
        await createCourseModuleMutation.mutateAsync({
          courseId,
          data: {
            order: orderedCourseModules.length + 1,
            type: "SUBJECT",
            subjectId: selectedAssetId,
          },
        });
        showToast.success("Modul materi berhasil ditambahkan");
        closeModuleModal();
      } catch (error) {
        showErrorToast(error);
      }

      return;
    }

    const trimmedTitle = moduleTitle.trim();

    if (!onCreateModuleFromAsset && !trimmedTitle) {
      return;
    }

    const selectedAssets = resolvedAssetOptions
      .filter((asset) => selectedAssetIds.includes(asset.id))
      .map((asset) => ({
        ...asset,
        id: `module-${Date.now()}-${asset.id}`,
      }));

    if (onCreateModuleFromAsset) {
      const selectedAssetId = selectedAssetIds[0];
      if (!selectedAssetId) {
        return;
      }

      onCreateModuleFromAsset(selectedAssetId);
      closeModuleModal();
      return;
    }

    const moduleItem: IMateriSequenceItem = {
      id: `materi-sequence-module-${Date.now()}`,
      type: "Modul",
      title: trimmedTitle,
      description:
        moduleDescription.trim() || buildModuleDescription(trimmedTitle),
      formatLabel: selectedAssets[0]?.kind ?? "PDF",
      assets: selectedAssets,
    };

    setLocalSequenceItems((previousItems) => [...previousItems, moduleItem]);
    closeModuleModal();
  };

  const selectDiagnosticTest = async (
    option: ILearningAnalyticsDiagnosticOption,
  ) => {
    if (isApiMode && courseId) {
      if (usedDiagnosticIds.has(option.id)) {
        return;
      }

      try {
        await createCourseModuleMutation.mutateAsync({
          courseId,
          data: {
            order: orderedCourseModules.length + 1,
            type: "DIAGNOSTIC_TEST",
            diagnosticTestId: option.id,
          },
        });
        showToast.success("Tes diagnostik berhasil ditambahkan");
        closeDiagnosticModal();
      } catch (error) {
        showErrorToast(error);
      }

      return;
    }

    if (onCreateDiagnosticFromOption) {
      onCreateDiagnosticFromOption(option.id);
      closeDiagnosticModal();
      return;
    }

    setLocalSequenceItems((previousItems) => {
      const isAlreadyExist = previousItems.some(
        (item) => item.type === "Tes Diagnostik" && item.title === option.title,
      );

      if (isAlreadyExist) {
        return previousItems;
      }

      const testItem: IMateriSequenceItem = {
        id: `materi-sequence-${option.id}-${Date.now()}`,
        type: "Tes Diagnostik",
        title: option.title,
        description: buildDiagnosticDescription(option.title),
        assets: [],
        questionCount: option.questionCount,
        durationMinutes: option.durationMinutes,
      };

      return [...previousItems, testItem];
    });

    closeDiagnosticModal();
  };

  const openSequenceItemDetail = (itemId: string) => {
    if (onViewSequenceItem) {
      onViewSequenceItem(itemId);
      return;
    }

    if (!isApiMode) {
      return;
    }

    setDetailModuleId(itemId);
    setIsDetailModalOpen(true);
  };

  const saveModuleDeadline = async () => {
    if (!courseId || !selectedModule) {
      return;
    }

    try {
      await updateCourseModuleMutation.mutateAsync({
        id: selectedModule.id,
        courseId,
        data: {
          deadline: deadlineDraft
            ? new Date(`${deadlineDraft}T00:00:00`).toISOString()
            : null,
        },
      });
      showToast.success("Deadline modul berhasil diperbarui");
      closeDetailModal();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const isModuleSaveDisabled = isApiMode
    ? !selectedAssetId || createCourseModuleMutation.isPending
    : onCreateModuleFromAsset
      ? !selectedAssetId
      : !moduleTitle.trim();

  return (
    <section className="space-y-3">
      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
        <h2 className="text-xl font-bold text-[#1F2937]">
          Susun Urutan Materi & Tes Diagnostik
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8] md:text-sm">
          Setiap modul sudah mencakup PDF, Video, dan E-LKPD. Tes Diagnostik
          berdiri sendiri di luar modul.
        </p>

        <div className="mt-4 space-y-2.5">
          {courseModulesError ? (
            <article className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-sm text-[#B91C1C]">
              Gagal memuat urutan modul kelas: {courseModulesError.message}
            </article>
          ) : isApiMode && isCourseModulesLoading ? (
            <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-6 text-center text-sm text-[#94A3B8]">
              Memuat urutan materi kelas...
            </article>
          ) : sequenceItems.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">
              Belum ada modul atau tes diagnostik. Tambahkan subject atau tes
              untuk mulai menyusun urutan belajar kelas.
            </article>
          ) : (
            sequenceItems.map((item, index) => (
              <MateriSequenceItemCard
                key={item.id}
                item={item}
                index={index}
                totalItems={sequenceItems.length}
                isMutating={isMutatingCourseModules}
                onMove={moveSequenceItem}
                onView={openSequenceItemDetail}
                onDelete={(itemId) => void deleteSequenceItem(itemId)}
              />
            ))
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModuleModalOpen(true)}
            disabled={isMutatingCourseModules}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Modul
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticModalOpen(true)}
            disabled={isMutatingCourseModules}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 text-sm font-semibold text-[#5B21B6] transition hover:bg-[#EDE9FE]"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Tes Diagnostik
          </button>
        </div>
      </article>

      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <button
            type="button"
            onClick={closeModuleModal}
            className="absolute inset-0 bg-[#0F172A]/45"
            aria-label="Tutup tambah modul"
          />

          <section className="relative z-10 w-full max-w-[540px] rounded-3xl bg-white p-5 shadow-[0_24px_48px_rgba(15,23,42,0.24)] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-4xl font-bold leading-none text-[#1F2937]">
                {isApiMode ? "Tambah Modul dari Subject" : "Tambah Modul Baru"}
              </h3>
              <button
                type="button"
                onClick={closeModuleModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#64748B]"
                aria-label="Tutup popup"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {!isApiMode ? (
                <>
                  <div>
                    <label
                      htmlFor="materi-module-title"
                      className="mb-1.5 block text-sm font-semibold text-[#334155]"
                    >
                      Nama Modul
                    </label>
                    <input
                      id="materi-module-title"
                      type="text"
                      value={moduleTitle}
                      onChange={(event) => setModuleTitle(event.target.value)}
                      placeholder="Contoh: Modul Aljabar"
                      className="h-11 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#DBEAFE]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="materi-module-description"
                      className="mb-1.5 block text-sm font-semibold text-[#334155]"
                    >
                      Deskripsi
                    </label>
                    <textarea
                      id="materi-module-description"
                      value={moduleDescription}
                      onChange={(event) =>
                        setModuleDescription(event.target.value)
                      }
                      placeholder="Deskripsi modul"
                      rows={3}
                      className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#DBEAFE]"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
                  Subject yang tampil di bawah ini diambil dari data materi yang
                  sudah Anda buat. Pilih satu subject untuk dijadikan modul
                  berikutnya di urutan kelas.
                </div>
              )}

              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#334155]">
                  {isApiMode ? "Pilih Subject Materi" : "Pilih Aset Materi"}
                </p>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-2">
                  {isApiMode && isSubjectsLoading ? (
                    <div className="rounded-xl bg-white px-3 py-8 text-center text-sm text-[#94A3B8]">
                      Memuat subject materi...
                    </div>
                  ) : resolvedAssetOptions.length === 0 ? (
                    <div className="rounded-xl bg-white px-3 py-8 text-center text-sm text-[#94A3B8]">
                      Belum ada subject yang tersedia. Buat subject terlebih
                      dahulu agar bisa ditambahkan ke urutan kelas.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {resolvedAssetOptions.map((asset) => {
                        const isSelected = selectedAssetIds.includes(asset.id);
                        const isAlreadyAdded =
                          isApiMode && usedSubjectIds.has(asset.id);
                        const AssetIcon = getAssetIconComponent(asset.kind);
                        const textClassName = getAssetTextClassName(asset.kind);

                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => toggleAssetSelection(asset.id)}
                            disabled={isAlreadyAdded}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition",
                              isSelected
                                ? "border-[#BFDBFE] bg-[#EFF6FF]"
                                : "border-transparent bg-transparent hover:bg-[#F8FAFC]",
                              isAlreadyAdded &&
                                "cursor-not-allowed border-[#E5E7EB] bg-[#F8FAFC] opacity-60",
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <AssetIcon
                                className={cn("h-4 w-4", textClassName)}
                              />
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  textClassName,
                                )}
                              >
                                {asset.kind}
                              </span>
                              <span className="text-sm font-semibold text-[#334155]">
                                {asset.label}
                              </span>
                            </div>

                            {isAlreadyAdded ? (
                              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                                Sudah ditambahkan
                              </span>
                            ) : isSelected ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                                <svg
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  className="h-3.5 w-3.5"
                                >
                                  <path
                                    d="M5 10.5L8.5 14L15 7.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="mt-1.5 text-xs font-semibold text-[#94A3B8]">
                  {isApiMode
                    ? `${availableSubjectCount} subject belum dimasukkan ke kelas`
                    : `${selectedAssetCount} aset dipilih`}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={closeModuleModal}
                className="h-11 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void saveNewModule()}
                disabled={isModuleSaveDisabled}
                className="h-11 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createCourseModuleMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan Modul"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isDiagnosticModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <button
            type="button"
            onClick={closeDiagnosticModal}
            className="absolute inset-0 bg-[#0F172A]/45"
            aria-label="Tutup pilih tes"
          />

          <section className="relative z-10 w-full max-w-[670px] rounded-3xl bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.24)] md:p-5">
            <div className="mb-3 flex items-center justify-between gap-4 px-1">
              <h3 className="text-4xl font-bold leading-none text-[#1F2937]">
                Pilih Tes Diagnostik
              </h3>
              <button
                type="button"
                onClick={closeDiagnosticModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#64748B]"
                aria-label="Tutup popup"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {isApiMode && isDiagnosticTestsLoading ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#94A3B8]">
                  Memuat tes diagnostik...
                </div>
              ) : resolvedDiagnosticOptions.length === 0 ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#94A3B8]">
                  Belum ada tes diagnostik yang tersedia.
                </div>
              ) : (
                resolvedDiagnosticOptions.map((option) => {
                  const alreadyAdded = isApiMode
                    ? usedDiagnosticIds.has(option.id)
                    : sequenceItems.some(
                        (item) =>
                          item.type === "Tes Diagnostik" &&
                          item.title === option.title,
                      );

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => void selectDiagnosticTest(option)}
                      disabled={
                        alreadyAdded || createCourseModuleMutation.isPending
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                        alreadyAdded
                          ? "cursor-not-allowed border-[#E5E7EB] bg-[#F8FAFC] opacity-60"
                          : "border-[#E5E7EB] bg-white hover:border-[#C4B5FD] hover:bg-[#FAF5FF]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
                          <NotebookIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[#1F2937]">
                            {option.title}
                          </p>
                          <p className="text-sm text-[#94A3B8]">
                            {option.questionCount} soal ·{" "}
                            {option.durationMinutes} menit
                          </p>
                        </div>
                      </div>

                      {alreadyAdded && (
                        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                          Sudah ditambahkan
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      <MateriModuleDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        module={selectedModule}
        diagnosticTest={selectedDiagnosticTest}
        elkpds={selectedModule?.subject?.eLKPDs ?? []}
        students={students}
        isLoading={isSelectedModuleLoading}
        isDiagnosticLoading={isSelectedDiagnosticTestLoading}
        deadlineDraft={deadlineDraft}
        onDeadlineChange={setDeadlineDraft}
        onSaveDeadline={() => void saveModuleDeadline()}
        isSaving={updateCourseModuleMutation.isPending}
      />
    </section>
  );
}

export function BaseKelolaELKPDSection({
  elkpdItems,
  buildELKPDScoreHref,
}: IBaseKelolaELKPDSectionProps) {
  const [activeActionItemId, setActiveActionItemId] = useState<string>("");

  useEffect(() => {
    if (elkpdItems.length === 0) {
      setActiveActionItemId("");
      return;
    }

    const hasActiveItem = elkpdItems.some(
      (item) => item.id === activeActionItemId,
    );

    if (!hasActiveItem) {
      setActiveActionItemId("");
    }
  }, [activeActionItemId, elkpdItems]);

  return (
    <section className="space-y-2.5">
      {elkpdItems.length === 0 ? (
        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-6 text-center text-sm text-[#94A3B8]">
          Belum ada E-LKPD di kelas ini.
        </article>
      ) : (
        elkpdItems.map((item) => {
          const isActionMode = item.id === activeActionItemId;

          return (
            <article
              key={item.id}
              className={cn(
                "rounded-2xl border px-4 py-3 transition",
                isActionMode
                  ? "border-[#CBD5E1] bg-[#F8FAFC]"
                  : "border-[#E5E7EB] bg-white",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveActionItemId(item.id)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-semibold text-[#1F2937]">
                    {item.title}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  {isActionMode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveActionItemId("")}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#94A3B8] transition hover:bg-[#E2E8F0] hover:text-[#64748B]"
                        aria-label={`Tutup aksi ${item.title}`}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M6 8L10 12L14 8"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                        aria-label={`Lihat ${item.title}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626] transition hover:bg-[#FEE2E2]"
                        aria-label={`Hapus ${item.title}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {buildELKPDScoreHref ? (
                        <Link
                          href={buildELKPDScoreHref(item.id)}
                          className="inline-flex h-8 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                        >
                          Nilai
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-8 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                        >
                          Nilai
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0px_4px_16px_rgba(148,163,184,0.08)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-2">
        {icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
            {icon}
          </span>
        )}

        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
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

export function TeacherOverviewSection({
  classDetail,
  materials,
}: ITeacherOverviewSectionProps) {
  const activeStudents = Math.max(
    Math.round(classDetail.studentCount * 0.4),
    Math.min(classDetail.studentCount, classDetail.students.length),
  );

  const moduleCount = Math.max(materials.length + 1, 4);

  const recentActivities = useMemo<IRecentActivityItem[]>(() => {
    const firstStudent = classDetail.students[0];
    const secondStudent = classDetail.students[1];
    const thirdStudent = classDetail.students[2];
    const fourthStudent = classDetail.students[3];

    return [
      {
        id: "activity-1",
        text: `${firstStudent?.fullname ?? "Siswa"} menyelesaikan Tes Diagnostik 2 dengan nilai ${firstStudent?.score ?? classDetail.averageScore}`,
        timeLabel: "5 menit lalu",
      },
      {
        id: "activity-2",
        text: `${secondStudent?.fullname ?? "Siswa"} bertanya di Forum Diskusi ${classDetail.classCode ?? classDetail.className}`,
        timeLabel: "12 menit lalu",
      },
      {
        id: "activity-3",
        text: `${thirdStudent?.fullname ?? "Siswa"} bergabung ke kelas ${classDetail.className}`,
        timeLabel: "1 jam lalu",
      },
      {
        id: "activity-4",
        text: `${fourthStudent?.fullname ?? "Siswa"} memerlukan video remedial di soal no. 4`,
        timeLabel: "3 jam lalu",
      },
    ];
  }, [
    classDetail.averageScore,
    classDetail.classCode,
    classDetail.className,
    classDetail.students,
  ]);

  return (
    <section className="space-y-4">
      <article className="overflow-hidden rounded-2xl bg-linear-to-r from-[#2563EB] to-[#2563EB]/90 px-4 py-4 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] md:px-5 md:py-5">
        <p className="text-sm font-medium text-white/75">Dashboard Analitik</p>
        <h2 className="mt-1 text-xl font-bold leading-tight md:text-2xl">
          Mau lihat hasil analisis siswa kelas {classDetail.className}?
        </h2>
        <p className="mt-1.5 text-sm text-white/80">
          Pantau perkembangan nilai, emosi belajar, dan progres seluruh siswa di
          kelas ini sekarang.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="?view=Laporan"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Analisis Keseluruhan Kelas
          </Link>
          <Link
            href="?view=Siswa"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1E40AF]"
          >
            Analisis Per Siswa
          </Link>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#2563EB]">
            {activeStudents}/{classDetail.studentCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Siswa Aktif</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#16A34A]">
            {moduleCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Modul Tersusun</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#4F46E5]">
            {Math.round(classDetail.averageScore)}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Rata-Rata Nilai</p>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-center">
          <p className="text-3xl font-extrabold leading-none text-[#DC2626]">
            {classDetail.remedialCount}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Butuh Remedial</p>
        </article>
      </div>

      <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
        <h3 className="text-sm font-semibold text-[#111827]">
          Aktivitas Terkini
        </h3>
        <div className="mt-3 space-y-2.5">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2.5">
              <span className="mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border border-[#D1D5DB] bg-[#F3F4F6]" />
              <div>
                <p className="text-sm text-[#334155]">{activity.text}</p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  {activity.timeLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
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
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
            <ReportScoreChart scoreBuckets={scoreBuckets} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ReportEmotionChart emotionSegments={emotionSegments} />

              <SectionCard
                title="Emosi saat Membaca Materi"
                icon={
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                <LADDonutChart segments={emotionSegments} />
              </SectionCard>
            </div>
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
