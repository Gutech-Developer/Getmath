import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  decodeGsJWTServer,
  getDashboardPathServer,
} from "@/libs/gs-jwt.server";

/**
 * Layout proteksi role TEACHER.
 * Jika role bukan TEACHER, user akan di-redirect ke dashboard sesuai role-nya.
 */
export default async function TeacherRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;

  const payload = token ? decodeGsJWTServer(token) : null;

  if (!payload || payload.role !== "TEACHER") {
    redirect(getDashboardPathServer(payload?.role));
  }

  return <>{children}</>;
}
