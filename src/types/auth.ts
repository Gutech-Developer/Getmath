/**
 * Authentication Types
 * Sesuai dengan backend auth endpoints
 */

import type {
  CreatePayload,
  EmailPayload,
  LoginPayload,
  UpdatePayload,
  UserTokenResponse,
  WithPassword,
} from "@/utils";

export type UserRole = "admin" | "teacher" | "student" | "parent" | "counselor";

export interface IEducation {
  university: string;
  stage: "D3" | "D4" | "S1" | "S2" | "S3";
  majority: string;
  semester?: number | null;
}

// ============ COUNSELOR ============
export interface ICounselor {
  _id: string;
  email: string;
  fullname: string;
  address: string;
  phone: string;
  isStudent: boolean;
  education: IEducation;
  practiceLicenseNumber?: string | null;
  work?: string | null;
  createdAt: string;
  updatedAt: string;
}

type CounselorRegisterRequiredKeys =
  | "email"
  | "fullname"
  | "address"
  | "phone"
  | "isStudent"
  | "education";

type CounselorRegisterOptionalKeys = "practiceLicenseNumber" | "work";

export type ICounselorRegisterInput = WithPassword<
  CreatePayload<
    ICounselor,
    CounselorRegisterRequiredKeys,
    CounselorRegisterOptionalKeys
  >
>;

export type ICounselorLoginInput = LoginPayload<ICounselor>;

export type ICounselorLoginResponse = UserTokenResponse<ICounselor>;

// ============ TEACHER ============
export interface ITeacher {
  _id: string;
  email: string;
  fullname: string;
  phone: string;
  nip: string;
  province: string;
  city: string;
  school: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

type TeacherRegisterKeys =
  | "email"
  | "fullname"
  | "phone"
  | "nip"
  | "province"
  | "city"
  | "school";

export type ITeacherRegisterInput = WithPassword<
  CreatePayload<ITeacher, TeacherRegisterKeys>
>;

export type ITeacherLoginInput = LoginPayload<ITeacher>;

export type ITeacherLoginResponse = UserTokenResponse<ITeacher>;

// ============ STUDENT ============
export interface IStudent {
  _id: string;
  email: string;
  fullname: string;
  phone: string;
  nis: string;
  province: string;
  city: string;
  school: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

type StudentRegisterKeys =
  | "email"
  | "fullname"
  | "phone"
  | "nis"
  | "province"
  | "city"
  | "school";

export type IStudentRegisterInput = WithPassword<
  CreatePayload<IStudent, StudentRegisterKeys>
>;

export type IStudentLoginInput = LoginPayload<IStudent>;

export type IStudentLoginResponse = UserTokenResponse<IStudent>;

// ============ PARENT ============
export interface IParent {
  _id: string;
  email: string;
  fullname: string;
  address: string;
  phone: string;
  work: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

type ParentRegisterKeys =
  | "email"
  | "fullname"
  | "address"
  | "phone"
  | "work"
  | "age";

export type IParentRegisterInput = WithPassword<
  CreatePayload<IParent, ParentRegisterKeys>
>;

export type IParentLoginInput = LoginPayload<IParent>;

export type IParentLoginResponse = UserTokenResponse<IParent>;

// ============ COMMON ============
export interface IChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export type IForgotPasswordInput = EmailPayload<ICounselor> & {
  role: Exclude<UserRole, "admin">;
};

export interface IForgotPasswordResponse {
  message: string;
  resetToken: string;
}

export interface IResetPasswordInput {
  token: string;
  newPassword: string;
}

// Update profile types
type CounselorUpdateKeys =
  | "fullname"
  | "email"
  | "address"
  | "phone"
  | "isStudent"
  | "education"
  | "practiceLicenseNumber"
  | "work";

type ParentUpdateKeys =
  | "fullname"
  | "email"
  | "address"
  | "phone"
  | "work"
  | "age";

export type IUpdateCounselorInput = UpdatePayload<
  ICounselor,
  CounselorUpdateKeys
>;

export type IUpdateParentInput = UpdatePayload<IParent, ParentUpdateKeys>;

// Backend current-user yang dipakai modul existing masih counselor/parent
export type ICurrentUser = ICounselor | IParent;

// Type guards untuk membedakan Counselor dan Parent
export function isCounselor(user: ICurrentUser): user is ICounselor {
  return "isStudent" in user;
}

export function isParent(user: ICurrentUser): user is IParent {
  return "age" in user;
}
