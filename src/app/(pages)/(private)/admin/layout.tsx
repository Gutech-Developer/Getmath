import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  decodeGsJWTServer,
  getDashboardPathServer,
} from "@/libs/gs-jwt.server";

/**
 * Layout proteksi role ADMIN.
 * Jika role bukan ADMIN, user akan di-redirect ke dashboard sesuai role-nya.
 */
export default async function AdminRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;

  // Token sudah dicek di (private)/layout.tsx, tapi kita decode ulang untuk ambil role
  const payload = token ? decodeGsJWTServer(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    redirect(getDashboardPathServer(payload?.role));
  }

  return <>{children}</>;
}
