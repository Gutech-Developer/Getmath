import type {
  IClassInfoDetailItem,
  IClassInfoProgressItem,
  IClassInfoStudentItem,
} from "@/types";

const studentToneClassNames = [
  "bg-[#DC2626]",
  "bg-[#EA580C]",
  "bg-[#D97706]",
  "bg-[#CA8A04]",
  "bg-[#65A30D]",
  "bg-[#16A34A]",
  "bg-[#059669]",
  "bg-[#0891B2]",
  "bg-[#2563EB]",
  "bg-[#4F46E5]",
];

const classStudentNames = [
  "Andi Pratama",
  "Bima Sakti",
  "Citra Rahma",
  "Dani Wirawan",
  "Eka Nirmala",
  "Farhan Akbar",
  "Gita Lestari",
  "Hana Puspita",
  "Indra Saputra",
  "Jihan Maulida",
  "Karin Oktavia",
  "Luthfi Ramadhan",
  "Mira Andini",
  "Nadia Putri",
  "Oka Permana",
  "Putra Wibowo",
  "Qori Azzahra",
  "Raka Mahesa",
  "Salsa Nabila",
  "Tio Setiawan",
];

export function getClassInfoDetailItems(
  classTitle: string,
  opts?: { teacherName?: string; totalStudents?: number },
): IClassInfoDetailItem[] {
  const teacherName = opts?.teacherName ?? "Bpk. Budi Santoso";
  const totalStudents = opts?.totalStudents ?? 28;

  return [
    { label: "Nama Kelas", value: classTitle },
    { label: "Guru Pengampu", value: teacherName },
    { label: "Jurusan", value: "Umum" },
    { label: "Semester", value: "Ganjil 2024/2025" },
    { label: "Kode Kelas", value: "MAT-X-001" },
    { label: "Jumlah Siswa", value: `${totalStudents} Siswa` },
  ];
}

export const CLASS_INFO_PROGRESS_PERCENT = 75;

export const CLASS_INFO_PROGRESS_ITEMS: IClassInfoProgressItem[] = [
  {
    id: "total-material",
    label: "Jumlah Materi",
    value: "6 Modul",
    tone: "success",
  },
  {
    id: "active-test",
    label: "Tes Aktif",
    value: "1 Tes",
    tone: "danger",
  },
  {
    id: "joined-status",
    label: "Status Bergabung",
    value: "Aktif",
    tone: "success",
  },
];

export const CLASS_INFO_TOTAL_STUDENTS = 28;
export const CLASS_INFO_VISIBLE_STUDENTS = classStudentNames.length;

export const CLASS_INFO_STUDENTS: IClassInfoStudentItem[] =
  classStudentNames.map((name, index) => ({
    id: `student-${index + 1}`,
    name,
    toneClassName: studentToneClassNames[index % studentToneClassNames.length],
    isCurrentUser: name === "Andi Pratama",
  }));
