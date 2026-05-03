export type ModuleStepState = "completed" | "active" | "upcoming" | "lock";

export interface IClassMaterialContentPageTemplateProps {
  /** Course ID — dipakai untuk fetch modul lewat `useGsModulesByCourse(courseId)`. */
  courseId: string;
  /**
   * Module ID yang sedang dibuka. Sidebar tetap menampilkan semua modul dari course;
   * konten utama default ke step pertama dari modul ini.
   */
  contentId: string;
  /** Slug kelas — opsional, dipakai hanya untuk breadcrumb / back link. */
  slug?: string;
  totalPages?: number;
}

export interface IModuleStep {
  id: string;
  typeLabel: string;
  title: string;
  state: ModuleStepState;
}

export interface IModuleProgressEntry {
  label: string;
  value: number;
  accent?: string;
}

export interface IModuleItem {
  id: string;
  title: string;
  readLabel: string;
  progressPercent: number;
  progressEntries?: IModuleProgressEntry[];
  steps?: IModuleStep[];
}

export interface IPersamaanKuadratCardProps {
  module: IModuleItem;
  openModuleId: string | null;
  selectedStepId: string | null;
  toggleModule: (moduleId: string) => void;
  setSelectedStepId: (stepId: string) => void;
}

export interface IModulMateriCardProps {
  module: IModuleItem;
}
