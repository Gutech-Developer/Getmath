"use client";

import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import FilterIcon from "@/components/atoms/icons/FilterIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import SortIcon from "@/components/atoms/icons/SortIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import SearchableInput from "@/components/atoms/SearchableInput";
import { Modal } from "@/components/molecules/Modal";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";

import type {
  AdminClassStatus,
  IAdminClassListItem,
  IClassFormPayload,
} from "@/types/adminClassList";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSearchUser } from "@/services/hooks/useUser";

interface IAdminClassListContentProps {
  classes: IAdminClassListItem[];
  onCreateClass: (payload: IClassFormPayload) => void;
  onUpdateClass: (classId: string, payload: IClassFormPayload) => void;
  onDeleteClass: (classId: string) => void;
  onToggleClassStatus: (classId: string) => void;
  onManageClass?: (classId: string) => void;
  showTeacherSelection?: boolean;
}

interface IClassFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  values: IClassFormPayload;
  initialTeacherName?: string;
  onClose: () => void;
  onValuesChange: (values: IClassFormPayload) => void;
  onSubmit: () => void;
  showTeacherSelection: boolean;
  isTeacherPage: boolean;
}

/* ------------------------------------------------------------------ */
/* COMPONENT: ClassFormModal                                         */
/* ------------------------------------------------------------------ */
function ClassFormModal({
  isOpen,
  title,
  submitLabel,
  values,
  initialTeacherName = "",
  onClose,
  onValuesChange,
  onSubmit,
  isTeacherPage,
  showTeacherSelection,
}: IClassFormModalProps) {
  const isSubmitDisabled =
    values.className.trim().length < 3 ||
    (!isTeacherPage && showTeacherSelection && !values.teacherId);

  const [teacherSearchInput, setTeacherSearchInput] = useState("");
  const [debouncedTeacherQuery, setDebouncedTeacherQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (initialTeacherName && teacherSearchInput === initialTeacherName) {
      setDebouncedTeacherQuery(teacherSearchInput);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedTeacherQuery(teacherSearchInput);
    }, 500);

    return () => clearTimeout(handler);
  }, [teacherSearchInput, isOpen, initialTeacherName]);

  const { data: userData, isPending: isTeacherLoading } = useSearchUser({
    limit: 3,
    role: "teacher",
    search: debouncedTeacherQuery,
  });

  const fetchedTeacherOptions = useMemo(() => {
    if (!userData?.users) return [];
    return userData.users.map((u) => ({
      value: u.profileId,
      label: `${u.fullName} (${u.schoolName ?? "Tanpa Sekolah"})`,
    }));
  }, [userData]);

  useEffect(() => {
    if (isOpen) {
      if (initialTeacherName) {
        setTeacherSearchInput(initialTeacherName);
      } else {
        setTeacherSearchInput("");
      }
    }
  }, [isOpen, initialTeacherName]);

  useEffect(() => {
    if (isOpen && initialTeacherName && userData?.users && !values.teacherId) {
      const matchedTeacher = userData.users.find(
        (u) => u.fullName.toLowerCase() === initialTeacherName.toLowerCase(),
      );
      if (matchedTeacher) {
        onValuesChange({
          ...values,
          teacherId: matchedTeacher.profileId,
        });
      }
    }
  }, [isOpen, initialTeacherName, userData, values, onValuesChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/45 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Tutup popup"
      />

      {/* PERBAIKAN: Mengubah overflow-hidden menjadi overflow-visible agar dropdown tidak terpotong */}
      <div className="relative w-full max-w-[560px] overflow-visible rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        {/* PERBAIKAN: Menambahkan overflow-hidden dan rounded-t khusus di header agar sudut atas tetap melengkung rapi */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5 overflow-hidden rounded-t-[28px]">
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

        {/* PERBAIKAN: Memastikan form menggunakan overflow-visible */}
        <form
          className="space-y-5 px-6 py-5 overflow-visible"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitDisabled) return;
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
                onValuesChange({ ...values, className: event.target.value })
              }
              placeholder="cth: Matematika Wajib Kelas X"
              className="h-12 w-full rounded-2xl border border-[#D1D5DB] px-4 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#DBEAFE]"
            />
          </div>

          {!isTeacherPage && showTeacherSelection && (
            // PERBAIKAN: Memastikan wrapper input pencarian memiliki z-index tinggi dan tidak mengunci overflow
            <div className="space-y-2 relative z-50 overflow-visible">
              <label className="block text-lg font-semibold text-[#374151]">
                Pilih Guru
              </label>
              <SearchableInput
                value={teacherSearchInput}
                onChange={(text, option) => {
                  setTeacherSearchInput(text);
                  if (option) {
                    onValuesChange({ ...values, teacherId: option.value });
                  } else {
                    if (values.teacherId)
                      onValuesChange({ ...values, teacherId: "" });
                  }
                }}
                options={fetchedTeacherOptions}
                isLoading={isTeacherLoading}
                placeholder="Ketik nama guru untuk mencari..."
                className="w-full"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition relative z-10",
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

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT: AdminClassListContent                             */
/* ------------------------------------------------------------------ */
export default function AdminClassListContent({
  classes,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onToggleClassStatus,
  onManageClass,
  showTeacherSelection = true,
}: IAdminClassListContentProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedGlobalQuery, setDebouncedGlobalQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [sortBy, setSortBy] = useState<
    | "name-asc"
    | "name-desc"
    | "students-desc"
    | "students-asc"
    | "tests-desc"
    | "tests-asc"
  >("name-asc");

  const filteredClasses = useMemo(() => {
    const normalizedQuery = debouncedGlobalQuery.trim().toLowerCase();
    let nextItems = classes;

    if (statusFilter !== "all") {
      nextItems = nextItems.filter(
        (classItem) => classItem.status === statusFilter,
      );
    }

    if (normalizedQuery) {
      nextItems = nextItems.filter((classItem) => {
        return (
          classItem.name.toLowerCase().includes(normalizedQuery) ||
          classItem.teacherName.toLowerCase().includes(normalizedQuery) ||
          classItem.code.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    const sorted = [...nextItems];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.name.localeCompare(a.name, "id");
        case "students-desc":
          return b.studentCount - a.studentCount;
        case "students-asc":
          return a.studentCount - b.studentCount;
        case "tests-desc":
          return b.testCount - a.testCount;
        case "tests-asc":
          return a.testCount - b.testCount;
        case "name-asc":
        default:
          return a.name.localeCompare(b.name, "id");
      }
    });

    return sorted;
  }, [classes, debouncedGlobalQuery, sortBy, statusFilter]);

  const handleOpenAddModal = () => {
    setSelectedTeacherName("");
    setCreateFormValues({ className: "", teacherId: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (classItem: IAdminClassListItem) => {
    setEditingClassId(classItem.id);
    setSelectedTeacherName(classItem.teacherName);
    setEditFormValues({
      className: classItem.name,
      teacherId: "",
    });
  };

  const handleCreateClass = () => {
    onCreateClass(createFormValues);
    setIsAddModalOpen(false);
  };

  const handleUpdateClass = () => {
    if (!editingClassId) return;
    onUpdateClass(editingClassId, editFormValues);
    setEditingClassId(null);
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
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari nama kelas, guru, atau kode..."
            className="h-12 min-w-[240px] flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#DBEAFE]"
          />
        </div>

        {filteredClasses.length > 0 ? (
          <ul className="space-y-4">
            {filteredClasses.map((classItem) => (
              <li
                key={classItem.id}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">
                      {classItem.name}
                    </h2>
                    <p className="text-sm text-[#6B7280]">
                      Guru: {classItem.teacherName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(classItem)}
                    className="p-2 border border-[#BFDBFE] rounded-xl bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center border border-dashed border-[#D1D5DB] rounded-2xl text-sm text-[#6B7280]">
            Belum ada kelas yang terdaftar.
          </div>
        )}
      </section>

      {/* MODAL FORM TAMBAH */}
      <ClassFormModal
        isOpen={isAddModalOpen}
        title="Tambah Kelas Baru"
        submitLabel="Tambah Kelas"
        values={createFormValues}
        onClose={() => setIsAddModalOpen(false)}
        onValuesChange={setCreateFormValues}
        onSubmit={handleCreateClass}
        isTeacherPage={isTeacherPage}
        showTeacherSelection={showTeacherSelection}
      />

      {/* MODAL FORM EDIT */}
      <ClassFormModal
        isOpen={Boolean(editingClassId)}
        title="Edit Kelas"
        submitLabel="Simpan Perubahan"
        values={editFormValues}
        initialTeacherName={selectedTeacherName}
        onClose={() => setEditingClassId(null)}
        onValuesChange={setEditFormValues}
        onSubmit={handleUpdateClass}
        isTeacherPage={isTeacherPage}
        showTeacherSelection={showTeacherSelection}
      />
    </>
  );
}
