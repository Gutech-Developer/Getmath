import type {
  IAdminClassListItem,
  ITeacherOption,
} from "@/types/adminClassList";

export const ADMIN_CLASS_TEACHER_OPTIONS: ITeacherOption[] = [
  { id: "teacher-1", label: "Bpk. Budi Santoso" },
  { id: "teacher-2", label: "Ibu Sari Dewi" },
  { id: "teacher-3", label: "Ibu Rahma Johar" },
  { id: "teacher-4", label: "Bpk. Dani Wirawan" },
];

export const INITIAL_ADMIN_CLASS_LIST: IAdminClassListItem[] = [
  {
    id: "class-1",
    name: "Matematika Peminatan XI IPA",
    teacherName: "Bpk. Budi Santoso",
    createdAt: "2024-02-01",
    studentCount: 28,
    testCount: 5,
    code: "MAT-XI-002",
    status: "Aktif",
  },
  {
    id: "class-2",
    name: "Statistika & Probabilitas",
    teacherName: "Ibu Sari Dewi",
    createdAt: "2024-01-20",
    studentCount: 24,
    testCount: 4,
    code: "STAT-001",
    status: "Aktif",
  },
  {
    id: "class-3",
    name: "Matematika Wajib Kelas X",
    teacherName: "Ibu Rahma Johar",
    createdAt: "2024-01-10",
    studentCount: 32,
    testCount: 6,
    code: "MWK-X-001",
    status: "Aktif",
  },
  {
    id: "class-4",
    name: "Geometri & Trigonometri",
    teacherName: "Bpk. Dani Wirawan",
    createdAt: "2023-12-18",
    studentCount: 20,
    testCount: 3,
    code: "GEO-TRI-004",
    status: "Nonaktif",
  },
];
