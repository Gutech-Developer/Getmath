export type MaterialType = "pdf" | "video";

export type MaterialStatus = "Aktif" | "Nonaktif";

export interface IMaterialItem {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  typeLabel: string;
  dateLabel: string;
}

export interface IAdminMaterialItem extends IMaterialItem {
  status: MaterialStatus;
}

export interface IMaterialFormValues {
  selectedType: MaterialType;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  selectedPdfFile: File | null;
  selectedElkpdFile: File | null;
}
