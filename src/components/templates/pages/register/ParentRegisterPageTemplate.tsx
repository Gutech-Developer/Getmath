"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useGsRegister } from "@/services";
import { GsRegisterInput } from "@/types/gs-auth";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-lottie-zinc-500">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 pr-10 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-3 text-lottie-zinc-500 text-xs hover:text-lottie-teal"
          tabIndex={-1}
        >
          {visible ? "Sembunyikan" : "Lihat"}
        </button>
      </div>
    </div>
  );
}

export default function ParentRegisterPageTemplate() {
  const router = useRouter();
  const register = useGsRegister();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.phoneNumber ||
      !form.address ||
      !form.password
    ) {
      toast.error("Lengkapi semua data pendaftaran.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 huruf besar.");
      return;
    }

    if (!/[a-z]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 huruf kecil.");
      return;
    }

    if (!/[0-9]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 angka.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 karakter spesial.");
      return;
    }

    if (form.password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      const payload: GsRegisterInput = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        role: "PARENT",
        address: form.address,
      };
      await register.mutateAsync(payload);
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
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-lottie-teal hover:opacity-85 transition duration-200"
        >
          <span aria-hidden="true">&larr;</span>
          Pilih Peran Lain
        </button>

        <div className="mt-4 getmath-card p-5 sm:p-6 lg:p-7 pt-1 lg:pt-1.5">
          <div className="text-center">
            <Image
              src="/img/logo/logo.png"
              alt="GetMath"
              width={80}
              height={80}
              className="w-topbar-height h-topbar-height object-contain mx-auto"
            />
            <h1 className="text-3xl font-extrabold leading-8 text-lottie-teal">
              Daftar sebagai Orang Tua
            </h1>
            <p className="mt-1 text-xs text-lottie-zinc-500">
              Lengkapi data untuk membuat akun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lottie-zinc-500">
                Nama Lengkap<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lottie-zinc-500">
                Email<span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lottie-zinc-500">
                Nomor HP/WhatsApp<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lottie-zinc-500">
                Alamat<span className="text-[#dc2626]">*</span>
              </label>
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Masukkan alamat lengkap"
                className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
              />
            </div>

            <PasswordField
              label="Password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
              placeholder="Minimal 8 karakter"
            />
            <p className="text-[11px] text-[#6b7280] leading-normal mt-1">
              Password minimal 8 karakter, serta harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.
            </p>

            <PasswordField
              label="Konfirmasi Password"
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(value)}
              placeholder="Ulangi password"
            />

            <button
              type="submit"
              className="mt-4 w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer disabled:opacity-70"
              disabled={register.isPending}
            >
              {register.isPending ? "Memproses..." : "Buat Akun"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-lottie-zinc-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-lottie-teal hover:opacity-80 transition duration-200">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
