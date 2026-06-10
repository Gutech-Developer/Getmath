"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { MATERIAL_BADGE_CLASS_BY_TYPE } from "@/constant/materialManagement";
import { cn } from "@/libs/utils";
import { showToast } from "@/libs/toast";
import { toEmbedUrl, type EmbedType } from "@/libs/embed";
import { useEffect, useState, useMemo } from "react";
import {
  useGsMySubjects,
  useGsCreateSubject,
  useGsUpdateSubject,
  useGsDeleteSubject,
} from "@/services";
import { TablePagination } from "@/components/molecules/table";
import SearchableInput from "@/components/atoms/SearchableInput";
import { useSearchUser } from "@/services/hooks/useUser";

interface ITeacherManageMaterialContentProps {
  useSubjectsQuery?: typeof useGsMySubjects;
  role?: "admin" | "teacher";
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface ISubjectForm {
  subjectName: string;
  description: string;
  subjectFileUrl: string;
  videoUrl: string;
  elkpdTitle: string;
  elkpdDescription: string;
  elkpdFileUrl: string;
  teacherId?: string;
  teacherName?: string;
}

function createEmptyForm(): ISubjectForm {
  return {
    subjectName: "",
    description: "",
    subjectFileUrl: "",
    videoUrl: "",
    elkpdTitle: "",
    elkpdDescription: "",
    elkpdFileUrl: "",
    teacherId: "",
    teacherName: "",
  };
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

interface IPreview {
  title: string;
  url: string;
  type: EmbedType;
}

function PreviewModal({
  preview,
  onClose,
}: {
  preview: IPreview | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [preview, onClose]);

  if (!preview) return null;

  const embedSrc = toEmbedUrl(preview.url, preview.type);
  const typeLabel =
    preview.type === "pdf"
      ? "PDF · Heyzine"
      : preview.type === "video"
        ? "Video · YouTube"
        : "E-LKPD · Liveworksheets";

  return (
    <div className="fixed inset-0 z-90 flex flex-col bg-[#111827]/80 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-100 mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              {typeLabel}
            </p>
            <h3 className="text-lg font-semibold text-[#111827] leading-tight">
              {preview.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-lottie-teal/5 px-3 py-1.5 text-xs font-semibold text-lottie-teal transition hover:bg-lottie-teal/10"
            >
              Buka di tab baru
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#6B7280] transition hover:bg-[#F3F4F6]"
              aria-label="Tutup preview"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#F3F4F6]">
          <iframe
            src={embedSrc}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={preview.title}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-material row ─────────────────────────────────────────────────────────

function SubMaterialRow({
  icon,
  label,
  title,
  badgeClass,
  onPreview,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  badgeClass: string;
  onPreview: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6B7280] shadow-sm">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold leading-none",
            badgeClass,
          )}
        >
          {label}
        </span>
        <p className="mt-0.5 truncate text-sm font-medium text-[#374151]">
          {title}
        </p>
      </div>
      <button
        type="button"
        onClick={onPreview}
        className="shrink-0 rounded-xl bg-lottie-teal/5 px-3 py-1.5 text-xs font-semibold text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
      >
        Preview
      </button>
    </div>
  );
}

// ─── Subject Modal Component ──────────────────────────────────────────────────

function SubjectModal({
  isOpen,
  isEditing,
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
  role,
  initialTeacherName = "",
}: {
  isOpen: boolean;
  isEditing: boolean;
  form: ISubjectForm;
  isSaving: boolean;
  onChange: (patch: Partial<ISubjectForm>) => void;
  onClose: () => void;
  onSubmit: () => void;
  role?: "admin" | "teacher";
  initialTeacherName?: string;
}) {
  // ── STATE UNTUK NATIVE DEBOUNCE SEARCH GURU ──
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

  // Hit Endpoint API Pencarian User secara Internal
  const { data: userData, isPending: isTeacherLoading } = useSearchUser({
    role: "teacher",
    page: 1,
    limit: 30,
    search: debouncedTeacherQuery,
  });

  const fetchedTeacherOptions = useMemo(() => {
    if (!userData?.users) return [];
    return userData.users.map((u) => ({
      value: u.profileId,
      label: `${u.fullName} (${u.schoolName ?? "Tanpa Sekolah"})`,
    }));
  }, [userData]);

  // Sinkronisasi input teks saat modal terbuka (Edit vs Tambah)
  useEffect(() => {
    if (isOpen) {
      if (initialTeacherName) {
        setTeacherSearchInput(initialTeacherName);
      } else {
        setTeacherSearchInput("");
      }
    }
  }, [isOpen, initialTeacherName]);

  // Otomatis pasangkan ID jika nama hasil query awal cocok dengan nama dari list utama kelas
  useEffect(() => {
    if (isOpen && initialTeacherName && userData?.users && !form.teacherId) {
      const matchedTeacher = userData.users.find(
        (u) => u.fullName.toLowerCase() === initialTeacherName.toLowerCase(),
      );
      if (matchedTeacher) {
        onChange({ teacherId: matchedTeacher.profileId });
      }
    }
  }, [isOpen, initialTeacherName, userData, form.teacherId, onChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50";
  const labelClass = "block text-base font-semibold text-[#374151]";

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* PERBAIKAN: Mengubah overflow-hidden menjadi overflow-visible agar dropdown search guru tidak terpotong */}
      <div className="relative z-90 w-full max-w-[820px] overflow-visible rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5 overflow-hidden rounded-t-3xl">
          <h3 className="text-xl font-semibold text-[#111827]">
            {isEditing ? "Edit Materi" : "Tambah Materi Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6]"
            aria-label="Tutup"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5 thinnest-scrollbar overflow-visible">
          <div className="rounded-2xl border border-[#EFF6FF] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1E40AF]">
            Judul Materi wajib diisi. Silakan lengkapi minimal satu komponen
            pembelajaran (PDF, Video, atau E-LKPD) sesuai kebutuhan materi Anda.
          </div>

          {/* Input Guru (Hanya Admin) */}
          {role === "admin" && (
            <div className="space-y-2 relative z-50 overflow-visible">
              <SearchableInput
                label="Guru (Pembuat Materi)"
                placeholder="Cari atau ketik nama guru..."
                value={teacherSearchInput}
                onChange={(label, option) => {
                  setTeacherSearchInput(label);
                  if (option) {
                    onChange({ teacherName: label, teacherId: option.value });
                  } else {
                    if (form.teacherId) onChange({ teacherId: "" });
                  }
                }}
                options={fetchedTeacherOptions}
                isLoading={isTeacherLoading}
                required
              />
            </div>
          )}

          {/* Judul */}
          <div className="space-y-2">
            <label className={labelClass}>
              Judul Materi <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={form.subjectName}
              onChange={(e) => onChange({ subjectName: e.target.value })}
              placeholder="Contoh: Persamaan Kuadrat"
              className={inputClass}
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className={labelClass}>Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Deskripsi singkat materi (opsional)"
              rows={2}
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {/* Link Materi */}
          <div className="space-y-2">
            <label className={labelClass}>
              Link Materi (PDF / File) - Opsional
            </label>
            <input
              type="url"
              value={form.subjectFileUrl}
              onChange={(e) => onChange({ subjectFileUrl: e.target.value })}
              placeholder="https://heyzine.com/flip-book/3094f26f1e.html"
              className={inputClass}
            />
          </div>

          {/* Link Video */}
          <div className="space-y-2">
            <label className={labelClass}>
              Link Video (YouTube) - Opsional
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass}
            />
          </div>

          {/* E-LKPD — opsional */}
          <div className="border-t border-[#E5E7EB] pt-4">
            <p className="mb-3 text-base font-semibold text-[#374151]">
              E-LKPD (Liveworksheets - Opsional)
            </p>
            <div className="space-y-4 rounded-2xl border border-lottie-teal/20 bg-lottie-teal/5 p-4">
              <div className="space-y-2">
                <label className={labelClass}>Judul E-LKPD</label>
                <input
                  type="text"
                  value={form.elkpdTitle}
                  onChange={(e) => onChange({ elkpdTitle: e.target.value })}
                  placeholder="Judul lembar kerja"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Deskripsi E-LKPD</label>
                <textarea
                  value={form.elkpdDescription}
                  onChange={(e) =>
                    onChange({ elkpdDescription: e.target.value })
                  }
                  placeholder="Deskripsi E-LKPD (opsional)"
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Link E-LKPD</label>
                <input
                  type="url"
                  value={form.elkpdFileUrl}
                  onChange={(e) => onChange({ elkpdFileUrl: e.target.value })}
                  placeholder="https://www.liveworksheets.com/..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-8 py-2.5 text-base font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-8 py-2.5 text-base disabled:opacity-60 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            <span>
              {isSaving
                ? "Menyimpan..."
                : isEditing
                  ? "Simpan Perubahan"
                  : "Simpan Materi"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT: TeacherManageMaterialContent                      */
/* ------------------------------------------------------------------ */
export default function TeacherManageMaterialContent({
  useSubjectsQuery = useGsMySubjects,
  role = "teacher",
}: ITeacherManageMaterialContentProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [form, setForm] = useState<ISubjectForm>(createEmptyForm);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<IPreview | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // State bantu untuk mengalirkan nama guru ke modal anak saat edit diklik
  const [selectedTeacherName, setSelectedTeacherName] = useState("");

  const { data: subjectsData, isLoading } = useSubjectsQuery({ page, limit });
  const createSubject = useGsCreateSubject();
  const updateSubject = useGsUpdateSubject();
  const deleteSubject = useGsDeleteSubject();

  const subjects = subjectsData?.subjects ?? [];

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openCreateModal = () => {
    setEditingSubjectId(null);
    setSelectedTeacherName("");
    setForm(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (subjectId: string) => {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;

    // Type casting ke (s as any) agar garis merah hilang
    const rawSubject = s as any;

    setEditingSubjectId(subjectId);
    setSelectedTeacherName(rawSubject.teacherName ?? "");
    setForm({
      subjectName: s.subjectName,
      description: s.description ?? "",
      subjectFileUrl: s.subjectFileUrl ?? "",
      videoUrl: s.videoUrl ?? "",
      elkpdTitle: s.eLKPDTitle ?? "",
      elkpdDescription: s.eLKPDDescription ?? "",
      elkpdFileUrl: s.eLKPDFileUrl ?? "",
      teacherId: rawSubject.teacherId ?? "",
      teacherName: rawSubject.teacherName ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubjectId(null);
  };

  const handleSave = () => {
    if (!form.subjectName.trim()) {
      showToast.error("Judul materi wajib diisi");
      return;
    }
    if (role === "admin" && !form.teacherId) {
      showToast.error("Silakan pilih guru pengampu terlebih dahulu");
      return;
    }

    const hasPdf = Boolean(form.subjectFileUrl.trim());
    const hasVideo = Boolean(form.videoUrl.trim());
    const hasElkpd = Boolean(
      form.elkpdTitle.trim() && form.elkpdFileUrl.trim(),
    );

    if (!hasPdf && !hasVideo && !hasElkpd) {
      showToast.error(
        "Minimal satu komponen (PDF, Video, atau E-LKPD) harus diisi",
      );
      return;
    }

    if (
      (form.elkpdTitle.trim() && !form.elkpdFileUrl.trim()) ||
      (!form.elkpdTitle.trim() && form.elkpdFileUrl.trim())
    ) {
      showToast.error(
        "Judul dan Link E-LKPD harus diisi lengkap jika ingin menambahkan E-LKPD",
      );
      return;
    }

    const elkpdData =
      form.elkpdTitle.trim() && form.elkpdFileUrl.trim()
        ? {
          eLKPD: {
            title: form.elkpdTitle.trim(),
            description: form.elkpdDescription.trim() || null,
            fileUrl: form.elkpdFileUrl.trim(),
          },
        }
        : {};

    const baseSubjectPayload = {
      subjectName: form.subjectName.trim(),
      description: form.description.trim() || null,
      subjectFileUrl: form.subjectFileUrl.trim() || null,
      videoUrl: form.videoUrl.trim() || null,
      teacherId: form.teacherId || undefined,
    };

    if (editingSubjectId) {
      const updatePayload = {
        ...baseSubjectPayload,
        eLKPDTitle: form.elkpdTitle.trim() || null,
        eLKPDDescription: form.elkpdDescription.trim() || null,
        eLKPDFileUrl: form.elkpdFileUrl.trim() || null,
      };

      updateSubject.mutate(
        { id: editingSubjectId, data: updatePayload },
        {
          onSuccess: () => {
            showToast.success("Materi berhasil diperbarui");
            closeModal();
          },
          onError: (err) =>
            showToast.error(err.message ?? "Gagal memperbarui materi"),
        },
      );
    } else {
      createSubject.mutate(
        {
          ...baseSubjectPayload,
          ...elkpdData,
        },
        {
          onSuccess: () => {
            showToast.success("Materi berhasil ditambahkan");
            closeModal();
          },
          onError: (err) =>
            showToast.error(err.message ?? "Gagal menambahkan materi"),
        },
      );
    }
  };

  const handleDelete = (subjectId: string) => {
    if (!confirm("Hapus materi ini? Tindakan tidak dapat dibatalkan.")) return;
    deleteSubject.mutate(subjectId, {
      onSuccess: () => showToast.success("Materi berhasil dihapus"),
      onError: (err) =>
        showToast.error(err.message ?? "Gagal menghapus materi"),
    });
  };

  const isSaving = createSubject.isPending || updateSubject.isPending;

  return (
    <>
      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-[#111827]">
              Kelola Materi
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {isLoading
                ? "Memuat materi..."
                : `${subjectsData?.pagination.totalItems ?? 0} materi tersedia · Materi dapat dipilih ke dalam tiap kelas`}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-5 py-3 text-base"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Materi</span>
          </button>
        </header>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
            Memuat data materi...
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-12 text-center">
            <p className="text-sm text-[#9CA3AF]">
              Belum ada materi. Klik &quot;Tambah Materi&quot; untuk mulai.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subject) => {
              const hasPdf = !!subject.subjectFileUrl;
              const hasVideo = !!subject.videoUrl;
              const hasElkpd = !!subject.eLKPDTitle;
              const isExpanded = expandedIds.has(subject.id);
              const dateLabel = new Date(subject.createdAt).toLocaleDateString(
                "id-ID",
                { day: "2-digit", month: "short", year: "numeric" },
              );

              return (
                <li
                  key={subject.id}
                  className="getmath-card overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-5">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold leading-tight text-[#111827]">
                        {subject.subjectName}
                      </h2>
                      {subject.description && (
                        <p className="mt-1.5 truncate text-base text-[#6B7280]">
                          {subject.description}
                        </p>
                      )}
                      {role === "admin" && (subject as any).teacherName && (
                        <p className="mt-1 text-xs font-medium text-[#4F46E5]">
                          Oleh: {(subject as any).teacherName}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {hasPdf && (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-sm font-semibold leading-none",
                              MATERIAL_BADGE_CLASS_BY_TYPE["pdf"],
                            )}
                          >
                            PDF
                          </span>
                        )}
                        {hasVideo && (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-sm font-semibold leading-none",
                              MATERIAL_BADGE_CLASS_BY_TYPE["video"],
                            )}
                          >
                            Video
                          </span>
                        )}
                        {hasElkpd && (
                          <span className="inline-flex rounded-full border border-[#A7F3D0] bg-[#D1FAE5] px-3 py-1 text-sm font-semibold leading-none text-[#065F46]">
                            E-LKPD
                          </span>
                        )}
                        <span className="text-sm text-[#9CA3AF]">
                          {dateLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(subject.id)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9FAFB] text-[#6B7280] transition hover:bg-[#F3F4F6]"
                      >
                        <svg
                          className={cn(
                            "h-5 w-5 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(subject.id)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lottie-teal/5 text-lottie-teal transition hover:bg-lottie-teal/10 cursor-pointer"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(subject.id)}
                        disabled={deleteSubject.isPending}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2] disabled:opacity-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown item preview */}
                  {isExpanded && (
                    <div className="space-y-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4">
                      {hasPdf && (
                        <SubMaterialRow
                          icon={
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M7 21H17C18.1046 21 19 20.1046 19 19V9L14 4H7C5.89543 4 5 4.89543 5 6V19C5 20.1046 5.89543 21 7 21Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M14 4V9H19"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9 13H15M9 17H13"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          }
                          label="PDF"
                          title={subject.subjectName}
                          badgeClass={MATERIAL_BADGE_CLASS_BY_TYPE["pdf"]}
                          onPreview={() =>
                            setPreview({
                              title: subject.subjectName,
                              url: subject.subjectFileUrl!,
                              type: "pdf",
                            })
                          }
                        />
                      )}
                      {hasVideo && (
                        <SubMaterialRow
                          icon={
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                          }
                          label="Video"
                          title={`Video: ${subject.subjectName}`}
                          badgeClass={MATERIAL_BADGE_CLASS_BY_TYPE["video"]}
                          onPreview={() =>
                            setPreview({
                              title: `Video: ${subject.subjectName}`,
                              url: subject.videoUrl!,
                              type: "video",
                            })
                          }
                        />
                      )}
                      {hasElkpd && (
                        <SubMaterialRow
                          icon={
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M7 9H17M7 13H12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M21 21L19.5 19.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          }
                          label="E-LKPD"
                          title={subject.eLKPDTitle!}
                          badgeClass="border-[#A7F3D0] bg-[#D1FAE5] text-[#065F46]"
                          onPreview={() =>
                            setPreview({
                              title: subject.eLKPDTitle!,
                              url: subject.eLKPDFileUrl!,
                              type: "elkpd",
                            })
                          }
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {subjectsData?.pagination && subjectsData.pagination.totalPages > 1 && (
          <TablePagination
            currentPage={subjectsData.pagination.currentPage}
            totalPages={subjectsData.pagination.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </section>

      <SubjectModal
        isOpen={isModalOpen}
        isEditing={editingSubjectId !== null}
        form={form}
        isSaving={isSaving}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onClose={closeModal}
        onSubmit={handleSave}
        role={role}
        initialTeacherName={selectedTeacherName} // Kirim nama guru terpilih ke komponen anak
      />

      <PreviewModal preview={preview} onClose={() => setPreview(null)} />
    </>
  );
}
