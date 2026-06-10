"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { showToast } from "@/libs/toast";
import { useRouter } from "next/navigation";
import { useGsMyDiagnosticTests, useGsAllDiagnosticTests, useGsDeleteDiagnosticTest } from "@/services";
import type { GsDiagnosticTest } from "@/types/gs-diagnostic-test";
import { TablePagination } from "@/components/molecules/table";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mapper                                                             */
/* ------------------------------------------------------------------ */
interface IDiagnosticItem {
  id: string;
  title: string;
  description: string;
  packageSummaries: Array<{
    label: string;
    questionCount: number;
  }>;
  totalQuestions: number;
  durationMinutes: number | string;
  kkm: number | string;
  dateLabel: string;
}

function mapGsDiagnosticToItem(dt: GsDiagnosticTest): IDiagnosticItem {
  // Prefer backend-provided totalQuestions or questions length
  const totalQuestions =
    dt.questions?.length ?? dt.totalQuestions ?? 0;

  const packageSummaries = [
    {
      label: "Soal",
      questionCount: totalQuestions,
    },
  ];

  return {
    id: dt.id,
    title: dt.testName,
    description: dt.description ?? "",
    packageSummaries,
    totalQuestions,
    durationMinutes: dt.durationMinutes ?? "-",
    kkm: dt.passingScore ?? "-",
    dateLabel: new Date(dt.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherManageDiagnosticsContent({
  role = "teacher",
}: {
  role?: "admin" | "teacher";
}) {
  const router = useRouter();
  const basePath = role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const { data: myData, isLoading: myLoading } = useGsMyDiagnosticTests(
    { page, limit },
    { enabled: role === "teacher" }
  );

  const { data: allData, isLoading: allLoading } = useGsAllDiagnosticTests(
    { page, limit },
    { enabled: role === "admin" }
  );

  const diagnosticTestsData = role === "admin" ? allData : myData;
  const isLoading = role === "admin" ? allLoading : myLoading;

  const deleteMutation = useGsDeleteDiagnosticTest();

  const diagnostics: IDiagnosticItem[] = (
    diagnosticTestsData?.diagnosticTests ?? []
  ).map(mapGsDiagnosticToItem);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus "${title}"?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => showToast.success("Tes diagnostik berhasil dihapus"),
      onError: () => showToast.error("Gagal menghapus tes diagnostik"),
    });
  };

  /* ------------------------------------------------------------------ */
  return (
    <section className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            Kelola Tes Diagnostik
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {diagnostics.length} tes tersedia · Tes ini dapat dipilih ke dalam
            tiap kelas
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(`${basePath}/manage-diagnostics/create`)
          }
          className="inline-flex items-center gap-2.5 rounded-2xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-5 py-3 text-sm"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Tes Diagnostik</span>
        </button>
      </header>

      <ul className="space-y-3">
        {isLoading && (
          <li className="py-10 text-center text-sm text-[#9CA3AF]">
            Memuat tes diagnostik…
          </li>
        )}
        {!isLoading && diagnostics.length === 0 && (
          <li className="py-10 text-center text-sm text-[#9CA3AF]">
            Belum ada tes diagnostik. Klik &quot;Tambah Tes Diagnostik&quot;
            untuk membuat.
          </li>
        )}
        {diagnostics.map((diagnostic) => (
          <li
            key={diagnostic.id}
            className="getmath-card flex flex-wrap items-start gap-4 px-5 py-5"
          >
            {/* Info */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold leading-tight text-[#111827]">
                {diagnostic.title}
              </h2>
              <p className="mt-1 truncate text-sm text-[#6B7280]">
                {diagnostic.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {diagnostic.packageSummaries.map((pkg) => (
                  <span
                    key={pkg.label}
                    className="inline-flex rounded-full bg-lottie-teal/10 px-3 py-1 text-xs font-semibold text-lottie-teal"
                  >
                    {pkg.label} · {pkg.questionCount} soal
                  </span>
                ))}
                <span className="text-xs text-[#9CA3AF]">
                  {diagnostic.dateLabel}
                </span>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">Soal</p>
                  <p className="mt-0.5 text-base font-semibold text-[#111827]">
                    {diagnostic.totalQuestions}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">KKM</p>
                  <p className="mt-0.5 text-base font-semibold text-[#F97316]">
                    {diagnostic.kkm}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">Menit</p>
                  <p className="mt-0.5 text-base font-semibold text-[#111827]">
                    {diagnostic.durationMinutes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `${basePath}/manage-diagnostics/${diagnostic.id}`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lottie-teal/5 text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
                  aria-label={`Preview ${diagnostic.title}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `${basePath}/manage-diagnostics/${diagnostic.id}/edit`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lottie-teal/5 text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
                  aria-label={`Edit ${diagnostic.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(diagnostic.id, diagnostic.title)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2] cursor-pointer"
                  aria-label={`Hapus ${diagnostic.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {diagnosticTestsData?.pagination && diagnosticTestsData.pagination.totalPages > 1 && (
        <TablePagination
          currentPage={diagnosticTestsData.pagination.currentPage}
          totalPages={diagnosticTestsData.pagination.totalPages}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}
    </section>
  );
}
