"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGsResetPassword } from "@/services";
import { toast } from "sonner";
import { BodySmallMedium } from "@/components/atoms/Typography";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPassword = useGsResetPassword();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password minimal 8 karakter.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password harus mengandung minimal 1 huruf kapital.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password harus mengandung minimal 1 huruf kecil.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password harus mengandung minimal 1 angka.";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password harus mengandung minimal 1 karakter spesial.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token reset password tidak ditemukan.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, newPassword });
      setIsSuccess(true);
      toast.success("Password berhasil direset!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal reset password.");
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-[448px]">
          <div className="getmath-card p-5 sm:p-6 lg:p-7 text-center">
            <div className="text-center mb-8">
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
                Password Berhasil Direset!
              </h2>
              <p className="text-[13px] text-lottie-zinc-500">
                Password Anda telah berhasil direset. Silakan login dengan
                password baru Anda.
              </p>
            </div>
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

  if (!token) {
    return (
      <div className="w-full flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-[448px]">
          <div className="getmath-card p-5 sm:p-6 lg:p-7 text-center">
            <div className="text-center mb-8">
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
                Token Tidak Valid
              </h2>
              <p className="text-[13px] text-lottie-zinc-500">
                Link reset password tidak valid atau sudah kedaluwarsa.
              </p>
            </div>
            <Link href="/forgot-password" className="block w-full">
              <button className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer">
                Request Link Baru
              </button>
            </Link>
            <div className="mt-3">
              <Link href="/login" className="block w-full">
                <button className="w-full flex justify-center items-center rounded-xl border border-lottie-teal/20 bg-white/60 hover:bg-lottie-teal/5 text-lottie-teal px-4 py-3 text-sm font-semibold transition cursor-pointer">
                  Kembali ke Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-[448px]">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-lottie-teal hover:opacity-85 transition duration-200"
        >
          <span aria-hidden="true">&larr;</span>
          Kembali ke Login
        </Link>
        <div className="mt-4 getmath-card p-5 sm:p-6 lg:p-7">
          <div className="mb-5 text-center">
            <h2 className="text-3xl font-extrabold text-lottie-teal leading-tight mb-1.5">
              Reset Password
            </h2>
            <p className="text-[13px] text-lottie-zinc-500">
              Masukkan password baru Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block">
                <BodySmallMedium className="text-lottie-zinc-500">
                  Password Baru
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lottie-zinc-500 z-10">
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
                      d="M12 11c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11V8a5 5 0 0110 0v3"
                    />
                  </svg>
                </span>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 pl-10 pr-10 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
                  placeholder="Masukkan password baru"
                />
              </div>
              <p className="mt-1 text-[11px] text-lottie-zinc-500 leading-normal">
                Min. 8 karakter, mengandung huruf besar, huruf kecil, angka, dan
                karakter spesial.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block">
                <BodySmallMedium className="text-lottie-zinc-500">
                  Konfirmasi Password
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lottie-zinc-500 z-10">
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
                      d="M12 11c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11V8a5 5 0 0110 0v3"
                    />
                  </svg>
                </span>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 pl-10 pr-10 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
                  placeholder="Konfirmasi password baru"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer disabled:opacity-70"
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending ? "Menyimpan..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[448px] mx-auto p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lottie-teal"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
