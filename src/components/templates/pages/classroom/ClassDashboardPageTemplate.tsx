"use client";

import Link from "next/link";
import {
  ClassMetricCard,
  ClassModuleCard,
  ClassStudentChip,
  classRouteIconMap,
  classRouteToneMap,
} from "@/components/molecules/classroom";
import {
  buildClassRoute,
  getClassSidebarRoutes,
  type ClassSidebarRouteKey,
} from "@/constant/classSidebarRoutes";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";
import { useGsCourseBySlug, useGsModulesByCourse } from "@/services";
import { useGsCurrentUser } from "@/services";

interface IClassDashboardPageTemplateProps {
  slug: string;
}

const studentToneClassNames = [
  "bg-[#C84B4B]",
  "bg-[#BE9A42]",
  "bg-[#73A84A]",
  "bg-[#3A9B67]",
  "bg-[#3A8F8A]",
  "bg-[#4C74D6]",
  "bg-[#7A61C7]",
  "bg-[#C2608A]",
];

export default function ClassDashboardPageTemplate({
  slug,
}: IClassDashboardPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);
  const moduleItems = getClassSidebarRoutes(slug).filter(
    (item) => item.key !== "overview",
  );
  const auth = useGsCurrentUser();
  const { data: course } = useGsCourseBySlug(slug);
  const { data: modules } = useGsModulesByCourse(course?.id ?? "");

  const courseName = course?.courseName ?? classTitle;
  const courseCode = course?.courseCode ?? "–";
  const totalStudents = course?.enrolledCount ?? 0;
  // Hitung hanya modul bertipe SUBJECT dari kelas ini (bukan semua materi system)
  const totalSubjects = (modules ?? []).filter(
    (m) => m.type === "SUBJECT",
  ).length;
  const totalDiagnosticTests = (modules ?? []).filter(
    (m) => m.type === "DIAGNOSTIC_TEST",
  ).length;

  const metricItems: {
    key: string;
    value: string;
    label: string;
    hint: string;
    routeKey: ClassSidebarRouteKey;
  }[] = [
    {
      key: "metric-read-material",
      value: `0/${totalSubjects}`,
      label: "Materi Terbaca",
      hint: `${totalSubjects} materi tersedia`,
      routeKey: "materi",
    },
    {
      key: "metric-diagnostic",
      value: String(totalDiagnosticTests),
      label: "Tes Diagnostik",
      hint: `${totalDiagnosticTests} tes tersedia`,
      routeKey: "diagnosis",
    },
    {
      key: "metric-progress",
      value: "–",
      label: "Rata-rata Nilai",
      hint: "Lihat LAD lengkapmu",
      routeKey: "lad",
    },
    {
      key: "metric-score",
      value: "–",
      label: "Peringkat Kelas",
      hint: `Dari ${totalStudents} siswa`,
      routeKey: "lad",
    },
  ];

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey="overview"
      classTitle={classTitle}
    >
      <header className="rounded-3xl bg-[#1F2375] p-5 text-white shadow-[0px_20px_40px_rgba(39,48,132,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{courseName}</h1>
            <p className="mt-1 text-sm text-white/80">
              {course?.schoolName ?? "–"} •{" "}
              {course ? (course.isArchived ? "Diarsipkan" : "Aktif") : "–"}
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Keluar Kelas
          </Link>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-white/85">
            <span>Progres keseluruhan</span>
            <span>0%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-0 rounded-full bg-[#DCE3FF]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            `${totalSubjects} Materi`,
            totalDiagnosticTests > 0 ? `${totalDiagnosticTests} Tes` : null,
            `${totalStudents} Siswa Terdaftar`,
            courseCode,
          ]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag!}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90"
              >
                {tag}
              </span>
            ))}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item) => (
          <ClassMetricCard
            key={item.key}
            value={item.value}
            label={item.label}
            hint={item.hint}
            icon={classRouteIconMap[item.routeKey]}
            iconBackgroundClassName={
              classRouteToneMap[item.routeKey].iconBackgroundClassName
            }
            iconClassName={classRouteToneMap[item.routeKey].iconClassName}
          />
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0px_12px_24px_rgba(148,163,184,0.12)]">
        <h2 className="text-base font-bold text-[#0F172A]">
          Akses Modul Kelas
        </h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {moduleItems.map((item) => (
            <ClassModuleCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {!auth.isPending && auth.data?.role === "TEACHER" && (
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0px_12px_24px_rgba(148,163,184,0.14)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              Daftar Siswa Kelas
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {totalStudents} siswa terdaftar
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center">
            <p className="text-sm font-medium text-[#0F172A]">
              {totalStudents} siswa terdaftar di kelas ini.
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Daftar siswa lengkap hanya tersedia untuk role guru.
            </p>
          </div>
        </section>
      )}
    </ClassPageShellTemplate>
  );
}
