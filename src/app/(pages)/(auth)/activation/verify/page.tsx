"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGsActivationVerify } from "@/services";

export default function ActivationVerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { data, isLoading, isError, error } = useGsActivationVerify({ token });

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-02 mb-2">
          Token Tidak Ditemukan
        </h2>
        <p className="text-grey text-sm mb-6">
          Link aktivasi tidak valid. Silakan minta ulang email aktivasi.
        </p>
        <Link
          href="/login"
          className="inline-block bg-charcoal-green text-white py-3 px-6 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors"
        >
          Kembali ke Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
        <div className="animate-spin mx-auto h-8 w-8 rounded-full border-b-2 border-charcoal-green" />
      </div>
    );
  }

  if (data) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-jade/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-jade"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-02 mb-2">
          Akun Berhasil Diaktifkan!
        </h2>
        <p className="text-grey text-sm mb-6">
          Akun Anda telah aktif. Silakan login untuk melanjutkan.
        </p>
        <Link
          href="/login"
          className="inline-block bg-charcoal-green text-white py-3 px-6 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  const errorMessage =
    error?.message || "Link aktivasi tidak valid atau sudah kedaluwarsa.";

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-neutral-02 mb-2">Aktivasi Gagal</h2>
      <p className="text-grey text-sm mb-6">{errorMessage}</p>
      <div className="space-y-3">
        <Link
          href="/login"
          className="block bg-charcoal-green text-white py-3 px-6 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
