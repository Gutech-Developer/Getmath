"use client";

import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import FilterIcon from "@/components/atoms/icons/FilterIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import SortIcon from "@/components/atoms/icons/SortIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type {
  AdminClassStatus,
  IAdminClassListItem,
  IClassFormPayload,
  ITeacherOption,
} from "@/types/adminClassList";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface IAdminClassListContentProps {
  classes: IAdminClassListItem[];
  teacherOptions: ITeacherOption[];
  onCreateClass: (payload: IClassFormPayload) => void;
  onUpdateClass: (classId: string, payload: IClassFormPayload) => void;
  onDeleteClass: (classId: string) => void;
  onToggleClassStatus: (classId: string) => void;
  onManageClass?: (classId: string) => void;
}

interface IClassFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  values: IClassFormPayload;
  teacherOptions: ITeacherOption[];
  onClose: () => void;
  onValuesChange: (values: IClassFormPayload) => void;
  onSubmit: () => void;
}

function ClassFormModal({
  isOpen,
  title,
  submitLabel,
  values,
  teacherOptions,
  onClose,
  onValuesChange,
  onSubmit,
  isTeacherPage,
}: IClassFormModalProps & { isTeacherPage: boolean }) {
  const isSubmitDisabled =
    values.className.trim().length < 3 || !values.teacherId;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/45 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Tutup popup"
      />

      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-2xl font-semibold leading-tight text-[#111827]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#1F2937]"
            aria-label="Tutup modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitDisabled) {
              return;
            }
            onSubmit();
          }}
        >
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#374151]">
              Nama Kelas
            </label>
            <input
              type="text"
              value={values.className}
              onChange={(event) =>
                onValuesChange({
                  ...values,
                  className: event.target.value,
                })
              }
              placeholder="cth: Matematika Wajib Kelas X"
              className="h-12 w-full rounded-2xl border border-[#D1D5DB] px-4 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#DBEAFE]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#374151]">
              Pilih Guru
            </label>
            <select
              value={values.teacherId}
              onChange={(event) =>
                onValuesChange({
                  ...values,
                  teacherId: event.target.value,
                })
              }
              disabled={isTeacherPage}
              className={cn(
                "h-12 w-full rounded-2xl border px-4 text-base outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#DBEAFE]",
                isTeacherPage
                  ? "border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed"
                  : "border-[#D1D5DB] bg-white text-[#111827]",
              )}
            >
              <option value="">Pilih guru pengampu</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </option>
              ))}
            </select>
            {isTeacherPage && (
              <p className="text-sm text-[#6B7280]">
                Pilih guru tidak dapat diubah di halaman guru.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition",
              isSubmitDisabled
                ? "cursor-not-allowed bg-[#E5E7EB] text-white"
                : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
            )}
          >
            <PlusIcon className="h-4 w-4" />
            <span>{submitLabel}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminClassListContent({
  classes,
  teacherOptions,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onToggleClassStatus,
  onManageClass,
}: IAdminClassListContentProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [createFormValues, setCreateFormValues] = useState<IClassFormPayload>({
    className: "",
    teacherId: "",
  });
  const [editFormValues, setEditFormValues] = useState<IClassFormPayload>({
    className: "",
    teacherId: "",
  });
  const pathname = usePathname();
  const isTeacherPage = pathname?.includes("/teacher") ?? false;

  const [statusFilter, setStatusFilter] = useState<AdminClassStatus | "all">(
    "all",
  );

  const filteredClasses = useMemo(() => {
    if (statusFilter === "all") {
      return classes;
    }

    return classes.filter((classItem) => classItem.status === statusFilter);
  }, [classes, statusFilter]);

  const teacherIdByLabel = useMemo(
    () =>
      teacherOptions.reduce<Record<string, string>>((accumulator, teacher) => {
        accumulator[teacher.label] = teacher.id;
        return accumulator;
      }, {}),
    [teacherOptions],
  );

  const handleOpenAddModal = () => {
    setCreateFormValues({
      className: "",
      teacherId: isTeacherPage ? (teacherOptions[0]?.id ?? "") : "",
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (classItem: IAdminClassListItem) => {
    setEditingClassId(classItem.id);
    setEditFormValues({
      className: classItem.name,
      teacherId:
        teacherIdByLabel[classItem.teacherName] ??
        (isTeacherPage ? (teacherOptions[0]?.id ?? "") : ""),
    });
  };

  const handleCloseEditModal = () => {
    setEditingClassId(null);
  };

  const handleCreateClass = () => {
    onCreateClass(createFormValues);
    handleCloseAddModal();
  };

  const handleUpdateClass = () => {
    if (!editingClassId) {
      return;
    }

    onUpdateClass(editingClassId, editFormValues);
    handleCloseEditModal();
  };

  const handleDeleteClass = (classItem: IAdminClassListItem) => {
    const shouldDelete = window.confirm(
      `Hapus kelas \"${classItem.name}\" dari daftar?`,
    );

    if (!shouldDelete) {
      return;
    }

    onDeleteClass(classItem.id);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast.success(`Kode kelas ${code} berhasil disalin`);
    } catch {
      showToast.error("Browser tidak mengizinkan salin kode kelas");
    }
  };

  return (
    <>
      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight text-[#111827]">
            Daftar Kelas ({filteredClasses.length})
          </h1>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Kelas</span>
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 min-w-[136px] items-center rounded-2xl border border-[#E5E7EB] bg-white px-3 text-[#6B7280] transition hover:bg-[#F9FAFB]"
            aria-label="Filter daftar kelas"
          >
            <FilterIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-12 min-w-[136px] items-center rounded-2xl border border-[#E5E7EB] bg-white px-3 text-[#6B7280] transition hover:bg-[#F9FAFB]"
            aria-label="Urutkan daftar kelas"
          >
            <SortIcon className="h-4 w-4" />
          </button>
        </div>

        {filteredClasses.length > 0 ? (
          <ul className="space-y-4">
            {filteredClasses.map((classItem) => {
              const isActive = classItem.status === "Aktif";

              return (
                <li
                  key={classItem.id}
                  className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-lg font-semibold leading-tight text-[#111827]">
                          {classItem.name}
                        </h2>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-base font-semibold",
                            isActive
                              ? "bg-[#ECFDF5] text-[#059669]"
                              : "bg-[#F3F4F6] text-[#6B7280]",
                          )}
                        >
                          {classItem.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[#6B7280]">
                        Guru: {classItem.teacherName}
                      </p>

                      <p className="mt-1  text-sm text-[#9CA3AF]">
                        Dibuat: {classItem.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(classItem)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                        aria-label={`Edit ${classItem.name}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleClassStatus(classItem.id)}
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                          isActive
                            ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#16A34A] hover:bg-[#DCFCE7]"
                            : "border-[#D1D5DB] bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6]",
                        )}
                        aria-label={`Ubah status ${classItem.name}`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClass(classItem)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                        aria-label={`Hapus ${classItem.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
                      <p className="text-xl font-semibold text-[#2563EB]">
                        {classItem.studentCount}
                      </p>
                      <p className="text-sm text-[#9CA3AF]">Siswa</p>
                    </div>

                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
                      <p className="text-xl font-semibold text-[#2563EB]">
                        {classItem.testCount}
                      </p>
                      <p className="text-sm text-[#9CA3AF]">Tes</p>
                    </div>

                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
                      <p className="text-xl font-semibold text-[#2563EB]">
                        {classItem.code}
                      </p>
                      <p className="text-sm text-[#9CA3AF]">Kode</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5  font-semibold text-[#2563EB]">
                        {classItem.code}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(classItem.code)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] transition hover:bg-[#F3F4F6]"
                        aria-label={`Salin kode ${classItem.code}`}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onManageClass?.(classItem.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-5 py-2  font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
                    >
                      <span>Kelola Kelas</span>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 6L15 12L9 18"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F8FAFC] p-8 text-center text-sm text-[#6B7280]">
            Belum ada kelas yang terdaftar.
          </div>
        )}
      </section>

      <ClassFormModal
        isOpen={isAddModalOpen}
        title="Tambah Kelas Baru"
        submitLabel="Tambah Kelas"
        values={createFormValues}
        teacherOptions={teacherOptions}
        onClose={handleCloseAddModal}
        onValuesChange={setCreateFormValues}
        onSubmit={handleCreateClass}
        isTeacherPage={isTeacherPage}
      />

      <ClassFormModal
        isOpen={Boolean(editingClassId)}
        title="Edit Kelas"
        submitLabel="Simpan Perubahan"
        values={editFormValues}
        teacherOptions={teacherOptions}
        onClose={handleCloseEditModal}
        onValuesChange={setEditFormValues}
        onSubmit={handleUpdateClass}
        isTeacherPage={isTeacherPage}
      />
    </>
  );
}
