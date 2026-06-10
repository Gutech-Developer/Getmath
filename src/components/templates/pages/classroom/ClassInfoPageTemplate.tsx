"use client";

import Link from "next/link";
import BookIcon from "@/components/atoms/icons/BookIcon";
import InfoCircleIcon from "@/components/atoms/icons/InfoCircleIcon";
import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import {
  CLASS_INFO_PROGRESS_ITEMS,
  CLASS_INFO_PROGRESS_PERCENT,
  getClassInfoDetailItems,
} from "@/constant/classInfo";
import type { IClassInfoPageTemplateProps } from "@/types";
import ClassInfoDetailRow from "@/components/molecules/classroom/info/ClassInfoDetailRow";
import ClassProgressStatItem from "@/components/molecules/classroom/info/ClassProgressStatItem";
import ClassStudentMemberCard from "@/components/molecules/classroom/info/ClassStudentMemberCard";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";
import { useGsCourseBySlug, useStudentDashboard } from "@/services";
import { CLASS_INFO_STUDENTS as STATIC_STUDENTS } from "@/constant/classInfo";

export default function ClassInfoPageTemplate({
  slug,
}: IClassInfoPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);
  const { data: course, isLoading, error } = useGsCourseBySlug(slug);
  const { data: dashboardMetrics } = useStudentDashboard(course?.id ?? "", {
    enabled: !!course?.id,
  });

  const teacherName = course?.teacher?.fullName ?? "Guru Kelas";
  const totalStudents = course?.enrolledCount ?? STATIC_STUDENTS.length;
  const studentList = dashboardMetrics?.enrolledStudentNames;

  const detailItems = getClassInfoDetailItems(classTitle, {
    teacherName,
    totalStudents,
  });

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey="info-class"
      classTitle={classTitle}
    >
      <section className="space-y-5">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-lottie-teal to-lottie-teal/90 p-6 text-white shadow-[0_8px_24px_rgba(31,35,117,0.12)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div>
                <h1 className=" text-xl font-normal sm:text-3xl">
                  {classTitle}
                </h1>
                <p className="mt-2 text-lg text-white/75">{teacherName}</p>
              </div>
            </div>

            <Link
              href="/student/dashboard"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white transition hover:bg-white/15"
            >
              <LogoutIcon className="h-5 w-5" />
              Keluar Kelas
            </Link>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <h2 className=" text-lg font-normal text-lottie-midnight">
                Informasi Kelas
              </h2>
            </div>

            <div className="mt-5">
              {detailItems.map((item, index) => (
                <ClassInfoDetailRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  isLast={index === detailItems.length - 1}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <h2 className=" text-lg font-normal text-lottie-midnight">
                Progres Belajar
              </h2>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base text-lottie-zinc-500">Progress Keseluruhan</p>
                <p className="text-lg font-bold text-lottie-teal">
                  {course?.progressPercent}%
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-lottie-mist">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lottie-teal to-lottie-teal/80"
                  style={{ width: `${course?.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {course?.subjectCount && (
                <ClassProgressStatItem
                  label={"Jumlah Materi"}
                  value={course.subjectCount ?? 0}
                  tone={"neutral"}
                />
              )}
              {course?.diagnosticTestCount && (
                <ClassProgressStatItem
                  label={"Jumlah Tes Diagnostik"}
                  value={course.diagnosticTestCount ?? 0}
                  tone={"neutral"}
                />
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className=" text-lg font-normal text-lottie-midnight">Daftar Siswa</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {studentList &&
              studentList?.length > 0 &&
              studentList.map((student, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-lottie-pearl transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lottie-teal/10 text-lottie-teal border border-lottie-teal/20 text-sm font-semibold">
                    {student.fullName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-lottie-midnight">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-lottie-zinc-400">Siswa</p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </section>
    </ClassPageShellTemplate>
  );
}
