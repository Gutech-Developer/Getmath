"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGsResetPassword } from "@/services";
import { toast } from "sonner";
import { BodySmallMedium, Heading3 } from "@/components/atoms/Typography";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";

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
          <div className="bg-white/95 rounded-[24px] shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)] border border-[#1a237e]/10 p-5 sm:p-6 lg:p-7">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1a237e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#1a237e]"
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
              <h2 className="text-2xl lg:text-[34px] font-extrabold text-[#1a237e] leading-tight mb-2">
                Password Berhasil Direset!
              </h2>
              <p className="text-[13px] text-grey">
                Password Anda telah berhasil direset. Silakan login dengan
                password baru Anda.
              </p>
            </div>
            <Link href="/login" className="block w-full">
              <button className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)] py-2.5 text-sm font-medium transition-colors">
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
          <div className="bg-white/95 rounded-[24px] shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)] border border-[#1a237e]/10 p-5 sm:p-6 lg:p-7">
            <div className="text-center mb-8">
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
              <h2 className="text-2xl lg:text-[34px] font-extrabold text-[#1a237e] leading-tight mb-2">
                Token Tidak Valid
              </h2>
              <p className="text-[13px] text-grey">
                Link reset password tidak valid atau sudah kedaluwarsa.
              </p>
            </div>
            <Link href="/forgot-password" className="block w-full">
              <button className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)] py-2.5 text-sm font-medium transition-colors">
                Request Link Baru
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/login" className="block w-full">
                <button className="w-full bg-[#1a237e]/5 text-[#4b5563] py-2.5 rounded-[12px] text-sm font-medium hover:bg-[#1a237e]/10 transition-colors">
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
          className="inline-flex items-center gap-2 text-[13px] text-[#6b7280] hover:text-[#4b5563]"
        >
          <span aria-hidden="true">&lt;</span>
          Kembali ke Login
        </Link>
        <div className="mt-4 bg-white/95 rounded-[24px] shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)] border border-[#1a237e]/10 p-5 sm:p-6 lg:p-7">
          <div className="mb-5 text-center">
            <h2 className="text-2xl lg:text-[34px] font-extrabold text-[#1a237e] leading-tight mb-1.5">
              Reset Password
            </h2>
            <p className="text-[13px] text-grey">
              Masukkan password baru Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block">
                <BodySmallMedium className="text-[#4b5563]">
                  Password Baru
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] z-10">
                  <svg
                    className="w-3.5 h-3.5"
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
                  className="rounded-[12px] bg-[#1a237e]/5 py-2.5 pl-8 pr-8 text-[13px] outline-[#1a237e]/10 focus:outline-[#00acc1]"
                  placeholder="Masukkan password baru"
                />
              </div>
              <p className="mt-1 text-xs text-[#6b7280]">
                Min. 8 karakter, mengandung huruf besar, huruf kecil, angka, dan
                karakter spesial.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block">
                <BodySmallMedium className="text-[#4b5563]">
                  Konfirmasi Password
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] z-10">
                  <svg
                    className="w-3.5 h-3.5"
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
                  className="rounded-[12px] bg-[#1a237e]/5 py-2.5 pl-8 pr-8 text-[13px] outline-[#1a237e]/10 focus:outline-[#00acc1]"
                  placeholder="Konfirmasi password baru"
                />
              </div>
            </div>

            <div className="pt-1">
              <SubmitButton
                variant="outline"
                type="submit"
                className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)]"
                disabled={resetPassword.isPending}
                text={
                  resetPassword.isPending ? "Menyimpan..." : "Reset Password"
                }
              />
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e]"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
