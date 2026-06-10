"use client";

import { useState } from "react";
import Link from "next/link";
import { useGsForgotPassword } from "@/services";
import { toast } from "sonner";
import { BodySmallMedium } from "@/components/atoms/Typography";
import EmailInput from "@/components/atoms/inputs/EmailInput";

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
                Email Terkirim!
              </h2>
              <p className="text-[13px] text-lottie-zinc-500">
                Silakan cek email Anda dan klik link reset password yang telah
                dikirim.
              </p>
            </div>
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
              Lupa Password?
            </h2>
            <p className="text-[13px] text-lottie-zinc-500">
              Masukkan email Anda untuk menerima link reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block">
                <BodySmallMedium className="text-lottie-zinc-500">
                  Email
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lottie-zinc-500">
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-1 10H4a1 1 0 01-1-1V7a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1z"
                    />
                  </svg>
                </span>
                <EmailInput
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 pl-10 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer disabled:opacity-70"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? "Mengirim..." : "Lanjut"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
