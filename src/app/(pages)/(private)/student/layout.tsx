import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  decodeGsJWTServer,
  getDashboardPathServer,
} from "@/libs/gs-jwt.server";

/**
 * Layout proteksi role STUDENT.
 * Jika role bukan STUDENT, user akan di-redirect ke dashboard sesuai role-nya.
 */
export default async function StudentRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;

  const payload = token ? decodeGsJWTServer(token) : null;

  if (!payload || payload.role !== "STUDENT") {
    redirect(getDashboardPathServer(payload?.role));
  }

  return (
    <div className="min-h-screen relative z-0 w-full">
      {/* Subtle coordinate grid plot doodle behind the sidebar page content */}
      {/* <div className="absolute right-[4%] top-[15%] pointer-events-none opacity-[0.035] select-none z-0 hidden lg:block">
        <svg width="240" height="240" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="#1F2375" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="#1F2375" strokeWidth="2" />
          <line x1="100" y1="20" x2="100" y2="180" stroke="#1F2375" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute left-[3%] bottom-[12%] pointer-events-none opacity-[0.035] select-none z-0 hidden lg:block">
        <svg width="180" height="120" viewBox="0 0 180 100" fill="none">
          <path d="M10,50 Q45,10 80,50 T150,50" stroke="#1F2375" strokeWidth="2.5" fill="none" />
        </svg>
      </div> */}

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
