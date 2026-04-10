"use client";

import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { cn } from "@/libs/utils";
import { useEffect, useState } from "react";

type MaterialType = "pdf" | "video" | "elkpd";

interface IMaterialItem {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  typeLabel: string;
  dateLabel: string;
}

const MATERIAL_ITEMS: IMaterialItem[] = [
  {
    id: "material-1",
    title: "Persamaan Kuadrat",
    description: "Materi tentang persamaan kuadrat dan aplikasinya",
    type: "pdf",
    typeLabel: "PDF",
    dateLabel: "15 Mar 2026",
  },
  {
    id: "material-2",
    title: "Fungsi Kuadrat",
    description: "Video tutorial memahami fungsi kuadrat secara visual",
    type: "video",
    typeLabel: "Video YouTube",
    dateLabel: "20 Mar 2026",
  },
  {
    id: "material-3",
    title: "E-LKPD Persamaan",
    description: "Lembar kerja untuk persamaan linear dan kuadrat",
    type: "elkpd",
    typeLabel: "E-LKPD",
    dateLabel: "22 Mar 2026",
  },
  {
    id: "material-4",
    title: "Sistem Persamaan",
    description: "Materi lengkap sistem persamaan linear dua variabel",
    type: "pdf",
    typeLabel: "PDF",
    dateLabel: "25 Mar 2026",
  },
];

const contentTypeOptions: Array<{
  value: MaterialType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "pdf", label: "Materi PDF", icon: NotebookIcon },
  { value: "video", label: "Video YouTube", icon: VideoIcon },
  { value: "elkpd", label: "E-LKPD", icon: DocumentIcon },
];

const badgeClassByType: Record<MaterialType, string> = {
  pdf: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  video: "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669]",
  elkpd: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
};

export default function TeacherManageMaterialTemplate() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MaterialType>("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedElkpdFile, setSelectedElkpdFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAddModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAddModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isAddModalOpen]);

  const openModal = () => {
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setSelectedType("pdf");
    setTitle("");
    setDescription("");
    setContent("");
    setSelectedPdfFile(null);
    setVideoUrl("");
    setSelectedElkpdFile(null);
  };

  const handleCancel = () => {
    resetForm();
    closeModal();
  };

  const handleSave = () => {
    closeModal();
  };

  return (
    <>
      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-[#111827]">
              Kelola Materi
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {MATERIAL_ITEMS.length} materi tersedia . Materi ini dapat dipilih
              ke dalam tiap kelas
            </p>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Materi</span>
          </button>
        </header>

        <ul className="space-y-3">
          {MATERIAL_ITEMS.map((material) => (
            <li
              key={material.id}
              className="flex items-center gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[2rem] font-semibold leading-tight text-[#111827]">
                  {material.title}
                </h2>
                <p className="mt-1.5 truncate text-lg text-[#6B7280]">
                  {material.description}
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-xl font-semibold leading-none",
                      badgeClassByType[material.type],
                    )}
                  >
                    {material.typeLabel}
                  </span>

                  <span className="text-lg text-[#9CA3AF]">
                    {material.dateLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Edit ${material.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                  aria-label={`Delete ${material.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/50 p-4">
          <div
            className="absolute inset-0"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-90 w-full max-w-[820px] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
              <h3 className="text-[2rem] font-semibold text-[#111827]">
                Tambah Materi Baru
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#1F2937]"
                aria-label="Tutup popup"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div>
                <p className="text-xl font-semibold text-[#374151]">
                  Tipe Konten
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {contentTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = selectedType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedType(option.value)}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xl font-semibold transition",
                          isActive
                            ? "border-[#2563EB] bg-[#2563EB] text-white"
                            : "border-[#D1D5DB] bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xl font-semibold text-[#374151]">
                  Judul
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Masukkan judul"
                  className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xl font-semibold text-[#374151]">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Deskripsi singkat"
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xl font-semibold text-[#374151]">
                  Konten / Isi Materi
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Masukkan konten materi"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </div>

              <div className="border-t border-[#E5E7EB] pt-4">
                {selectedType === "pdf" && (
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-[#374151]">
                      Upload PDF
                    </p>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-5 py-3 text-lg font-semibold text-[#1F2937] transition hover:bg-[#F3F4F6]">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setSelectedPdfFile(file);
                        }}
                      />
                      {selectedPdfFile
                        ? selectedPdfFile.name
                        : "Pilih file PDF"}
                    </label>
                  </div>
                )}

                {selectedType === "video" && (
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-[#374151]">
                      Video URL
                    </p>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      placeholder="Masukkan URL video"
                      className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                    />
                  </div>
                )}

                {selectedType === "elkpd" && (
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-[#374151]">
                      Upload E-LKPD
                    </p>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-5 py-3 text-lg font-semibold text-[#1F2937] transition hover:bg-[#F3F4F6]">
                      <input
                        type="file"
                        accept="application/pdf,.doc,.docx"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setSelectedElkpdFile(file);
                        }}
                      />
                      {selectedElkpdFile
                        ? selectedElkpdFile.name
                        : "Pilih file E-LKPD"}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-8 py-2.5 text-2xl font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-[#2563EB] px-8 py-2.5 text-2xl font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Simpan Materi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
