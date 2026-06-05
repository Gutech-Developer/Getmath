import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFBFF] pt-28 pb-20 md:pt-36 md:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:px-8">
        {/* Text Content */}
        <div className="flex flex-1 flex-col items-start gap-6 lg:max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE3FF] bg-[#EEF2FF] px-4 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-xs font-semibold text-[#2563EB]">
              Platform E-Learning Adaptif Berbasis AI
            </span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-[1.15] text-[#111827] lg:text-[4rem]">
            Belajar Lebih Cerdas untuk Semua <span className="text-[#2563EB]">Mata Pelajaran</span>
          </h1>
          
          <p className="text-lg leading-relaxed text-[#6B7280]">
            GetSmart menyediakan pengalaman belajar yang dipersonalisasi — dari modul interaktif, remedial per soal, hingga analitik belajar yang komprehensif untuk Matematika, Sains, Sosial, dan berbagai mata pelajaran lainnya.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2563EB] px-8 text-base font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Mulai Belajar Gratis
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#demo"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D1D5DB] bg-white px-8 text-base font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
            >
              Lihat Demo
            </Link>
          </div>
        </div>

        {/* Image / Graphic Content */}
        <div className="relative flex-1">
          <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl">
            {/* The laptop image placeholder */}
            <div className="aspect-[4/3] w-full bg-[#E9ECEF] flex items-center justify-center">
               <img src="/img/belajar.png" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Floating Card 1 */}
          <div className="absolute -right-6 top-8 z-20 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF]">Real-time</p>
              <p className="text-sm font-bold text-[#111827]">LAD Dashboard</p>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div className="absolute -bottom-6 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#9CA3AF]">AI-Powered</p>
              <p className="text-sm font-bold text-[#111827]">Analitik Emosi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
