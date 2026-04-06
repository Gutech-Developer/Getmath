"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/services";
import { toast } from "react-toastify";
import { BodySmallMedium, Heading3 } from "@/components/atoms/Typography";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPassword = useResetPassword();

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
      <div className="w-full max-w-md mx-auto p-6 sm:p-8">
        <div className="text-center mb-8">
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
          <Heading3 className="text-neutral-02 mb-2">
            Password Berhasil Direset!
          </Heading3>
          <p className="text-grey text-sm">
            Password Anda telah berhasil direset. Silakan login dengan password
            baru Anda.
          </p>
        </div>

        <Link href="/login" className="block w-full">
          <button className="w-full bg-charcoal-green text-white py-3 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors">
            Login Sekarang
          </button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8">
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
          <Heading3 className="text-neutral-02 mb-2">
            Token Tidak Valid
          </Heading3>
          <p className="text-grey text-sm">
            Link reset password tidak valid atau sudah kedaluwarsa.
          </p>
        </div>

        <Link href="/forgot-password" className="block w-full">
          <button className="w-full bg-charcoal-green text-white py-3 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors">
            Request Link Baru
          </button>
        </Link>

        <div className="mt-4">
          <Link href="/login" className="block w-full">
            <button className="w-full bg-grey-light text-neutral-02 py-3 rounded-lg font-medium hover:bg-grey-stroke transition-colors">
              Kembali ke Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5 sm:p-8">
      <div className=" w-full md:w-md mx-auto p-5 lg:p-10 bg-white rounded-xl">
        <div className="text-center mb-8">
          <Heading3 className="text-neutral-02 mb-2">Reset Password</Heading3>
          <p className="text-grey text-sm">Masukkan password baru Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block">
              <BodySmallMedium>Password Baru</BodySmallMedium>
            </label>
            <div className="mt-2">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
              />
            </div>
            <p className="mt-1 text-xs text-grey">
              Min. 8 karakter, mengandung huruf besar, huruf kecil, angka, dan
              karakter spesial.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block">
              <BodySmallMedium>Konfirmasi Password</BodySmallMedium>
            </label>
            <div className="mt-2">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>

          {/* Submit Button */}
          <SubmitButton
            type="submit"
            className="w-full flex justify-center"
            disabled={resetPassword.isPending}
            text={resetPassword.isPending ? "Menyimpan..." : "Reset Password"}
          />
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-moss-stone hover:text-charcoal-green transition-colors"
          >
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-green"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
