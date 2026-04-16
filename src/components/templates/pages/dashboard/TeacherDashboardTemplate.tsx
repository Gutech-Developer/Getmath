"use client";

import {
  TeacherDashboardContent,
  TeacherStat,
  TeacherClass,
  RecentItem,
} from "@/components/organisms/TeacherDashboardContent";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { useRouter } from "next/navigation";

// ============ MOCK DATA ============
// Replace with real API data from hooks

const TEACHER_STATS: TeacherStat[] = [
  {
    icon: <BookIcon className="w-5 h-5" />,
    value: 4,
    label: "Total Materi",
  },
  {
    icon: <ClipboardIcon className="w-5 h-5" />,
    value: 2,
    label: "Tes Diagnostik",
  },
  {
    icon: <DashboardIcon className="w-5 h-5" variant="filled" />,
    value: 2,
    label: "Kelas Aktif",
  },
  {
    icon: <UsersIcon className="w-5 h-5" />,
    value: 60,
    label: "Total Siswa",
  },
];

const TEACHER_CLASSES: TeacherClass[] = [
  {
    id: "1",
    title: "Matematika Wajib Kelas X",
    classCode: "MAT-X-001",
    totalStudents: 28,
    progress: 72,
    progressVariant: "primary",
    isActive: true,
    activeTests: 1,
  },
  {
    id: "2",
    title: "Matematika Peminatan XI IPA",
    classCode: "MAT-XI-002",
    totalStudents: 32,
    progress: 55,
    progressVariant: "info",
    isActive: true,
    activeTests: 2,
  },
];

const RECENT_MATERIALS: RecentItem[] = [
  {
    id: "1",
    icon: <BookIcon className="w-4 h-4" />,
    title: "Persamaan Kuadrat",
    subtitle: "PDF · 15 Mar 2026",
  },
  {
    id: "2",
    icon: <VideoIcon className="w-4 h-4" />,
    title: "Fungsi Kuadrat",
    subtitle: "Video · 20 Mar 2026",
  },
  {
    id: "3",
    icon: <BookIcon className="w-4 h-4" />,
    title: "Sistem Persamaan Linear",
    subtitle: "PDF · 22 Mar 2026",
  },
  {
    id: "4",
    icon: <VideoIcon className="w-4 h-4" />,
    title: "Trigonometri Dasar",
    subtitle: "Video · 25 Mar 2026",
  },
];

const RECENT_DIAGNOSTICS: RecentItem[] = [
  {
    id: "1",
    icon: <ClipboardIcon className="w-4 h-4" />,
    title: "Tes Diagnostik 1 - Persamaan Kuadrat",
    subtitle: "2 soal · 60 menit",
  },
  {
    id: "2",
    icon: <ClipboardIcon className="w-4 h-4" />,
    title: "Tes Diagnostik 2 - Fungsi Kuadrat",
    subtitle: "1 soal · 45 menit",
  },
];

export default function TeacherDashboardTemplate() {
  const router = useRouter();
  return (
    <TeacherDashboardContent
      teacherName="Ibu Rahma Johar"
      subtitle="NIP: 197001011998021001 · SMP Negeri 12 Banda Aceh"
      stats={TEACHER_STATS}
      classes={TEACHER_CLASSES}
      recentMaterials={RECENT_MATERIALS}
      recentDiagnostics={RECENT_DIAGNOSTICS}
      onCreateClass={() => console.log("Buat Kelas")}
      onManageClass={(id) => router.push(`/teacher/dashboard/class-list/${id}`)}
    />
  );
}
