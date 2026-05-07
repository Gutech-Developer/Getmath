"use client";

import { useEffect, useMemo, useState } from "react";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import { ContentTextArea } from "@/components/atoms/Input";
import { Modal } from "@/components/molecules/Modal";
import type {
  ICreateForumDiscussionInput,
  IForumMaterial,
  IForumOption,
} from "@/types";
import ForumSelectField from "./ForumSelectField";

interface ICreateDiscussionModalProps {
  isOpen: boolean;
  materials: IForumMaterial[];
  onClose: () => void;
  onSubmit: (value: ICreateForumDiscussionInput) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function CreateDiscussionModal({
  isOpen,
  materials,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}: ICreateDiscussionModalProps) {
  const [content, setContent] = useState("");
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "umum");

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setMaterialId(materials[0]?.id ?? "umum");
    }
  }, [isOpen, materials]);

  const materialOptions = useMemo<IForumOption<string>[]>(
    () =>
      materials.map((material) => ({
        value: material.id,
        label: material.label,
      })),
    [materials],
  );

  const isSubmitDisabled = !content.trim() || !materialId || isLoading;

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }

    onSubmit({
      content: content.trim(),
      materialId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Diskusi Baru"
      size="md"
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-[24px] border border-[#FEE2E2] bg-[#FEF2F2] p-4">
            <div className="flex items-start gap-3">
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
              <div>
                <p className="text-sm font-medium text-[#DC2626]">
                  Gagal membuat diskusi
                </p>
                <p className="text-xs text-[#991B1B] mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Pertanyaan / Topik Diskusi
          </label>
          <ContentTextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Tuliskan pertanyaanmu dengan jelas agar mudah dipahami teman sekelas dan guru."
            rows={6}
            maxLength={280}
            showCounter={false}
            className="min-h-[180px] rounded-[24px] border-[#E2E8F0] px-5 py-4 text-base leading-7 text-[#334155] placeholder:text-[#94A3B8]"
          />
          <p className="mt-2 text-right text-xs font-medium text-[#94A3B8]">
            {content.length}/280 karakter
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Materi Terkait
          </label>
          <ForumSelectField
            value={materialId}
            onChange={setMaterialId}
            options={materialOptions}
            disabled={isLoading}
          />
        </div>

        <div className="rounded-[24px] border border-[#FED7AA] bg-[#FFF7ED] p-4 text-sm leading-6 text-[#9A3412]">
          <div className="flex items-start gap-3">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
            <p className="text-sm">
              Sebelum membuat diskusi baru, cek dulu apakah pertanyaanmu sudah
              pernah dibahas. Kalau topiknya sama, lebih baik lanjut di thread
              yang sudah ada supaya diskusi kelas tetap rapi.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-14 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 text-base font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="h-14 flex-1 rounded-2xl bg-[#1F2375] px-5 text-base font-semibold text-white transition hover:bg-[#1F2375]/90 disabled:cursor-not-allowed disabled:bg-[#1F2375]/70 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isLoading ? "Memproses..." : "Publikasikan Diskusi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
