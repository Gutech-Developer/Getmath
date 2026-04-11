import Link from "next/link";
import BookIcon from "@/components/atoms/icons/BookIcon";
import InfoCircleIcon from "@/components/atoms/icons/InfoCircleIcon";
import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import {
  CLASS_INFO_PROGRESS_ITEMS,
  CLASS_INFO_PROGRESS_PERCENT,
  CLASS_INFO_STUDENTS,
  CLASS_INFO_TOTAL_STUDENTS,
  CLASS_INFO_VISIBLE_STUDENTS,
  getClassInfoDetailItems,
} from "@/constant/classInfo";
import type { IClassInfoPageTemplateProps } from "@/types";
import ClassInfoDetailRow from "@/components/molecules/classroom/info/ClassInfoDetailRow";
import ClassProgressStatItem from "@/components/molecules/classroom/info/ClassProgressStatItem";
import ClassStudentMemberCard from "@/components/molecules/classroom/info/ClassStudentMemberCard";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";

export default function ClassInfoPageTemplate({
  slug,
}: IClassInfoPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);
  const detailItems = getClassInfoDetailItems(classTitle);

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey="info-class"
      classTitle={classTitle}
    >
      <section className="space-y-5">
        <header className="overflow-hidden rounded-[32px] bg-[#1F2375] p-6 text-white  sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div>
                <h1 className="text-lg font-semibold sm:text-3xl">
                  {classTitle}
                </h1>
                <p className="mt-2 text-lg text-white/75">Bpk. Budi Santoso</p>
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
          <section className="rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-8">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
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

          <section className="rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-8">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Progres Belajar
              </h2>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base text-[#64748B]">Progress Keseluruhan</p>
                <p className="text-lg font-bold text-[#232B89]">
                  {CLASS_INFO_PROGRESS_PERCENT}%
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#232B89_0%,#3943A8_100%)]"
                  style={{ width: `${CLASS_INFO_PROGRESS_PERCENT}%` }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {CLASS_INFO_PROGRESS_ITEMS.map((item) => (
                <ClassProgressStatItem
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1E293B]">Daftar Siswa</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CLASS_INFO_STUDENTS.map((student) => (
              <ClassStudentMemberCard
                key={student.id}
                name={student.name}
                toneClassName={student.toneClassName}
                isCurrentUser={student.isCurrentUser}
              />
            ))}
          </div>
        </section>
      </section>
    </ClassPageShellTemplate>
  );
}
