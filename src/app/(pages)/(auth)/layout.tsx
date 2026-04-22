import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  decodeGsJWTServer,
  getDashboardPathServer,
} from "@/libs/gs-jwt.server";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;

  if (token) {
    const payload = decodeGsJWTServer(token);
    if (payload) {
      redirect(getDashboardPathServer(payload.role));
    }
  }

  return (
    <div className="w-screen min-h-svh flex justify-center items-center bg-white-mineral font-parkinsans relative z-0">
      <div className="h-full w-full absolute -z-1 opacity-[0.03] bg-[#F0F4FF]"></div>
      {children}
    </div>
  );
};

export default AuthLayout;
