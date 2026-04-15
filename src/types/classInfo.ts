export type ClassInfoProgressTone = "success" | "danger" | "neutral";

export interface IClassInfoPageTemplateProps {
  slug: string;
}

export interface IClassInfoDetailItem {
  label: string;
  value: string;
}

export interface IClassInfoProgressItem {
  id: string;
  label: string;
  value: string;
  tone: ClassInfoProgressTone;
}

export interface IClassInfoStudentItem {
  id: string;
  name: string;
  toneClassName: string;
  isCurrentUser?: boolean;
}
