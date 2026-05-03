"use client";

import {
  AdminDashboardContent,
  AdminChartLine,
  AdminStat,
  TeacherActivity,
} from "@/components/organisms/AdminDashboardContent";
import BookIcon from "@/components/atoms/icons/BookIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import {
  useGsAllCourses,
  useGsAllDiagnosticTests,
  useGsAllSubjects,
} from "@/services";

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
  const { data: coursesData } = useGsAllCourses({ limit: 1 });
  const { data: subjectsData } = useGsAllSubjects({ limit: 1 });
  const { data: diagnosticTestsData } = useGsAllDiagnosticTests({ limit: 1 });

  const stats: AdminStat[] = [
    {
      icon: <UsersIcon className="h-5 w-5" />,
      iconColor: "bg-blue-100 text-blue-500",
      value: coursesData?.pagination.totalItems ?? 0,
      label: "Total Kelas",
      delta: 3,
    },
    {
      icon: <DashboardIcon className="h-5 w-5" variant="filled" />,
      iconColor: "bg-emerald-100 text-emerald-500",
      value: subjectsData?.pagination.totalItems ?? 0,
      label: "Total Materi",
      delta: 3,
    },
    {
      icon: <BookIcon className="h-5 w-5" />,
      iconColor: "bg-violet-100 text-violet-500",
      value: diagnosticTestsData?.pagination.totalItems ?? 0,
      label: "Total Tes",
      delta: 3,
    },
    {
      icon: <ClipboardIcon className="h-5 w-5" />,
      iconColor: "bg-amber-100 text-amber-500",
      value:
        (coursesData?.pagination.totalItems ?? 0) +
        (subjectsData?.pagination.totalItems ?? 0),
      label: "Total Konten",
      delta: 3,
    },
  ];

  return (
    <AdminDashboardContent
      stats={stats}
      chartLabels={CHART_LABELS}
      chartLines={CHART_LINES}
      chartTitle="Tren Pertumbuhan Platform"
      teacherActivities={TEACHER_ACTIVITIES}
    />
  );
}
