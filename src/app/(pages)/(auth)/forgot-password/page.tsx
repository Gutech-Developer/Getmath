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
                Email Terkirim!
              </h2>
              <p className="text-[13px] text-grey">
                Silakan cek email Anda dan klik link reset password yang telah
                dikirim.
              </p>
            </div>
            <Link href="/login" className="block w-full">
              <button className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)] py-2.5 text-sm font-medium transition-colors">
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
          className="inline-flex items-center gap-2 text-[13px] text-[#6b7280] hover:text-[#4b5563]"
        >
          <span aria-hidden="true">&lt;</span>
          Kembali ke Login
        </Link>

        <div className="mt-4 bg-white/95 rounded-[24px] shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)] border border-[#1a237e]/10 p-5 sm:p-6 lg:p-7">
          <div className="mb-5 text-center">
            <h2 className="text-2xl lg:text-[34px] font-extrabold text-[#1a237e] leading-tight mb-1.5">
              Lupa Password?
            </h2>
            <p className="text-[13px] text-grey">
              Masukkan email Anda untuk menerima link reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block">
                <BodySmallMedium className="text-[#4b5563]">
                  Email
                </BodySmallMedium>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
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
                  className="rounded-[12px] bg-[#1a237e]/5 px-3.5 py-2.5 pl-8 text-[13px] outline-[#1a237e]/10 focus:outline-[#00acc1]"
                />
              </div>
            </div>

            <div className="pt-1">
              <SubmitButton
                variant="outline"
                type="submit"
                className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)]"
                disabled={forgotPassword.isPending}
                text={forgotPassword.isPending ? "Mengirim..." : "Lanjut"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
