"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { showToast } from "@/libs/toast";
import { useRouter } from "next/navigation";
import { useGsMyRemedialTests, useGsAllRemedialTests, useGsDeleteRemedialTest } from "@/services";
import type { GsRemedialTest } from "@/types/gs-remedial";
import { TablePagination } from "@/components/molecules/table";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mapper                                                             */
/* ------------------------------------------------------------------ */
interface IRemedialItem {
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

function mapGsRemedialToItem(rt: GsRemedialTest): IRemedialItem {
  const questions = rt.questions ?? [];
  const packageSet = new Set<string>();
  const packageCountMap: Record<string, number> = {};

  questions.forEach((q) => {
    (q.variants ?? []).forEach((v) => {
      packageSet.add(v.packageLabel);
      packageCountMap[v.packageLabel] = (packageCountMap[v.packageLabel] || 0) + 1;
    });
  });

  const packageSummaries = Array.from(packageSet).map((label) => ({
    label: `Paket ${label}`,
    questionCount: packageCountMap[label],
  }));

  const totalQuestions = rt.totalQuestions ?? questions.length;

  return {
    id: rt.id,
    title: rt.testName,
    description: rt.description ?? "",
    packageSummaries,
    totalQuestions,
    durationMinutes: rt.durationMinutes ?? "-",
    kkm: rt.passingScore ?? "-",
    dateLabel: new Date(rt.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherManageRemedialContent({
  role = "teacher",
}: {
  role?: "admin" | "teacher";
}) {
  const router = useRouter();
  const basePath = role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const { data: myData, isLoading: myLoading } = useGsMyRemedialTests(
    { page, limit },
    { enabled: role === "teacher" }
  );

  const { data: allData, isLoading: allLoading } = useGsAllRemedialTests(
    { page, limit },
    { enabled: role === "admin" }
  );

  const remedialTestsData = role === "admin" ? allData : myData;
  const isLoading = role === "admin" ? allLoading : myLoading;

  const deleteMutation = useGsDeleteRemedialTest();

  const remedials: IRemedialItem[] = (
    remedialTestsData?.remedialTests ?? []
  ).map(mapGsRemedialToItem);
 

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus "${title}"?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => showToast.success("Tes remedial berhasil dihapus"),
      onError: () => showToast.error("Gagal menghapus tes remedial"),
    });
  };

   console.log("ini DataRemedial",remedialTestsData?.remedialTests.forEach((item)=> item.totalQuestions))
  /* ------------------------------------------------------------------ */
  return (
    <section className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            Kelola Tes Remedial
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {remedials.length} tes tersedia · Tes ini dapat dipilih ke dalam
            tiap kelas
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(`${basePath}/manage-remedial/create`)
          }
          className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Tes Remedial</span>
        </button>
      </header>

      <ul className="space-y-3">
        {isLoading && (
          <li className="py-10 text-center text-sm text-[#9CA3AF]">
            Memuat tes remedial…
          </li>
        )}
        {!isLoading && remedials.length === 0 && (
          <li className="py-10 text-center text-sm text-[#9CA3AF]">
            Belum ada tes remedial. Klik &quot;Tambah Tes Remedial&quot;
            untuk membuat.
          </li>
        )}
        {remedials.map((remedial) => (
          <li
            key={remedial.id}
            className="flex flex-wrap items-start gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5"
          >
            {/* Info */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold leading-tight text-[#111827]">
                {remedial.title}
              </h2>
              <p className="mt-1 truncate text-sm text-[#6B7280]">
                {remedial.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {remedial.packageSummaries.map((pkg) => (
                  <span
                    key={pkg.label}
                    className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]"
                  >
                    {pkg.label} · {pkg.questionCount} soal
                  </span>
                ))}
                <span className="text-xs text-[#9CA3AF]">
                  {remedial.dateLabel}
                </span>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">Soal</p>
                  <p className="mt-0.5 text-base font-semibold text-[#111827]">
                    {remedial.totalQuestions}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">KKM</p>
                  <p className="mt-0.5 text-base font-semibold text-[#F97316]">
                    {remedial.kkm}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] px-4 py-2">
                  <p className="text-xs uppercase text-[#9CA3AF]">Menit</p>
                  <p className="mt-0.5 text-base font-semibold text-[#111827]">
                    {remedial.durationMinutes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `${basePath}/manage-remedial/${remedial.id}`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Preview ${remedial.title}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `${basePath}/manage-remedial/${remedial.id}/edit`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Edit ${remedial.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(remedial.id, remedial.title)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                  aria-label={`Hapus ${remedial.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {remedialTestsData?.pagination && remedialTestsData.pagination.totalPages > 1 && (
        <TablePagination
          currentPage={remedialTestsData.pagination.currentPage}
          totalPages={remedialTestsData.pagination.totalPages}
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
