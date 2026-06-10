"use client";

import { useEffect, useState } from "react";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";
import { toast } from "sonner";
import {
  useSchools,
  useCreateSchool,
  useUpdateSchool,
  useDeleteSchool,
} from "@/services";
import { GsSchoolWithCounts } from "@/types/gs-school";
import { Modal } from "@/components/molecules/Modal";
import { TablePagination } from "@/components/molecules/table/TablePagination";

interface ISchoolFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

function SchoolFormModal({
  isOpen,
  title,
  submitLabel,
  initialName = "",
  onClose,
  onSubmit,
  isSubmitting,
}: ISchoolFormModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const isSubmitDisabled = name.trim().length < 3 || isSubmitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Tutup popup"
      />
      <div className="relative w-full max-w-[500px] overflow-visible rounded-[28px] border border-lottie-teal/16 bg-white shadow-[0_24px_70px_rgba(31,35,117,0.15)]">
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

        <form
          className="space-y-5 px-6 py-5 overflow-visible"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitDisabled) return;
            onSubmit(name);
          }}
        >
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#374151]">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="cth: SMAN 1 Jakarta"
              className="h-12 w-full rounded-2xl border border-[#D1D5DB] px-4 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition relative z-10 cursor-pointer",
              isSubmitDisabled
                ? "cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF]"
                : "bg-lottie-teal mantaps text-white  text-white"
            )}
          >
            <PlusIcon className="h-4 w-4" />
            <span>{isSubmitting ? "Memproses..." : submitLabel}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminManageSchoolsTemplate() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<GsSchoolWithCounts | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<GsSchoolWithCounts | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: schoolsData, isLoading } = useSchools({
    page,
    limit,
    search: debouncedSearch,
  });

  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const handleCreate = async (name: string) => {
    try {
      await createSchool.mutateAsync({ name });
      toast.success("Sekolah berhasil ditambahkan");
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menambahkan sekolah");
    }
  };

  const handleUpdate = async (name: string) => {
    if (!editingSchool) return;
    try {
      await updateSchool.mutateAsync({
        id: editingSchool.id,
        data: { name },
      });
      toast.success("Sekolah berhasil diperbarui");
      setEditingSchool(null);
    } catch (error: any) {
      toast.error(error?.message || "Gagal memperbarui sekolah");
    }
  };

  const handleDelete = async () => {
    if (!deletingSchool) return;
    try {
      await deleteSchool.mutateAsync(deletingSchool.id);
      toast.success("Sekolah berhasil dihapus");
      setDeletingSchool(null);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus sekolah");
      setDeletingSchool(null);
    }
  };

  const schools = schoolsData?.schools || [];

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Manajemen List Sekolah</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Kelola data institusi sekolah yang terdaftar dalam sistem
          </p>
        </div>
      </div>

      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-xl font-semibold leading-tight text-[#111827]">
            Daftar Sekolah ({schoolsData?.pagination?.totalItems || 0})
          </h2>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-lottie-teal mantaps text-white  px-5 py-3 text-sm font-semibold text-white transition cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Tambah Sekolah</span>
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari nama sekolah..."
            className="h-12 min-w-[240px] flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-lottie-teal/20 focus:ring-2 focus:ring-lottie-mint-glow/20"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-[#6B7280]">Memuat data sekolah...</div>
        ) : schools.length > 0 ? (
          <ul className="space-y-4">
            {schools.map((school) => (
              <li
                key={school.id}
                className="getmath-card p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827]">
                      {school.name}
                    </h3>
                    <div className="mt-2 flex gap-4 text-sm text-[#6B7280]">
                      <span>Guru: <strong className="text-lottie-teal">{school.teacherCount}</strong></span>
                      <span>Siswa: <strong className="text-lottie-teal">{school.studentCount}</strong></span>
                      <span>Kelas: <strong className="text-lottie-teal">{school.courseCount}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSchool(school)}
                      className="p-2 border border-lottie-teal/20 rounded-xl bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10 transition cursor-pointer"
                      title="Edit Sekolah"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingSchool(school)}
                      className="p-2 border border-red-200 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      title="Hapus Sekolah"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center border border-dashed border-[#D1D5DB] rounded-2xl text-sm text-[#6B7280]">
            Belum ada sekolah yang terdaftar atau tidak ditemukan.
          </div>
        )}

        {schoolsData?.pagination && schoolsData.pagination.totalPages > 1 && (
          <TablePagination
            currentPage={schoolsData.pagination.currentPage}
            totalPages={schoolsData.pagination.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </section>

      {/* MODAL TAMBAH */}
      <SchoolFormModal
        isOpen={isAddOpen}
        title="Tambah Sekolah Baru"
        submitLabel="Simpan Sekolah"
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createSchool.isPending}
      />

      {/* MODAL EDIT */}
      <SchoolFormModal
        isOpen={Boolean(editingSchool)}
        title="Edit Sekolah"
        submitLabel="Simpan Perubahan"
        initialName={editingSchool?.name || ""}
        onClose={() => setEditingSchool(null)}
        onSubmit={handleUpdate}
        isSubmitting={updateSchool.isPending}
      />

      {/* MODAL HAPUS */}
      <Modal
        isOpen={Boolean(deletingSchool)}
        onClose={() => setDeletingSchool(null)}
        title="Hapus Sekolah"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <TrashIcon className="h-7 w-7 text-[#DC2626]" />
          </div>
          <p className="text-center text-sm text-[#4B5563]">
            Apakah Anda yakin ingin menghapus sekolah <strong className="text-gray-900">{deletingSchool?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="mt-4 flex w-full justify-end gap-3 pt-4">
            <button
              onClick={() => setDeletingSchool(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition"
              disabled={deleteSchool.isPending}
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteSchool.isPending}
              className="rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C] transition disabled:opacity-50"
            >
              {deleteSchool.isPending ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
