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
      color: "#1F2375", // GetMath Indigo (lottie-teal)
      data: [
        Math.floor(totalStudents * 0.4),
        Math.floor(totalStudents * 0.6),
        Math.floor(totalStudents * 0.8),
        totalStudents,
      ],
    },
    {
      label: "Guru",
      color: "#818cf8", // lottie-mint-glow
      data: [
        Math.floor(totalTeachers * 0.4),
        Math.floor(totalTeachers * 0.6),
        Math.floor(totalTeachers * 0.8),
        totalTeachers,
      ],
    },
    {
      label: "Orang Tua",
      color: "#f4d58d", // topaz
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
      iconColor: "bg-lottie-teal/5 text-lottie-teal",
      value: totalStudents,
      label: "Siswa",
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-emerald-50 text-emerald-600",
      value: totalTeachers,
      label: "Guru",
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-amber-50 text-amber-600",
      value: totalParents,
      label: "Orang Tua",
    },
    {
      icon: <DashboardIcon className="h-5 w-5" variant="filled" />,
      iconColor: "bg-lottie-teal/5 text-lottie-teal",
      value: userStats?.data?.activeAccounts ?? 0,
      label: "Akun Aktif",
    },
    {
      icon: <ClipboardIcon className="h-5 w-5" />,
      iconColor: "bg-red-50 text-red-600",
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
