"use client";

import { useState, useEffect } from "react";
import CameraIcon from "@/components/atoms/icons/CameraIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import InfoCircleIcon from "@/components/atoms/icons/InfoCircleIcon";
import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import ShieldIcon from "@/components/atoms/icons/ShieldIcon";
import ProfileActionButton from "@/components/molecules/profile/ProfileActionButton";
import ProfileReadOnlyField from "@/components/molecules/profile/ProfileReadOnlyField";
import { Modal } from "@/components/molecules/Modal";
import { useGsUpdateProfile } from "@/services/hooks/useGsAuth";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type { ReactNode } from "react";

interface IUserProfileField {
  label: string;
  value: string;
  fullWidth?: boolean;
}

interface IUserProfileContentProps {
  isLoading: boolean;
  fullName: string;
  email: string;
  phone: string;
  avatarInitial: string;
  roleDescription: string;
  fields: IUserProfileField[];
  infoHint?: string;
  securityDescription?: string;
  pageTitle?: string;
  editLabel?: string;
  passwordLabel?: string;
  logoutLabel?: string;
  isLogoutLoading?: boolean;
  onChangePhoto: () => void;
  onEditProfile?: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

function ProfileCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "getmath-card p-5 sm:p-7",
        className,
      )}
    >
      {children}
    </article>
  );
}

export default function UserProfileContent({
  isLoading,
  fullName,
  email,
  phone,
  avatarInitial,
  roleDescription,
  fields,
  infoHint,
  securityDescription = "Jaga keamanan akunmu dengan memperbarui password secara berkala.",
  pageTitle = "Profil Saya",
  editLabel = "Edit Profil",
  passwordLabel = "Ubah Password",
  logoutLabel = "Keluar dari Akun",
  isLogoutLoading = false,
  onChangePhoto,
  onEditProfile,
  onChangePassword,
  onLogout,
}: IUserProfileContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formFullName, setFormFullName] = useState(fullName);
  const [formPhone, setFormPhone] = useState(phone);

  const updateProfileMutation = useGsUpdateProfile();

  useEffect(() => {
    setFormFullName(fullName);
  }, [fullName]);

  useEffect(() => {
    setFormPhone(phone);
  }, [phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      showToast.error("Nama lengkap tidak boleh kosong");
      return;
    }
    if (!formPhone.trim()) {
      showToast.error("Nomor HP/WhatsApp tidak boleh kosong");
      return;
    }

    updateProfileMutation.mutate(
      {
        fullName: formFullName,
        phoneNumber: formPhone,
      },
      {
        onSuccess: () => {
          showToast.success("Profil berhasil diperbarui");
          setIsEditModalOpen(false);
        },
        onError: (err) => {
          showToast.error(err.message || "Gagal memperbarui profil");
        },
      }
    );
  };

  return (
    <section className="relative isolate mx-auto w-full max-w-[920px] overflow-hidden px-1 pb-8 pt-3">
      <div className="relative space-y-6">
        <header>
          <h1 className=" text-3xl font-normal tracking-[-0.02em] text-lottie-teal">
            {pageTitle}
          </h1>
        </header>

        <ProfileCard>
          {isLoading ? (
            <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 rounded-[24px] bg-lottie-pearl" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-52 rounded-full bg-lottie-pearl" />
                <div className="h-4 w-44 rounded-full bg-lottie-pearl" />
                <div className="h-4 w-56 rounded-full bg-lottie-pearl" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-18 w-18 shrink-0">
                <div className="flex h-18 w-18 items-center justify-center rounded-[16px] bg-[#1F2375] text-2xl font-bold text-white ">
                  {avatarInitial}
                </div>

                <button
                  type="button"
                  onClick={onChangePhoto}
                  aria-label="Ubah foto profil"
                  className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-lottie-teal text-white shadow-[rgba(31,35,117,0.3)_0px_8px_16px_0px] transition hover:bg-lottie-teal/90"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold text-2xl  mantap font-normal leading-tight tracking-[-0.03em] text-lottie-midnight">
                  {fullName}
                </h2>
                <p className="mt-1 truncate text-base text-lottie-zinc-500">
                  {email}
                </p>
                <p className="mt-1 text-sm font-medium text-lottie-fog">
                  {roleDescription}
                </p>
              </div>
            </div>
          )}
        </ProfileCard>

        <ProfileCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className=" text-xl font-normal tracking-[-0.02em] text-lottie-teal">
                Informasi Profil
              </h2>
              <p className="mt-1 text-sm text-lottie-zinc-500">
                Data utama akun yang tersimpan di platform.
              </p>
            </div>

            <ProfileActionButton
              onClick={onEditProfile || (() => setIsEditModalOpen(true))}
              icon={<EditIcon className="h-4 w-4" />}
            >
              {editLabel}
            </ProfileActionButton>
          </div>

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className={cn("space-y-2", index === 6 && "sm:col-span-2")}
                >
                  <div className="h-4 w-32 animate-pulse rounded-full bg-lottie-pearl" />
                  <div className="h-12 animate-pulse rounded-[16px] bg-lottie-pearl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <ProfileReadOnlyField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  fullWidth={field.fullWidth}
                />
              ))}
            </div>
          )}

          {infoHint ? (
            <div className="mt-5 flex items-start gap-2 rounded-[18px] bg-lottie-pearl border border-lottie-mist px-4 py-3 text-sm text-lottie-zinc-500">
              <InfoCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-lottie-fog" />
              <p>{infoHint}</p>
            </div>
          ) : null}
        </ProfileCard>

        <ProfileCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className=" text-xl font-normal tracking-[-0.02em] text-lottie-teal">
                Keamanan Akun
              </h2>
              <p className="mt-1 text-sm text-lottie-zinc-500">
                {securityDescription}
              </p>
            </div>

            <ProfileActionButton
              variant="warm"
              onClick={onChangePassword}
              icon={<ShieldIcon className="h-4 w-4" />}
            >
              {passwordLabel}
            </ProfileActionButton>
          </div>
        </ProfileCard>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLogoutLoading}
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-6 py-4 text-base font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>{isLogoutLoading ? "Memproses..." : logoutLabel}</span>
        </button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#4B5563]">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="h-12 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm text-[#1F2937] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#C7D2FE] placeholder:text-[#9CA3AF]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#4B5563]">
              Nomor HP/WhatsApp
            </label>
            <input
              type="text"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Masukkan nomor HP/WhatsApp"
              className="h-12 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm text-[#1F2937] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#C7D2FE] placeholder:text-[#9CA3AF]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB] mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition"
              disabled={updateProfileMutation.isPending}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1F2375] text-white text-sm font-semibold hover:bg-[#171B5A] transition disabled:opacity-50"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
