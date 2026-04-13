import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import Link from "next/link";

export interface ISummaryStat {
  label: string;
  value: number;
  color: string;
}

export interface IScoreBucket {
  label: string;
  value: number;
  color: string;
}

export interface IEmotionSegment {
  label: string;
  value: number;
  color: string;
}

export interface IClassAnalytics {
  id: string;
  className: string;
  teacherName: string;
  studentCount: number;
  averageScore: number;
  passedCount: number;
  remedialCount: number;
  progress: number;
}

interface AdminLearningAnalyticsContentProps {
  summaryStats: ISummaryStat[];
  scoreBuckets: IScoreBucket[];
  emotionSegments: IEmotionSegment[];
  classAnalytics: IClassAnalytics[];
}

const SCORE_AXIS_MAX = 37;
const SCORE_AXIS_TICKS = [0, 9, 18, 27, 37];

function buildConicGradient(segments: IEmotionSegment[]) {
  let cursor = 0;
  const colorStops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + segment.value;
    cursor = end;

    return `${segment.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${colorStops.join(",")})`;
}

function SummaryStatCard({ stat }: { stat: ISummaryStat }) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5">
      <p
        className="text-[2rem] font-extrabold leading-none"
        style={{ color: stat.color }}
      >
        {stat.value}
      </p>
      <p className="mt-2 text-[11px] font-medium text-[#9CA3AF]">
        {stat.label}
      </p>
    </article>
  );
}

function ScoreDistributionCard({
  scoreBuckets,
}: {
  scoreBuckets: IScoreBucket[];
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <h2 className="text-sm font-semibold text-[#111827]">
        Distribusi Nilai Global
      </h2>

      <div className="mt-4 rounded-xl border border-[#F0F2F5] bg-[#FCFCFD] px-3 pb-2 pt-3">
        <div className="relative h-36">
          <div className="absolute bottom-7 left-0 top-0 flex flex-col justify-between text-[10px] text-[#9CA3AF]">
            {[...SCORE_AXIS_TICKS].reverse().map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          <div className="absolute bottom-7 left-7 right-0 top-0">
            {SCORE_AXIS_TICKS.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-dashed border-[#E5E7EB]"
                style={{ bottom: `${(tick / SCORE_AXIS_MAX) * 100}%` }}
              />
            ))}
          </div>

          <div className="absolute bottom-7 left-7 right-0 top-0 flex items-end gap-2">
            {scoreBuckets.map((bucket) => (
              <div key={bucket.label} className="flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(bucket.value / SCORE_AXIS_MAX) * 100}%`,
                    backgroundColor: bucket.color,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-7 right-0 flex items-center gap-2 text-[10px] text-[#9CA3AF]">
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

function EmotionDistributionCard({
  emotionSegments,
}: {
  emotionSegments: IEmotionSegment[];
}) {
  const dominantEmotion = emotionSegments.reduce((acc, segment) =>
    segment.value > acc.value ? segment : acc,
  );

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
      <h2 className="text-sm font-semibold text-[#111827]">
        Distribusi Emosi Siswa (Global)
      </h2>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{ background: buildConicGradient(emotionSegments) }}
          />
          <div className="absolute inset-[26px] rounded-full bg-white shadow-[inset_0_0_0_1px_#E5E7EB]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-medium text-[#6B7280]">
              {dominantEmotion.label}: {dominantEmotion.value}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-semibold sm:grid-cols-1">
          {emotionSegments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span style={{ color: segment.color }}>
                {segment.label} {segment.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ClassAnalyticsCard({ classItem }: { classItem: IClassAnalytics }) {
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-3.5 md:px-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">
            {classItem.className}
          </h3>
          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
            {classItem.teacherName} - {classItem.studentCount} siswa
          </p>
        </div>

        <Link
          href={`/admin/dashboard/learning-analytics/${classItem.id}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#F3F4F6]"
          aria-label={`Lihat detail ${classItem.className}`}
        >
          <ChevronLeftIcon className="h-3.5 w-3.5 rotate-180" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-center">
          <p className="text-sm font-bold text-[#2563EB]">
            {classItem.averageScore}
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Rata-rata</p>
        </div>

        <div className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-center">
          <p className="text-sm font-bold text-[#059669]">
            {classItem.passedCount}
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Lulus</p>
        </div>

        <div className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-center">
          <p className="text-sm font-bold text-[#DC2626]">
            {classItem.remedialCount}
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Remedial</p>
        </div>

        <div className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-center">
          <p className="text-sm font-bold text-[#4F46E5]">
            {classItem.progress}%
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Progress</p>
        </div>
      </div>

      <ProgressBar
        value={classItem.progress}
        variant="primary"
        size="sm"
        className="mt-3"
      />
    </article>
  );
}

export default function AdminLearningAnalyticsContent({
  summaryStats,
  scoreBuckets,
  emotionSegments,
  classAnalytics,
}: AdminLearningAnalyticsContentProps) {
  return (
    <div className="w-full  space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[#111827]">
          Learning Analytics Dashboard
        </h1>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Ringkasan analitik semua kelas di platform
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <SummaryStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ScoreDistributionCard scoreBuckets={scoreBuckets} />
        <EmotionDistributionCard emotionSegments={emotionSegments} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#111827]">
          LAD Per Kelas - Klik untuk detail analitik siswa
        </h2>

        <div className="space-y-3">
          {classAnalytics.map((classItem) => (
            <ClassAnalyticsCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      </section>
    </div>
  );
}
