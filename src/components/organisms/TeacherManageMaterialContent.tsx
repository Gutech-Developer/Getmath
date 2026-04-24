"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { MATERIAL_BADGE_CLASS_BY_TYPE } from "@/constant/materialManagement";
import { cn } from "@/libs/utils";
import { showToast } from "@/libs/toast";
import { useEffect, useState } from "react";
import {
  useGsMySubjects,
  useGsCreateSubject,
  useGsUpdateSubject,
  useGsDeleteSubject,
  useGsAddELKPD,
  useGsUpdateELKPD,
} from "@/services";

interface ITeacherManageMaterialContentProps {
  useSubjectsQuery?: typeof useGsMySubjects;
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
  };
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

/** Konversi berbagai format URL YouTube ke format embed */
function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    // youtu.be/ID
    if (u.hostname === "youtu.be")
      return `https://www.youtube.com/embed${u.pathname}`;
    // sudah embed
    if (u.pathname.startsWith("/embed/")) return url;
  } catch {
    // bukan URL valid, kembalikan apa adanya
  }
  return url;
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

interface IPreview {
  title: string;
  url: string;
  type: "pdf" | "video" | "elkpd";
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

  const iframeSrc =
    preview.type === "video" ? toYouTubeEmbed(preview.url) : preview.url;

  const typeLabel =
    preview.type === "pdf"
      ? "PDF · Heyzine"
      : preview.type === "video"
        ? "Video · YouTube"
        : "E-LKPD · Liveworksheets";

  return (
    <div className="fixed inset-0 z-90 flex flex-col bg-[#111827]/80 p-4">
      {/* backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* panel */}
      <div className="relative z-100 mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              {typeLabel}
            </p>
            <h3 className="text-lg font-semibold text-[#111827] leading-tight">
              {preview.title}
            </h3>
          </div>
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

        {/* iframe */}
        <div className="flex-1 bg-[#F3F4F6]">
          <iframe
            src={iframeSrc}
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
        className="shrink-0 rounded-xl bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
      >
        Preview
      </button>
    </div>
  );
}

function SubjectModal({
  isOpen,
  isEditing,
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  isEditing: boolean;
  form: ISubjectForm;
  isSaving: boolean;
  onChange: (patch: Partial<ISubjectForm>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
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
    "w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]";
  const labelClass = "block text-base font-semibold text-[#374151]";

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-90 w-full max-w-[820px] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
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
        <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5 thinnest-scrollbar">
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
              Link Materi (PDF / File) <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="url"
              value={form.subjectFileUrl}
              onChange={(e) => onChange({ subjectFileUrl: e.target.value })}
              placeholder="https://drive.google.com/file/..."
              className={inputClass}
            />
          </div>

          {/* Link Video */}
          <div className="space-y-2">
            <label className={labelClass}>
              Link Video (YouTube) <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass}
            />
          </div>

          {/* E-LKPD — selalu wajib */}
          <div className="border-t border-[#E5E7EB] pt-4">
            <p className="mb-3 text-base font-semibold text-[#374151]">
              E-LKPD (Liveworksheets)
            </p>
            <div className="space-y-4 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
              <div className="space-y-2">
                <label className={labelClass}>
                  Judul E-LKPD <span className="text-[#EF4444]">*</span>
                </label>
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
                <label className={labelClass}>
                  Link E-LKPD <span className="text-[#EF4444]">*</span>
                </label>
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
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
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
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-8 py-2.5 text-base font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherManageMaterialContent({
  useSubjectsQuery = useGsMySubjects,
}: ITeacherManageMaterialContentProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [form, setForm] = useState<ISubjectForm>(createEmptyForm);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<IPreview | null>(null);

  const { data: subjectsData, isLoading } = useSubjectsQuery({ limit: 50 });
  const createSubject = useGsCreateSubject();
  const updateSubject = useGsUpdateSubject();
  const deleteSubject = useGsDeleteSubject();
  const addELKPD = useGsAddELKPD();
  const updateELKPD = useGsUpdateELKPD();

  const subjects = subjectsData?.subjects ?? [];

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openCreateModal = () => {
    setEditingSubjectId(null);
    setForm(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (subjectId: string) => {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    setEditingSubjectId(subjectId);
    setForm({
      subjectName: s.subjectName,
      description: s.description ?? "",
      subjectFileUrl: s.subjectFileUrl,
      videoUrl: s.videoUrl ?? "",
      elkpdTitle: s.eLKPDs?.[0]?.title ?? "",
      elkpdDescription: s.eLKPDs?.[0]?.description ?? "",
      elkpdFileUrl: s.eLKPDs?.[0]?.fileUrl ?? "",
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
    if (!form.subjectFileUrl.trim()) {
      showToast.error("Link materi (PDF) wajib diisi");
      return;
    }
    if (!form.videoUrl.trim()) {
      showToast.error("Link video wajib diisi");
      return;
    }
    if (!form.elkpdTitle.trim() || !form.elkpdFileUrl.trim()) {
      showToast.error("Judul dan link E-LKPD wajib diisi");
      return;
    }

    const elkpdData = {
      title: form.elkpdTitle.trim(),
      description: form.elkpdDescription.trim() || undefined,
      fileUrl: form.elkpdFileUrl.trim(),
    };

    if (editingSubjectId) {
      const subjectData = {
        subjectName: form.subjectName.trim(),
        description: form.description.trim() || undefined,
        subjectFileUrl: form.subjectFileUrl.trim(),
        videoUrl: form.videoUrl.trim(),
      };

      // Temukan subject yang sedang diedit untuk cek apakah sudah punya ELKPD
      const existing = subjects.find((x) => x.id === editingSubjectId);
      const existingElkpd = existing?.eLKPDs?.[0];

      updateSubject.mutate(
        { id: editingSubjectId, data: subjectData },
        {
          onSuccess: () => {
            // Setelah subject berhasil diupdate, handle ELKPD
            if (existingElkpd) {
              updateELKPD.mutate(
                {
                  subjectId: editingSubjectId,
                  elkpdId: existingElkpd.id,
                  data: elkpdData,
                },
                {
                  onSuccess: () => {
                    showToast.success("Materi berhasil diperbarui");
                    closeModal();
                  },
                  onError: (err) =>
                    showToast.error(err.message ?? "Gagal memperbarui E-LKPD"),
                },
              );
            } else {
              addELKPD.mutate(
                { subjectId: editingSubjectId, data: elkpdData },
                {
                  onSuccess: () => {
                    showToast.success("Materi berhasil diperbarui");
                    closeModal();
                  },
                  onError: (err) =>
                    showToast.error(err.message ?? "Gagal menambahkan E-LKPD"),
                },
              );
            }
          },
          onError: (err) =>
            showToast.error(err.message ?? "Gagal memperbarui materi"),
        },
      );
    } else {
      createSubject.mutate(
        {
          subjectName: form.subjectName.trim(),
          description: form.description.trim() || undefined,
          subjectFileUrl: form.subjectFileUrl.trim(),
          videoUrl: form.videoUrl.trim(),
          eLKPD: elkpdData,
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

  const isSaving =
    createSubject.isPending ||
    updateSubject.isPending ||
    addELKPD.isPending ||
    updateELKPD.isPending;

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
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
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
              const hasVideo = !!subject.videoUrl;
              const hasElkpd = !!subject.eLKPDs?.[0];
              const isExpanded = expandedIds.has(subject.id);
              const dateLabel = new Date(subject.createdAt).toLocaleDateString(
                "id-ID",
                { day: "2-digit", month: "short", year: "numeric" },
              );

              return (
                <li
                  key={subject.id}
                  className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white"
                >
                  {/* ── Card header ── */}
                  <div className="flex items-center gap-4 px-5 py-5">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-semibold leading-tight text-[#111827]">
                        {subject.subjectName}
                      </h2>
                      {subject.description && (
                        <p className="mt-1.5 truncate text-base text-[#6B7280]">
                          {subject.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-sm font-semibold leading-none",
                            MATERIAL_BADGE_CLASS_BY_TYPE["pdf"],
                          )}
                        >
                          PDF
                        </span>
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
                      {/* Toggle sub-materials */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(subject.id)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9FAFB] text-[#6B7280] transition hover:bg-[#F3F4F6]"
                        aria-label={
                          isExpanded
                            ? "Sembunyikan sub-materi"
                            : "Lihat sub-materi"
                        }
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
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                        aria-label={`Edit ${subject.subjectName}`}
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(subject.id)}
                        disabled={deleteSubject.isPending}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2] disabled:opacity-50"
                        aria-label={`Hapus ${subject.subjectName}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* ── Sub-material dropdown ── */}
                  {isExpanded && (
                    <div className="space-y-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4">
                      {/* PDF */}
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
                            url: subject.subjectFileUrl,
                            type: "pdf",
                          })
                        }
                      />

                      {/* Video */}
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

                      {/* E-LKPD */}
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
                          title={subject.eLKPDs![0].title}
                          badgeClass="border-[#A7F3D0] bg-[#D1FAE5] text-[#065F46]"
                          onPreview={() =>
                            setPreview({
                              title: subject.eLKPDs![0].title,
                              url: subject.eLKPDs![0].fileUrl,
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
      </section>

      <SubjectModal
        isOpen={isModalOpen}
        isEditing={editingSubjectId !== null}
        form={form}
        isSaving={isSaving}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onClose={closeModal}
        onSubmit={handleSave}
      />

      <PreviewModal preview={preview} onClose={() => setPreview(null)} />
    </>
  );
}
