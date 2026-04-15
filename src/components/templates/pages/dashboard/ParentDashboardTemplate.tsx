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

// ============ MOCK DATA ============
// Replace with real API data from hooks

const PARENT_STATS: ParentStat[] = [
  {
    icon: <ActivityIcon className="w-5 h-5" />,
    value: 3,
    label: "Kelas Aktif",
    subtitle: "kelas diikuti",
  },
  {
    icon: <BookIcon className="w-5 h-5" />,
    value: "8/15",
    label: "Materi Selesai",
    subtitle: "dari materi",
  },
  {
    icon: <TrophyIcon className="w-5 h-5" />,
    value: 78,
    label: "Rata-rata Nilai",
    subtitle: "nilai sekarang",
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    value: "14j 35m",
    label: "Waktu Belajar",
    subtitle: "total waktu",
  },
];

const PARENT_CLASSES: ParentClass[] = [
  {
    id: "1",
    title: "Matematika Wajib Kelas X",
    teacherName: "Bpk. Rudi Santoso",
    symbol: <span className="text-xl">Σ</span>,
    symbolColor: "bg-indigo-100 text-indigo-600",
    progress: 75,
    score: 80,
    status: "Aktif",
    progressVariant: "primary",
    activeTests: 1,
  },
  {
    id: "2",
    title: "Matematika Peminatan XI IPA",
    teacherName: "Ibu Sari Dewi",
    symbol: <span className="text-xl">∫</span>,
    symbolColor: "bg-purple-100 text-purple-600",
    progress: 45,
    score: 72,
    status: "Aktif",
    progressVariant: "info",
    activeTests: 2,
  },
  {
    id: "3",
    title: "Statistika & Probabilitas",
    teacherName: "Bpk. Dani Wirawan",
    symbol: <span className="text-xl">σ</span>,
    symbolColor: "bg-emerald-100 text-emerald-600",
    progress: 90,
    score: 88,
    status: "Aktif",
    progressVariant: "success",
  },
];

const TREND_LABELS = ["21 Jan", "28 Jan", "04 Feb", "11 Feb", "17 Feb"];

const TREND_LINES: TrendLine[] = [
  {
    label: "Nilai Ahmad Rizki",
    color: "#10b981",
    data: [65, 70, 75, 80, 82],
  },
];

const EMOTION_SEGMENTS: EmotionSegment[] = [
  { label: "Fokus", value: 45, color: "#6366f1" },
  { label: "Senang", value: 30, color: "#10b981" },
  { label: "Bingung", value: 15, color: "#f59e0b" },
  { label: "Lelah", value: 10, color: "#ef4444" },
];

const TEST_RESULTS: TestResult[] = [
  {
    id: "1",
    title: "Tes Diagnostik 1 – Persamaan Kuadrat",
    date: "21 Jun 2025",
    score: 88,
    status: "Lulus",
    type: "other",
    subject: "Mat. Wajib",
  },
  {
    id: "2",
    title: "Tes Diagnostik 1 – Fungsi Kuadrat",
    date: "19 Jun 2025",
    score: 65,
    status: "Remedial",
    type: "diagnostic",
    remedialNote: "Wajib menonton video remedial!",
    subject: "Diagnostik",
  },
  {
    id: "3",
    title: "Tes Statistika Dasar",
    date: "10 Feb 2025",
    score: 88,
    status: "Lulus",
    type: "other",
    subject: "Statistika",
  },
  {
    id: "4",
    title: "Tes Diagnostik 2 – Fungsi",
    date: "28 Jan 2025",
    score: 72,
    status: "Remedial",
    type: "diagnostic",
    remedialNote: "Wajib menonton video remedial!",
    subject: "Diagnostik",
  },
  {
    id: "5",
    title: "Tes Probabilitas Dasar",
    date: "17 Feb 2025",
    score: 85,
    status: "Lulus",
    type: "other",
    subject: "Statistika",
  },
];

const MANAGED_CHILDREN: IManagedChild[] = [
  {
    id: "child-1",
    fullname: "Ahmad Rizki",
    nis: "10234",
    classroom: "Kelas X-1",
  },
  {
    id: "child-2",
    fullname: "Siti Nurhaliza",
    nis: "10235",
    classroom: "Kelas IX-2",
  },
];

export default function ParentDashboardTemplate() {
  const [isChildManagementOpen, setIsChildManagementOpen] = useState(false);

  return (
    <>
      <ParentDashboardContent
        parentName="Musliadi"
        childName="Ahmad Rizki"
        stats={PARENT_STATS}
        alertMessage="Ahmad Rizki belum lulus di 2 tes dan wajib menonton video remedial. Pastikan ia meluangkan waktu untuk mengulang materi terkait."
        onAlertClick={() => console.log("Lihat detail alert")}
        classes={PARENT_CLASSES}
        onViewClass={(id) => console.log("View class", id)}
        trendChartLabels={TREND_LABELS}
        trendChartLines={TREND_LINES}
        trendChartTitle="Tren Nilai Ahmad Rizki"
        emotionSegments={EMOTION_SEGMENTS}
        testResults={TEST_RESULTS}
        onManageChild={() => setIsChildManagementOpen(true)}
      />

      <ChildManagementModal
        isOpen={isChildManagementOpen}
        onClose={() => setIsChildManagementOpen(false)}
        initialChildren={MANAGED_CHILDREN}
      />
    </>
  );
}
