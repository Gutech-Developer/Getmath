import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  decodeGsJWTServer,
  getDashboardPathServer,
} from "@/libs/gs-jwt.server";

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;
  const payload = token ? decodeGsJWTServer(token) : null;

  if (!payload || payload.role !== "STUDENT") {
    redirect(payload ? getDashboardPathServer(payload.role) : "/login");
  }

  return (
    <div className="min-h-screen w-full bg-grey-lightest p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}
