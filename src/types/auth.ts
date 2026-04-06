/**
 * Authentication Types
 * Sesuai dengan backend auth endpoints
 */

export type UserRole = "counselor" | "parent";

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

export interface ICounselorRegisterInput {
  email: string;
  fullname: string;
  address: string;
  phone: string;
  isStudent: boolean;
  education: IEducation;
  password: string;
  practiceLicenseNumber?: string | null;
  work?: string | null;
}

export interface ICounselorLoginInput {
  email: string;
  password: string;
}

export interface ICounselorLoginResponse {
  user: ICounselor;
  token: string;
}

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

export interface IParentRegisterInput {
  email: string;
  fullname: string;
  address: string;
  phone: string;
  work: string;
  age: number;
  password: string;
}

export interface IParentLoginInput {
  email: string;
  password: string;
}

export interface IParentLoginResponse {
  user: IParent;
  token: string;
}

// ============ COMMON ============
export interface IChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface IForgotPasswordInput {
  email: string;
  role: UserRole;
}

export interface IForgotPasswordResponse {
  message: string;
  resetToken: string;
}

export interface IResetPasswordInput {
  token: string;
  newPassword: string;
}

// Update profile types
export interface IUpdateCounselorInput {
  fullname?: string;
  email?: string;
  address?: string;
  phone?: string;
  isStudent?: boolean;
  education?: IEducation;
  practiceLicenseNumber?: string | null;
  work?: string | null;
}

export interface IUpdateParentInput {
  fullname?: string;
  email?: string;
  address?: string;
  phone?: string;
  work?: string;
  age?: number;
}

// Backend mengembalikan langsung user data tanpa wrapper
export type ICurrentUser = ICounselor | IParent;

// Type guards untuk membedakan Counselor dan Parent
export function isCounselor(user: ICurrentUser): user is ICounselor {
  return "isStudent" in user;
}

export function isParent(user: ICurrentUser): user is IParent {
  return "age" in user;
}
