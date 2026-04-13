"use client";

import CameraIcon from "@/components/atoms/icons/CameraIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { cn } from "@/libs/utils";

const EMPTY_FIELD_VALUE = "Belum diisi";

interface IReadOnlyFieldProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

interface IParentProfileContentProps {
  isLoading: boolean;
  fullName: string;
  email: string;
  phone: string;
  nis: string;
  province: string;
  city: string;
  school: string;
  avatarInitial: string;
  onChangePhoto: () => void;
  onEditProfile: () => void;
}

function ReadOnlyField({
  label,
  value,
  fullWidth = false,
}: IReadOnlyFieldProps) {
  const isEmptyValue = value === EMPTY_FIELD_VALUE;

  return (
    <div className={cn("space-y-1.5", fullWidth && "sm:col-span-2")}>
      <label className="block text-sm font-semibold text-[#4B5563]">
        {label}
      </label>
      <input
        readOnly
        value={value}
        className={cn(
          "h-11 w-full rounded-[14px] border border-[rgba(0,0,0,0.10)] bg-[rgba(0,0,0,0.04)] px-4 text-sm text-[#374151] outline-none",
          isEmptyValue && "text-[#9CA3AF]",
        )}
      />
    </div>
  );
}

export default function ParentProfileContent({
  isLoading,
  fullName,
  email,
  phone,
  nis,
  province,
  city,
  school,
  avatarInitial,
  onChangePhoto,
  onEditProfile,
}: IParentProfileContentProps) {
  return (
    <section className="mx-auto w-full max-w-[760px] space-y-5">
      <h1 className="text-2xl font-bold text-[#1F2937]">Profil Saya</h1>

      <article className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.07)]">
        {isLoading ? (
          <div className="flex animate-pulse items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-[#E5E7EB]" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 rounded bg-[#E5E7EB]" />
              <div className="h-4 w-52 rounded bg-[#E5E7EB]" />
              <div className="h-4 w-60 rounded bg-[#E5E7EB]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1A237E_0%,#7C3AED_100%)] text-4xl font-bold text-white shadow-[0px_4px_16px_rgba(26,35,126,0.25)]">
                {avatarInitial}
              </div>

              <button
                type="button"
                className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-white"
                aria-label="Ubah foto profil"
                onClick={onChangePhoto}
              >
                <CameraIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-[#1F2937]">
                {fullName}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{email}</p>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Orang Tua - GetSmart Platform
              </p>
            </div>
          </div>
        )}
      </article>

      <article className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.07)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-[#1F2937]">
            Informasi Profil
          </h2>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(37,99,235,0.20)] bg-[rgba(37,99,235,0.08)] px-4 text-sm font-semibold text-[#2563EB] transition hover:bg-[rgba(37,99,235,0.14)]"
          >
            <EditIcon className="h-4 w-4" />
            Edit Profil
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <ReadOnlyField label="Nama Lengkap" value={fullName} />
          <ReadOnlyField label="NIS (Nomor Induk Siswa)" value={nis} />
          <ReadOnlyField label="Nomor HP/WhatsApp" value={phone} />
          <ReadOnlyField label="Email" value={email} />
          <ReadOnlyField label="Provinsi" value={province} />
          <ReadOnlyField label="Kota" value={city} />
          <ReadOnlyField label="Nama Sekolah" value={school} fullWidth />
        </div>
      </article>
    </section>
  );
}
