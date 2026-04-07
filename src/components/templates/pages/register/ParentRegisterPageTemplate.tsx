"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRegisterParent } from "@/services";
import { IParentRegisterInput } from "@/types/auth";

export default function ParentRegisterPageTemplate() {
  const router = useRouter();
  const registerParent = useRegisterParent();

  const [form, setForm] = useState<IParentRegisterInput>({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    age: 0,
    work: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateField = (
    key: keyof IParentRegisterInput,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullname ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.work ||
      !form.password ||
      !form.age
    ) {
      toast.error("Lengkapi semua data pendaftaran.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    if (form.password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      await registerParent.mutateAsync(form);
      toast.success("Registrasi berhasil. Silakan login.");
    } catch (error: any) {
      toast.error(error?.message || "Registrasi gagal.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-[448px]">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6b7280]"
        >
          <span aria-hidden="true">&lt;</span>
          Pilih Peran Lain
        </button>

        <div className="mt-4 rounded-[24px] border border-[#1a237e]/10 bg-white/95 p-5 sm:p-6 lg:p-7 shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)]">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1a237e]/14 bg-[#1a237e]/8">
              <Image
                src="/img/logo/logo.png"
                alt="GetMath"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-[30px] font-extrabold leading-8 text-[#1a237e]">
              Daftar sebagai Orang Tua
            </h1>
            <p className="mt-1 text-xs text-[#6b7280]">
              Lengkapi data untuk membuat akun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Nama Lengkap<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.fullname}
                onChange={(e) => updateField("fullname", e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Email<span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Nomor HP/WhatsApp<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Alamat<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Masukkan alamat lengkap"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Umur<span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.age || ""}
                onChange={(e) =>
                  updateField("age", Number(e.target.value) || 0)
                }
                placeholder="Contoh: 36"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Pekerjaan<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.work}
                onChange={(e) => updateField("work", e.target.value)}
                placeholder="Contoh: Wiraswasta"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Password<span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4b5563]">
                Konfirmasi Password<span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-[14px] bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
              disabled={registerParent.isPending}
            >
              {registerParent.isPending ? "Memproses..." : "Buat Akun"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[#6b7280]">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#00acc1]">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
