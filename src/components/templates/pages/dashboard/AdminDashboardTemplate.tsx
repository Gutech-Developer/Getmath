"use client";

import {
  AdminDashboardContent,
  AdminStat,
  AdminChartLine,
  TeacherActivity,
} from "@/components/organisms/AdminDashboardContent";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";

// ============ MOCK DATA ============
// Replace with real API data from hooks

const ADMIN_STATS: AdminStat[] = [
  {
    icon: <UsersIcon className="w-5 h-5" />,
    iconColor: "bg-blue-100 text-blue-500",
    value: 10234,
    label: "Total Siswa",
    delta: 128,
  },
  {
    icon: <DashboardIcon className="w-5 h-5" variant="filled" />,
    iconColor: "bg-emerald-100 text-emerald-500",
    value: 4,
    label: "Total Kelas",
    delta: 3,
  },
  {
    icon: <BookIcon className="w-5 h-5" />,
    iconColor: "bg-violet-100 text-violet-500",
    value: 4,
    label: "Total Materi",
    delta: 3,
  },
  {
    icon: <ClipboardIcon className="w-5 h-5" />,
    iconColor: "bg-amber-100 text-amber-500",
    value: 3,
    label: "Total Tes",
    delta: 3,
  },
];

const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr"];

const CHART_LINES: AdminChartLine[] = [
  {
    label: "Siswa",
    color: "#3b82f6",
    data: [8500, 9000, 9400, 10234],
  },
  {
    label: "Kelas",
    color: "#10b981",
    data: [1, 2, 3, 4],
  },
  {
    label: "Tes",
    color: "#f59e0b",
    data: [800, 1200, 1600, 2000],
  },
];

const TEACHER_ACTIVITIES: TeacherActivity[] = [
  {
    id: "1",
    name: "Ibu Rahma Johar",
    initials: "RJ",
    avatarColor: "bg-indigo-600",
    subject: "Matematika Wajib",
    lastActivity: "2 jam lalu",
    totalStudents: 60,
    totalClasses: 2,
  },
  {
    id: "2",
    name: "Bpk. Rudi Santoso",
    initials: "RS",
    avatarColor: "bg-emerald-600",
    subject: "Matematika Peminatan",
    lastActivity: "5 jam lalu",
    totalStudents: 32,
    totalClasses: 1,
  },
  {
    id: "3",
    name: "Bpk. Dani Wirawan",
    initials: "DW",
    avatarColor: "bg-amber-600",
    subject: "Statistika & Probabilitas",
    lastActivity: "Kemarin",
    totalStudents: 24,
    totalClasses: 1,
  },
  {
    id: "4",
    name: "Ibu Sari Dewi",
    initials: "SD",
    avatarColor: "bg-rose-600",
    subject: "Matematika Peminatan",
    lastActivity: "3 hari lalu",
    totalStudents: 28,
    totalClasses: 1,
  },
];

export default function AdminDashboardTemplate() {
  return (
    <AdminDashboardContent
      stats={ADMIN_STATS}
      chartLabels={CHART_LABELS}
      chartLines={CHART_LINES}
      chartTitle="Tren Pertumbuhan Platform"
      teacherActivities={TEACHER_ACTIVITIES}
    />
  );
}
