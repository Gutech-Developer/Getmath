export type ClassAnalyticsViewType =
  | "Beranda"
  | "Siswa"
  | "Materi"
  | "Kelola E-LKPD"
  | "Laporan";

export type LearningAnalyticsStudentStatus = "Lulus" | "Remedial";

export interface ILearningAnalyticsStudentListItem {
  id: string;
  fullname: string;
  nis: string;
  score: number;
  status: LearningAnalyticsStudentStatus;
}

export interface ILearningAnalyticsMaterialItem {
  id: string;
  title: string;
  updatedAt: string;
  type: "Materi" | "Video" | "Tes";
  status: "Aktif" | "Draft";
}

export interface ILearningAnalyticsELKPDItem {
  id: string;
  title: string;
  dueLabel: string;
  submittedCount: number;
  status: "Aktif" | "Ditutup";
}

export interface IClassAnalyticsReportSummaryCard {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}

export interface ILearningAnalyticsScoreBucket {
  label: string;
  value: number;
  color: string;
}

export interface ILearningAnalyticsEmotionSegment {
  label: string;
  value: number;
  color: string;
}

export interface ILearningAnalyticsHeaderCardData {
  className: string;
  classCode: string;
  subjectLabel: string;
  metadata: string[];
  symbol?: string;
}

export interface ILearningAnalyticsClassDetail {
  slug: string;
  className: string;
  teacherName: string;
  studentCount: number;
  averageScore: number;
  passedCount: number;
  remedialCount: number;
  progress: number;
  classCode?: string;
  gradeLabel?: string;
  semesterLabel?: string;
  subjectLabel?: string;
  defaultViewType?: ClassAnalyticsViewType;
  students: ILearningAnalyticsStudentListItem[];
  materials?: ILearningAnalyticsMaterialItem[];
  elkpdItems?: ILearningAnalyticsELKPDItem[];
  reportSummaryCards?: IClassAnalyticsReportSummaryCard[];
  scoreBuckets?: ILearningAnalyticsScoreBucket[];
  emotionSegments?: ILearningAnalyticsEmotionSegment[];
}

export type IStudentAnalyticsItem = ILearningAnalyticsStudentListItem;
export type ITeacherStudentAnalyticsItem = ILearningAnalyticsStudentListItem;
export type IClassLearningAnalyticsDetail = ILearningAnalyticsClassDetail;
export type ITeacherClassLearningAnalyticsDetail =
  ILearningAnalyticsClassDetail;

export type MateriSequenceType = "Modul" | "Tes Diagnostik";
export type MateriAssetKind = "PDF" | "Video" | "E-LKPD";

export interface IMateriAssetItem {
  id: string;
  kind: MateriAssetKind;
  label: string;
}

export interface IMateriSequenceItem {
  id: string;
  type: MateriSequenceType;
  title: string;
  description: string;
  formatLabel?: MateriAssetKind;
  assets: IMateriAssetItem[];
  questionCount?: number;
  durationMinutes?: number;
}

export interface ILearningAnalyticsDiagnosticOption {
  id: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
}
