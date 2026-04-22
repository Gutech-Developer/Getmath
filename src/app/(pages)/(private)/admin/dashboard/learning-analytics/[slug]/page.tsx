import AdminLearningAnalyticsClassTemplate from "@/components/templates/pages/dashboard/AdminLearningAnalyticsClassTemplate";
import type { ClassAnalyticsViewType } from "@/types/learningAnalytics";

const VIEW_TYPES: ClassAnalyticsViewType[] = [
  "Beranda",
  "Siswa",
  "Materi",
  "Kelola E-LKPD",
  "Laporan",
];

function resolveViewType(
  value: string | undefined,
): ClassAnalyticsViewType | undefined {
  if (!value) {
    return undefined;
  }

  return VIEW_TYPES.includes(value as ClassAnalyticsViewType)
    ? (value as ClassAnalyticsViewType)
    : undefined;
}

interface IAdminDashboardLearningAnalyticsClassPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ view?: string }>;
}

export default async function AdminDashboardLearningAnalyticsClass({
  params,
  searchParams,
}: IAdminDashboardLearningAnalyticsClassPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialViewType = resolveViewType(resolvedSearchParams?.view);

  return (
    <AdminLearningAnalyticsClassTemplate
      slug={slug}
      initialViewType={initialViewType}
    />
  );
}
