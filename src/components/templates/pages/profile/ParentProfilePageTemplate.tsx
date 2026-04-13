"use client";

import CameraIcon from "@/components/atoms/icons/CameraIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { useCurrentUser } from "@/services";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";

const EMPTY_FIELD_VALUE = "Belum diisi";

interface IReadOnlyFieldProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

function normalizeValue(value?: string): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return EMPTY_FIELD_VALUE;
  }

  return trimmedValue;
}

function resolveInitial(fullName?: string): string {
  const normalizedName = fullName?.trim();
  if (!normalizedName) {
    return "?";
  }

  return normalizedName.charAt(0).toUpperCase();
}

function extractLocation(address?: string): { city: string; province: string } {
  const normalizedAddress = address?.trim();
  if (!normalizedAddress) {
    return {
      city: EMPTY_FIELD_VALUE,
      province: EMPTY_FIELD_VALUE,
    };
  }

  const segments = normalizedAddress
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return {
      city: EMPTY_FIELD_VALUE,
      province: EMPTY_FIELD_VALUE,
    };
  }

  if (segments.length === 1) {
    return {
      city: segments[0],
      province: EMPTY_FIELD_VALUE,
    };
  }

  return {
    city: segments[segments.length - 2],
    province: segments[segments.length - 1],
  };
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

export default function ParentProfilePageTemplate() {
  const { data: currentUser, isLoading } = useCurrentUser();

  const parentExtraFields = (currentUser ?? {}) as Partial<{
    nis: string;
    province: string;
    city: string;
    school: string;
  }>;

  const locationFromAddress = extractLocation(currentUser?.address);

  const fullName = normalizeValue(currentUser?.fullname);
  const email = normalizeValue(currentUser?.email);
  const phone = normalizeValue(currentUser?.phone);
  const nis = normalizeValue(parentExtraFields.nis);
  const province = normalizeValue(
    parentExtraFields.province ?? locationFromAddress.province,
  );
  const city = normalizeValue(
    parentExtraFields.city ?? locationFromAddress.city,
  );
  const school = normalizeValue(parentExtraFields.school);

  return (
    <section className="mx-auto w-full max-w-[760px] space-y-5">
      <h1 className="text-3xl font-bold text-[#1F2937]">Profil Saya</h1>

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
                {resolveInitial(currentUser?.fullname)}
              </div>

              <button
                type="button"
                className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-white"
                aria-label="Ubah foto profil"
                onClick={() =>
                  showToast.info("Fitur ubah foto profil akan segera tersedia")
                }
              >
                <CameraIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-[2rem] font-extrabold leading-tight text-[#1F2937]">
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
            onClick={() =>
              showToast.info("Fitur edit profil akan segera tersedia")
            }
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
