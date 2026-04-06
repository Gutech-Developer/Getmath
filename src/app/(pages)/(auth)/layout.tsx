import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { decodeJWT } from "@/libs/jwt";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    const payload = decodeJWT(token);
    if (payload) {
      if (payload.role === "counselor") redirect("/counselor/dashboard");
      else if (payload.role === "parent") redirect("/parent/dashboard");
      else redirect("/");
    }
  }

  return (
    <div className="w-screen min-h-svh flex justify-center items-center bg-white-mineral font-parkinsans relative z-0">
      <div className="h-full w-full absolute -z-1 opacity-[0.03]">
        <Image
          src={"/img/auth_bg.webp"}
          alt="Gajah Puteh Art Therapy"
          fill
          className="object-cover"
        />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
