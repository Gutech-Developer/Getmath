"use client";

import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { DiagnosticPreviewBody } from "@/components/organisms/learningAnalytics/ClassAnalyticsSequenceComponents";
import { useRouter } from "next/navigation";
import { useGsDiagnosticTestById } from "@/services";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface IProps {
  id: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherPreviewDiagnosticContent({ id }: IProps) {
  const router = useRouter();
  const { data: test, isLoading } = useGsDiagnosticTestById(id);

  /* ---- loading / error ---- */
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat tes diagnostik…
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#9CA3AF]">
          Tes diagnostik tidak ditemukan.
        </p>
        <button
          type="button"
          onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
          className="rounded-2xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F3F4F6]"
            aria-label="Kembali"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">
              {test.testName}
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              {new Date(test.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            router.push(`/teacher/dashboard/manage-diagnostics/${id}/edit`)
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-[#EFF6FF] px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
        >
          <EditIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      <DiagnosticPreviewBody test={test} />
    </div>
  );
}
