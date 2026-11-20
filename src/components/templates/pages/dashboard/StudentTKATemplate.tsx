"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { ClassSearchBar } from "@/components/molecules/searchBar/ClassSearchBar";
import { FilterTabs } from "@/components/molecules/FilterTabs";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { AlertBanner } from "@/components/molecules/AlertBanner";
import { TablePagination } from "@/components/molecules/table";
import { useDebouncedValue, useStudentTkaList } from "@/services";
import type {
  TKAStudentListItem,
  TKAStudentListStatusFilter,
} from "@/types/tka";
import { formatDiagnosticTime } from "@/utils";
import {
  formatTkaDateTime,
  isMobileOrTabletUserAgent,
} from "@/utils/tka";

const FILTER_TABS = [
  { key: "", label: "Semua" },
  { key: "AVAILABLE", label: "Tersedia" },
  { key: "IN_PROGRESS", label: "Sedang Mengerjakan" },
  { key: "COMPLETED", label: "Selesai" },
];

function formatScore(score?: number) {
  if (score === undefined) return "-";
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export default function StudentTKATemplate() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TKAStudentListStatusFilter | "">("");
  const [isMobile, setIsMobile] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setIsMobile(isMobileOrTabletUserAgent(navigator.userAgent));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, limit]);

  const { data, isLoading, isError, error } = useStudentTkaList({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const now = Date.now();

  const resolveCta = (test: TKAStudentListItem) => {
    if (test.attemptStatus === "COMPLETED") {
      return {
        label: "Lihat Hasil",
        href: `/student/tka/${test.id}/result`,
        disabled: false,
      };
    }

    if (test.attemptStatus === "IN_PROGRESS") {
      return {
        label: "Lanjutkan",
        href: `/student/tka/${test.id}/exam`,
        disabled: isMobile,
      };
    }

    if (test.status === "AVAILABLE") {
      const startMs = test.startAt ? new Date(test.startAt).getTime() : NaN;
      const endMs = test.endAt ? new Date(test.endAt).getTime() : NaN;
      if (Number.isFinite(startMs) && now < startMs) {
        return { label: "Belum Dimulai", href: "", disabled: true };
      }
      if (Number.isFinite(endMs) && now > endMs) {
        return { label: "Waktu Masuk Berakhir", href: "", disabled: true };
      }
      return {
        label: "Mulai TKA",
        href: `/student/tka/${test.id}/exam`,
        disabled: isMobile,
      };
    }

    return { label: "Tes Ditutup", href: "", disabled: true };
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            TKA
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Tes Kompetensi Akademik untuk sekolahmu
          </p>
        </div>
      </header>

      {isMobile && (
        <AlertBanner variant="warning">
          TKA hanya dapat dikerjakan melalui laptop atau komputer desktop.
          Tombol mulai dinonaktifkan pada perangkat ini.
        </AlertBanner>
      )}

      <ClassSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari judul TKA..."
      />

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Daftar TKA"
          action={
            <FilterTabs
              tabs={FILTER_TABS}
              activeTab={status}
              onTabChange={(key) =>
                setStatus(key as TKAStudentListStatusFilter | "")
              }
            />
          }
        />

        {isLoading && (
          <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
            Memuat TKA...
          </div>
        )}

        {!isLoading && isError && (
          <div className="getmath-card p-8 text-center text-sm text-rose-600">
            {error.message}
          </div>
        )}

        {!isLoading && !isError && (data?.tests.length ?? 0) === 0 && (
          <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
            Belum ada TKA yang cocok dengan filter.
          </div>
        )}

        {!isLoading && !isError && (data?.tests.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data?.tests.map((test) => {
              const cta = resolveCta(test);
              return (
                <article key={test.id} className="getmath-card flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-bold leading-snug text-lottie-teal">
                        {test.title}
                      </h2>
                      <p className="mt-1 text-xs text-lottie-zinc-500">
                        {test.teacherName ?? "Guru TKA"} · {test.schoolName}
                      </p>
                      <p className="text-xs text-lottie-zinc-500">
                        {test.schoolYear ?? "-"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        test.attemptStatus === "COMPLETED"
                          ? "success"
                          : test.attemptStatus === "IN_PROGRESS"
                            ? "warning"
                            : "info"
                      }
                    >
                      {test.attemptStatus === "COMPLETED"
                        ? "Selesai"
                        : test.attemptStatus === "IN_PROGRESS"
                          ? "Sedang Mengerjakan"
                          : test.status === "AVAILABLE"
                            ? "Tersedia"
                            : "Ditutup"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-lottie-zinc-500 sm:grid-cols-4">
                    <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide">Soal</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                        {test.totalQuestions}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide">Durasi</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                        {test.durationMinutes} menit
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide">
                        {test.attemptStatus === "COMPLETED" ? "Skor" : "Sisa Waktu"}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                        {test.attemptStatus === "COMPLETED"
                          ? formatScore(test.myScore)
                          : test.attemptStatus === "IN_PROGRESS" &&
                              test.remainingSeconds !== undefined
                            ? formatDiagnosticTime(test.remainingSeconds)
                            : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide">Jadwal</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                        {test.startAt && test.endAt
                          ? `${formatTkaDateTime(test.startAt)} - ${formatTkaDateTime(test.endAt)}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-lottie-mist pt-3">
                    <p className="text-xs text-lottie-zinc-500">
                      {test.description ?? "TKA sekolah"}
                    </p>
                    <button
                      type="button"
                      disabled={cta.disabled}
                      onClick={() => cta.href && router.push(cta.href)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-lottie-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cta.label}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {data?.pagination && data.pagination.totalItems > 0 && (
          <TablePagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={setLimit}
          />
        )}
      </section>
    </div>
  );
}
