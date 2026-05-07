"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGsRegister, useSchoolSearch } from "@/services";
import SearchableInput from "@/components/atoms/SearchableInput";
import {
  formatSchoolDisplay,
  getSchoolLocationData,
} from "@/utils/schoolSearch";
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
  schoolId: string; // NPSN
  password: string;
  confirmPassword: string;
}

const provinceOptions = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Selatan",
  "Papua Barat Daya",
];
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
      <label className="block text-xs font-semibold text-[#4b5563]">
        {label}
        <span className="text-[#dc2626]">*</span>
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 pr-10 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-3 text-[#6b7280] text-xs"
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
            isCompleted || isActive ? accent : "rgba(26,35,126,0.04)",
          color: isCompleted || isActive ? "#fff" : "#9ca3af",
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
        style={{
          backgroundColor: step > 1 ? accent : "rgba(26,35,126,0.09)",
        }}
      />
      {renderNode(2)}
      <div
        className="mx-2 h-[2px] flex-1"
        style={{
          backgroundColor: step > 2 ? accent : "rgba(26,35,126,0.09)",
        }}
      />
      {renderNode(3)}
    </div>
  );
}

export default function RoleRegisterWizard({ role }: IRoleRegisterWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [form, setForm] = useState<IRoleRegisterForm>({
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
  });

  const register = useGsRegister();

  const { schools, isLoading: loadingSchools } = useSchoolSearch({
    searchTerm: schoolSearch,
    debounceMs: 3000,
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
      accent: isTeacher ? "#7c3aed" : "#1a237e",
      dashboardPath: isTeacher ? "/teacher/dashboard" : "/student/dashboard",
      emailExample: isTeacher ? "guru@gmail.com" : "siswa@gmail.com",
    };
  }, [role]);

  const updateField = (key: keyof IRoleRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStepOne = () => {
    if (!form.fullname || !form.email || !form.phone || !form.identityNumber) {
      toast.error("Lengkapi data langkah 1 terlebih dahulu.");
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    if (
      !form.schoolName ||
      !form.schoolProvince ||
      !form.schoolCity ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Lengkapi semua data langkah 2.");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
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
        province: form.schoolProvince,
        city: form.schoolCity,
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
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6b7280]"
          >
            <span aria-hidden="true">&lt;</span>
            {topBackText}
          </button>
        )}

        <div className="mt-4 rounded-[24px] border border-[#1a237e]/10 bg-white/95 p-5 sm:p-6 lg:p-7 shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)]">
          {step === 3 ? (
            <div>
              <p className="text-center text-xs text-[#6b7280]">
                Langkah 3 dari 3
              </p>
              <RegisterStepIndicator step={step} accent={config.accent} />

              <div className="mt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-[#d1d5db] bg-[#f3f4f6]">
                  <svg
                    className="w-6 h-6 text-[#9ca3af]"
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

                <h1 className="text-[22px] font-extrabold leading-8 text-[#1a237e]">
                  Cek Email Kamu!
                </h1>

                <p className="mt-4 text-[13px] leading-5 text-[#6b7280]">
                  Magic link telah dikirimkan ke{" "}
                  <span className="font-semibold text-[#00acc1]">
                    {form.email || config.emailExample}
                  </span>
                  . Klik link di email untuk memverifikasi akun dan mulai
                  menggunakan GetMath!
                </p>

                <div className="mt-5 rounded-[14px] border border-[#00acc1]/25 bg-[#00acc1]/10 px-4 py-3 text-[12px] text-[#374151]">
                  Tidak menerima email? Cek folder Spam atau kirim ulang setelah
                  60 detik.
                </div>

                <button
                  type="button"
                  onClick={() => router.push(config.dashboardPath)}
                  className="mt-5 w-full rounded-[14px] px-4 py-3 text-[16px] font-bold text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(173deg, rgb(26, 35, 126) 0%, rgb(0, 172, 193) 100%)",
                  }}
                >
                  Lanjut ke Dashboard (Demo)
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl"
                  style={{
                    backgroundColor:
                      role === "teacher"
                        ? "rgba(124, 58, 237, 0.08)"
                        : "rgba(26, 35, 126, 0.08)",
                    borderColor:
                      role === "teacher"
                        ? "rgba(124, 58, 237, 0.14)"
                        : "rgba(26, 35, 126, 0.14)",
                  }}
                >
                  <Image
                    src="/img/logo/logo.png"
                    alt="GetMath"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-[30px] font-extrabold leading-8 text-[#1a237e]">
                  {config.title}
                </h1>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Langkah {step} dari 3
                </p>
              </div>

              <RegisterStepIndicator step={step} accent={config.accent} />

              {step === 1 ? (
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full rounded-[12px] border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                    onClick={() =>
                      toast.info("Login dengan Google belum tersedia.")
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-5 h-5"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    Masuk dengan Google
                  </button>

                  <div className="my-2 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#1a237e]/10" />
                    <span className="text-[11px] text-[#9ca3af]">
                      atau isi formulir
                    </span>
                    <div className="h-px flex-1 bg-[#1a237e]/10" />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#4b5563]">
                        Nama Lengkap<span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        value={form.fullname}
                        onChange={(e) =>
                          updateField("fullname", e.target.value)
                        }
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#4b5563]">
                        {config.identityLabel}
                        <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        value={form.identityNumber}
                        onChange={(e) =>
                          updateField("identityNumber", e.target.value)
                        }
                        placeholder={config.identityPlaceholder}
                        className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#4b5563]">
                        Nomor HP/WhatsApp
                        <span className="text-[#dc2626]">*</span>
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
                  </div>

                  <button
                    type="button"
                    onClick={handleGoNext}
                    className="mt-4 w-full rounded-[14px] px-4 py-3 text-sm font-bold text-white"
                    style={{
                      backgroundImage: `linear-gradient(173deg, ${config.accent} 0%, rgb(0, 172, 193) 100%)`,
                    }}
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
                        // Set input to selected school name to prevent redundant API calls
                        setSchoolSearch(selected.metadata?.schoolName || selected.value);
                        updateField(
                          "schoolName",
                          selected.metadata?.schoolName || selected.value,
                        );
                        updateField(
                          "schoolId",
                          selected.metadata?.schoolId || "",
                        );
                        updateField(
                          "schoolProvince",
                          selected.metadata?.province || "",
                        );
                        updateField(
                          "schoolCity",
                          selected.metadata?.city || "",
                        );
                      } else {
                        // Only update search value if no selection was made
                        setSchoolSearch(searchValue);
                      }
                    }}
                    options={schools.map((school) => ({
                      value: school.sekolah,
                      label: formatSchoolDisplay(school),
                      metadata: {
                        schoolName: school.sekolah,
                        schoolId: school.npsn,
                        province: school.propinsi,
                        city: school.kabupaten_kota,
                      },
                    }))}
                    isLoading={loadingSchools}
                    required
                    emptyMessage={
                      schoolSearch.length >= 2
                        ? "Tidak ada sekolah yang ditemukan"
                        : "Ketik minimal 2 karakter untuk mencari"
                    }
                  />

                  <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={(value) => updateField("password", value)}
                    placeholder="Minimal 8 karakter"
                  />

                  <PasswordField
                    label="Konfirmasi Password"
                    value={form.confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    placeholder="Ulangi password"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-[14px] px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
                    style={{
                      backgroundImage: `linear-gradient(173deg, ${config.accent} 0%, rgb(0, 172, 193) 100%)`,
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Memproses..." : "Buat Akun"}
                  </button>
                </form>
              )}

              <p className="mt-5 text-center text-[13px] text-[#6b7280]">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-[#00acc1]">
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
