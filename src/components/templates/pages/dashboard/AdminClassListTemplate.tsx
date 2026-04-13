"use client";

import AdminClassListContent from "@/components/organisms/AdminClassListContent";
import {
  INITIAL_ADMIN_CLASS_LIST,
  ADMIN_CLASS_TEACHER_OPTIONS,
} from "@/constant/adminClassList";
import type {
  IAdminClassListItem,
  IClassFormPayload,
} from "@/types/adminClassList";
import { showToast } from "@/libs/toast";
import { useCallback, useMemo, useState } from "react";

function buildClassCode(className: string, serialNumber: number): string {
  const prefix = className
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.slice(0, 4))
    .join("-");

  const safePrefix = prefix || "KELAS";

  return `${safePrefix}-${String(serialNumber).padStart(3, "0")}`;
}

function getTodayDateLabel(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminClassListTemplate() {
  const [classes, setClasses] = useState<IAdminClassListItem[]>(
    INITIAL_ADMIN_CLASS_LIST,
  );

  const teacherNameById = useMemo(
    () =>
      ADMIN_CLASS_TEACHER_OPTIONS.reduce<Record<string, string>>(
        (accumulator, teacher) => {
          accumulator[teacher.id] = teacher.label;
          return accumulator;
        },
        {},
      ),
    [],
  );

  const resolveTeacherName = useCallback(
    (teacherId: string) =>
      teacherNameById[teacherId] ?? "Guru belum ditentukan",
    [teacherNameById],
  );

  const handleCreateClass = useCallback(
    (payload: IClassFormPayload) => {
      setClasses((previous) => {
        const nextSerial = previous.length + 1;
        const newClass: IAdminClassListItem = {
          id: `class-${Date.now()}`,
          name: payload.className.trim(),
          teacherName: resolveTeacherName(payload.teacherId),
          createdAt: getTodayDateLabel(),
          studentCount: 0,
          testCount: 0,
          code: buildClassCode(payload.className, nextSerial),
          status: "Aktif",
        };

        return [newClass, ...previous];
      });

      showToast.success("Kelas baru berhasil ditambahkan");
    },
    [resolveTeacherName],
  );

  const handleUpdateClass = useCallback(
    (classId: string, payload: IClassFormPayload) => {
      setClasses((previous) =>
        previous.map((classItem) =>
          classItem.id === classId
            ? {
                ...classItem,
                name: payload.className.trim(),
                teacherName: resolveTeacherName(payload.teacherId),
              }
            : classItem,
        ),
      );

      showToast.success("Perubahan kelas berhasil disimpan");
    },
    [resolveTeacherName],
  );

  const handleDeleteClass = useCallback((classId: string) => {
    setClasses((previous) =>
      previous.filter((classItem) => classItem.id !== classId),
    );
    showToast.success("Kelas berhasil dihapus");
  }, []);

  const handleToggleClassStatus = useCallback((classId: string) => {
    setClasses((previous) =>
      previous.map((classItem) => {
        if (classItem.id !== classId) {
          return classItem;
        }

        return {
          ...classItem,
          status: classItem.status === "Aktif" ? "Nonaktif" : "Aktif",
        };
      }),
    );
  }, []);

  const handleManageClass = useCallback(() => {
    showToast.info("Halaman kelola kelas akan segera dihubungkan");
  }, []);

  return (
    <AdminClassListContent
      classes={classes}
      teacherOptions={ADMIN_CLASS_TEACHER_OPTIONS}
      onCreateClass={handleCreateClass}
      onUpdateClass={handleUpdateClass}
      onDeleteClass={handleDeleteClass}
      onToggleClassStatus={handleToggleClassStatus}
      onManageClass={handleManageClass}
    />
  );
}
