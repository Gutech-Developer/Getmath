"use client";

import PlusIcon from "@/components/atoms/icons/PlusIcon";
import { MATERIAL_CONTENT_TYPE_OPTIONS } from "@/constant/materialManagement";
import { cn } from "@/libs/utils";
import type { IMaterialFormValues } from "@/types/materialManagement";
import { useEffect } from "react";

interface IMaterialFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  formValues: IMaterialFormValues;
  onFormValuesChange: (values: IMaterialFormValues) => void;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function MaterialFormModal({
  isOpen,
  title,
  submitLabel,
  formValues,
  onFormValuesChange,
  onClose,
  onCancel,
  onSubmit,
}: IMaterialFormModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const updateFormValues = (patch: Partial<IMaterialFormValues>) => {
    onFormValuesChange({
      ...formValues,
      ...patch,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-90 w-full max-w-[820px] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <h3 className="text-[1.5rem] font-semibold text-[#111827]">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
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
            <p className="text-xl font-semibold text-[#374151]">Tipe Konten</p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {MATERIAL_CONTENT_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = formValues.selectedType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateFormValues({ selectedType: option.value })
                    }
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
            <label className="block text-lg font-semibold text-[#374151]">
              Judul
            </label>
            <input
              type="text"
              value={formValues.title}
              onChange={(event) =>
                updateFormValues({ title: event.target.value })
              }
              placeholder="Masukkan judul"
              className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#374151]">
              Deskripsi
            </label>
            <textarea
              value={formValues.description}
              onChange={(event) =>
                updateFormValues({ description: event.target.value })
              }
              placeholder="Deskripsi singkat"
              rows={2}
              className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-[#374151]">
              Konten / Isi Materi
            </label>
            <textarea
              value={formValues.content}
              onChange={(event) =>
                updateFormValues({ content: event.target.value })
              }
              placeholder="Masukkan konten materi"
              rows={3}
              className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </div>

          <div className="border-t border-[#E5E7EB] pt-4">
            {formValues.selectedType === "pdf" && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-[#374151]">
                  Upload PDF
                </p>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-5 py-3 text-lg font-semibold text-[#1F2937] transition hover:bg-[#F3F4F6]">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      updateFormValues({ selectedPdfFile: file });
                    }}
                  />
                  {formValues.selectedPdfFile
                    ? formValues.selectedPdfFile.name
                    : "Pilih file PDF"}
                </label>
              </div>
            )}

            {formValues.selectedType === "video" && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-[#374151]">
                  Video URL
                </p>
                <input
                  type="url"
                  value={formValues.videoUrl}
                  onChange={(event) =>
                    updateFormValues({ videoUrl: event.target.value })
                  }
                  placeholder="Masukkan URL video"
                  className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-8 py-2.5 text-xl font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-8 py-2.5 text-xl font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
