"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-charcoal-green via-charcoal-green-dark to-neutral-02 relative flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-jade/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-moss-stone/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-topaz/5 rounded-full blur-3xl" />

        {/* Decorative lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Elephant Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-jade/20 to-moss-stone/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-jade"
                viewBox="0 0 64 64"
                fill="currentColor"
              >
                {/* Simplified elephant silhouette */}
                <path d="M52 28c0-8.8-7.2-16-16-16h-4c-2.2 0-4 1.8-4 4v4c0 2.2-1.8 4-4 4h-4c-4.4 0-8 3.6-8 8v12c0 2.2 1.8 4 4 4h4v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4h8v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4h4c2.2 0 4-1.8 4-4V32c2.2 0 4-1.8 4-4zM20 36c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
              </svg>
            </div>
            {/* Decorative ring */}
            <div
              className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-jade/30 rounded-full animate-spin-slow"
              style={{ animationDuration: "20s" }}
            />
          </div>
        </div>

        {/* 404 Number with glow effect */}
        <div className="relative mb-6">
          <h1 className="text-[140px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tight">
            <span className="bg-gradient-to-b from-white via-jade-light to-jade bg-clip-text text-transparent drop-shadow-2xl">
              404
            </span>
          </h1>
          {/* Glow effect */}
          <div className="absolute inset-0 text-[140px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tight text-jade/20 blur-2xl -z-10">
            404
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-grey-light/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman
          telah dipindahkan, dihapus, atau alamat yang Anda masukkan tidak
          tepat.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-jade to-moss-stone text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-jade/30 hover:scale-105"
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
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:bg-white/10 hover:border-jade/50 hover:scale-105"
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
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-grey-light/60 mb-6">
            Atau kunjungi halaman-halaman berikut:
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <Link
              href="/login"
              className="text-jade hover:text-jade-light transition-colors inline-flex items-center gap-1"
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
              className="text-jade hover:text-jade-light transition-colors inline-flex items-center gap-1"
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
              className="text-jade hover:text-jade-light transition-colors inline-flex items-center gap-1"
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
            className="w-2 h-2 rounded-full bg-jade/60 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-jade/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-jade/60 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </main>
  );
}
