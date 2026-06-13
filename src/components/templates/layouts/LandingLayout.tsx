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
      <header className="sticky top-0 z-50 w-full border-b border-lottie-teal/20 bg-[#ededed] backdrop-blur-md shadow-[rgba(31,35,117,0.03)_0px_4px_16px_0px]">
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
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-lottie-teal px-5 text-sm font-medium text-white transition-all hover:bg-lottie-teal/95 active:scale-[0.98] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
            >
              Masuk/Daftar
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
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src={"/img/logo/logo.png"}
                  alt="Getsmart"
                  width={100}
                  height={100}
                  className="w-auto h-auto object-contain"
                />
              </Link>
              <p className="mb-6 text-sm leading-relaxed text-lottie-zinc-500 max-w-sm">
                Platform E-Learning Matematika dengan Teknologi AI untuk seluruh
                Indonesia.
              </p>
              <div className="flex items-center gap-3 rounded-2xl border border-lottie-mist bg-lottie-pearl p-3 w-max">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <Image
                    src={"/img/logo/logo_PRP-PMRI.png"}
                    alt="Getsmart"
                    width={100}
                    height={100}
                    className="w-auto h-auto object-contain"
                  />
                </Link>
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
