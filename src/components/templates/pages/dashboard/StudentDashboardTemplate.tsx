"use client";

import { useState, useMemo } from "react";
import {
  StudentDashboardContent,
  type EnrolledClass,
  type AvailableClass,
} from "@/components/organisms/StudentDashboardContent";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import { showToast } from "@/libs/toast";
import {
  useGsCurrentUser,
  useGsMyEnrollments,
  useGsEnrollCourse,
  useGsSchoolCourses,
} from "@/services";

// ─── Deterministic symbol helper ─────────────────────────────────────────────

const MATH_SYMBOLS = ["Σ", "∫", "σ", "π", "△", "∧", "∞", "∂", "√", "∮"];
const SYMBOL_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-blue-100 text-blue-600",
  "bg-teal-100 text-teal-600",
  "bg-orange-100 text-orange-600",
];

function symbolForId(id: string) {
  const hash = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    symbol: MATH_SYMBOLS[hash % MATH_SYMBOLS.length],
    color: SYMBOL_COLORS[hash % SYMBOL_COLORS.length],
  };
}

// ─── Modal Gabung Kelas ───────────────────────────────────────────────────────

function JoinCourseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [courseId, setCourseId] = useState("");
  const enrollCourse = useGsEnrollCourse();

  const handleSubmit = () => {
    if (!courseId.trim()) return;
    enrollCourse.mutate(
      { courseCode: courseId.trim() },
      {
        onSuccess: () => {
          showToast.success("Berhasil bergabung ke kelas");
          setCourseId("");
          onClose();
        },
        onError: (err) =>
          showToast.error(err.message ?? "Gagal bergabung ke kelas"),
      },
    );
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-neutral-02">
          Gabung dengan Kode Kelas
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-02">
            ID atau Kode Kelas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan ID kelas"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full border border-grey-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <p className="text-xs text-grey">
            Minta ID kelas dari gurumu untuk bergabung.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setCourseId("");
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-grey-stroke text-sm font-medium text-grey hover:bg-grey-stroke/40 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!courseId.trim() || enrollCourse.isPending}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1F2375] text-white hover:bg-[#171B5C] disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {enrollCourse.isPending ? "Memproses..." : "Masuk Kelas"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template ─────────────────────────────────────────────────────────────────

const StudentDashboardTemplate = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: me } = useGsCurrentUser();
  const { data: enrollmentsData } = useGsMyEnrollments({ limit: 50 });
  const { data: schoolCoursesData } = useGsSchoolCourses({ limit: 50, search: searchValue });

  const enrolledClasses: EnrolledClass[] = useMemo(() => {
    const schoolCoursesMap = new Map(
      (schoolCoursesData?.courses ?? []).map((c) => [c.id, c])
    );

    return (enrollmentsData?.enrollments ?? [])
      .filter((e) => e.course)
      .map((e) => {
        const course = e.course!;
        const schoolCourse = schoolCoursesMap.get(course.id);
        const { symbol, color } = symbolForId(course.id);

        return {
          id: course.id,
          slug: course.slug,
          title: course.courseName,
          teacher: course.teacher?.fullName ?? "–",
          institution: course.schoolName ?? "–",
          academicYear: schoolCourse?.schoolYear ?? "–",
          progress: 0,
          totalMaterials: schoolCourse?.subjectCount ?? (course as any).subjectCount ?? 0,
          totalStudents: schoolCourse?.enrolledCount ?? (course as any).enrolledCount ?? 0,
          symbol: <span className="text-xl">{symbol}</span>,
          symbolColor: color,
          progressVariant: "primary" as const,
        };
      });
  }, [enrollmentsData, schoolCoursesData]);


  // ── Available courses: classes in school that user hasn't joined ──────────
  const availableClasses: AvailableClass[] = useMemo(() => {
    const enrolledIds = new Set(enrolledClasses.map(c => c.id));
    return (schoolCoursesData?.courses ?? [])
      .filter(c => !enrolledIds.has(c.id))
      .map(course => {
        const { symbol, color } = symbolForId(course.id);
        return {
          id: course.id,
          title: course.courseName,
          teacher: course.teacher?.fullName ?? "–",
          institution: course.schoolName ?? "–",
          academicYear: course.schoolYear ?? "–",
          totalMaterials: course.subjectCount ?? course.modules?.length ?? 0,
          totalStudents: course.enrolledCount ?? 0,
          symbol: <span className="text-xl">{symbol}</span>,
          symbolColor: color,
        };
      });
  }, [schoolCoursesData, enrolledClasses]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredEnrolled = enrolledClasses.filter((cls) => {
    const matchSearch =
      !searchValue ||
      cls.title.toLowerCase().includes(searchValue.toLowerCase());
    const matchTab =
      activeTab === "all" ||
      (activeTab === "in_progress" && cls.progress < 100) ||
      (activeTab === "completed" && cls.progress >= 100);
    return matchSearch && matchTab;
  });

  const filteredAvailable = availableClasses.filter(
    (cls) =>
      !searchValue ||
      cls.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // ── User info ───────────────────────────────────────────────────────────────
  const studentName =
    (me?.profile?.["fullName"] as string | undefined) ?? me?.email ?? "Siswa";

  return (
    <>
      <JoinCourseModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <StudentDashboardContent
        studentName={studentName}
        streakDays={0}
        level={1}
        xp={0}
        rank={0}
        totalClassesFollowed={enrolledClasses.length}
        enrolledClasses={filteredEnrolled}
        availableClasses={filteredAvailable}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onJoinClass={() => setIsJoinModalOpen(true)}
        onClassClick={() => {}}
        onJoinWithCode={() => setIsJoinModalOpen(true)}
      />
    </>
  );
};

export default StudentDashboardTemplate;
