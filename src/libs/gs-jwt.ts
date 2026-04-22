"use client";

/**
 * GetSmart JWT Helper
 * Decode JWT token dari API GetSmart untuk membaca payload di sisi client.
 * Hanya untuk membaca role/userId — bukan untuk validasi keamanan.
 */

import type { GsJwtPayload, GsUserRole } from "@/types/gs-auth";
import { GS_DASHBOARD_PATH } from "@/types/gs-auth";

/**
 * Decode JWT token GetSmart tanpa verifikasi signature.
 * Safe dipakai di browser untuk membaca payload (role, userId, exp, dll).
 */
export function decodeGsJWT(token: string): GsJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");

    return JSON.parse(atob(payload)) as GsJwtPayload;
  } catch {
    return null;
  }
}

/** Kembalikan path dashboard berdasarkan role */
export function getDashboardPath(role: GsUserRole | undefined): string {
  if (!role) return "/login";
  return GS_DASHBOARD_PATH[role] ?? "/login";
}
