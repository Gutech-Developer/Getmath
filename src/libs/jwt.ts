/**
 * JWT Helper Functions
 * Decode JWT token untuk mendapatkan payload (role, id, email)
 */

import { UserRole } from "@/types/auth";
import { tokenStorage } from "./token";

export interface IJWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const dashboardPathByRole: Partial<Record<UserRole, string>> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  // Backward compatibility untuk role lama
  counselor: "/teacher/dashboard",
};

/**
 * Decode JWT token tanpa verify (client-side)
 * Hanya untuk membaca payload, bukan untuk security validation
 */
export function decodeJWT(token: string): IJWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64 payload (browser-compatible)
    const payload = parts[1];
    const decodeBase64 = globalThis.atob;
    if (typeof decodeBase64 !== "function") return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const decoded = decodeBase64(paddedPayload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function getDashboardPathByRole(role: UserRole | null): string {
  if (!role) return "/";
  return dashboardPathByRole[role] ?? "/";
}

/**
 * Get current user role dari JWT token
 */
export function getUserRole(): UserRole | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Get current user ID dari JWT token
 */
export function getUserId(): string | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.id || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const token = tokenStorage.getAccessToken();
  if (!token) return true;

  const payload = decodeJWT(token);
  if (!payload) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}
