"use client";

import {
  LearningAnalyticsClassHeaderCard,
  LearningAnalyticsViewSwitcher,
} from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import { Modal } from "@/components/molecules/Modal";
import { showToast, showErrorToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type {
  ClassAnalyticsViewType,
  IClassLearningAnalyticsDetail,
  ILearningAnalyticsHeaderCardData,
} from "@/types/learningAnalytics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useELKPDGradesByModule,
  useGradeELKPD,
  useResetELKPDGrade,
} from "@/services/hooks/useGsProgress";
import { useGsModulesByCourse } from "@/services/hooks/useGsCourseModule";

type AnalyticsRole = "admin" | "teacher";

interface ILearningAnalyticsELKPDScoreContentProps {
  role: AnalyticsRole;
  classDetail: IClassLearningAnalyticsDetail;
  elkpdId: string;
  courseId?: string;
}

interface IELKPDScoreRow {
  id: string;
  fullname: string;
  nis: string;
  initial: string;
  avatarTone: string;
  isOnline: boolean;
  scoreLabel: string;
  isScored: boolean;
  scoreValue: number | null;
  submissionUrl?: string;
  teacherNote?: string | null;
}

const ELKPD_AVATAR_ACCENTS = [
  "bg-[#CA8A04]",
  "bg-[#2563EB]",
  "bg-[#16A34A]",
  "bg-[#7C3AED]",
  "bg-[#0EA5E9]",
  "bg-[#F97316]",
] as const;

function buildClassHref(role: AnalyticsRole, slug: string): string {
  if (role === "admin") {
    return `/admin/dashboard/learning-analytics/${slug}`;
  }

  return `/teacher/dashboard/class-list/${slug}`;
}function GradeInputCell({
  elkpdId,
  studentId,
  initialScore,
  initialNote,
  isScored,
  onResetClick,
}: {
  elkpdId: string;
  studentId: string;
  initialScore: number | null;
  initialNote: string | null;
  isScored: boolean;
  onResetClick: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [scoreValue, setScoreValue] = useState(
    initialScore !== null ? String(initialScore) : "",
  );
  const [noteValue, setNoteValue] = useState(initialNote || "");
  const { mutate: gradeELKPD, isPending } = useGradeELKPD(elkpdId);
  const { mutate: resetGrade, isPending: isResetting } =
    useResetELKPDGrade(elkpdId);

  const handleSave = () => {
    const numScore = parseInt(scoreValue, 10);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
      gradeELKPD(
        {
          studentId,
          input: {
            score: numScore,
            teacherNote: noteValue || undefined,
          },
        },
        {
          onSuccess: () => {
            showToast.success("Nilai berhasil diperbarui");
            setIsEditing(false);
          },
          onError: (error) => {
            showErrorToast(error);
          },
        },
      );
    } else {
      showToast.error("Nilai harus antara 0 - 100");
    }
  };

  const handleCancel = () => {
    setScoreValue(initialScore !== null ? String(initialScore) : "");
    setNoteValue(initialNote || "");
    setIsEditing(false);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResetClick();
  };

  if (isEditing) {
    return (
      <div className="flex flex-col items-end gap-2 p-1 min-w-[200px]">
        <div className="flex items-center gap-1.5 w-full justify-end">
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              disabled={isPending}
              autoFocus
              className="w-16 rounded border border-[#E5E7EB] px-2 py-1 text-right text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
            <span className="ml-1 text-[10px] text-[#94A3B8]">/100</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              title="Simpan"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#94A3B8] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              title="Batal"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <textarea
          placeholder="Tambah catatan untuk siswa (opsional)..."
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          disabled={isPending}
          className="w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none min-h-[60px]"
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-end gap-2">
      {isScored && !isEditing && (
        <button
          onClick={handleReset}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] opacity-0 transition hover:bg-[#FEE2E2] hover:text-[#EF4444] group-hover:opacity-100 disabled:opacity-50"
          title="Hapus Nilai"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      <div
        className={cn(
          "cursor-pointer rounded px-2 py-1 transition hover:bg-[#F1F5F9]",
          isScored ? "text-[#16A34A]" : "text-[#94A3B8]",
        )}
        onClick={() => setIsEditing(true)}
        title="Klik untuk mengubah nilai"
      >
        {initialScore !== null ? `${initialScore}/100` : "-/100"}
      </div>
    </div>
  );
}



export default function LearningAnalyticsELKPDScoreContent({
  role,
  classDetail,
  elkpdId,
  courseId,
}: ILearningAnalyticsELKPDScoreContentProps) {
  const router = useRouter();
  const baseClassHref = buildClassHref(role, classDetail.slug);
  const backHref = `${baseClassHref}?view=${encodeURIComponent("Kelola E-LKPD")}`;

  const selectedELKPD = useMemo(
    () => classDetail.elkpdItems?.find((item) => item.id === elkpdId),
    [classDetail.elkpdItems, elkpdId],
  );

  const activeCourseId = courseId || classDetail.id || "";
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 1. Fetch Grades & Students for this ELKPD module
  const { data: gradesData } = useELKPDGradesByModule(elkpdId);

  // 2. Fetch Modules (for Materi and ELKPD counts)
  const { data: modulesData } = useGsModulesByCourse(activeCourseId);

  const { mutate: resetGrade, isPending: isResetting } =
    useResetELKPDGrade(elkpdId);

  const handleConfirmReset = () => {
    if (!resetTarget) return;

    resetGrade(resetTarget.id, {
      onSuccess: () => {
        showToast.success("Nilai berhasil dihapus");
        setResetTarget(null);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    });
  };

  const scoreRows = useMemo<IELKPDScoreRow[]>(() => {
    // Primary source is gradesData from the specific ELKPD module endpoint
    const apiGrades = gradesData?.eLKPDs?.[0]?.grades;

    if (apiGrades && apiGrades.length > 0) {
      return apiGrades.map((grade, index) => {
        const isScored = grade.score !== null;
        return {
          id: grade.studentId,
          fullname: grade.fullName || `Siswa ${index + 1}`,
          nis: grade.NIS || grade.studentId.substring(0, 7),
          initial: (grade.fullName || "?").trim().charAt(0).toUpperCase(),
          avatarTone: ELKPD_AVATAR_ACCENTS[index % ELKPD_AVATAR_ACCENTS.length],
          isOnline: true,
          isScored,
        
          scoreValue: grade.score,
          scoreLabel: isScored ? `${grade.score}/100` : "-/100",
          submissionUrl: grade.submissionId ? "#" : undefined, // Link if submission exists
          teacherNote: grade.teacherNote,
        };
      });
    }

    // Fallback to classDetail students if no API data yet
    return classDetail.students.map((student, index) => {
      const scoreSeed = elkpdId.length + student.fullname.length + index;
      const isScored = scoreSeed % 4 === 0;
      const scoreValue = Math.max(
        55,
        Math.min(100, (student.score || 70) + ((index % 3) - 1) * 4),
      );

      return {
        id: student.id,
        fullname: student.fullname,
        nis: student.nis,
        initial: student.fullname.trim().charAt(0).toUpperCase() || "?",
        avatarTone: ELKPD_AVATAR_ACCENTS[index % ELKPD_AVATAR_ACCENTS.length],
        isOnline: (elkpdId.length + student.fullname.length + index) % 3 !== 1,
        isScored,
        scoreValue: isScored ? scoreValue : null,
        scoreLabel: isScored ? `${scoreValue}/100` : "-/100",
        teacherNote: null,
      };
    });
  }, [classDetail.students, elkpdId, gradesData]);

  const headerData: ILearningAnalyticsHeaderCardData = {
    className: classDetail.className,
    classCode: classDetail.classCode ?? "MATH-X-001",
    subjectLabel: classDetail.subjectLabel ?? "Matematika",
    metadata: [
      classDetail.gradeLabel ?? "Umum",
      classDetail.semesterLabel ?? "Ganjil 2024/2025",
      `${classDetail.studentCount} Siswa`,
    ],
  };

  const badgeByType: Partial<Record<ClassAnalyticsViewType, number>> = {
    Siswa: scoreRows.length,
    Materi: modulesData?.length ?? classDetail.materials?.length ?? 0,
    "Kelola E-LKPD":
      modulesData?.filter((m) => m.subject?.eLKPDTitle).length ??
      classDetail.elkpdItems?.length ??
      0,
  };

  return (
    <div className="space-y-4">
      <LearningAnalyticsClassHeaderCard data={headerData} />

      <LearningAnalyticsViewSwitcher
        activeType="Kelola E-LKPD"
        onChange={(nextType) => {
          router.push(`${baseClassHref}?view=${encodeURIComponent(nextType)}`);
        }}
        badgeByType={badgeByType}
      />

      <div className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          + Kembali ke Daftar E-LKPD
        </Link>

        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
            <h2 className="truncate text-sm font-semibold text-[#1F2937]">
              {selectedELKPD?.title ?? "Nilai E-LKPD"}
            </h2>
            <p className="shrink-0 text-xs text-[#94A3B8]">
              {selectedELKPD?.dueLabel
                ? `Batas pengumpulan: ${selectedELKPD.dueLabel}`
                : "Pantau nilai siswa"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FCFCFD]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                    Nama Siswa
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                    NIS
                  </th>
                   <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                    Catatan 
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                    Nilai
                  </th>
                </tr>
              </thead>

              <tbody>
                {scoreRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-[#94A3B8]"
                    >
                      Belum ada data siswa untuk E-LKPD ini.
                    </td>
                  </tr>
                ) : (
                  scoreRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#E5E7EB] transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                              row.avatarTone,
                            )}
                          >
                            {row.initial}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F2937]">
                              {row.fullname}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                row.isOnline
                                  ? "text-[#16A34A]"
                                  : "text-[#9CA3AF]",
                              )}
                            >
                              {row.isOnline ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-[#94A3B8]">
                        {row.nis}
                      </td>

                      <td className="px-4 py-3 text-sm text-[#94A3B8]">
                        {row.teacherNote || "-"}
                      </td>

                      

                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        <GradeInputCell
                          elkpdId={elkpdId}
                          studentId={row.id}
                          initialScore={row.scoreValue}
                          initialNote={row.teacherNote ?? null}
                          isScored={row.isScored}
                          onResetClick={() =>
                            setResetTarget({ id: row.id, name: row.fullname })
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title="Hapus Nilai"
        size="md"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm font-semibold text-[#991B1B]">
              Yakin ingin menghapus nilai E-LKPD siswa ini?
            </p>
            <p className="mt-1 text-sm text-[#B91C1C]">
              {resetTarget?.name} · Nilai akan dihapus permanen.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="h-12 flex-1 rounded-2xl bg-[#DC2626] px-5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResetting ? "Menghapus..." : "Hapus Nilai"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
