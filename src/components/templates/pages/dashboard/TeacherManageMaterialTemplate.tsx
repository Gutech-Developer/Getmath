"use client";

import EditIcon from "@/components/atoms/icons/EditIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import MaterialFormModal from "@/components/molecules/dashboard/MaterialFormModal";
import {
  MATERIAL_BADGE_CLASS_BY_TYPE,
  TEACHER_MATERIAL_ITEMS,
} from "@/constant/materialManagement";
import { cn } from "@/libs/utils";
import type { IMaterialFormValues } from "@/types/materialManagement";
import { useState } from "react";

function createInitialFormValues(): IMaterialFormValues {
  return {
    selectedType: "pdf",
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    selectedPdfFile: null,
    selectedElkpdFile: null,
  };
}

export default function TeacherManageMaterialTemplate() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<IMaterialFormValues>(
    createInitialFormValues,
  );

  const openModal = () => {
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormValues(createInitialFormValues());
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
            <h1 className="text-2xl font-semibold leading-tight text-[#111827]">
              Kelola Materi
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {TEACHER_MATERIAL_ITEMS.length} materi tersedia . Materi ini dapat
              dipilih ke dalam tiap kelas
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
          {TEACHER_MATERIAL_ITEMS.map((material) => (
            <li
              key={material.id}
              className="flex items-center gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-semibold leading-tight text-[#111827]">
                  {material.title}
                </h2>
                <p className="mt-1.5 truncate text-base text-[#6B7280]">
                  {material.description}
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-sm font-semibold leading-none",
                      MATERIAL_BADGE_CLASS_BY_TYPE[material.type],
                    )}
                  >
                    {material.typeLabel}
                  </span>

                  <span className="text-sm text-[#9CA3AF]">
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

      <MaterialFormModal
        isOpen={isAddModalOpen}
        title="Tambah Materi Baru"
        submitLabel="Simpan Materi"
        formValues={formValues}
        onFormValuesChange={setFormValues}
        onClose={closeModal}
        onCancel={handleCancel}
        onSubmit={handleSave}
      />
    </>
  );
}
