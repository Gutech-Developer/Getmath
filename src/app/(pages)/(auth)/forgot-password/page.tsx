"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/services";
import { toast } from "react-toastify";
import { BodySmallMedium, Heading3 } from "@/components/atoms/Typography";
import EmailInput from "@/components/atoms/inputs/EmailInput";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";
import { UserRole } from "@/types/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("counselor");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Masukkan email Anda.");
      return;
    }

    try {
      const result = await forgotPassword.mutateAsync({ email, role });
      setResetToken(result.resetToken);
      toast.success("Link reset password berhasil dikirim!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal mengirim link reset password.");
    }
  };

  if (resetToken) {
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
          <Heading3 className="text-neutral-02 mb-2">Token Reset!</Heading3>
          <p className="text-grey text-sm">
            Gunakan token di bawah ini untuk reset password Anda. Token valid
            selama 15 menit.
          </p>
        </div>

        <div className="bg-grey-light/50 rounded-lg p-4 mb-6">
          <p className="text-xs text-grey mb-2">Reset Token:</p>
          <p className="text-sm font-mono break-all text-neutral-02 bg-white p-3 rounded border border-grey-stroke">
            {resetToken}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
            className="block w-full"
          >
            <button className="w-full bg-charcoal-green text-white py-3 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors">
              Reset Password Sekarang
            </button>
          </Link>

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
          <Heading3 className="text-neutral-02 mb-2">Lupa Password?</Heading3>
          <p className="text-grey text-sm">
            Masukkan email Anda untuk menerima token reset password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block mb-2">
              <BodySmallMedium>Tipe Akun</BodySmallMedium>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("counselor")}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  role === "counselor"
                    ? "bg-charcoal-green text-white-mineral"
                    : "bg-white/5 text-charcoal-green-dark border border-grey-stroke hover:bg-grey-light"
                }`}
              >
                Konselor
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  role === "parent"
                    ? "bg-charcoal-green text-white-mineral"
                    : "bg-white/5 text-charcoal-green-dark border border-grey-stroke hover:bg-grey-light"
                }`}
              >
                Orangtua
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block">
              <BodySmallMedium>Email</BodySmallMedium>
            </label>
            <div className="mt-2">
              <EmailInput
                id="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
              />
            </div>
          </div>

          {/* Submit Button */}
          <SubmitButton
            type="submit"
            className="w-full flex justify-center items-center"
            disabled={forgotPassword.isPending}
            text={forgotPassword.isPending ? "Mengirim..." : "Lanjut"}
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
