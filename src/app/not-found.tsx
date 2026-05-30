"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white-mineral w-screen font-parkinsans relative flex items-center justify-center overflow-hidden z-0">
      <div className="h-full w-full absolute -z-1 opacity-[0.03] bg-[#F0F4FF]"></div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1a237e]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00acc1]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a237e]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Elephant Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#1a237e]/10 to-[#00acc1]/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#1a237e]/10 shadow-xl">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-[#1a237e]"
                viewBox="0 0 64 64"
                fill="currentColor"
              >
                {/* Simplified elephant silhouette */}
                <path d="M52 28c0-8.8-7.2-16-16-16h-4c-2.2 0-4 1.8-4 4v4c0 2.2-1.8 4-4 4h-4c-4.4 0-8 3.6-8 8v12c0 2.2 1.8 4 4 4h4v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4h8v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4h4c2.2 0 4-1.8 4-4V32c2.2 0 4-1.8 4-4zM20 36c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
              </svg>
            </div>
            {/* Decorative ring */}
            <div
              className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-[#1a237e]/30 rounded-full animate-spin-slow"
              style={{ animationDuration: "20s" }}
            />
          </div>
        </div>

        {/* 404 Number with glow effect */}
        <div className="relative mb-6">
          <h1 className="text-[140px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tight">
            <span className="bg-gradient-to-b from-[#1a237e] via-[#00acc1] to-[#1a237e] bg-clip-text text-transparent drop-shadow-xl">
              404
            </span>
          </h1>
          {/* Glow effect */}
          <div className="absolute inset-0 text-[140px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tight text-[#1a237e]/10 blur-2xl -z-10">
            404
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a237e] mb-4">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-[15px] text-grey max-w-xl mx-auto mb-10 leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman
          telah dipindahkan, dihapus, atau alamat yang Anda masukkan tidak
          tepat.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] text-white text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 shadow-[0px_10px_20px_rgba(26,35,126,0.2)] hover:scale-105"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Kembali ke Beranda
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white backdrop-blur-sm text-[#1a237e] text-sm font-semibold rounded-xl border border-[#1a237e]/20 transition-all duration-300 hover:bg-[#1a237e]/5 hover:border-[#1a237e]/50 hover:scale-105 shadow-sm"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Halaman Sebelumnya
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-16 pt-8 border-t border-[#1a237e]/10">
          <p className="text-[13px] text-grey mb-6">
            Atau kunjungi halaman-halaman berikut:
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] font-medium">
            <Link
              href="/login"
              className="text-[#00acc1] hover:text-[#1a237e] transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Login
            </Link>
            <Link
              href="/register/counselor"
              className="text-[#00acc1] hover:text-[#1a237e] transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Daftar
            </Link>
            <Link
              href="/forgot-password"
              className="text-[#00acc1] hover:text-[#1a237e] transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Lupa Password
            </Link>
          </div>
        </div>

        {/* Decorative bottom element */}
        <div className="mt-12 flex justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-[#1a237e]/60 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#1a237e]/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#1a237e]/60 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </main>
  );
}
