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
      <div className="w-full flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-[448px]">
          <div className="getmath-card p-5 sm:p-6 lg:p-7 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg
                className="w-8 h-8 text-red-500"
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
            <h2 className="text-3xl font-extrabold text-red-500 leading-tight mb-2">
              Token Hilang
            </h2>
            <p className="text-lottie-zinc-500 text-[13px] mb-6">
              Link aktivasi tidak valid. Silakan minta ulang email aktivasi dari admin.
            </p>
            <Link href="/login" className="block w-full">
              <button className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer">
                Kembali ke Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-[448px]">
          <div className="getmath-card p-12 text-center flex items-center justify-center">
            <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-lottie-teal" />
          </div>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="w-full flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-[448px]">
          <div className="getmath-card p-5 sm:p-6 lg:p-7 text-center">
            <div className="w-16 h-16 bg-lottie-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-lottie-teal/20">
              <svg
                className="w-8 h-8 text-lottie-teal"
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
            <h2 className="text-3xl font-extrabold text-lottie-teal leading-tight mb-2">
              Akun Aktif!
            </h2>
            <p className="text-lottie-zinc-500 text-[13px] mb-6">
              Akun Anda telah aktif. Silakan login untuk memulai petualangan belajar Anda.
            </p>
            <Link href="/login" className="block w-full">
              <button className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer">
                Login Sekarang
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const errorMessage =
    error?.message || "Link aktivasi tidak valid atau sudah kedaluwarsa.";

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-[448px]">
        <div className="getmath-card p-5 sm:p-6 lg:p-7 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h2 className="text-3xl font-extrabold text-red-500 leading-tight mb-2">
            Aktivasi Gagal
          </h2>
          <p className="text-lottie-zinc-500 text-[13px] mb-6">{errorMessage}</p>
          <Link href="/login" className="block w-full">
            <button className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer">
              Kembali ke Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
