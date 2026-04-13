import Link from "next/link";

export interface IStudentTestHistoryItem {
  title: string;
  note: string;
}

export interface IStudentLearningAnalyticsDetail {
  id: string;
  fullname: string;
  nis: string;
  score: number;
  status: "Lulus" | "Remedial";
  progress: number;
  dominantEmotion: string;
  testHistory: IStudentTestHistoryItem[];
}

interface AdminLearningAnalyticsStudentContentProps {
  slug: string;
  student: IStudentLearningAnalyticsDetail;
  allClassesHref?: string;
}

function statusClasses(status: "Lulus" | "Remedial") {
  if (status === "Lulus") {
    return "bg-[#E8F8F1] text-[#059669]";
  }

  return "bg-[#FDECEC] text-[#DC2626]";
}

function scoreColor(score: number) {
  if (score >= 75) {
    return "text-[#059669]";
  }

  return "text-[#DC2626]";
}

export default function AdminLearningAnalyticsStudentContent({
  slug,
  student,
}: AdminLearningAnalyticsStudentContentProps) {
  return (
    <div className="w-full space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Learning Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Detail analitik siswa</p>
        </div>
      </header>

      <Link
        href={`/admin/dashboard/learning-analytics/${slug}`}
        className="inline-flex items-center text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
      >
        ← Kembali ke Daftar Siswa
      </Link>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F63DA] text-base font-bold text-white">
                {student.fullname.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-[#111827]">
                  {student.fullname}
                </h2>
                <p className="text-sm text-[#9CA3AF]">NIS: {student.nis}</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${statusClasses(student.status)}`}
            >
              {student.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-center">
              <p
                className={`text-3xl font-extrabold leading-none ${scoreColor(student.score)}`}
              >
                {student.score}
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">Nilai Tes</p>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-center">
              <p className="text-3xl font-extrabold leading-none text-[#2563EB]">
                {student.progress}%
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">Progress</p>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-center">
              <p className="text-3xl font-extrabold leading-none text-[#7C3AED]">
                {student.dominantEmotion}
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">Emosi Dominan</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <p className="text-sm font-semibold text-[#374151]">Riwayat Tes</p>
            <div className="mt-1.5 space-y-1">
              {student.testHistory.map((item) => (
                <p key={item.title} className="text-sm text-[#9CA3AF]">
                  {item.title}: {item.note}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
