import { GsPaginationMeta } from "./gs-course";

export interface GsSchool {
  id: string;
  name: string;
}

export type GsAuthProvider = "LOCAL" | "GOOGLE";

export interface GsSchool {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}

// ── Relasi Khusus Guru ────────────────────────────────────────────────────────
export interface GsTeacherProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  NIP: string; // Khusus Guru
  province: string;
  city: string;
  schoolId: string;
  school: GsSchool;
}

// ── Relasi Khusus Siswa ────────────────────────────────────────────────────────
export interface GsStudentProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  NIS: string; // Khusus Siswa
  province: string;
  city: string;
  schoolId: string;
  school: GsSchool;
  birthDate?: string | null;
  gender?: string | null;
}

// ── Base Properti yang Dimiliki Kedua Role ────────────────────────────────────
interface GsUserDataBase {
  userId: string;
  email: string;
  isActive: boolean;
  authProvider: GsAuthProvider;
  profileId: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  schoolId: string;
  schoolName: string;
  createdAt?: string; // Opsional tergantung list/detail API
  updatedAt?: string;
}

// ── Kondisi Gabungan (Discriminated Union) ────────────────────────────────────
export interface GsUserTeacherData extends GsUserDataBase {
  role: "TEACHER";
  teacher: GsTeacherProfile;
  student?: never; // Memastikan properti student tidak boleh ada saat role TEACHER
}

export interface GsUserStudentData extends GsUserDataBase {
  role: "STUDENT";
  student: GsStudentProfile;
  teacher?: never; // Memastikan properti teacher tidak boleh ada saat role STUDENT
}

// Interface Utama yang Mengekspos Kedua Kondisi
export type GsUserData = GsUserTeacherData | GsUserStudentData;

export interface GsPaginatedUser {
  users: GsUserData[];
  pagination: GsPaginationMeta;
}

export interface BaseCreateUser {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  schoolId: string;
}

interface CreateTeacher extends BaseCreateUser {
  NIS: string;
  role: "TEACHER";
}

interface CreateStudent extends BaseCreateUser {
  NIP: string;
  role: "STUDENT";
  birthDate?: string;
  gender?: string;
}

export type CreateUserInput = CreateTeacher | CreateStudent;

export type UpdateUserInput = Partial<CreateTeacher> | Partial<CreateStudent>;
