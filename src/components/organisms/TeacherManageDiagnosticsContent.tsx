"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { showToast } from "@/libs/toast";
import { useRouter } from "next/navigation";
import { useGsMyDiagnosticTests, useGsDeleteDiagnosticTest } from "@/services";
import type { GsDiagnosticTest } from "@/types/gs-diagnostic-test";

/* ------------------------------------------------------------------ */
/*  Mapper                                                             */
/* ------------------------------------------------------------------ */
interface IDiagnosticItem {
  id: string;
  title: string;
  description: string;
  typeTags: string[];
  totalQuestions: number;
  durationMinutes: number;
  kkm: number;
  dateLabel: string;
}

function mapGsDiagnosticToItem(dt: GsDiagnosticTest): IDiagnosticItem {
  const totalQuestions =
    dt.packages?.reduce((s, p) => s + (p.questions?.length ?? 0), 0) ?? 0;
  return {
    id: dt.id,
    title: dt.testName,
    description: dt.description ?? "",
    typeTags: dt.packages?.length
      ? dt.packages.map((_, i) => `Tipe ${String.fromCharCode(65 + i)}`)
      : ["Tipe A"],
    totalQuestions,
    durationMinutes: dt.durationMinutes,
    kkm: dt.passingScore,
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
export default function TeacherManageDiagnosticsContent() {
  const router = useRouter();
  const { data: diagnosticTestsData, isLoading } = useGsMyDiagnosticTests({
    limit: 50,
  });
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
            router.push("/teacher/dashboard/manage-diagnostics/create")
          }
          className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
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
            className="flex flex-wrap items-start gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5"
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
                {diagnostic.typeTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]"
                  >
                    {tag}
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
                      `/teacher/dashboard/manage-diagnostics/${diagnostic.id}`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Preview ${diagnostic.title}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/teacher/dashboard/manage-diagnostics/${diagnostic.id}/edit`,
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Edit ${diagnostic.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(diagnostic.id, diagnostic.title)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                  aria-label={`Hapus ${diagnostic.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
