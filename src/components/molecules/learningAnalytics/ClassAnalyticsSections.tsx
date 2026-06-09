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
import ChatIcon from "@/components/atoms/icons/ChatIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { MathSymbolAvatar } from "@/components/atoms/MathSymbolAvatar";
import { WelcomeBanner } from "@/components/molecules/cards/WelcomeBanner";
import { DonutChart } from "@/components/molecules/charts/DonutChart";
import { MateriModuleDetailModal } from "@/components/organisms/learningAnalytics/MateriModuleDetailModal";
import { Modal } from "@/components/molecules/Modal";
import { TablePagination } from "@/components/molecules/table";
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
  useGsDiagnosticTestsByTeacher,
  useGsMySubjects,
  useGsSubjectsByTeacher,
  useGsReorderCourseModules,
  useGsUpdateCourseModule,
} from "@/services";
import {
  useGsRemedialTestById,
  useGsMyRemedialTests,
  useGsRemedialTestsByTeacher,
} from "@/services/hooks/useGsRemedialTest";
import { 
  useGsDiagnosticScores, 
  useGsRemedialScores 
} from "@/services/hooks/useGsProgress";
import type { GsCourseModule } from "@/types/gs-course";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/libs/api";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { 
  useEmotionDistributionOverall,
  useDiagnosticTestDistribution,
  useRemedialTestDistribution
} from "@/services/hooks/useLAD";
import { mapDistributionToSegments } from "@/components/templates/pages/classroom/ClassLADPageTemplate";

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
  actionNode?: ReactNode;
}

interface IBaseBerandaSectionProps {
  reportSummaryCards: IClassAnalyticsReportSummaryCard[];
  materials: ILearningAnalyticsMaterialItem[];
  students: ILearningAnalyticsStudentListItem[];
}

interface IBaseSiswaSectionProps {
  students: ILearningAnalyticsStudentListItem[];
  buildStudentDetailHref?: (studentId: string, studentName: string) => string;
  onKickStudent?: (student: ILearningAnalyticsStudentListItem) => void;
  isKickingStudent?: boolean;
}

export interface IBaseMateriSectionProps {
  materials: ILearningAnalyticsMaterialItem[];
  courseId?: string;
  teacherId?: string;
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
  classId: string;
  buildStudentDetailHref?: (studentId: string, studentName: string) => string;
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
  { type: "Nilai E-LKPD", icon: ClipboardIcon },
  { type: "Nilai Test", icon: ClipboardIcon },
  { type: "Laporan", icon: TrendUpIcon },
  { type: "Forum", icon: ChatIcon },
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
    totalQuestions: 0,
  },
  {
    id: "diagnostic-2",
    title: "Tes Diagnostik 2 - Fungsi Kuadrat",
    questionCount: 1,
    durationMinutes: 45,
    totalQuestions: 0,
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
      const diagnosticTitle = module.testName ?? `Tes Diagnostik ${index + 1}`;
      const diagnosticDescription = module.description?.trim();

      return {
        id: module.id,
        type: "Tes Diagnostik",
        title: diagnosticTitle,
        description: diagnosticDescription
          ? `${diagnosticDescription} · ${deadlineLabel}`
          : deadlineLabel,
        assets: [],
        durationMinutes:
          module.diagnosticTest?.durationMinutes ?? module.durationMinutes,
        passingScore:
          module.diagnosticTest?.passingScore ?? module.passingScore,
        questionCount: (module.diagnosticTest as any)?.totalQuestions ?? 5,
      } satisfies IMateriSequenceItem;
    }

    if (module.type === "REMEDIAL") {
      const remedialTitle = module.testName ?? `Tes Remedial ${index + 1}`;
      const remedialDescription = module.description?.trim();

      return {
        id: module.id,
        type: "Tes Remedial",
        title: remedialTitle,
        description: remedialDescription
          ? `${remedialDescription} · ${deadlineLabel}`
          : deadlineLabel,
        assets: [],
        durationMinutes:
          module.remedialTest?.durationMinutes ?? module.durationMinutes,
        passingScore: module.remedialTest?.passingScore ?? module.passingScore,
        questionCount: (module.remedialTest as any)?.totalQuestions ?? 5,
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
  actionNode,
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
      actionNode={actionNode}
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
        progress: student.progress ?? inferStudentProgress(student, index),
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
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
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
  teacherId,
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
  const queryClient = useQueryClient();
  const [localApiModules, setLocalApiModules] = useState<GsCourseModule[]>([]);

  const isControlled = !isApiMode && Array.isArray(sequenceItemsProp);
  const [localSequenceItems, setLocalSequenceItems] = useState<
    IMateriSequenceItem[]
  >(() => buildInitialMateriSequence(materials));
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModuleId, setDetailModuleId] = useState("");
  const [moduleToDelete, setModuleToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deadlineDraft, setDeadlineDraft] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [diagnosticPage, setDiagnosticPage] = useState(1);
  const [diagnosticItemsPerPage, setDiagnosticItemsPerPage] = useState(10);

  const {
    data: courseModules,
    isLoading: isCourseModulesLoading,
    error: courseModulesError,
  } = useGsModulesByCourse(courseId ?? "");

  useEffect(() => {
    if (courseModules) {
      setLocalApiModules(
        [...courseModules].sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        }),
      );
    }
  }, [courseModules]);

  const { data: mySubjectsData, isLoading: isMySubjectsLoading } = useGsMySubjects(
    { limit: 200 },
    { enabled: isApiMode && !teacherId },
  );
  const { data: teacherSubjectsData, isLoading: isTeacherSubjectsLoading } = useGsSubjectsByTeacher(
    teacherId ?? "",
    { limit: 200 },
  );
  const subjectsData = teacherId ? teacherSubjectsData : mySubjectsData;
  const isSubjectsLoading = teacherId ? isTeacherSubjectsLoading : isMySubjectsLoading;

  const { data: myDiagnosticTestsData, isLoading: isMyDiagnosticTestsLoading } =
    useGsMyDiagnosticTests(
      { page: diagnosticPage, limit: diagnosticItemsPerPage },
      { enabled: isApiMode && !teacherId },
    );
  const { data: teacherDiagnosticTestsData, isLoading: isTeacherDiagnosticTestsLoading } =
    useGsDiagnosticTestsByTeacher(
      teacherId ?? "",
      { page: diagnosticPage, limit: diagnosticItemsPerPage },
    );
  const diagnosticTestsData = teacherId ? teacherDiagnosticTestsData : myDiagnosticTestsData;
  const isDiagnosticTestsLoading = teacherId ? isTeacherDiagnosticTestsLoading : isMyDiagnosticTestsLoading;

  const { data: myRemedialTestsData, isLoading: isMyRemedialTestsLoading } =
    useGsMyRemedialTests({ page: 1, limit: 100 }, { enabled: isApiMode && !teacherId });
  const { data: teacherRemedialTestsData, isLoading: isTeacherRemedialTestsLoading } =
    useGsRemedialTestsByTeacher(teacherId ?? "", { page: 1, limit: 100 });
  const remedialTestsData = teacherId ? teacherRemedialTestsData : myRemedialTestsData;
  const isRemedialTestsLoading = teacherId ? isTeacherRemedialTestsLoading : isMyRemedialTestsLoading;

  const [selectedDiagnosticForPairing, setSelectedDiagnosticForPairing] =
    useState<ILearningAnalyticsDiagnosticOption | null>(null);

  const createCourseModuleMutation = useGsCreateCourseModule();
  const updateCourseModuleMutation = useGsUpdateCourseModule();
  const reorderCourseModulesMutation = useGsReorderCourseModules();
  const deleteCourseModuleMutation = useGsDeleteCourseModule();
  const {
    data: selectedModule,
    isLoading: isSelectedModuleLoading,
    error: selectedModuleError,
  } = useGsModuleById(isApiMode ? detailModuleId : "");

  const orderedCourseModules = useMemo(
    () => [...localApiModules],
    [localApiModules],
  );

  const selectedModuleFromCourseModules = useMemo(
    () => orderedCourseModules.find((module) => module.id === detailModuleId),
    [detailModuleId, orderedCourseModules],
  );

  const resolvedSelectedModule = useMemo(() => {
    if (!selectedModule && !selectedModuleFromCourseModules) {
      return undefined;
    }

    if (!selectedModule) {
      return selectedModuleFromCourseModules;
    }

    if (!selectedModuleFromCourseModules) {
      return selectedModule;
    }

    return {
      ...selectedModuleFromCourseModules,
      ...selectedModule,
      subject:
        selectedModule.subject ?? selectedModuleFromCourseModules.subject,
      diagnosticTest:
        selectedModule.diagnosticTest ??
        selectedModuleFromCourseModules.diagnosticTest,
      remedialTest:
        selectedModule.remedialTest ??
        selectedModuleFromCourseModules.remedialTest,
    };
  }, [selectedModule, selectedModuleFromCourseModules]);

  const {
    data: selectedDiagnosticTest,
    isLoading: isSelectedDiagnosticTestLoading,
  } = useGsDiagnosticTestById(resolvedSelectedModule?.diagnosticTestId ?? "");
  const {
    data: selectedRemedialTest,
    isLoading: isSelectedRemedialTestLoading,
  } = useGsRemedialTestById(resolvedSelectedModule?.remedialTestId ?? "");

  const nextOrder = useMemo(() => {
    if (orderedCourseModules.length === 0) return 1;
    const maxOrder = Math.max(...orderedCourseModules.map((m) => m.order ?? 0));
    return maxOrder + 1;
  }, [orderedCourseModules]);

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
        questionCount: test.totalQuestions ?? 0,
        totalQuestions: test.totalQuestions ?? 0,
        durationMinutes: test.durationMinutes,
      })),
    [diagnosticTestsData],
  );

  const apiRemedialOptions = useMemo(
    () =>
      (remedialTestsData?.remedialTests ?? []).map((test) => ({
        id: test.id,
        title: test.testName,
        questionCount: test.questions?.length ?? test.totalQuestions ?? 0,
        durationMinutes: test.durationMinutes,
      })),
    [remedialTestsData],
  );

  const diagnosticPagination = diagnosticTestsData?.pagination;
  const diagnosticTotalPages = diagnosticPagination?.totalPages ?? 1;

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
    if (!isDiagnosticModalOpen) {
      return;
    }

    setDiagnosticPage(1);
  }, [isDiagnosticModalOpen]);

  useEffect(() => {
    if (!diagnosticPagination) {
      return;
    }

    if (diagnosticPage > diagnosticPagination.totalPages) {
      setDiagnosticPage(diagnosticPagination.totalPages || 1);
    }
  }, [diagnosticPage, diagnosticPagination]);

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
    if (!resolvedSelectedModule) {
      setDeadlineDraft("");
      return;
    }

    setDeadlineDraft(toDateInputValue(resolvedSelectedModule.deadline));
  }, [resolvedSelectedModule]);

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

  const originalOrderIds = useMemo(() => {
    return [...(courseModules ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((m) => m.id);
  }, [courseModules]);

  const currentOrderIds = useMemo(() => {
    return localApiModules.map((m) => m.id);
  }, [localApiModules]);

  const hasOrderChanged = useMemo(() => {
    if (originalOrderIds.length !== currentOrderIds.length) return false;
    return originalOrderIds.some((id, index) => id !== currentOrderIds[index]);
  }, [originalOrderIds, currentOrderIds]);

  const handleSaveReorder = async () => {
    if (!courseId) return;
    try {
      await reorderCourseModulesMutation.mutateAsync({
        courseId,
        data: {
          modules: localApiModules.map((module, index) => ({
            id: module.id,
            order: index + 1,
          })),
        },
      });
      showToast.success("Urutan materi berhasil diperbarui");
    } catch (error) {
      showErrorToast(error);
      // On error/failure, force a refetch to correct positions
      queryClient.invalidateQueries({
        queryKey: queryKeys.gsCourseModules.byCourse(courseId),
      });
    }
  };

  const handleCancelReorder = () => {
    if (courseModules) {
      setLocalApiModules(
        [...courseModules].sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        }),
      );
    }
  };

  const moveSequenceItem = async (itemIndex: number, direction: -1 | 1) => {
    const sourceItem = sequenceItems[itemIndex];
    if (!sourceItem) {
      return;
    }

    if (isApiMode && courseId) {
      const currentIndex = localApiModules.findIndex(
        (module) => module.id === sourceItem.id,
      );
      const targetIndex = currentIndex + direction;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= localApiModules.length
      ) {
        return;
      }

      const reorderedModules = [...localApiModules];
      const currentModule = reorderedModules[currentIndex];
      reorderedModules[currentIndex] = reorderedModules[targetIndex];
      reorderedModules[targetIndex] = currentModule;

      // Update local state immediately for instant feedback
      setLocalApiModules(reorderedModules);

      // Auto save the new order in backend
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
        // Force refetch to rollback to original order in case of failure
        queryClient.invalidateQueries({
          queryKey: queryKeys.gsCourseModules.byCourse(courseId),
        });
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

  const handleTriggerDelete = (itemId: string) => {
    const item = sequenceItems.find((i) => i.id === itemId);
    if (item) {
      setModuleToDelete({ id: itemId, title: item.title });
    }
  };

  const deleteSequenceItem = async () => {
    if (!moduleToDelete) return;
    const itemId = moduleToDelete.id;

    if (isApiMode && courseId) {
      try {
        await deleteCourseModuleMutation.mutateAsync({
          id: itemId,
          courseId,
        });
        showToast.success("Modul berhasil dihapus");
        setModuleToDelete(null);
        if (isDetailModalOpen) setIsDetailModalOpen(false);
      } catch (error) {
        showErrorToast(error);
      }

      return;
    }

    if (onDeleteSequenceItemProp) {
      onDeleteSequenceItemProp(itemId);
      setModuleToDelete(null);
      return;
    }

    setLocalSequenceItems((previousItems) =>
      previousItems.filter((item) => item.id !== itemId),
    );
    setModuleToDelete(null);
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
            order: nextOrder,
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

  const confirmPairingAndSave = async (remedialId: string) => {
    if (!selectedDiagnosticForPairing || !courseId) return;
    try {
      await createCourseModuleMutation.mutateAsync({
        courseId,
        data: {
          order: nextOrder,
          type: "DIAGNOSTIC_TEST",
          diagnosticTestId: selectedDiagnosticForPairing.id,
          remedialTestId: remedialId,
        },
      });
      showToast.success("Tes diagnostik dan remedial berhasil dipasangkan!");
      setSelectedDiagnosticForPairing(null);
      closeDiagnosticModal();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const selectDiagnosticTest = (option: ILearningAnalyticsDiagnosticOption) => {
    if (isApiMode && courseId) {
      if (usedDiagnosticIds.has(option.id)) {
        return;
      }
      setSelectedDiagnosticForPairing(option);
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
    if (!courseId || !resolvedSelectedModule) {
      return;
    }

    try {
      await updateCourseModuleMutation.mutateAsync({
        id: resolvedSelectedModule.id,
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
          Setiap modul dapat mencakup PDF, Video, dan E-LKPD. Tes Diagnostik
          dapat memiliki remedial terpasang di dalamnya. Anda dapat memindahkan
          modul naik/turun untuk merubah urutan.
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
                onDelete={handleTriggerDelete}
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
              <h3 className="text-2xl font-bold leading-none text-[#1F2937]">
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
                            {/* error */}
                            {option.totalQuestions} soal ·
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

            {isApiMode && diagnosticTotalPages > 1 && (
              <div className="mt-4 border-t border-[#E5E7EB] pt-3">
                <TablePagination
                  currentPage={diagnosticPage}
                  totalPages={diagnosticTotalPages}
                  itemsPerPage={diagnosticItemsPerPage}
                  onPageChange={setDiagnosticPage}
                  onItemsPerPageChange={(items) => {
                    setDiagnosticItemsPerPage(items);
                    setDiagnosticPage(1);
                  }}
                  className="py-0"
                />
              </div>
            )}
          </section>
        </div>
      )}

      {selectedDiagnosticForPairing && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDiagnosticForPairing(null)}
          title="Pasangkan dengan Tes Remedial"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#EFF6FF] bg-[#EFF6FF] p-4 text-sm text-[#1E40AF]">
              <p className="font-semibold text-xs text-[#2563EB] uppercase tracking-wider">
                Tes Diagnostik Terpilih
              </p>
              <p className="mt-1 font-bold text-base text-[#1E3A8A] leading-snug">
                {selectedDiagnosticForPairing.title}
              </p>
              <p className="mt-1 text-xs text-[#2563EB] font-medium">
                {selectedDiagnosticForPairing.questionCount} Soal ·{" "}
                {selectedDiagnosticForPairing.durationMinutes} Menit
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]">
                Pilih Tes Remedial Pasangan{" "}
                <span className="text-[#EF4444]">*</span>
              </label>
              <p className="text-xs text-[#6B7280]">
                Siswa yang tidak mencapai KKM pada tes diagnostik ini akan
                secara otomatis diarahkan untuk mengerjakan kuis remedial
                terpilih.
              </p>

              {isRemedialTestsLoading ? (
                <div className="py-6 text-center text-sm text-[#9CA3AF]">
                  Memuat daftar tes remedial...
                </div>
              ) : apiRemedialOptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
                  <p className="text-sm text-[#9CA3AF]">
                    Belum ada bank soal tes remedial.
                  </p>
                  <a
                    href="/teacher/dashboard/manage-remedial/create"
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    Buat Tes Remedial Baru
                  </a>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 thinnest-scrollbar">
                  {apiRemedialOptions.map((remedial) => (
                    <button
                      key={remedial.id}
                      type="button"
                      onClick={() => void confirmPairingAndSave(remedial.id)}
                      disabled={createCourseModuleMutation.isPending}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left transition hover:border-[#2563EB] hover:bg-[#EFF6FF] group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#1E40AF] truncate">
                          {remedial.title}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {remedial.questionCount} Soal ·{" "}
                          {remedial.durationMinutes} Menit
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#2563EB] ml-3 shrink-0 rounded-lg bg-[#EFF6FF] px-2.5 py-1 transition group-hover:bg-[#2563EB] group-hover:text-white">
                        Pilih & Pasangkan
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedDiagnosticForPairing(null)}
                className="h-11 rounded-2xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}

      <MateriModuleDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        module={resolvedSelectedModule}
        diagnosticTest={selectedDiagnosticTest}
        remedialTest={selectedRemedialTest}
        elkpds={
          resolvedSelectedModule?.subject?.eLKPDTitle
            ? [
                {
                  id: resolvedSelectedModule.subject.id, // Using subject id as a fallback for elkpd id
                  title: resolvedSelectedModule.subject.eLKPDTitle,
                  description: resolvedSelectedModule.subject.eLKPDDescription,
                  fileUrl: resolvedSelectedModule.subject.eLKPDFileUrl || "",
                },
              ]
            : []
        }
        students={students}
        isLoading={isSelectedModuleLoading && !resolvedSelectedModule}
        isDiagnosticLoading={isSelectedDiagnosticTestLoading}
        isRemedialLoading={isSelectedRemedialTestLoading}
        deadlineDraft={deadlineDraft}
        onDeadlineChange={setDeadlineDraft}
        onSaveDeadline={() => void saveModuleDeadline()}
        isSaving={updateCourseModuleMutation.isPending}
        onDelete={() => handleTriggerDelete(detailModuleId)}
        isDeleting={deleteCourseModuleMutation.isPending}
      />

      <Modal
        isOpen={!!moduleToDelete}
        onClose={() => setModuleToDelete(null)}
        title="Hapus Modul"
        size="md"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm font-semibold text-[#991B1B]">
              Yakin ingin menghapus modul ini?
            </p>
            <p className="mt-1 text-sm text-[#B91C1C]">
              {moduleToDelete?.title} · Seluruh data progres siswa pada modul
              ini akan hilang permanen.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setModuleToDelete(null)}
              className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={deleteSequenceItem}
              disabled={deleteCourseModuleMutation.isPending}
              className="h-12 flex-1 rounded-2xl bg-[#DC2626] px-5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteCourseModuleMutation.isPending
                ? "Menghapus..."
                : "Hapus Modul"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export function BaseNilaiTestSection({ courseId }: { courseId?: string }) {
  const { data: modules, isPending } = useGsModulesByCourse(courseId ?? "");
  const [expandedModuleId, setExpandedModuleId] = useState<string>("");
  const [activeScoreType, setActiveScoreType] = useState<"DIAGNOSTIC" | "REMEDIAL">("DIAGNOSTIC");

  const diagnosticModules = useMemo(() => {
    return modules?.filter((m) => m.type === "DIAGNOSTIC_TEST") || [];
  }, [modules]);

  if (isPending) {
    return (
      <section className="space-y-2.5">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-6 text-center text-sm text-[#94A3B8]">
          Memuat data modul...
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {diagnosticModules.length === 0 ? (
        <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-6 text-center text-sm text-[#94A3B8]">
          Belum ada Tes Diagnostik di kelas ini.
        </article>
      ) : (
        diagnosticModules.map((m) => {
          const isExpanded = expandedModuleId === m.id;
          return (
            <div key={m.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0px_4px_16px_rgba(148,163,184,0.08)]">
              <div 
                className="flex cursor-pointer items-center justify-between" 
                onClick={() => {
                  setExpandedModuleId(isExpanded ? "" : m.id);
                  setActiveScoreType("DIAGNOSTIC"); // default tab
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <NotebookIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      {m.diagnosticTest?.testName || "Tes Diagnostik"}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#64748B]">Tes Diagnostik & Remedial</p>
                  </div>
                </div>
                <div className="text-[#94A3B8] transition-transform duration-200">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={cn("h-5 w-5", isExpanded && "rotate-180")}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-5 border-t border-[#F1F5F9] pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => setActiveScoreType("DIAGNOSTIC")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-semibold transition",
                        activeScoreType === "DIAGNOSTIC" 
                        ? "bg-[#2563EB] text-white" 
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      )}
                    >
                      Nilai Diagnostik
                    </button>
                    <button 
                      onClick={() => setActiveScoreType("REMEDIAL")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-semibold transition",
                        activeScoreType === "REMEDIAL" 
                        ? "bg-[#2563EB] text-white" 
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      )}
                    >
                      Nilai Remedial
                    </button>
                  </div>
                  
                  <NilaiTestScoreTable moduleId={m.id} type={activeScoreType} />
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}

function NilaiTestScoreTable({ moduleId, type }: { moduleId: string; type: "DIAGNOSTIC" | "REMEDIAL" }) {
  if (type === "DIAGNOSTIC") {
    return <DiagnosticScoreTable moduleId={moduleId} />;
  }
  return <RemedialScoreTable moduleId={moduleId} />;
}

function DiagnosticScoreTable({ moduleId }: { moduleId: string }) {
  const { data, isPending, error } = useGsDiagnosticScores(moduleId);

  if (isPending) return <div className="p-4 text-center text-sm text-[#94A3B8]">Memuat nilai diagnostik...</div>;
  if (error) return <div className="p-4 text-center text-sm text-[#EF4444]">Gagal memuat nilai diagnostik.</div>;

  const scores = data?.scores || [];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Nama Siswa</th>
            <th className="px-4 py-3 text-left font-semibold text-[#64748B]">NIS</th>
            <th className="px-4 py-3 text-center font-semibold text-[#64748B]">Percobaan</th>
            <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Nilai Terbaik</th>
            <th className="px-4 py-3 text-center font-semibold text-[#64748B]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {scores.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-[#94A3B8]">Belum ada nilai diagnostik.</td>
            </tr>
          ) : (
            scores.map((s, i) => (
              <tr key={i} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3 font-medium text-[#0F172A]">{s.fullName}</td>
                <td className="px-4 py-3 text-[#64748B]">{s.NIS}</td>
                <td className="px-4 py-3 text-center text-[#64748B]">{s.totalAttempts}</td>
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{s.bestScore ?? "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    s.isPassed ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#B91C1C]"
                  )}>
                    {s.isPassed ? "Tuntas" : "Belum Tuntas"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RemedialScoreTable({ moduleId }: { moduleId: string }) {
  const { data, isPending, error } = useGsRemedialScores(moduleId);

  if (isPending) return <div className="p-4 text-center text-sm text-[#94A3B8]">Memuat nilai remedial...</div>;
  if (error) return <div className="p-4 text-center text-sm text-[#EF4444]">Gagal memuat nilai remedial.</div>;

  const scores = data?.scores || [];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Nama Siswa</th>
            <th className="px-4 py-3 text-left font-semibold text-[#64748B]">NIS</th>
            <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Nilai</th>
            <th className="px-4 py-3 text-center font-semibold text-[#64748B]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {scores.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-[#94A3B8]">Belum ada nilai remedial.</td>
            </tr>
          ) : (
            scores.map((s, i) => (
              <tr key={i} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3 font-medium text-[#0F172A]">{s.fullName}</td>
                <td className="px-4 py-3 text-[#64748B]">{s.NIS}</td>
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{s.score ?? "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    s.isPassed ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#B91C1C]"
                  )}>
                    {s.isPassed ? "Tuntas" : "Belum Tuntas"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
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
  classId,
}: {
  classId: string;
}) {
  const [distributionType, setDistributionType] = useState<"diagnostic" | "remedial">("diagnostic");

  const { data: diagnosticDist, isPending: isDiagPending } = useDiagnosticTestDistribution(classId);
  const { data: remedialDist, isPending: isRemPending } = useRemedialTestDistribution(classId);

  const rawDist = distributionType === "diagnostic" ? diagnosticDist : remedialDist;
  const activeDist = rawDist
    ? ("buckets" in rawDist ? rawDist : rawDist.data)
    : undefined;
  const isPending = distributionType === "diagnostic" ? isDiagPending : isRemPending;

  const scoreBuckets = useMemo(() => {
    if (!activeDist?.buckets) {
      return [
        { label: "0-20", value: 0, color: "#EF4444" },
        { label: "21-40", value: 0, color: "#F97316" },
        { label: "41-60", value: 0, color: "#F59E0B" },
        { label: "61-80", value: 0, color: "#3B82F6" },
        { label: "81-100", value: 0, color: "#10B981" },
      ];
    }
    const colorMap: Record<string, string> = {
      "0-20": "#EF4444",
      "21-40": "#F97316",
      "41-60": "#F59E0B",
      "61-80": "#3B82F6",
      "81-100": "#10B981",
    };
    return activeDist.buckets.map((b) => ({
      label: b.range,
      value: b.count,
      color: colorMap[b.range] || "#64748B",
    }));
  }, [activeDist]);

  const maxCount = useMemo(
    () => Math.max(...scoreBuckets.map((bucket) => bucket.value), 1),
    [scoreBuckets],
  );

  const averageScore = activeDist?.averageScore ?? 0;
  const totalSamples = activeDist?.totalSamples ?? 0;

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5 shadow-[0px_4px_16px_rgba(148,163,184,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Distribusi Nilai Siswa</h3>
          <p className="mt-1 text-xs text-[#64748B]">
            {!isPending && (
              <>
                Rata-rata: <span className="font-semibold text-[#2563EB]">{averageScore.toFixed(1)}</span>
                <span className="mx-2 text-[#CBD5E1]">|</span>
                Sampel: <span className="font-semibold text-[#0F172A]">{totalSamples} Sesi</span>
              </>
            )}
            {isPending && "Memuat data..."}
          </p>
        </div>

        <select
          value={distributionType}
          onChange={(e) => setDistributionType(e.target.value as "diagnostic" | "remedial")}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] shadow-sm outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
        >
          <option value="diagnostic">Tes Diagnostik</option>
          <option value="remedial">Tes Remedial</option>
        </select>
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-4 md:p-5">
        {isPending ? (
          <div className="flex h-44 items-center justify-center text-sm text-[#64748B] font-medium">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Memuat grafik distribusi...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart
              data={scoreBuckets}
              margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
              barSize={44}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [`${value} Siswa`, "Jumlah"]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {scoreBuckets.map((entry, i) => (
                  <Cell key={i} fill={entry.color} className="transition-all duration-300 hover:opacity-90" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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
  buildStudentDetailHref?: (studentId: string, studentName: string) => string;
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
                  href={buildStudentDetailHref(student.id, student.fullname)}
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
            {activeStudents}
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
  classId,
  buildStudentDetailHref,
}: IBaseLaporanSectionProps) {
  const [reportMode, setReportMode] = useState<ReportMode>(
    "Analisis Nilai & Emosi",
  );

  const {data: emotionOverall, isPending} = useEmotionDistributionOverall(classId)

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
            <ReportScoreChart classId={classId} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <LADDonutChart
                        segments={mapDistributionToSegments(
                          emotionOverall?.moduleLearning.distribution
                        )}
                      />
                    </SectionCard>
            
                    <SectionCard
                      title="Emosi saat Tes Diagnostik"
                      icon={
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                    >
                      <LADDonutChart
                        segments={mapDistributionToSegments(
                          emotionOverall?.remedial.distribution
                        )}
                      />
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
