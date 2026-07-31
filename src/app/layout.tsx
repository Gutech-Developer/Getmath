import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import NextTopLoader from "nextjs-toploader";
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
    <html lang="id">
      <body
        className={`font-inter antialiased bg-grey-lightest overflow-x-hidden overflow-y-auto thin-scrollbar`}
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
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
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
