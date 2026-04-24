"use client";

import TeacherLearningAnalyticsClassContent from "@/components/organisms/TeacherLearningAnalyticsClassContent";
import {
  useGsCreateCourseModule,
  useGsDeleteCourseModule,
  useGsModuleById,
  useGsCourseBySlug,
  useGsEnrollmentsByCourse,
  useGsModulesByCourse,
  useGsMyDiagnosticTests,
  useGsMySubjects,
  useGsReorderCourseModules,
  useGsUpdateCourseModule,
} from "@/services";
import { showErrorToast, showToast } from "@/libs/toast";
import type {
  ILearningAnalyticsDiagnosticOption,
  IMateriAssetItem,
  IMateriSequenceItem,
  ITeacherClassLearningAnalyticsDetail,
} from "@/types/learningAnalytics";
import { useEffect, useMemo, useState } from "react";

interface ITeacherLearningAnalyticsClassTemplateProps {
  slug: string;
}

function formatDateLabel(input?: string | null): string {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function seededScore(seed: string, index: number): number {
  const source = `${seed}-${index}`;
  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash % 45);
  return 55 + normalized;
}

export default function TeacherLearningAnalyticsClassTemplate({
  slug,
}: ITeacherLearningAnalyticsClassTemplateProps) {
  const [detailModuleId, setDetailModuleId] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState("");

  const {
    data: course,
    isLoading: isCourseLoading,
    error: courseError,
  } = useGsCourseBySlug(slug);

  const { data: modules = [], isLoading: isModulesLoading } =
    useGsModulesByCourse(course?.id ?? "");

  const { data: subjectsData } = useGsMySubjects({ limit: 200 });
  const { data: diagnosticTestsData } = useGsMyDiagnosticTests({ limit: 200 });

  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } =
    useGsEnrollmentsByCourse(course?.id ?? "", { limit: 200 });

  const createModuleMutation = useGsCreateCourseModule();
  const updateModuleMutation = useGsUpdateCourseModule();
  const reorderModulesMutation = useGsReorderCourseModules();
  const deleteModuleMutation = useGsDeleteCourseModule();

  const {
    data: selectedModule,
    isLoading: isSelectedModuleLoading,
    error: selectedModuleError,
  } = useGsModuleById(detailModuleId);

  const orderedModules = useMemo(
    () =>
      [...modules].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      }),
    [modules],
  );

  const subjectAssetOptions = useMemo<IMateriAssetItem[]>(
    () =>
      (subjectsData?.subjects ?? []).map((subject) => ({
        id: subject.id,
        kind: subject.videoUrl ? "Video" : "PDF",
        label: subject.subjectName,
      })),
    [subjectsData],
  );

  const diagnosticOptions = useMemo<ILearningAnalyticsDiagnosticOption[]>(
    () =>
      (diagnosticTestsData?.diagnosticTests ?? []).map((test) => ({
        id: test.id,
        title: test.testName,
        questionCount:
          test.packages?.reduce(
            (count, pack) => count + pack.questions.length,
            0,
          ) ?? 0,
        durationMinutes: test.durationMinutes,
      })),
    [diagnosticTestsData],
  );

  const materiSequenceItems = useMemo<IMateriSequenceItem[]>(
    () =>
      orderedModules.map((module, index) => {
        if (module.type === "DIAGNOSTIC_TEST") {
          return {
            id: module.id,
            type: "Tes Diagnostik",
            title:
              module.diagnosticTest?.testName ?? `Tes Diagnostik ${index + 1}`,
            description: module.deadline
              ? `Deadline: ${formatDateLabel(module.deadline)}`
              : "Tanpa deadline",
            assets: [],
            questionCount: 0,
            durationMinutes: module.diagnosticTest?.durationMinutes,
          };
        }

        const assets: IMateriAssetItem[] = [];
        if (module.subject?.subjectFileUrl) {
          assets.push({
            id: `${module.id}-file`,
            kind: "PDF",
            label: module.subject.subjectName,
          });
        }
        if (module.subject?.videoUrl) {
          assets.push({
            id: `${module.id}-video`,
            kind: "Video",
            label: `${module.subject.subjectName} (Video)`,
          });
        }
        if (assets.length === 0) {
          assets.push({
            id: `${module.id}-default`,
            kind: "PDF",
            label: module.subject?.subjectName ?? `Modul ${index + 1}`,
          });
        }

        return {
          id: module.id,
          type: "Modul",
          title: module.subject?.subjectName ?? `Modul ${index + 1}`,
          description: module.deadline
            ? `Deadline: ${formatDateLabel(module.deadline)}`
            : "Tanpa deadline",
          formatLabel: assets[0]?.kind,
          assets,
        };
      }),
    [orderedModules],
  );

  useEffect(() => {
    if (selectedModuleError) {
      showErrorToast(selectedModuleError);
    }
  }, [selectedModuleError]);

  useEffect(() => {
    if (!selectedModule?.deadline) {
      setDeadlineDraft("");
      return;
    }

    const deadlineDate = new Date(selectedModule.deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      setDeadlineDraft("");
      return;
    }

    const y = deadlineDate.getFullYear();
    const m = String(deadlineDate.getMonth() + 1).padStart(2, "0");
    const d = String(deadlineDate.getDate()).padStart(2, "0");
    setDeadlineDraft(`${y}-${m}-${d}`);
  }, [selectedModule]);

  const handleCreateModuleFromAsset = async (assetId: string) => {
    if (!course) {
      return;
    }

    try {
      await createModuleMutation.mutateAsync({
        courseId: course.id,
        data: {
          order: orderedModules.length + 1,
          type: "SUBJECT",
          subjectId: assetId,
        },
      });
      showToast.success("Modul materi berhasil ditambahkan");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleCreateDiagnosticModule = async (diagnosticId: string) => {
    if (!course) {
      return;
    }

    try {
      await createModuleMutation.mutateAsync({
        courseId: course.id,
        data: {
          order: orderedModules.length + 1,
          type: "DIAGNOSTIC_TEST",
          diagnosticTestId: diagnosticId,
        },
      });
      showToast.success("Modul tes diagnostik berhasil ditambahkan");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleMoveSequenceItem = async (itemId: string, direction: -1 | 1) => {
    if (!course) {
      return;
    }

    const currentIndex = orderedModules.findIndex(
      (module) => module.id === itemId,
    );
    const targetIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= orderedModules.length
    ) {
      return;
    }

    const reordered = [...orderedModules];
    const current = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = current;

    try {
      await reorderModulesMutation.mutateAsync({
        courseId: course.id,
        data: {
          modules: reordered.map((module, index) => ({
            id: module.id,
            order: index + 1,
          })),
        },
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDeleteSequenceItem = async (itemId: string) => {
    if (!course) {
      return;
    }

    try {
      await deleteModuleMutation.mutateAsync({
        id: itemId,
        courseId: course.id,
      });
      showToast.success("Modul berhasil dihapus");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleViewSequenceItem = (itemId: string) => {
    setDetailModuleId(itemId);
    setIsDetailModalOpen(true);
  };

  const handleSaveDeadline = async () => {
    if (!course || !selectedModule) {
      return;
    }

    try {
      await updateModuleMutation.mutateAsync({
        id: selectedModule.id,
        courseId: course.id,
        data: {
          deadline: deadlineDraft
            ? new Date(`${deadlineDraft}T00:00:00`).toISOString()
            : null,
        },
      });
      showToast.success("Deadline modul berhasil diperbarui");
      setIsDetailModalOpen(false);
      setDetailModuleId("");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const classDetail =
    useMemo<ITeacherClassLearningAnalyticsDetail | null>(() => {
      if (!course) {
        return null;
      }

      const students: ITeacherClassLearningAnalyticsDetail["students"] = (
        enrollmentsData?.enrollments ?? []
      ).map((enrollment, index) => {
        const score = seededScore(enrollment.studentId ?? enrollment.id, index);
        return {
          id: enrollment.studentId ?? enrollment.id,
          fullname: enrollment.student?.fullName ?? `Siswa ${index + 1}`,
          nis: enrollment.student?.NIS ?? "-",
          score,
          status: score >= 75 ? "Lulus" : "Remedial",
        };
      });

      const studentCount =
        enrollmentsData?.pagination.totalItems ?? students.length;
      const passedCount = students.filter(
        (student) => student.status === "Lulus",
      ).length;
      const remedialCount = Math.max(studentCount - passedCount, 0);
      const averageScore =
        students.length > 0
          ? Math.round(
              students.reduce((sum, student) => sum + student.score, 0) /
                students.length,
            )
          : 0;

      const materials: NonNullable<
        ITeacherClassLearningAnalyticsDetail["materials"]
      > = modules.map((module, index) => {
        const isSubject = module.type === "SUBJECT";
        const title = isSubject
          ? (module.subject?.subjectName ?? `Modul ${index + 1}`)
          : (module.diagnosticTest?.testName ?? `Tes Diagnostik ${index + 1}`);

        const type: "Materi" | "Video" | "Tes" = isSubject
          ? module.subject?.videoUrl
            ? "Video"
            : "Materi"
          : "Tes";

        return {
          id: module.id,
          title,
          updatedAt: formatDateLabel(module.deadline ?? course.updatedAt),
          type,
          status:
            module.deadline && new Date(module.deadline).getTime() < Date.now()
              ? "Draft"
              : "Aktif",
        };
      });

      const elkpdItems: NonNullable<
        ITeacherClassLearningAnalyticsDetail["elkpdItems"]
      > = modules
        .filter((module) => module.type === "SUBJECT")
        .map((module, index) => ({
          id: module.id,
          title: `E-LKPD ${index + 1} - ${module.subject?.subjectName ?? "Materi"}`,
          dueLabel: formatDateLabel(module.deadline),
          submittedCount: studentCount,
          status:
            module.deadline && new Date(module.deadline).getTime() < Date.now()
              ? "Ditutup"
              : "Aktif",
        }));

      const progress =
        studentCount > 0 ? Math.round((passedCount / studentCount) * 100) : 0;

      return {
        slug,
        className: course.courseName,
        teacherName: course.teacher?.fullName ?? "Guru",
        studentCount,
        averageScore,
        passedCount,
        remedialCount,
        progress,
        classCode: course.courseCode,
        gradeLabel: "Umum",
        semesterLabel: course.schoolYear ?? "Tahun Ajaran Berjalan",
        subjectLabel: "Matematika",
        defaultViewType: "Beranda",
        students,
        materials,
        elkpdItems,
      };
    }, [course, enrollmentsData, modules, slug]);

  if (isCourseLoading || isModulesLoading || isEnrollmentsLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
        Memuat analitik kelas...
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
        Gagal memuat data kelas: {courseError.message}
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">
        Data kelas tidak ditemukan.
      </div>
    );
  }

  return (
    <>
      <TeacherLearningAnalyticsClassContent
        classDetail={classDetail}
        materiSectionProps={{
          sequenceItems: materiSequenceItems,
          assetOptions: subjectAssetOptions,
          diagnosticOptions,
          onCreateModuleFromAsset: handleCreateModuleFromAsset,
          onCreateDiagnosticFromOption: handleCreateDiagnosticModule,
          onMoveSequenceItem: handleMoveSequenceItem,
          onDeleteSequenceItem: handleDeleteSequenceItem,
          onViewSequenceItem: handleViewSequenceItem,
        }}
      />

      {isDetailModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[#111827]">
              Detail Modul
            </h2>

            {isSelectedModuleLoading ? (
              <p className="mt-4 text-sm text-[#6B7280]">
                Memuat detail modul...
              </p>
            ) : selectedModule ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-[#374151]">
                  Tipe:{" "}
                  {selectedModule.type === "SUBJECT"
                    ? "Modul"
                    : "Tes Diagnostik"}
                </p>
                <p className="text-sm text-[#374151]">
                  Judul:{" "}
                  {selectedModule.subject?.subjectName ??
                    selectedModule.diagnosticTest?.testName ??
                    "-"}
                </p>
                <label className="block space-y-1 text-sm text-[#374151]">
                  <span>Deadline</span>
                  <input
                    type="date"
                    value={deadlineDraft}
                    onChange={(event) => setDeadlineDraft(event.target.value)}
                    className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#B91C1C]">
                Detail modul tidak tersedia.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setDetailModuleId("");
                }}
                className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#4B5563]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveDeadline}
                disabled={!selectedModule || updateModuleMutation.isPending}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Simpan Deadline
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
