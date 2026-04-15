import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import type {
  IAdminMaterialItem,
  IMaterialItem,
  MaterialType,
} from "@/types/materialManagement";
import type { ComponentType } from "react";

export interface IMaterialContentTypeOption {
  value: MaterialType;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const MATERIAL_CONTENT_TYPE_OPTIONS: IMaterialContentTypeOption[] = [
  { value: "pdf", label: "Materi PDF", icon: NotebookIcon },
  { value: "video", label: "Video YouTube", icon: VideoIcon },
];

export const MATERIAL_BADGE_CLASS_BY_TYPE: Record<MaterialType, string> = {
  pdf: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
  video: "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669]",
};

export const MATERIAL_TYPE_LABEL_BY_TYPE: Record<MaterialType, string> = {
  pdf: "PDF",
  video: "Video YouTube",
};

export const TEACHER_MATERIAL_ITEMS: IMaterialItem[] = [
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
    id: "material-4",
    title: "Sistem Persamaan",
    description: "Materi lengkap sistem persamaan linear dua variabel",
    type: "pdf",
    typeLabel: "PDF",
    dateLabel: "25 Mar 2026",
  },
];

export const ADMIN_MATERIAL_ITEMS: IAdminMaterialItem[] = [
  {
    ...TEACHER_MATERIAL_ITEMS[0],
    status: "Aktif",
  },
  {
    ...TEACHER_MATERIAL_ITEMS[1],
    status: "Aktif",
  },
  {
    ...TEACHER_MATERIAL_ITEMS[2],
    status: "Nonaktif",
  },
];
