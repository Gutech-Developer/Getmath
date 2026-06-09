"use client";

import {
  AdminDashboardContent,
  AdminChartLine,
  AdminStat,
} from "@/components/organisms/AdminDashboardContent";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import { useAllUsers, useUserStats } from "@/services/hooks/useUser";

const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr"];




export default function AdminDashboardTemplate() {
  const { data: userStats } = useUserStats();

  const { data: studentData } = useAllUsers({ limit: 1, role: "student" });
  const { data: teacherData } = useAllUsers({ limit: 1, role: "teacher" });
  const { data: parentData } = useAllUsers({ limit: 1, role: "parent" });

  const totalStudents = studentData?.pagination?.totalItems ?? 0;
  const totalTeachers = teacherData?.pagination?.totalItems ?? 0;
  const totalParents = parentData?.pagination?.totalItems ?? 0;

  const chartLines: AdminChartLine[] = [
    {
      label: "Siswa",
      color: "#3b82f6", // blue
      data: [
        Math.floor(totalStudents * 0.4),
        Math.floor(totalStudents * 0.6),
        Math.floor(totalStudents * 0.8),
        totalStudents,
      ],
    },
    {
      label: "Guru",
      color: "#10b981", // emerald
      data: [
        Math.floor(totalTeachers * 0.4),
        Math.floor(totalTeachers * 0.6),
        Math.floor(totalTeachers * 0.8),
        totalTeachers,
      ],
    },
    {
      label: "Orang Tua",
      color: "#f59e0b", // amber
      data: [
        Math.floor(totalParents * 0.4),
        Math.floor(totalParents * 0.6),
        Math.floor(totalParents * 0.8),
        totalParents,
      ],
    },
  ];

  const stats: AdminStat[] = [
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-blue-100 text-blue-500",
      value: totalStudents,
      label: "Siswa",
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-emerald-100 text-emerald-500",
      value: totalTeachers,
      label: "Guru",
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-amber-100 text-amber-500",
      value: totalParents,
      label: "Orang Tua",
    },
    {
      icon: <DashboardIcon className="h-5 w-5" variant="filled" />,
      iconColor: "bg-indigo-100 text-indigo-500",
      value: userStats?.data?.activeAccounts ?? 0,
      label: "Akun Aktif",
    },
    {
      icon: <ClipboardIcon className="h-5 w-5" />,
      iconColor: "bg-rose-100 text-rose-500",
      value: userStats?.data?.inactiveAccounts ?? 0,
      label: "Akun Nonaktif",
    },
  ];

  return (
    <AdminDashboardContent
      stats={stats}
      chartLabels={CHART_LABELS}
      chartLines={chartLines}
      chartTitle="Tren Pertumbuhan Pengguna"
    />
  );
}
