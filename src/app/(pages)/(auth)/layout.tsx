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
    <div className="w-screen min-h-svh flex justify-center items-center bg-gradient-to-br from-[#FCFDFE] via-[#F8FAFC] to-[#F1F5F9] math-grid-bg font-inter relative overflow-hidden">
      {/* Hand-drawn star doodle in the top-left */}
      <div className="absolute left-[8%] top-[15%] pointer-events-none z-0 hidden lg:block select-none animate-pulse">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#ffbf00"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 5 C20 15, 25 20, 35 20 C25 20, 20 25, 20 35 C20 25, 15 20, 5 20 C15 20, 20 15, 20 5 Z"
            fill="#fffbeb"
          />
        </svg>
      </div>

      {/* Curved loop arrow in the top-right */}
      <div className="absolute right-[8%] top-[10%] pointer-events-none z-0 hidden lg:block select-none opacity-40">
        <svg
          width="90"
          height="90"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 15 15 C 40 15, 65 25, 65 50 C 65 75, 25 75, 25 50 C 25 25, 75 20, 85 45" />
          <path d="M 77 42 L 85 45 L 87 37" />
        </svg>
      </div>

      {/* Coordinate axes plot at bottom-left */}
      <div className="absolute left-[5%] bottom-[10%] opacity-[0.04] pointer-events-none z-0 hidden lg:block select-none">
        <svg width="200" height="100" viewBox="0 0 240 120" fill="none">
          <line x1="10" y1="60" x2="230" y2="60" stroke="#1F2375" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="120" y1="10" x2="120" y2="110" stroke="#1F2375" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M10,60 Q37.5,0 65,60 T120,60 T175,60 T230,60" stroke="#1F2375" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Cute yellow star mascot peeking at the bottom-right */}
      <div className="absolute right-[6%] bottom-[8%] pointer-events-none z-0 hidden lg:block select-none opacity-90">
        <svg
          width="80"
          height="80"
          viewBox="0 0 70 70"
          fill="none"
        >
          <path
            d="M35 5L44 24L65 27L50 42L54 63L35 53L16 63L20 42L5 27L26 24L35 5Z"
            fill="#ffbf00"
          />
          <circle cx="28" cy="35" r="2.5" fill="#09090b" />
          <circle cx="42" cy="35" r="2.5" fill="#09090b" />
          <path
            d="M33 39C34 40.5 36 40.5 37 39"
            stroke="#09090b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
