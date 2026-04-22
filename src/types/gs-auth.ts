/**
 * GetSmart API — Auth Types
 * Sesuai dengan backend auth.types.ts di getsmart_api_services
 */

export type GsUserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

/** Payload yang ada di dalam JWT (di-decode di client untuk redirect) */
export interface GsJwtPayload {
  userId: string;
  email: string;
  isActive: boolean;
  role: GsUserRole;
  iat: number;
  exp: number;
}

export interface GsTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface GsUser {
  id: string;
  email: string;
  isActive: boolean;
  role: GsUserRole;
  profile: Record<string, unknown> | null;
  // Legacy optional fields — present on older API responses or profile endpoints
  fullname?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  work?: string;
  age?: number;
}

export interface GsAuthResponse {
  user: GsUser;
  tokens: GsTokenPair;
}

// ── Input types ────────────────────────────────────────────────────────────────

export interface GsLoginInput {
  email: string;
  password: string;
}

export interface GsRegisterInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: "TEACHER" | "STUDENT" | "PARENT";
  NIS?: string;
  NIP?: string;
  province?: string;
  city?: string;
  schoolName?: string;
  address?: string;
}

export interface GsForgotPasswordInput {
  email: string;
}

export interface GsResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface GsResendActivationInput {
  email: string;
}

// ── Response types ─────────────────────────────────────────────────────────────

export interface GsMessageResponse {
  message: string;
}

/** Mapping role ke path dashboard frontend */
export const GS_DASHBOARD_PATH: Record<GsUserRole, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};
