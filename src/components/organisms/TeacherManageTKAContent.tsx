"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import SearchableInput from "@/components/atoms/SearchableInput";
import TkaSchoolPicker from "@/components/molecules/tka/TkaSchoolPicker";
import TkaTeacherPicker from "@/components/molecules/tka/TkaTeacherPicker";
import { Badge } from "@/components/atoms/Badge";
import {
  TKA_STATUS_BADGE,
  TKA_STATUS_LABEL,
} from "@/constant/tka";
import { FilterTabs } from "@/components/molecules/FilterTabs";
import { Modal } from "@/components/molecules/Modal";
import { TablePagination } from "@/components/molecules/table";
import { GsApiError } from "@/libs/api";
import { showToast } from "@/libs/toast";
import {
  useAssignTka,
  useDebouncedValue,
  useDeleteTka,
  useDuplicateTka,
  useTkaList,
} from "@/services";
import { useSchoolSearch } from "@/services/hooks/useSchool";
import { useSearchUser } from "@/services/hooks/useUser";
import type { TKAStatus, TKATestSummary } from "@/types/tka";
import { formatTkaDateTime } from "@/utils/tka";

type Role = "admin" | "teacher";

const STATUS_LABEL: Record<TKAStatus, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Tersedia",
  COMPLETED: "Selesai",
};

const STATUS_BADGE: Record<
  TKAStatus,
  "warning" | "success" | "info"
> = {
  DRAFT: "warning",
  AVAILABLE: "success",
  COMPLETED: "info",
};

export default function TeacherManageTKAContent({ role = "teacher" }: { role?: Role }) {
  const router = useRouter();
  const basePath =
    role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<TKAStatus | "">("");
  const [search, setSearch] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolFilterId, setSchoolFilterId] = useState("");
  const [schoolFilterLabel, setSchoolFilterLabel] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherFilterId, setTeacherFilterId] = useState("");
  const [teacherFilterLabel, setTeacherFilterLabel] = useState("");

  const debouncedSearch = useDebouncedValue(search);
  const debouncedTeacherQuery = useDebouncedValue(teacherQuery);

  const { schools: schoolOptions, isLoading: isSchoolLoading } =
    useSchoolSearch({ searchTerm: schoolQuery });
  const { data: teacherData, isPending: isTeacherLoading } = useSearchUser(
    {
      role: "teacher",
      limit: 50,
      search: debouncedTeacherQuery || undefined,
      schoolId: schoolFilterId || undefined,
    },
    { enabled: role === "admin" },
  );

  const { data, isLoading, isError, error } = useTkaList({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
    schoolId: role === "admin" ? schoolFilterId || undefined : undefined,
    teacherId: role === "admin" ? teacherFilterId || undefined : undefined,
  });

  const deleteMutation = useDeleteTka();
  const [deleteTarget, setDeleteTarget] = useState<TKATestSummary | null>(null);
  const [assignTarget, setAssignTarget] = useState<TKATestSummary | null>(null);
  const [assignSchoolId, setAssignSchoolId] = useState("");
  const [assignSchoolLabel, setAssignSchoolLabel] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignTeacherLabel, setAssignTeacherLabel] = useState("");
  const [duplicateTarget, setDuplicateTarget] =
    useState<TKATestSummary | null>(null);
  const [duplicateTargets, setDuplicateTargets] = useState<
    Array<{
      schoolId: string;
      schoolLabel: string;
      teacherId: string;
      teacherLabel: string;
    }>
  >([{ schoolId: "", schoolLabel: "", teacherId: "", teacherLabel: "" }]);

  const assignMutation = useAssignTka(assignTarget?.id ?? "");
  const duplicateMutation = useDuplicateTka(duplicateTarget?.id ?? "");

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, schoolFilterId, teacherFilterId, limit]);

  useEffect(() => {
    setTeacherFilterId("");
    setTeacherFilterLabel("");
    setTeacherQuery("");
  }, [schoolFilterId]);

  const counts = data?.counts;
  const tabs = useMemo(
    () => [
      { key: "", label: `Semua (${counts?.total ?? 0})` },
      { key: "AVAILABLE", label: `Tersedia (${counts?.available ?? 0})` },
      { key: "DRAFT", label: `Draft (${counts?.draft ?? 0})` },
      { key: "COMPLETED", label: `Selesai (${counts?.completed ?? 0})` },
    ],
    [counts],
  );

  const teacherOptions = useMemo(
    () =>
      (teacherData?.users ?? []).map((user) => ({
        value: user.profileId,
        label: `${user.fullName} (${user.schoolName ?? "Tanpa Sekolah"})`,
      })),
    [teacherData],
  );

  const schoolFilterOptions = useMemo(
    () =>
      schoolOptions.map((school) => ({
        value: school.id,
        label: school.name,
      })),
    [schoolOptions],
  );

  const copyAccessCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast.success("Kode akses disalin");
    } catch {
      showToast.error("Gagal menyalin kode akses");
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast.success("TKA berhasil dihapus");
        setDeleteTarget(null);
      },
      onError: (mutationError) => {
        showToast.error(mutationError.message);
      },
    });
  };

  const openAssign = (test: TKATestSummary) => {
    setAssignTarget(test);
    setAssignSchoolId(test.schoolId);
    setAssignSchoolLabel(test.schoolName);
    setAssignTeacherId(test.teacherId ?? "");
    setAssignTeacherLabel(test.teacherName ?? "");
  };

  const handleAssign = () => {
    if (!assignTarget) return;
    if (!assignSchoolId && !assignTeacherId) {
      showToast.error("Pilih sekolah atau guru terlebih dahulu");
      return;
    }
    assignMutation.mutate(
      {
        schoolId: assignSchoolId || undefined,
        teacherId: assignTeacherId || null,
      },
      {
        onSuccess: () => {
          showToast.success("TKA berhasil di-assign");
          setAssignTarget(null);
        },
        onError: (mutationError) => {
          if (
            mutationError instanceof GsApiError &&
            mutationError.status === 409
          ) {
            const target = assignTarget;
            setAssignTarget(null);
            showToast.warning(
              "Sekolah tidak dapat dipindahkan karena sudah ada attempt. Gunakan Duplikat TKA.",
            );
            if (target) openDuplicate(target);
            return;
          }
          showToast.error(mutationError.message);
        },
      },
    );
  };

  const openDuplicate = (test: TKATestSummary) => {
    setDuplicateTarget(test);
    setDuplicateTargets([
      {
        schoolId: "",
        schoolLabel: "",
        teacherId: "",
        teacherLabel: "",
      },
    ]);
  };

  const handleDuplicate = () => {
    if (!duplicateTarget) return;
    const targets = duplicateTargets
      .filter((target) => Boolean(target.schoolId))
      .map((target) => ({
        schoolId: target.schoolId,
        teacherId: target.teacherId || undefined,
      }));
    if (targets.length === 0) {
      showToast.error("Pilih minimal 1 sekolah tujuan");
      return;
    }
    duplicateMutation.mutate(
      { targets },
      {
        onSuccess: (created) => {
          showToast.success(`${created.length} TKA berhasil diduplikasi`);
          setDuplicateTarget(null);
        },
        onError: (mutationError) => {
          showToast.error(mutationError.message);
        },
      },
    );
  };

  return (
    <section className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            Kelola TKA
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {counts?.total ?? 0} TKA ·{" "}
            {role === "admin"
              ? "Seluruh TKA lintas sekolah"
              : "TKA yang kamu kelola"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`${basePath}/manage-tka/create`)}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white duration-200 hover:bg-lottie-teal/90"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah TKA</span>
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul TKA..."
            className="h-11 w-full rounded-2xl border border-[#E5E7EB] bg-white pl-9 pr-4 text-sm outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50"
          />
        </div>

        {role === "admin" && (
          <>
            <div className="min-w-[220px]">
              <SearchableInput
                value={schoolFilterLabel}
                onChange={(value, option) => {
                  setSchoolFilterLabel(value);
                  setSchoolQuery(value);
                  setSchoolFilterId(option?.value ?? "");
                }}
                options={schoolFilterOptions}
                isLoading={isSchoolLoading}
                placeholder="Filter sekolah..."
              />
            </div>
            <div className="min-w-[220px]">
              <SearchableInput
                value={teacherFilterLabel}
                onChange={(value, option) => {
                  setTeacherFilterLabel(value);
                  setTeacherQuery(value);
                  setTeacherFilterId(option?.value ?? "");
                }}
                options={teacherOptions}
                isLoading={isTeacherLoading}
                placeholder="Filter guru..."
              />
            </div>
          </>
        )}

        <FilterTabs
          tabs={tabs}
          activeTab={status}
          onTabChange={(key) => setStatus(key as TKAStatus | "")}
        />
      </div>

      {isLoading && (
        <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
          Memuat TKA...
        </div>
      )}

      {!isLoading && isError && (
        <div className="getmath-card p-8 text-center text-sm text-rose-600">
          {error.message}
        </div>
      )}

      {!isLoading && !isError && (data?.tests.length ?? 0) === 0 && (
        <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
          Belum ada TKA yang cocok dengan filter.
        </div>
      )}

      {!isLoading && !isError && (data?.tests.length ?? 0) > 0 && (
        <ul className="space-y-3">
          {data?.tests.map((test) => (
            <li
              key={test.id}
              className="getmath-card flex flex-wrap items-start gap-4 px-5 py-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold leading-tight text-[#111827]">
                    {test.title}
                  </h2>
                  <Badge variant={TKA_STATUS_BADGE[test.status]}>
                    {TKA_STATUS_LABEL[test.status]}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-[#6B7280]">
                  {test.schoolName} ·{" "}
                  {test.teacherName ?? "Milik Sekolah"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                  <span>{test.totalQuestions} soal</span>
                  <span>·</span>
                  <span>{test.durationMinutes} menit</span>
                  <span>·</span>
                  <span>{test.pointsPerQuestion} poin/soal</span>
                  <span>·</span>
                  <span>
                    {test.startAt && test.endAt
                      ? `${formatTkaDateTime(test.startAt)} - ${formatTkaDateTime(test.endAt)}`
                      : "Jadwal belum diatur"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-lottie-teal/10 px-3 py-1 font-mono text-xs font-semibold text-lottie-teal">
                    {test.accessCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyAccessCode(test.accessCode)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-lottie-teal transition hover:bg-lottie-teal/10"
                    aria-label="Salin kode akses"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`${basePath}/manage-tka/${test.id}/analytics`)
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lottie-teal/5 text-lottie-teal transition hover:bg-lottie-teal/10"
                  aria-label={`Analitik ${test.title}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`${basePath}/manage-tka/${test.id}/edit`)
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lottie-teal/5 text-lottie-teal transition hover:bg-lottie-teal/10"
                  aria-label={`Edit ${test.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                {role === "admin" && (
                  <>
                    <button
                      type="button"
                      onClick={() => openAssign(test)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition hover:bg-sky-100"
                      aria-label={`Assign ${test.title}`}
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDuplicate(test)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
                      aria-label={`Duplikat ${test.title}`}
                    >
                      <CopyIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(test)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                  aria-label={`Hapus ${test.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data?.pagination && data.pagination.totalItems > 0 && (
        <TablePagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus TKA"
        size="sm"
      >
        <p className="text-sm text-[#4B5563]">
          Hapus TKA <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Assign TKA"
        size="sm"
      >
        <div className="space-y-4">
          <TkaSchoolPicker
            label="Sekolah"
            valueLabel={assignSchoolLabel}
            onChange={(schoolId, schoolLabel) => {
              setAssignSchoolId(schoolId);
              setAssignSchoolLabel(schoolLabel);
              setAssignTeacherId("");
              setAssignTeacherLabel("");
            }}
            required
          />
          <TkaTeacherPicker
            schoolId={assignSchoolId}
            label="Guru"
            valueLabel={assignTeacherLabel}
            onChange={(teacherId, teacherLabel) => {
              setAssignTeacherId(teacherId);
              setAssignTeacherLabel(teacherLabel);
            }}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setAssignTarget(null)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={assignMutation.isPending}
            className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {assignMutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(duplicateTarget)}
        onClose={() => setDuplicateTarget(null)}
        title="Duplikat TKA"
        size="md"
      >
        <p className="text-sm text-[#4B5563]">
          Salin <strong>{duplicateTarget?.title}</strong> ke sekolah tujuan.
          Hasil duplikat berstatus Draft dengan kode akses baru.
        </p>
        <div className="mt-4 space-y-3">
          {duplicateTargets.map((target, index) => {
            return (
              <div
                key={`duplicate-${index}`}
                className="rounded-2xl border border-[#E5E7EB] p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <TkaSchoolPicker
                      label=""
                      valueLabel={target.schoolLabel}
                      onChange={(schoolId, schoolLabel) => {
                        const next = [...duplicateTargets];
                        next[index] = {
                          ...next[index],
                          schoolId,
                          schoolLabel,
                          teacherId: "",
                          teacherLabel: "",
                        };
                        setDuplicateTargets(next);
                      }}
                    />
                  </div>
                  {duplicateTargets.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDuplicateTargets(
                          duplicateTargets.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                      aria-label="Hapus target"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <TkaTeacherPicker
                    schoolId={target.schoolId}
                    label=""
                    valueLabel={target.teacherLabel}
                    onChange={(teacherId, teacherLabel) => {
                      const next = [...duplicateTargets];
                      next[index] = {
                        ...next[index],
                        teacherId,
                        teacherLabel,
                      };
                      setDuplicateTargets(next);
                    }}
                  />
                </div>
              </div>
            );
          })}
          {duplicateTargets.length < 50 && (
            <button
              type="button"
              onClick={() =>
                setDuplicateTargets([
                  ...duplicateTargets,
                  {
                    schoolId: "",
                    schoolLabel: "",
                    teacherId: "",
                    teacherLabel: "",
                  },
                ])
              }
              className="inline-flex items-center gap-2 rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm font-medium text-[#4B5563]"
            >
              <PlusIcon className="h-4 w-4" /> Tambah sekolah
            </button>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDuplicateTarget(null)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {duplicateMutation.isPending ? "Menduplikasi..." : "Duplikat"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
