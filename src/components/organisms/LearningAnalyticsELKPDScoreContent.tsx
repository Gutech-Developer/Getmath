"use client";

import {
  LearningAnalyticsClassHeaderCard,
  LearningAnalyticsViewSwitcher,
} from "@/components/molecules/learningAnalytics/ClassAnalyticsSections";
import { cn } from "@/libs/utils";
import type {
  ClassAnalyticsViewType,
  IClassLearningAnalyticsDetail,
  ILearningAnalyticsHeaderCardData,
} from "@/types/learningAnalytics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type AnalyticsRole = "admin" | "teacher";

interface ILearningAnalyticsELKPDScoreContentProps {
  role: AnalyticsRole;
  classDetail: IClassLearningAnalyticsDetail;
  elkpdId: string;
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
}

function buildScoreRows(
  classDetail: IClassLearningAnalyticsDetail,
  elkpdId: string,
): IELKPDScoreRow[] {
  return classDetail.students.map((student, index) => {
    const scoreSeed = elkpdId.length + student.fullname.length + index;
    const isScored = scoreSeed % 4 === 0;
    const scoreValue = Math.max(
      55,
      Math.min(100, student.score + ((index % 3) - 1) * 4),
    );

    return {
      id: student.id,
      fullname: student.fullname,
      nis: student.nis,
      initial: student.fullname.trim().charAt(0).toUpperCase() || "?",
      avatarTone: ELKPD_AVATAR_ACCENTS[index % ELKPD_AVATAR_ACCENTS.length],
      isOnline: scoreSeed % 3 !== 1,
      isScored,
      scoreLabel: isScored ? `${scoreValue}/100` : "-/100",
    };
  });
}

export default function LearningAnalyticsELKPDScoreContent({
  role,
  classDetail,
  elkpdId,
}: ILearningAnalyticsELKPDScoreContentProps) {
  const router = useRouter();
  const baseClassHref = buildClassHref(role, classDetail.slug);
  const backHref = `${baseClassHref}?view=${encodeURIComponent("Kelola E-LKPD")}`;

  const selectedELKPD = useMemo(
    () => classDetail.elkpdItems?.find((item) => item.id === elkpdId),
    [classDetail.elkpdItems, elkpdId],
  );

  const scoreRows = useMemo(
    () => buildScoreRows(classDetail, elkpdId),
    [classDetail, elkpdId],
  );

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
    Siswa: classDetail.studentCount,
    Materi: classDetail.materials?.length ?? 0,
    "Kelola E-LKPD": classDetail.elkpdItems?.length ?? 0,
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
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.03em] text-[#94A3B8]">
                    Nilai
                  </th>
                </tr>
              </thead>

              <tbody>
                {scoreRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
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

                      <td
                        className={cn(
                          "px-4 py-3 text-right text-sm font-semibold",
                          row.isScored ? "text-[#16A34A]" : "text-[#94A3B8]",
                        )}
                      >
                        {row.scoreLabel}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
