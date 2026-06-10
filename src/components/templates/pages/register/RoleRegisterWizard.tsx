"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useGsRegister } from "@/services";
import { useSchoolSearch } from "@/services"; // Sesuaikan path custom hook search Anda
import SearchableInput from "@/components/atoms/SearchableInput";
// (No longer using external school search utilities)
import type { GsRegisterInput } from "@/types/gs-auth";

type RegisterRole = "student" | "teacher";
type Step = 1 | 2 | 3;

interface IRoleRegisterWizardProps {
  role: RegisterRole;
}

interface IRoleRegisterForm {
  fullname: string;
  email: string;
  phone: string;
  identityNumber: string;
  schoolName: string;
  schoolProvince: string;
  schoolCity: string;
  schoolId: string;
  password: string;
  confirmPassword: string;
}

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

function RegisterStepIndicator({
  step,
  accent,
}: {
  step: Step;
  accent: string;
}) {
  const renderNode = (nodeStep: Step) => {
    const isCompleted = step > nodeStep;
    const isActive = step === nodeStep;

    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
        style={{
          backgroundColor:
            isCompleted || isActive ? "var(--color-lottie-teal)" : "rgba(31,35,117,0.04)",
          color: isCompleted || isActive ? "#fff" : "#9f9fa9",
        }}
      >
        {isCompleted ? (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          nodeStep
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 flex items-center">
      {renderNode(1)}
      <div
        className="mx-2 h-[2px] flex-1"
        style={{ backgroundColor: step > 1 ? "var(--color-lottie-teal)" : "rgba(31,35,117,0.09)" }}
      />
      {renderNode(2)}
      <div
        className="mx-2 h-[2px] flex-1"
        style={{ backgroundColor: step > 2 ? "var(--color-lottie-teal)" : "rgba(31,35,117,0.09)" }}
      />
      {renderNode(3)}
    </div>
  );
}

// ─── Fungsi Inisialisasi Form Bawaan (Tambahkan Ini) ───────────────────
function createEmptyForm(): IRoleRegisterForm {
  return {
    fullname: "",
    email: "",
    phone: "",
    identityNumber: "",
    schoolName: "",
    schoolProvince: "",
    schoolCity: "",
    schoolId: "",
    password: "",
    confirmPassword: "",
  };
}

export default function RoleRegisterWizard({ role }: IRoleRegisterWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [form, setForm] = useState<IRoleRegisterForm>(createEmptyForm);

  const register = useGsRegister();

  // Custom hook search sekolah terpanggil di top-level dengan aman
  const {
    schools,
    isLoading: loadingSchools,
    error: searchError,
  } = useSchoolSearch({
    searchTerm: schoolSearch,
    debounceMs: 600, // Kecepatan debounce optimal untuk ketikan user
  });

  const isSubmitting = register.isPending;

  const config = useMemo(() => {
    const isTeacher = role === "teacher";
    return {
      title: isTeacher ? "Daftar sebagai Guru" : "Daftar sebagai Siswa",
      identityLabel: isTeacher
        ? "NIP (Nomor Induk Pegawai)"
        : "NIS (Nomor Induk Siswa)",
      identityPlaceholder: isTeacher
        ? "Contoh: 197001011998021001"
        : "Contoh: 1234567890",
      accent: isTeacher ? "#7c3aed" : "#1F2375",
      dashboardPath: isTeacher ? "/teacher/dashboard" : "/student/dashboard",
      emailExample: isTeacher ? "guru@gmail.com" : "siswa@gmail.com",
    };
  }, [role]);

  const updateField = (key: keyof IRoleRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStepOne = () => {
    if (
      !form.fullname.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.identityNumber.trim()
    ) {
      toast.error("Lengkapi data langkah 1 terlebih dahulu.");
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    if (!form.schoolName || !form.password || !form.confirmPassword) {
      toast.error("Lengkapi semua data sekolah dan keamanan.");
      return false;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return false;
    }
    if (!/[A-Z]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 huruf besar.");
      return false;
    }
    if (!/[a-z]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 huruf kecil.");
      return false;
    }
    if (!/[0-9]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 angka.");
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      toast.error("Password harus mengandung minimal 1 karakter spesial.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return false;
    }
    return true;
  };

  const handleGoNext = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStepTwo()) return;

    try {
      const payload: GsRegisterInput = {
        fullName: form.fullname,
        email: form.email,
        phoneNumber: form.phone,
        password: form.password,
        role: role === "student" ? "STUDENT" : "TEACHER",
        ...(role === "student"
          ? { NIS: form.identityNumber }
          : { NIP: form.identityNumber }),
        schoolId: form.schoolId,
        schoolName: form.schoolName,
      };

      await register.mutateAsync(payload);
      toast.success("Registrasi berhasil. Silakan verifikasi email Anda.");
      setStep(3);
    } catch (error: any) {
      toast.error(error?.message || "Registrasi gagal.");
    }
  };

  const topBackText = step === 1 ? "Pilih Peran Lain" : "Kembali ke Langkah 1";

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-[448px]">
        {step !== 3 && (
          <button
            type="button"
            onClick={() => {
              if (step === 1) router.push("/login");
              if (step === 2) setStep(1);
            }}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-lottie-teal hover:opacity-85 transition duration-200"
          >
            <span aria-hidden="true">&larr;</span>
            {topBackText}
          </button>
        )}

        <div className="mt-4 getmath-card p-5 sm:p-6 lg:p-7 pt-1 lg:pt-1.5">
          {step === 3 ? (
            <div>
              <p className="text-center text-xs text-[#6b7280] pt-2">
                Langkah 3 dari 3
              </p>
              <RegisterStepIndicator step={step} accent={config.accent} />

              <div className="mt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-lottie-mist bg-lottie-pearl text-lottie-zinc-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-1 10H4a1 1 0 01-1-1V7a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1z"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl font-extrabold leading-8 text-lottie-teal">
                  Cek Email Kamu!
                </h1>
                <p className="mt-4 text-[13px] leading-5 text-lottie-zinc-500">
                  Magic link telah dikirimkan ke{" "}
                  <span className="font-semibold text-lottie-teal">
                    {form.email || config.emailExample}
                  </span>
                  . Klik link di email untuk memverifikasi akun dan mulai
                  menggunakan GetMath!
                </p>

                <div className="mt-5 rounded-xl border border-lottie-teal/20 bg-lottie-teal/5 px-4 py-3 text-[12px] text-lottie-teal font-medium">
                  Tidak menerima email? Cek folder Spam atau kirim ulang setelah
                  60 detik.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="w-full flex items-center justify-center mb-4">
                  <Image
                    src="/img/logo/logo.png"
                    alt="GetMath"
                    width={80}
                    height={80}
                    className="w-topbar-height h-topbar-height object-contain"
                  />
                </div>
                <h1 className="text-3xl font-extrabold leading-8 text-lottie-teal">
                  {config.title}
                </h1>
                <p className="mt-1 text-xs text-lottie-zinc-500">
                  Langkah {step} dari 3
                </p>
              </div>

              <RegisterStepIndicator step={step} accent={config.accent} />

              {step === 1 ? (
                <div className="mt-6 space-y-4">

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-lottie-zinc-500">
                        Nama Lengkap<span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        value={form.fullname}
                        onChange={(e) =>
                          updateField("fullname", e.target.value)
                        }
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-lottie-zinc-500">
                        {config.identityLabel}
                        <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        value={form.identityNumber}
                        onChange={(e) =>
                          updateField("identityNumber", e.target.value)
                        }
                        placeholder={config.identityPlaceholder}
                        className="w-full rounded-xl bg-white/60 border border-lottie-teal/10 px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/20 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-lottie-zinc-500">
                        Nomor HP/WhatsApp
                        <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="Contoh: 081234567890"
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
                  </div>

                  <button
                    type="button"
                    onClick={handleGoNext}
                    className="mt-4 w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold transition cursor-pointer"
                  >
                    Lanjut
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <SearchableInput
                    label="Nama Sekolah"
                    placeholder="Cari nama sekolah..."
                    value={schoolSearch}
                    onChange={(searchValue, selected) => {
                      if (selected) {
                        // Pasang data sekolah dari metadata yang dikembalikan API
                        setSchoolSearch(selected.label);
                        updateField("schoolName", selected.label);
                        updateField("schoolId", selected.value);
                        updateField(
                          "schoolProvince",
                          selected.metadata?.province || "",
                        );
                        updateField(
                          "schoolCity",
                          selected.metadata?.city || "",
                        );
                      } else {
                        setSchoolSearch(searchValue);
                      }
                    }}
                    // PERBAIKAN LOGIKA: Map options agar label berisi nama sekolah (teks), value berisi id/npsn
                    options={schools.map((school) => ({
                      value: school.id,
                      label: school.name,
                      metadata: {
                        schoolName: school.name,
                        schoolId: school.id,
                        province: "",
                        city: "",
                      },
                    }))}
                    isLoading={loadingSchools}
                    emptyMessage={
                      searchError
                        ? "Gagal memuat data"
                        : schoolSearch.length >= 2
                          ? "Tidak ada sekolah yang ditemukan"
                          : "Ketik minimal 2 karakter untuk mencari"
                    }
                    required
                  />

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
                    value={form.confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    placeholder="Ulangi password"
                  />

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center rounded-xl bg-lottie-teal mantaps text-white  px-4 py-3 text-sm font-semibold disabled:opacity-70 transition cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Memproses..." : "Buat Akun"}
                  </button>
                </form>
              )}

              <p className="mt-5 text-center text-[13px] text-lottie-zinc-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-lottie-teal hover:opacity-80 transition duration-200">
                  Masuk di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
