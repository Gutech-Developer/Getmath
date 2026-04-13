"use client";

import EyeIcon from "@/components/atoms/icons/EyeIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import MaterialFormModal from "@/components/molecules/dashboard/MaterialFormModal";
import {
  ADMIN_MATERIAL_ITEMS,
  MATERIAL_BADGE_CLASS_BY_TYPE,
  MATERIAL_TYPE_LABEL_BY_TYPE,
} from "@/constant/materialManagement";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type {
  IAdminMaterialItem,
  IMaterialFormValues,
  IMaterialItem,
  MaterialStatus,
} from "@/types/materialManagement";
import { useMemo, useState } from "react";

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

function toEditFormValues(material: IMaterialItem): IMaterialFormValues {
  return {
    selectedType: material.type,
    title: material.title,
    description: material.description,
    content: "",
    videoUrl: "",
    selectedPdfFile: null,
    selectedElkpdFile: null,
  };
}

function getTodayDateLabel() {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminManageMaterialTemplate() {
  const [materials, setMaterials] =
    useState<IAdminMaterialItem[]>(ADMIN_MATERIAL_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null,
  );
  const [formValues, setFormValues] = useState<IMaterialFormValues>(
    createInitialFormValues,
  );

  const isEditing = editingMaterialId !== null;

  const modalTitle = isEditing ? "Edit Materi" : "Tambah Materi Baru";
  const modalSubmitLabel = isEditing ? "Simpan Perubahan" : "Simpan Materi";

  const materialCountLabel = useMemo(
    () => materials.length,
    [materials.length],
  );

  const openAddModal = () => {
    setEditingMaterialId(null);
    setFormValues(createInitialFormValues());
    setIsModalOpen(true);
  };

  const openEditModal = (material: IAdminMaterialItem) => {
    setEditingMaterialId(material.id);
    setFormValues(toEditFormValues(material));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCancelModal = () => {
    closeModal();
    setEditingMaterialId(null);
    setFormValues(createInitialFormValues());
  };

  const handleSubmitMaterial = () => {
    if (!formValues.title.trim() || !formValues.description.trim()) {
      showToast.warning("Judul dan deskripsi materi wajib diisi");
      return;
    }

    if (isEditing) {
      setMaterials((previous) =>
        previous.map((material) =>
          material.id === editingMaterialId
            ? {
                ...material,
                title: formValues.title.trim(),
                description: formValues.description.trim(),
                type: formValues.selectedType,
                typeLabel: MATERIAL_TYPE_LABEL_BY_TYPE[formValues.selectedType],
              }
            : material,
        ),
      );

      showToast.success("Materi berhasil diperbarui");
    } else {
      const newMaterial: IAdminMaterialItem = {
        id: `material-${Date.now()}`,
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        type: formValues.selectedType,
        typeLabel: MATERIAL_TYPE_LABEL_BY_TYPE[formValues.selectedType],
        dateLabel: getTodayDateLabel(),
        status: "Aktif",
      };

      setMaterials((previous) => [newMaterial, ...previous]);
      showToast.success("Materi berhasil ditambahkan");
    }

    closeModal();
    setEditingMaterialId(null);
    setFormValues(createInitialFormValues());
  };

  const handleDeleteMaterial = (material: IAdminMaterialItem) => {
    const shouldDelete = window.confirm(
      `Hapus materi \"${material.title}\" dari daftar?`,
    );

    if (!shouldDelete) {
      return;
    }

    setMaterials((previous) =>
      previous.filter((item) => item.id !== material.id),
    );
    showToast.success("Materi berhasil dihapus");
  };

  const toggleMaterialStatus = (material: IAdminMaterialItem) => {
    const nextStatus: MaterialStatus =
      material.status === "Aktif" ? "Nonaktif" : "Aktif";

    setMaterials((previous) =>
      previous.map((item) =>
        item.id === material.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item,
      ),
    );

    showToast.success(`Materi berhasil diubah menjadi ${nextStatus}`);
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
              {materialCountLabel} materi tersedia . Materi ini dapat dipilih ke
              dalam tiap kelas
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Materi</span>
          </button>
        </header>

        <ul className="space-y-3">
          {materials.map((material) => {
            const isActive = material.status === "Aktif";

            return (
              <li
                key={material.id}
                className={cn(
                  "flex items-center gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5",
                  !isActive && "opacity-70",
                )}
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-semibold leading-tight text-[#111827]">
                    {material.title}
                  </h2>
                  <p className="mt-1.5 truncate text-base text-[#6B7280]">
                    {material.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
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
                    onClick={() => toggleMaterialStatus(material)}
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl transition",
                      isActive
                        ? "bg-[#ECFDF5] text-[#16A34A] hover:bg-[#DCFCE7]"
                        : "bg-[#F3F4F6] text-[#334155] hover:bg-[#E2E8F0]",
                    )}
                    aria-label={`Lihat ${material.title}`}
                  >
                    <EyeIcon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-[#16A34A]" : "text-[#0F172A]",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(material)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                    aria-label={`Edit ${material.title}`}
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(material)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                    aria-label={`Delete ${material.title}`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <MaterialFormModal
        isOpen={isModalOpen}
        title={modalTitle}
        submitLabel={modalSubmitLabel}
        formValues={formValues}
        onFormValuesChange={setFormValues}
        onClose={closeModal}
        onCancel={handleCancelModal}
        onSubmit={handleSubmitMaterial}
      />
    </>
  );
}
