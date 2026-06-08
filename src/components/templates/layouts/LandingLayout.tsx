import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-lottie-pearl font-inter text-lottie-midnight antialiased selection:bg-lottie-mint-wash selection:text-lottie-midnight">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1f2375] bg-[#ededed] backdrop-blur-md shadow-[rgba(31,35,117,0.03)_0px_4px_16px_0px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src={"/img/logo/logo.png"}
              alt="Getsmart"
              width={100}
              height={100}
              className="w-auto h-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#tentang"
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              Tentang
            </Link>
            <Link
              href="#fitur"
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              Fitur
            </Link>
            <Link
              href="#peran"
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              Peran
            </Link>
            <Link
              href="#cara-kerja"
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              Cara Kerja
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search Field */}
            <div className="relative hidden lg:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lottie-zinc-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari materi..."
                className="h-9 w-48 rounded-lg border border-white/50 bg-white/40 pl-9 pr-12 text-[13px] text-lottie-midnight placeholder-lottie-fog outline-none transition focus:border-lottie-teal focus:bg-white/80 focus:ring-2 focus:ring-lottie-teal/20 backdrop-blur-sm"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-lottie-zinc-500 border border-white/40">
                ⌘K
              </span>
            </div>

            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-lottie-midnight hover:bg-lottie-pearl transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-medium text-white transition-all hover:bg-lottie-teal/95 active:scale-[0.98] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-lottie-mist bg-white pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 xl:gap-24 mb-12">
            {/* Logo and About */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lottie-teal text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <span className="font-dm-sans text-xl font-bold tracking-tight text-lottie-midnight">
                  Get<span className="text-lottie-teal">Math</span>
                </span>
              </Link>
              <p className="mb-6 text-sm leading-relaxed text-lottie-zinc-500 max-w-sm">
                Platform E-Learning Matematika dengan Teknologi AI untuk seluruh
                Indonesia.
              </p>
              <div className="flex items-center gap-3 rounded-2xl border border-lottie-mist bg-lottie-pearl p-3 w-max">
                <div className="h-8 px-2.5 bg-white flex items-center justify-center rounded-lg border border-lottie-mist text-[10px] font-bold text-red-600 shadow-sm">
                  PRP-PMRI
                </div>
                <span className="text-xs font-semibold text-lottie-midnight tracking-wider">
                  PRP-PMRI USK
                </span>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                Produk
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Fitur Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Modul Materi
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Tes Diagnostik
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    LAD Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    AI Chatbot
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                Pengguna
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Untuk Siswa
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Untuk Guru
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Untuk Orang Tua
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Mulai Daftar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Masuk Akun
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                Perusahaan
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Syarat Layanan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-lottie-mist pt-8 gap-4 text-center md:text-left">
            <p className="text-xs text-lottie-fog">
              &copy; {new Date().getFullYear()} GetSmart by PRP-PMRI USK. All
              rights reserved.
            </p>
            <p className="text-xs text-lottie-fog">
              Platform E-Learning Matematika dengan Teknologi AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
