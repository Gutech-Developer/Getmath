import Link from "next/link";

export interface IStudentAnalyticsItem {
  id: string;
  fullname: string;
  nis: string;
  score: number;
  status: "Lulus" | "Remedial";
}

export interface IClassLearningAnalyticsDetail {
  slug: string;
  className: string;
  teacherName: string;
  studentCount: number;
  averageScore: number;
  passedCount: number;
  remedialCount: number;
  progress: number;
  students: IStudentAnalyticsItem[];
}

interface AdminLearningAnalyticsClassContentProps {
  classDetail: IClassLearningAnalyticsDetail;
  backHref?: string;
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C2 12 5.63636 5.45454 12 5.45454C18.3636 5.45454 22 12 22 12C22 12 18.3636 18.5455 12 18.5455C5.63636 18.5455 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function StudentAnalyticsRow({
  student,
  classSlug,
}: {
  student: IStudentAnalyticsItem;
  classSlug: string;
}) {
  const isPassed = student.status === "Lulus";
  const scoreColor = isPassed ? "text-[#059669]" : "text-[#DC2626]";
  const badgeClass = isPassed
    ? "bg-[#E8F8F1] text-[#059669]"
    : "bg-[#FDECEC] text-[#DC2626]";

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 md:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F63DA] text-base font-bold text-white">
            {student.fullname.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[1.55rem] font-bold leading-tight text-[#111827] md:text-[1.35rem]">
              {student.fullname}
            </h3>
            <p className="text-[1.2rem] text-[#9CA3AF] md:text-sm">
              NIS: {student.nis}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <div className="text-right">
            <p
              className={`text-[2rem] font-extrabold leading-none md:text-3xl ${scoreColor}`}
            >
              {student.score}
            </p>
            <p className="mt-1 text-[1.05rem] text-[#9CA3AF] md:text-xs">
              Nilai
            </p>
          </div>

          <span
            className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-4 py-1.5 text-[1.2rem] font-semibold md:min-w-[84px] md:px-3 md:py-1 md:text-sm ${badgeClass}`}
          >
            {student.status}
          </span>

          <Link
            href={`/admin/dashboard/learning-analytics/${classSlug}/${student.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F3F4F6]"
            aria-label={`Lihat analitik ${student.fullname}`}
          >
            <EyeIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AdminLearningAnalyticsClassContent({
  classDetail,
  backHref = "/admin/dashboard/learning-analytics",
}: AdminLearningAnalyticsClassContentProps) {
  return (
    <div className="w-full space-y-5">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Learning Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Analitik per siswa dalam kelas
          </p>
        </div>

        <Link
          href={backHref}
          className="inline-flex items-center justify-center rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
        >
          ← Semua Kelas
        </Link>
      </header>

      <section className="rounded-3xl bg-[linear-gradient(135deg,#2F63DA_0%,#2B5DCE_100%)] p-5 text-white shadow-[0px_10px_30px_rgba(47,99,218,0.25)] md:p-6">
        <h2 className="text-[1.85rem] font-bold leading-tight md:text-3xl">
          {classDetail.className}
        </h2>
        <p className="mt-1 text-[1.2rem] text-white/75 md:text-sm">
          {classDetail.teacherName} · {classDetail.studentCount} siswa
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          <div className="rounded-2xl bg-white/12 px-3 py-3 text-center">
            <p className="text-[1.8rem] font-extrabold leading-none md:text-3xl">
              {classDetail.averageScore}
            </p>
            <p className="mt-1 text-[1.05rem] text-white/75 md:text-sm">
              Rata-rata
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 px-3 py-3 text-center">
            <p className="text-[1.8rem] font-extrabold leading-none md:text-3xl">
              {classDetail.passedCount}
            </p>
            <p className="mt-1 text-[1.05rem] text-white/75 md:text-sm">
              Lulus
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 px-3 py-3 text-center">
            <p className="text-[1.8rem] font-extrabold leading-none md:text-3xl">
              {classDetail.remedialCount}
            </p>
            <p className="mt-1 text-[1.05rem] text-white/75 md:text-sm">
              Remedial
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 px-3 py-3 text-center">
            <p className="text-[1.8rem] font-extrabold leading-none md:text-3xl">
              {classDetail.progress}%
            </p>
            <p className="mt-1 text-[1.05rem] text-white/75 md:text-sm">
              Progress
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-[#111827] md:text-[1.55rem]">
          Analitik Per Siswa
        </h2>

        <div className="space-y-2.5 md:space-y-3">
          {classDetail.students.map((student) => (
            <StudentAnalyticsRow
              key={student.id}
              student={student}
              classSlug={classDetail.slug}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
