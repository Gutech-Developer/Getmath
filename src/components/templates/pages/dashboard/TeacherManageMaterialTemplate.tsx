"use client";

import TeacherManageMaterialContent from "@/components/organisms/TeacherManageMaterialContent";
import { useGsAllSubjects, useGsMySubjects } from "@/services";

export default function TeacherManageMaterialTemplate({
  role = "teacher",
}: {
  role?: "admin" | "teacher";
}) {
  const query = role === "admin" ? useGsAllSubjects : useGsMySubjects;
  return <TeacherManageMaterialContent useSubjectsQuery={query} role={role} />;
}
