import Link from "next/link";
import { ReactNode } from "react";

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-[#111827]">
      {/* HEADER */}
      <header className="fixed top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
           <img src="/img/logo/logo.png" alt="" className="w-36 h-36" />
          
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#2563EB]">Beranda</Link>
            <Link href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#2563EB]">Tentang</Link>
            <Link href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#2563EB]">Fitur</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Masuk
            </Link>
            
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-20">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#111827] pt-16 pb-8 border-t border-[#1F2937]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 xl:gap-24 mb-16">
            {/* Logo and About */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                  <img src="/img/logo/logo.png" alt="" className="w-36 h-36" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#9CA3AF] max-w-sm">
                Platform E-Learning Matematika dengan Teknologi AI untuk seluruh Indonesia.
              </p>
              <div className="flex items-center gap-3 rounded-lg border border-[#374151] bg-[#1F2937] p-3 w-max">
                <div className="h-8 w-12 bg-white flex items-center justify-center rounded text-[10px] font-bold text-red-600">
                  PRP-PMRI
                </div>
                <span className="text-xs font-semibold text-white tracking-widest">PRP-PMRI USK</span>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Produk</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#9CA3AF]">
                <li><Link href="#" className="hover:text-white transition">Fitur Platform</Link></li>
                <li><Link href="#" className="hover:text-white transition">Modul Materi</Link></li>
                <li><Link href="#" className="hover:text-white transition">Tes Diagnostik</Link></li>
                <li><Link href="#" className="hover:text-white transition">LAD Analytics</Link></li>
                <li><Link href="#" className="hover:text-white transition">AI Chatbot</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Pengguna</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#9CA3AF]">
                <li><Link href="#" className="hover:text-white transition">Untuk Siswa</Link></li>
                <li><Link href="#" className="hover:text-white transition">Untuk Guru</Link></li>
                <li><Link href="#" className="hover:text-white transition">Untuk Orang Tua</Link></li>
                <li><Link href="/register" className="hover:text-white transition">Mulai Daftar</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Masuk Akun</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">Perusahaan</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#9CA3AF]">
                <li><Link href="#" className="hover:text-white transition">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-white transition">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-white transition">Syarat Layanan</Link></li>
                <li><Link href="#" className="hover:text-white transition">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#1F2937] pt-8 gap-4 text-center md:text-left">
            <p className="text-xs text-[#6B7280]">
              &copy; 2025 GetSmart by PRP-PMRI USK. All rights reserved.
            </p>
            <p className="text-xs text-[#6B7280]">
              Platform E-Learning Matematika dengan Teknologi AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
