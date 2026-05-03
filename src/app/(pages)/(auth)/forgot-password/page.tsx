"use client";

import { useState } from "react";
import Link from "next/link";
import { useGsForgotPassword } from "@/services";
import { toast } from "sonner";
import { BodySmallMedium, Heading3 } from "@/components/atoms/Typography";
import EmailInput from "@/components/atoms/inputs/EmailInput";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotPassword = useGsForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Masukkan email Anda.");
      return;
    }

    try {
      await forgotPassword.mutateAsync({ email });
      setSent(true);
      toast.success("Link reset password berhasil dikirim!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal mengirim link reset password.");
    }
  };

  if (sent) {
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
          <Heading3 className="text-neutral-02 mb-2">Email Terkirim!</Heading3>
          <p className="text-grey text-sm">
            Silakan cek email Anda dan klik link reset password yang telah
            dikirim.
          </p>
        </div>
        <Link href="/login" className="block w-full">
          <button className="w-full bg-charcoal-green text-white py-3 rounded-lg font-medium hover:bg-charcoal-green-dark transition-colors">
            Kembali ke Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-5 sm:p-8">
      <div className="w-full md:w-md mx-auto p-5 lg:p-10 bg-white rounded-xl">
        <div className="text-center mb-8">
          <Heading3 className="text-neutral-02 mb-2">Lupa Password?</Heading3>
          <p className="text-grey text-sm">
            Masukkan email Anda untuk menerima link reset password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
