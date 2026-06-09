import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { SidebarProvider } from "@/providers/SidebarProvider";
import NextTopLoader from "nextjs-toploader";
import MainLayout from "@/components/templates/layouts/MainLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GetSmart",
  description: "GetSmart Adaptive Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-parkinsans antialiased bg-grey-lightest overflow-x-hidden overflow-y-auto thin-scrollbar`}
      >
        <NextTopLoader
          color="#1F2375"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          zIndex={99999}
        />
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
          duration={4000}
        />
      </body>
    </html>
  );
}
