"use client";

import { useState } from "react";
import {
  ParentDashboardContent,
  ParentStat,
  ParentClass,
  TrendLine,
  EmotionSegment,
  TestResult,
} from "@/components/organisms/ParentDashboardContent";
import ChildManagementModal, {
  IManagedChild,
} from "@/components/molecules/parent/ChildManagementModal";
import ActivityIcon from "@/components/atoms/icons/ActivityIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import TrophyIcon from "@/components/atoms/icons/TrophyIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import { Modal } from "@/components/molecules/Modal";
import {
  useGsCurrentUser,
  useGsChildren,
  useGsChildDashboard,
  useGsAddChild,
  useGsRemoveChild,
} from "@/services";
import { useEffect, useMemo } from "react";
import { showToast } from "@/libs/toast";

// Mappings removed, moved inside component or using API data

export default function ParentDashboardTemplate() {
  const [isChildManagementOpen, setIsChildManagementOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: user } = useGsCurrentUser();

  // ─── API Hooks ─────────────────────────────────────────────────────────────
  const { data: children, isLoading: isChildrenLoading } = useGsChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Auto-select first child if not selected
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const { data: dashboard, isLoading: isDashboardLoading } = useGsChildDashboard(
    selectedChildId ?? ""
  );

  const addChild = useGsAddChild();
  const removeChild = useGsRemoveChild();

  // ─── Mappings ──────────────────────────────────────────────────────────────
  const parentName =
    (user?.profile?.fullName as string) ||
    (user?.fullName as string) ||
    (user?.profile?.fullname as string) ||
    user?.fullname ||
    "Orang Tua";

  const selectedChild = useMemo(() => {
    return children?.find((c) => c.id === selectedChildId);
  }, [children, selectedChildId]);

  const childName = selectedChild?.fullName || "Pilih Anak";

  const parentStats: ParentStat[] = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        icon: <ActivityIcon className="w-5 h-5" />,
        value: dashboard.activeCourses.length,
        label: "Kelas Aktif",
        subtitle: "kelas diikuti",
      },
      {
        icon: <BookIcon className="w-5 h-5" />,
        value: `${dashboard.completedSubjectModules}/${dashboard.totalSubjectModules}`,
        label: "Materi Selesai",
        subtitle: "dari materi",
      },
      {
        icon: <TrophyIcon className="w-5 h-5" />,
        value: Math.round(dashboard.avgDiagnosticScore),
        label: "Rata-rata Nilai",
        subtitle: "skor tes",
      },
      {
        icon: <ClockIcon className="w-5 h-5" />,
        value: dashboard.activeCourses.reduce(
          (sum, c) => sum + c.unfinishedDiagnostics,
          0
        ),
        label: "Tes Belum Selesai",
        subtitle: "segera kerjakan",
      },
    ];
  }, [dashboard]);

  const parentClasses: ParentClass[] = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.activeCourses.map((c, i) => ({
      id: c.courseId,
      slug: c.courseId,
      title: c.courseName,
      teacherName: "Guru Pengampu",
      symbol: <span className="text-xl">Σ</span>,
      symbolColor: [
        "bg-indigo-100 text-indigo-600",
        "bg-purple-100 text-purple-600",
        "bg-emerald-100 text-emerald-600",
      ][i % 3],
      progress: c.progressPercent,
      score: c.lastDiagnosticScore,
      status: c.isArchived ? "Tidak Aktif" : "Aktif",
      progressVariant: ["primary", "info", "success"][i % 3] as any,
      activeTests: c.unfinishedDiagnostics,
    }));
  }, [dashboard]);

  const testResults: TestResult[] = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.recentDiagnostics.map((d) => ({
      id: d.attemptId,
      title: d.testName,
      date: new Date(d.completedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      score: d.score,
      status: d.isRemedial ? "Remedial" : "Lulus",
      type: "diagnostic",
      remedialNote: d.isRemedial ? "Wajib menonton video remedial!" : undefined,
      subject: d.courseName,
    }));
  }, [dashboard]);

  const managedChildren: IManagedChild[] = useMemo(() => {
    return (children || []).map((c) => ({
      id: c.id,
      fullname: c.fullName,
      nis: c.NIS,
      classroom: c.schoolName || "Siswa GetSmart",
    }));
  }, [children]);

  // Handlers
  const handleAddChild = (nis: string) => {
    addChild.mutate(
      { nis },
      {
        onSuccess: () => {
          showToast.success("Anak berhasil ditambahkan");
        },
        onError: (error: any) => {
          showToast.error(error?.message || "Gagal menambahkan anak");
        },
      }
    );
  };

  const handleDeleteChild = (id: string) => {
    const child = managedChildren.find((c) => c.id === id);
    if (child) {
      setChildToDelete({ id, name: child.fullname });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteChild = () => {
    if (childToDelete) {
      removeChild.mutate(childToDelete.id, {
        onSuccess: () => {
          showToast.success("Anak berhasil dihapus");
          if (selectedChildId === childToDelete.id) setSelectedChildId(null);
          setIsDeleteModalOpen(false);
          setChildToDelete(null);
        },
        onError: (error: any) => {
          showToast.error(error?.message || "Gagal menghapus anak");
        },
      });
    }
  };

  if (isChildrenLoading) {
    return <div className="flex min-h-screen items-center justify-center">Memuat data...</div>;
  }

  return (
    <>
      <ParentDashboardContent
        key={selectedChildId}
        parentName={parentName}
        childName={childName}
        stats={parentStats}
        alertMessage={
          dashboard && dashboard.avgDiagnosticScore < 70
            ? `${childName} membutuhkan bimbingan lebih pada beberapa materi (Rata-rata: ${Math.round(dashboard.avgDiagnosticScore)}).`
            : ""
        }
        onAlertClick={() => console.log("Lihat detail alert")}
        classes={parentClasses}
        onViewClass={(id) => console.log("View class", id)}
        trendChartLabels={["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]}
        childrenList={children?.map((c) => ({
          id: c.id,
          fullName: c.fullName,
        }))}
        selectedChildId={selectedChildId}
        onChildSelect={(id) => setSelectedChildId(id)}
        trendChartLines={[
          {
            label: `Skor Tes ${childName}`,
            color: "#6366f1",
            data: dashboard?.recentDiagnostics.map((d) => d.score).reverse() || [
              0,
            ],
          },
        ]}
        trendChartTitle={`Tren Belajar ${childName}`}
        emotionSegments={[
          { label: "Fokus", value: 60, color: "#6366f1" },
          { label: "Senang", value: 40, color: "#10b981" },
        ]}
        testResults={testResults}
        onManageChild={() => setIsChildManagementOpen(true)}
      />

      <ChildManagementModal
        isOpen={isChildManagementOpen}
        onClose={() => setIsChildManagementOpen(false)}
        children={managedChildren}
        onAddChild={handleAddChild}
        onDeleteChild={handleDeleteChild}
        onSelectChild={setSelectedChildId}
        isLoading={addChild.isPending || removeChild.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-grey text-sm">
            Apakah Anda yakin ingin memutuskan hubungan dengan{" "}
            <span className="font-bold text-neutral-02">
              {childToDelete?.name}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-grey-stroke rounded-xl text-sm font-semibold text-grey hover:bg-grey-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteChild}
              disabled={removeChild.isPending}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {removeChild.isPending ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
