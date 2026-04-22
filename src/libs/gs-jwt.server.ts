/**
 * GetSmart JWT Helper — Server Only
 * Digunakan di Server Components / layouts untuk membaca payload token
 * dari cookie tanpa mengekspos logic ke browser.
 * JANGAN tambahkan "use client" di sini.
 */

import type { GsJwtPayload, GsUserRole } from "@/types/gs-auth";
import { GS_DASHBOARD_PATH } from "@/types/gs-auth";

/**
 * Decode JWT payload tanpa verifikasi signature.
 * Cukup untuk membaca role/userId di server untuk keperluan route protection.
 */
export function decodeGsJWTServer(token: string): GsJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");

    return JSON.parse(
      Buffer.from(base64, "base64").toString("utf-8"),
    ) as GsJwtPayload;
  } catch {
    return null;
  }
}

/** Kembalikan path dashboard berdasarkan role */
export function getDashboardPathServer(role: GsUserRole | undefined): string {
  if (!role) return "/login";
  return GS_DASHBOARD_PATH[role] ?? "/login";
}
