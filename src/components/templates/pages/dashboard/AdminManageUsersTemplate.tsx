"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { cn } from "@/libs/utils";
import { toast } from "sonner";
import { useSearchUser, useDeleteUser, useCreateUser, useUpdateUser, useUserStats } from "@/services/hooks/useUser";
import { Modal } from "@/components/molecules/Modal";
import { TablePagination } from "@/components/molecules/table/TablePagination";
import { CreateUserInput, GsUserData, UpdateUserInput } from "@/types/user";
import SearchableInput from "@/components/atoms/SearchableInput";
import { useSchoolSearch } from "@/services/hooks/useSchoolSearch";

interface IAdminManageUsersTemplateProps {
  role: "siswa" | "guru";
}

function formatDateToYYYYMMDD(dateStr?: string | null): string {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const idMatch = str.match(/^(\d{2})[/.-](\d{2})[/.-](\d{4})/);
  if (idMatch) {
    return `${idMatch[3]}-${idMatch[2]}-${idMatch[1]}`;
  }
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch {}
  return str.slice(0, 10);
}

function UserFormModal({
  isOpen,
  onClose,
  role,
  initialData,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: "siswa" | "guru";
  initialData?: GsUserData | null;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    identityNumber: "", // NIS or NIP
    schoolId: "",
    isActive: true,
    birthDate: "",
    gender: "",
  });
  const [schoolSearch, setSchoolSearch] = useState("");

  const { schools, isLoading: loadingSchools } = useSchoolSearch({
    searchTerm: schoolSearch,
    debounceMs: 500,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const idNum = role === "siswa" ? initialData.student?.NIS : initialData.teacher?.NIP;
        const bDate = role === "siswa" ? formatDateToYYYYMMDD(initialData.student?.birthDate) : "";
        const gndr = role === "siswa" ? initialData.student?.gender : "";
        setForm({
          fullName: initialData.fullName || "",
          email: initialData.email || "",
          password: "",
          phoneNumber: initialData.phoneNumber || "",
          identityNumber: idNum || "",
          schoolId: initialData.schoolId || "",
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          birthDate: bDate || "",
          gender: gndr || "",
        });
        setSchoolSearch(initialData.schoolName || "");
      } else {
        setForm({
          fullName: "",
          email: "",
          password: "",
          phoneNumber: "",
          identityNumber: "",
          schoolId: "",
          isActive: true,
          birthDate: "",
          gender: "",
        });
        setSchoolSearch("");
      }
    }
  }, [isOpen, initialData, role]);

  const isSubmitDisabled =
    !form.fullName ||
    !form.email ||
    (!initialData && !form.password) || // password is required only for creation
    !form.identityNumber ||
    !form.schoolId ||
    (role === "siswa" && (!form.birthDate || !form.gender)) ||
    isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const payload: any = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      schoolId: form.schoolId,
    };

    if (initialData) {
      payload.isActive = form.isActive;
    }

    if (form.password) {
      payload.password = form.password;
    }

    if (role === "siswa") {
      payload.role = "STUDENT";
      payload.NIS = form.identityNumber;
      payload.birthDate = formatDateToYYYYMMDD(form.birthDate);
      payload.gender = form.gender;
    } else {
      payload.role = "TEACHER";
      payload.NIP = form.identityNumber;
    }

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Tutup popup"
      />
      <div className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[28px] border border-lottie-teal/16 bg-white shadow-[0_24px_70px_rgba(31,35,117,0.15)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5 rounded-t-[28px]">
          <h2 className="text-xl font-semibold leading-tight text-[#111827]">
            {initialData ? "Edit" : "Tambah"} {role === "siswa" ? "Siswa" : "Guru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#1F2937]"
            aria-label="Tutup modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151]">Nama Lengkap</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151]">
              {role === "siswa" ? "NIS" : "NIP"}
            </label>
            <input
              type="text"
              value={form.identityNumber}
              onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
              placeholder={role === "siswa" ? "Nomor Induk Siswa" : "Nomor Induk Pegawai"}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={initialData ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 8 karakter"}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151]">Nomor HP (Opsional)</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="Contoh: 08123456789"
              className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
            />
          </div>

          {role === "siswa" && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#374151]">Tanggal Lahir</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#374151]">Jenis Kelamin</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50 cursor-pointer"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </>
          )}

          {initialData && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#374151]">Status Akun</label>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                className="h-11 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          )}

          <SearchableInput
            label="Asal Sekolah"
            placeholder="Ketik untuk mencari sekolah..."
            value={schoolSearch}
            onChange={(val, selected) => {
              if (selected) {
                setSchoolSearch(selected.metadata?.schoolName || selected.value);
                setForm({ ...form, schoolId: selected.metadata?.schoolId || "" });
              } else {
                setSchoolSearch(val);
                if (form.schoolId) setForm({ ...form, schoolId: "" });
              }
            }}
            options={schools.map((s) => ({
              value: s.name,
              label: s.name,
              metadata: { schoolName: s.name, schoolId: s.id },
            }))}
            isLoading={loadingSchools}
            emptyMessage={schoolSearch.length >= 2 ? "Sekolah tidak ditemukan" : "Ketik minimal 2 karakter"}
            required
          />

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition cursor-pointer",
              isSubmitDisabled
                ? "cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF]"
                : "bg-lottie-teal mantaps text-white  text-white"
            )}
          >
            {initialData ? (
              <span>{isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Akun"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminManageUsersTemplate({ role }: IAdminManageUsersTemplateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GsUserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<GsUserData | null>(null);

  const backendRole = role === "siswa" ? "student" : "teacher";

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: statsData } = useUserStats();

  // Fetch users of the role (server-side pagination)
  const { data: usersData, isLoading } = useSearchUser({
    page,
    limit,
    role: backendRole,
    search: debouncedSearch || undefined,
  });

  const allUsers = usersData?.users || [];

  // Frontend filtering for status (search is handled on server side)
  const paginatedUsers = useMemo(() => {
    let result = allUsers;

    if (statusFilter === "ACTIVE") {
      result = result.filter(u => u.isActive === true);
    } else if (statusFilter === "INACTIVE") {
      result = result.filter(u => u.isActive === false);
    }

    return result;
  }, [allUsers, statusFilter]);

  const totalItems = usersData?.pagination?.totalItems ?? paginatedUsers.length;
  const totalPages = usersData?.pagination?.totalPages ?? Math.ceil(totalItems / limit);

  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleCreate = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      await createUser.mutateAsync(data as CreateUserInput);
      toast.success(`${role === "siswa" ? "Siswa" : "Guru"} berhasil ditambahkan`);
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menambahkan user");
    }
  };

  const handleUpdate = async (data: CreateUserInput | UpdateUserInput) => {
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({ id: editingUser.userId, data: data as UpdateUserInput });
      toast.success(`${role === "siswa" ? "Siswa" : "Guru"} berhasil diperbarui`);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error?.message || "Gagal memperbarui user");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser.mutateAsync(deletingUser.userId);
      toast.success(`${role === "siswa" ? "Siswa" : "Guru"} berhasil dihapus`);
      setDeletingUser(null);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus user");
      setDeletingUser(null);
    }
  };

  const rolePath = role === "siswa" ? "student" : "teacher";

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Manajemen User - {role === "siswa" ? "Siswa" : "Guru"}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Kelola data {role} yang terdaftar dalam sistem
          </p>
        </div>
      </div>

      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="getmath-card p-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total Guru</p>
            <p className="mt-2 text-2xl font-bold text-[#111827]">
              {statsData.totalTeachers || 0}
            </p>
          </div>
          <div className="getmath-card p-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total Siswa</p>
            <p className="mt-2 text-2xl font-bold text-[#111827]">
              {statsData.totalStudents || 0}
            </p>
          </div>
          <div className="getmath-card p-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total Orang Tua</p>
            <p className="mt-2 text-2xl font-bold text-[#111827]">
              {statsData.totalParents || 0}
            </p>
          </div>
          <div className="getmath-card p-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Akun Aktif</p>
            <p className="mt-2 text-2xl font-bold text-[#059669]">
              {statsData.activeUsers || 0}
            </p>
          </div>
          <div className="getmath-card p-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Akun Nonaktif</p>
            <p className="mt-2 text-2xl font-bold text-[#DC2626]">
              {statsData.inactiveUsers || 0}
            </p>
          </div>
        </div>
      )}

      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-xl font-semibold leading-tight text-[#111827]">
            Daftar {role === "siswa" ? "Siswa" : "Guru"} ({totalItems})
          </h2>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-lottie-teal mantaps text-white  px-5 py-3 text-sm font-semibold text-white transition cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Tambah {role === "siswa" ? "Siswa" : "Guru"}</span>
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={`Cari nama, email, atau asal sekolah...`}
            className="h-12 min-w-[240px] flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#9CA3AF] focus:border-lottie-teal/20 focus:ring-2 focus:ring-lottie-mint-glow/20"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-12 rounded-2xl border border-lottie-teal/20 bg-white px-4 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 min-w-[140px] cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-[#6B7280]">Memuat data {role}...</div>
        ) : paginatedUsers.length > 0 ? (
          <ul className="space-y-4">
            {paginatedUsers.map((user) => (
              <li
                key={user.userId}
                className={cn(
                  "getmath-card p-5 md:p-6 transition",
                  !user.isActive && "border-red-200 bg-red-50/50 opacity-80"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                      {user.fullName}
                      {user.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-semibold text-[#065F46]">Aktif</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-semibold text-[#991B1B]">Nonaktif</span>
                      )}
                    </h3>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-[#6B7280]">
                      <span>Email: <strong className="text-lottie-teal">{user.email}</strong></span>
                      <span>Sekolah: <strong className="text-lottie-teal">{user.schoolName || "-"}</strong></span>
                      {role === "siswa" && user.role === "STUDENT" && user.student?.NIS && (
                        <span>NIS: <strong className="text-lottie-teal">{user.student.NIS}</strong></span>
                      )}
                      {role === "guru" && user.role === "TEACHER" && user.teacher?.NIP && (
                        <span>NIP: <strong className="text-lottie-teal">{user.teacher.NIP}</strong></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/manage-users/${rolePath}/${user.userId}?fullName=${encodeURIComponent(user.fullName)}`}
                      className="p-2 border border-lottie-teal/20 rounded-xl bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10 transition cursor-pointer"
                      title={`Detail ${role}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="p-2 border border-amber-200 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                      title={`Edit ${role}`}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingUser(user)}
                      className="p-2 border border-red-200 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      title={`Hapus ${role}`}
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
            Belum ada {role} yang terdaftar atau tidak ditemukan.
          </div>
        )}

        {totalItems > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </section>

      {/* MODAL TAMBAH USER */}
      <UserFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        role={role}
        onSubmit={handleCreate}
        isSubmitting={createUser.isPending}
      />

      {/* MODAL EDIT USER */}
      <UserFormModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        role={role}
        initialData={editingUser}
        onSubmit={handleUpdate}
        isSubmitting={updateUser.isPending}
      />

      <Modal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title={`Hapus ${role === "siswa" ? "Siswa" : "Guru"}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <TrashIcon className="h-7 w-7 text-[#DC2626]" />
          </div>
          <p className="text-center text-sm text-[#4B5563]">
            Apakah Anda yakin ingin menghapus {role} <strong className="text-gray-900">{deletingUser?.fullName}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="mt-4 flex w-full justify-end gap-3 pt-4">
            <button
              onClick={() => setDeletingUser(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition"
              disabled={deleteUser.isPending}
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C] transition disabled:opacity-50"
            >
              {deleteUser.isPending ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
