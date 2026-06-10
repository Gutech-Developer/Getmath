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
  role?: "admin" | "teacher";
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherPreviewDiagnosticContent({ id, role = "teacher" }: IProps) {
  const basePath = role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";
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
          onClick={() => router.push(`${basePath}/manage-diagnostics`)}
          className="rounded-2xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-5 py-2 text-sm font-semibold text-white cursor-pointer"
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
            onClick={() => router.push(`${basePath}/manage-diagnostics`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-lottie-teal/10 bg-white text-lottie-teal hover:bg-lottie-teal/5 transition cursor-pointer"
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
            router.push(`${basePath}/manage-diagnostics/${id}/edit`)
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-lottie-teal/5 px-4 py-2.5 text-sm font-semibold text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
        >
          <EditIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      <DiagnosticPreviewBody test={test} />
    </div>
  );
}
