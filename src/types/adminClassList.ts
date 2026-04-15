export type AdminClassStatus = "Aktif" | "Nonaktif";

export interface IAdminClassListItem {
  id: string;
  name: string;
  teacherName: string;
  createdAt: string;
  studentCount: number;
  testCount: number;
  code: string;
  status: AdminClassStatus;
}

export interface ITeacherOption {
  id: string;
  label: string;
}

export interface IClassFormPayload {
  className: string;
  teacherId: string;
}
