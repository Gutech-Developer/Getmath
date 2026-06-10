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
  "bg-[#1f2375]",
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
} function GradeForm({
  student,
  elkpdId,
  onClose,
}: {
  student: IELKPDScoreRow;
  elkpdId: string;
  onClose: () => void;
}) {
  const [score, setScore] = useState(
    student.scoreValue !== null ? String(student.scoreValue) : "",
  );
  const [note, setNote] = useState(student.teacherNote || "");
  const [errorMsg, setErrorMsg] = useState("");
  const { mutate: gradeELKPD, isPending } = useGradeELKPD(elkpdId);

  const handleSave = () => {
    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      setErrorMsg("Nilai harus berupa angka antara 0 hingga 100");
      return;
    }
    setErrorMsg("");

    gradeELKPD(
      {
        studentId: student.id,
        input: {
          score: numScore,
          teacherNote: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast.success(`Nilai untuk ${student.fullname} berhasil disimpan`);
          onClose();
        },
        onError: (err) => {
          showErrorToast(err);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Detail Siswa */}
      <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-1">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          Siswa yang Dinilai
        </p>
        <h3 className="text-sm font-bold text-[#1F2937]">{student.fullname}</h3>
        <p className="text-xs text-[#94A3B8]">NIS: {student.nis}</p>
      </div>

      {/* Input Nilai */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
          Nilai E-LKPD (Skala 0 - 100)
        </label>
        <div className="relative flex items-center">
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => {
              setScore(e.target.value);
              setErrorMsg("");
            }}
            placeholder="Masukkan nilai"
            className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            disabled={isPending}
            autoFocus
          />
          <span className="absolute right-4 text-xs font-semibold text-[#94A3B8]">
            / 100
          </span>
        </div>
        {errorMsg && (
          <p className="text-xs font-semibold text-[#EF4444]">{errorMsg}</p>
        )}
      </div>

      {/* Input Catatan */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
          Catatan Guru (Umpan Balik)
        </label>
        <textarea
          placeholder="Berikan umpan balik atau catatan terkait pengerjaan E-LKPD siswa (opsional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm text-[#1F2937] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50 min-h-[100px] resize-none"
          disabled={isPending}
        />
      </div>

      {/* Button Actions */}
      <div className="flex flex-col gap-2 sm:flex-row pt-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] disabled:opacity-50"
          disabled={isPending}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-10 flex-1 rounded-xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Menyimpan...
            </>
          ) : (
            "Simpan Nilai"
          )}
        </button>
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
  const backHref = `${baseClassHref}?view=${encodeURIComponent("Nilai E-LKPD")}`;

  const selectedELKPD = useMemo(
    () => classDetail.elkpdItems?.find((item) => item.id === elkpdId),
    [classDetail.elkpdItems, elkpdId],
  );

  const activeCourseId = courseId || classDetail.id || "";
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [gradeTarget, setGradeTarget] = useState<IELKPDScoreRow | null>(null);

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
          submissionUrl: grade.submissionId ? "#" : undefined,
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
    "Nilai E-LKPD":
      modulesData?.filter((m) => m.subject?.eLKPDTitle).length ??
      classDetail.elkpdItems?.length ??
      0,
  };

  return (
    <div className="space-y-4">
      <LearningAnalyticsClassHeaderCard data={headerData} />

      <LearningAnalyticsViewSwitcher
        activeType="Nilai E-LKPD"
        onChange={(nextType) => {
          router.push(`${baseClassHref}?view=${encodeURIComponent(nextType)}`);
        }}
        badgeByType={badgeByType}
      />

      <div className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-semibold text-lottie-teal transition hover:opacity-90"
        >
          ← Kembali ke Daftar E-LKPD
        </Link>

        <section className="getmath-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 bg-white">
            <h2 className="truncate text-sm font-bold text-[#1F2937]">
              {selectedELKPD?.title ?? "Nilai E-LKPD"}
            </h2>
            <p className="shrink-0 text-xs text-[#94A3B8] font-medium">
              {selectedELKPD?.dueLabel
                ? `Batas pengumpulan: ${selectedELKPD.dueLabel}`
                : "Pantau nilai siswa"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FCFCFD]">
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] min-w-[240px]">
                    Nama Siswa
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] min-w-[140px]">
                    Status Penilaian
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] max-w-[280px] min-w-[220px]">
                    Catatan Guru
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] min-w-[120px]">
                    Nilai E-LKPD
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] min-w-[160px]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {scoreRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-[#94A3B8]"
                    >
                      Belum ada data siswa untuk E-LKPD ini.
                    </td>
                  </tr>
                ) : (
                  scoreRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#E5E7EB] last:border-0 transition-colors hover:bg-[#F8FAFC]"
                    >
                      {/* 1. Nama Siswa & NIS */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm",
                              row.avatarTone,
                            )}
                          >
                            {row.initial}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F2937]">
                              {row.fullname}
                            </p>
                            <p className="text-xs text-[#94A3B8] font-medium">
                              NIS: {row.nis}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status Penilaian */}
                      <td className="px-5 py-3.5">
                        {row.isScored ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#047857]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                            Sudah Dinilai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#64748B]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                            Belum Dinilai
                          </span>
                        )}
                      </td>

                      {/* 3. Catatan Guru */}
                      <td className="px-5 py-3.5 text-sm text-[#475569] max-w-[280px]">
                        {row.teacherNote ? (
                          <p
                            className="truncate italic text-[#475569]/80 font-medium"
                            title={row.teacherNote}
                          >
                            "{row.teacherNote}"
                          </p>
                        ) : (
                          <span className="text-[#CBD5E1] font-normal">-</span>
                        )}
                      </td>

                      {/* 4. Nilai E-LKPD */}
                      <td className="px-5 py-3.5 text-center">
                        {row.isScored && row.scoreValue !== null ? (
                          <span
                            className={cn(
                              "inline-flex rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm border",
                              row.scoreValue >= 75
                                ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                                : "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]",
                            )}
                          >
                            {row.scoreValue} / 100
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1] text-sm font-normal">
                            - / 100
                          </span>
                        )}
                      </td>

                      {/* 5. Aksi */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {row.isScored ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setGradeTarget(row)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lottie-teal/20 bg-white px-2.5 text-xs font-semibold text-[#475569] transition hover:bg-lottie-teal/5 hover:text-lottie-teal cursor-pointer"
                                title="Ubah Nilai"
                              >
                                <svg
                                  className="h-3.5 w-3.5 text-[#64748B]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setResetTarget({
                                    id: row.id,
                                    name: row.fullname,
                                  })
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#EF4444] transition hover:bg-[#FEF2F2]"
                                title="Hapus Nilai"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
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
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setGradeTarget(row)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-2.5 text-xs cursor-pointer"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Beri Nilai
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Input Nilai */}
      <Modal
        isOpen={!!gradeTarget}
        onClose={() => {
          if (!isResetting) setGradeTarget(null);
        }}
        title="Beri Nilai E-LKPD"
        size="md"
      >
        {gradeTarget && (
          <GradeForm
            student={gradeTarget}
            elkpdId={elkpdId}
            onClose={() => setGradeTarget(null)}
          />
        )}
      </Modal>

      {/* Modal Hapus Nilai */}
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
