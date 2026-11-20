"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import { Badge } from "@/components/atoms/Badge";
import {
  TKA_EMOTION_COLOR,
  TKA_EMOTION_LABEL,
  TKA_QUESTION_TYPE_LABEL,
} from "@/constant/tka";
import MathText from "@/components/atoms/MathText";
import { ClassSearchBar } from "@/components/molecules/searchBar/ClassSearchBar";
import { FilterTabs } from "@/components/molecules/FilterTabs";
import { StatsCard } from "@/components/molecules/cards/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
} from "@/components/molecules/table";
import LADDonutChart, {
  type IEmotionSegment,
} from "@/components/molecules/classroom/LADDonutChart";
import TkaScoreDistributionChart from "@/components/molecules/tka/TkaScoreDistributionChart";
import { useDebouncedValue, useTkaAnalytics } from "@/services";
import type {
  TKAAnalyticsStatusFilter,
  TKAAttemptStatus,
} from "@/types/tka";
import { formatTkaNumber } from "@/utils/tka";

const STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "IN_PROGRESS", label: "Sedang Mengerjakan" },
];

function statusBadge(status: TKAAttemptStatus) {
  return status === "COMPLETED" ? "success" : "warning";
}

export default function TkaAnalyticsContent({
  testId,
  role = "teacher",
}: {
  testId: string;
  role?: "admin" | "teacher";
}) {
  const router = useRouter();
  const basePath =
    role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TKAAnalyticsStatusFilter>("ALL");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, error } = useTkaAnalytics(testId, {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, limit]);

  const emotionSegments = useMemo<IEmotionSegment[]>(() => {
    const distribution = data?.emotionAnalytics.distribution;
    if (!distribution) return [];
    return Object.entries(distribution)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({
        label: TKA_EMOTION_LABEL[label as keyof typeof TKA_EMOTION_LABEL] ?? label,
        value: Math.round(value * 10000) / 100,
        color: TKA_EMOTION_COLOR[label as keyof typeof TKA_EMOTION_COLOR] ?? "#94A3B8",
      }));
  }, [data?.emotionAnalytics.distribution]);

  if (isLoading) {
    return (
      <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
        Memuat analitik TKA...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="getmath-card space-y-3 p-8 text-center text-sm text-rose-600">
        <p>{error?.message ?? "Analitik TKA tidak ditemukan."}</p>
        <button
          type="button"
          onClick={() => router.push(`${basePath}/manage-tka`)}
          className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke daftar TKA
        </button>
      </div>
    );
  }

  return (
    <section className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(`${basePath}/manage-tka`)}
            className="mb-2 text-sm font-medium text-lottie-teal"
          >
            ← Kembali ke daftar TKA
          </button>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            Analitik TKA
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {data.test.title} · {data.test.schoolName} ·{" "}
            {data.test.totalQuestions} soal
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Segera hadir"
          className="cursor-not-allowed rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#9CA3AF]"
        >
          Unduh Hasil (Segera Hadir)
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Peserta"
          value={`${data.overview.joinedCount}/${data.overview.schoolTotalStudents}`}
          subtitle="siswa bergabung / total sekolah"
          icon={<ThreeUserGroupIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Selesai"
          value={`${data.overview.completedCount}`}
          subtitle={`${data.overview.inProgressCount} sedang mengerjakan`}
          icon={<CheckCircleIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Tingkat Penyelesaian"
          value={`${formatTkaNumber(data.overview.completionRate)}%`}
          subtitle="dari peserta yang bergabung"
          icon={<ClipboardIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Rata-rata Skor"
          value={formatTkaNumber(data.overview.averageScore)}
          subtitle={`${formatTkaNumber(data.overview.averageAnsweredCount, 1)} soal dijawab`}
          icon={<TrendUpIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="getmath-card p-5">
          <h2 className="text-base font-semibold text-[#111827]">
            Distribusi Skor
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Hanya attempt yang sudah selesai.
          </p>
          <TkaScoreDistributionChart data={data.scoreDistribution} />
        </div>

        <div className="getmath-card p-5">
          <h2 className="text-base font-semibold text-[#111827]">
            Ringkasan Emosi Kelas
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            {data.emotionAnalytics.totalSamples} sampel ·{" "}
            {data.emotionAnalytics.participantsWithEmotion} siswa
          </p>
          <LADDonutChart segments={emotionSegments} className="mt-3" />
          <p className="mt-2 text-sm text-[#4B5563]">
            Dominan:{" "}
            <span className="font-semibold text-[#111827]">
              {TKA_EMOTION_LABEL[data.emotionAnalytics.dominant] ??
                data.emotionAnalytics.dominant}
            </span>
          </p>
        </div>
      </div>

      <div className="getmath-card p-5">
        <h2 className="text-base font-semibold text-[#111827]">
          Akurasi per Tipe Soal
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {data.questionTypeStats.map((stat) => (
            <div
              key={stat.questionType}
              className="rounded-2xl border border-[#E5E7EB] p-4"
            >
              <p className="text-sm font-semibold text-[#111827]">
                {TKA_QUESTION_TYPE_LABEL[stat.questionType]}
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                {stat.questionCount} soal
              </p>
              <p className="mt-3 text-2xl font-bold text-lottie-teal">
                {formatTkaNumber(stat.accuracyRate)}%
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                {stat.totalCorrect} benar · {stat.totalWrong} salah ·{" "}
                {stat.totalUnanswered} kosong
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="getmath-card overflow-hidden">
        <div className="border-b border-[#E5E7EB] p-5">
          <h2 className="text-base font-semibold text-[#111827]">
            Analisis per Butir Soal
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Soal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Benar</TableHead>
                <TableHead>Salah</TableHead>
                <TableHead>Kosong</TableHead>
                <TableHead>Akurasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.questionStats.map((question) => (
                <TableRow key={question.questionId}>
                  <TableCell>{question.questionNumber}</TableCell>
                  <TableCell className="max-w-[420px]">
                    <MathText text={question.questionText} />
                  </TableCell>
                  <TableCell>
                    {TKA_QUESTION_TYPE_LABEL[question.questionType]}
                  </TableCell>
                  <TableCell>{question.correctCount}</TableCell>
                  <TableCell>{question.wrongCount}</TableCell>
                  <TableCell>{question.unansweredCount}</TableCell>
                  <TableCell>{formatTkaNumber(question.accuracyRate)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="getmath-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">
              Hasil Siswa
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Klik baris untuk melihat detail jawaban dan emosi.
            </p>
          </div>
          <FilterTabs
            tabs={STATUS_TABS}
            activeTab={status}
            onTabChange={(key) => setStatus(key as TKAAnalyticsStatusFilter)}
          />
        </div>

        <div className="mt-4">
          <ClassSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari nama atau NIS..."
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead>Dijawab</TableHead>
                <TableHead>Emosi</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" >
                    Tidak ada siswa pada filter ini.
                  </TableCell>
                </TableRow>
              )}
              {data.students.map((student) => (
                <TableRow
                  key={student.attemptId}
                  onClick={() =>
                    router.push(
                      `${basePath}/manage-tka/${testId}/analytics/${student.attemptId}`,
                    )
                  }
                >
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>{student.nis ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadge(student.status)}>
                      {student.status === "COMPLETED"
                        ? "Selesai"
                        : "Sedang Mengerjakan"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.score === undefined
                      ? "-"
                      : formatTkaNumber(student.score)}
                  </TableCell>
                  <TableCell>
                    {student.answeredCount}/{student.totalQuestions}
                  </TableCell>
                  <TableCell>
                    {student.dominantEmotion
                      ? TKA_EMOTION_LABEL[student.dominantEmotion] ??
                        student.dominantEmotion
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-lottie-teal">
                      Detail
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.pagination.totalItems > 0 && (
          <TablePagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={setLimit}
          />
        )}
      </div>
    </section>
  );
}
