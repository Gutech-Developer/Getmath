import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeGsJWTServer } from "@/libs/gs-jwt.server";
import MainLayout from "@/components/templates/layouts/MainLayout";
import { SidebarProvider } from "@/providers/SidebarProvider";

const PrivateLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("gs_access_token")?.value;

  if (!token || !decodeGsJWTServer(token)) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
};

export default PrivateLayout;
