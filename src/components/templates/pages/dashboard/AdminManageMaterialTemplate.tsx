"use client";

import TeacherManageMaterialContent from "@/components/organisms/TeacherManageMaterialContent";
import { useGsAllSubjects } from "@/services";

export default function AdminManageMaterialTemplate() {
  return <TeacherManageMaterialContent useSubjectsQuery={useGsAllSubjects} />;
}
