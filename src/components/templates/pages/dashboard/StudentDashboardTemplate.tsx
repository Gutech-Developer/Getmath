"use client";

import { useState } from "react";
import {
  StudentDashboardContent,
  EnrolledClass,
  AvailableClass,
} from "@/components/organisms/StudentDashboardContent";

// ============ MOCK DATA ============
// Replace with real API data from hooks

const ENROLLED_CLASSES: EnrolledClass[] = [
  {
    id: "1",
    title: "Matematika Wajib Kelas X",
    teacher: "Bpk. Budi Santoso",
    institution: "Umum",
    academicYear: "Ganjil 2024/2025",
    progress: 75,
    totalMaterials: 6,
    totalStudents: 35,
    symbol: <span className="text-xl">Σ</span>,
    symbolColor: "bg-indigo-100 text-indigo-600",
    progressVariant: "primary",
    activeTests: 1,
  },
  {
    id: "2",
    title: "Matematika Peminatan XI IPA",
    teacher: "Ibu Sari Dewi",
    institution: "IPA",
    academicYear: "Ganjil 2024/2025",
    progress: 45,
    totalMaterials: 8,
    totalStudents: 53,
    symbol: <span className="text-xl">∫</span>,
    symbolColor: "bg-purple-100 text-purple-600",
    progressVariant: "info",
    activeTests: 2,
  },
  {
    id: "3",
    title: "Statistika & Probabilitas",
    teacher: "Bpk. Dari Wiraswiri",
    institution: "IPA/IPS",
    academicYear: "Ganjil 2024/2025",
    progress: 90,
    totalMaterials: 5,
    totalStudents: 24,
    symbol: <span className="text-xl">σ</span>,
    symbolColor: "bg-emerald-100 text-emerald-600",
    progressVariant: "success",
  },
];

const AVAILABLE_CLASSES: AvailableClass[] = [
  {
    id: "4",
    title: "Matematika Dasar XI IPS",
    teacher: "Ibu Tina Putri",
    institution: "IPS",
    academicYear: "Ganjil 2024/2025",
    totalMaterials: 7,
    totalStudents: 20,
    symbol: <span className="text-xl">π</span>,
    symbolColor: "bg-rose-100 text-rose-600",
  },
  {
    id: "5",
    title: "Geometri & Trigonometri",
    teacher: "Bpk. Arif Rahman",
    institution: "IPA",
    academicYear: "Genap 2024/2025",
    totalMaterials: 9,
    totalStudents: 22,
    symbol: <span className="text-xl">△</span>,
    symbolColor: "bg-amber-100 text-amber-600",
  },
  {
    id: "6",
    title: "Logika Matematika",
    teacher: "Ibu Rina Sari",
    institution: "Umum",
    academicYear: "Genap 2024/2025",
    totalMaterials: 4,
    totalStudents: 35,
    symbol: <span className="text-xl">∧</span>,
    symbolColor: "bg-red-100 text-red-600",
  },
];

const StudentDashboardTemplate = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter enrolled classes based on search and tab
  const filteredEnrolledClasses = ENROLLED_CLASSES.filter((cls) => {
    const matchesSearch =
      !searchValue ||
      cls.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchValue.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_progress" && cls.progress < 100) ||
      (activeTab === "completed" && cls.progress >= 100);

    return matchesSearch && matchesTab;
  });

  // Filter available classes based on search
  const filteredAvailableClasses = AVAILABLE_CLASSES.filter(
    (cls) =>
      !searchValue ||
      cls.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleJoinClass = () => {
    // TODO: Open join class modal
    console.log("Open join class modal");
  };

  const handleClassClick = (classId: string) => {
    // TODO: Navigate to class detail
    console.log("Navigate to class:", classId);
  };

  const handleJoinWithCode = (classId: string) => {
    // TODO: Open join with code modal for specific class
    console.log("Join with code:", classId);
  };

  return (
    <StudentDashboardContent
      studentName="Rafli Afriza Nugraha"
      streakDays={5}
      level={12}
      xp={2840}
      rank={2}
      totalClassesFollowed={3}
      enrolledClasses={filteredEnrolledClasses}
      availableClasses={filteredAvailableClasses}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onJoinClass={handleJoinClass}
      onClassClick={handleClassClick}
      onJoinWithCode={handleJoinWithCode}
    />
  );
};

export default StudentDashboardTemplate;
