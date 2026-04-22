"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TeacherDashboardContent,
  type TeacherStat,
  type TeacherClass,
  type RecentItem,
} from "@/components/organisms/TeacherDashboardContent";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import { showToast } from "@/libs/toast";
import {
  useGsCurrentUser,
  useGsMyCourses,
  useGsMySubjects,
  useGsMyDiagnosticTests,
  useGsCreateCourse,
} from "@/services";

// ─── Modal Buat Kelas ─────────────────────────────────────────────────────────

function CreateCourseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [courseName, setCourseName] = useState("");
  const createCourse = useGsCreateCourse();

  const handleSubmit = () => {
    if (!courseName.trim()) return;
    createCourse.mutate(
      { courseName: courseName.trim() },
      {
        onSuccess: () => {
          showToast.success("Kelas berhasil dibuat");
          setCourseName("");
          onClose();
        },
        onError: (err) => showToast.error(err.message ?? "Gagal membuat kelas"),
      },
    );
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-neutral-02">
          Buat Kelas Baru
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-02">
            Nama Kelas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Matematika Wajib Kelas X"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full border border-grey-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setCourseName("");
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-grey hover:bg-grey-stroke/40 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!courseName.trim() || createCourse.isPending}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {createCourse.isPending ? "Menyimpan..." : "Buat Kelas"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template ─────────────────────────────────────────────────────────────────

export default function TeacherDashboardTemplate() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: me } = useGsCurrentUser();
  const { data: coursesData } = useGsMyCourses({ limit: 10 });
  const { data: subjectsData } = useGsMySubjects({ limit: 4 });
  const { data: diagnosticsData } = useGsMyDiagnosticTests({ limit: 4 });

  const activeCourses = coursesData?.courses.filter((c) => !c.isArchived) ?? [];

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats: TeacherStat[] = [
    {
      icon: <BookIcon className="w-5 h-5" />,
      value: subjectsData?.pagination.totalItems ?? "–",
      label: "Total Materi",
    },
    {
      icon: <ClipboardIcon className="w-5 h-5" />,
      value: diagnosticsData?.pagination.totalItems ?? "–",
      label: "Tes Diagnostik",
    },
    {
      icon: <DashboardIcon className="w-5 h-5" variant="filled" />,
      value: activeCourses.length,
      label: "Kelas Aktif",
    },
    {
      icon: <UsersIcon className="w-5 h-5" />,
      value: coursesData?.pagination.totalItems ?? "–",
      label: "Total Kelas",
    },
  ];

  // ── Classes ────────────────────────────────────────────────────────────────
  const classes: TeacherClass[] = (coursesData?.courses ?? []).map((c) => ({
    id: c.slug,
    title: c.courseName,
    classCode: c.courseCode,
    totalStudents: 0,
    progress: 0,
    progressVariant: "primary" as const,
    isActive: !c.isArchived,
  }));

  // ── Recent Materials ───────────────────────────────────────────────────────
  const recentMaterials: RecentItem[] = (subjectsData?.subjects ?? []).map(
    (s) => ({
      id: s.id,
      icon: s.videoUrl ? (
        <VideoIcon className="w-4 h-4" />
      ) : (
        <BookIcon className="w-4 h-4" />
      ),
      title: s.subjectName,
      subtitle: s.videoUrl ? "Video" : "PDF",
    }),
  );

  // ── Recent Diagnostics ─────────────────────────────────────────────────────
  const recentDiagnostics: RecentItem[] = (
    diagnosticsData?.diagnosticTests ?? []
  ).map((d) => ({
    id: d.id,
    icon: <ClipboardIcon className="w-4 h-4" />,
    title: d.testName,
    subtitle: `${d.durationMinutes} menit · KKM ${d.passingScore}`,
  }));

  // ── Teacher info ───────────────────────────────────────────────────────────
  const teacherName =
    (me?.profile?.["fullName"] as string | undefined) ?? me?.email ?? "Guru";
  const subtitle =
    (me?.profile?.["schoolName"] as string | undefined) ?? undefined;

  return (
    <>
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <TeacherDashboardContent
        teacherName={teacherName}
        subtitle={subtitle}
        stats={stats}
        classes={classes}
        recentMaterials={recentMaterials}
        recentDiagnostics={recentDiagnostics}
        onCreateClass={() => setIsModalOpen(true)}
        onManageClass={(slug) =>
          router.push(`/teacher/dashboard/class-list/${slug}`)
        }
      />
    </>
  );
}
