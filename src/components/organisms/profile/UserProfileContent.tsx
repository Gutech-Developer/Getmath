"use client";

import CameraIcon from "@/components/atoms/icons/CameraIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import InfoCircleIcon from "@/components/atoms/icons/InfoCircleIcon";
import LogoutIcon from "@/components/atoms/icons/LogoutIcon";
import ShieldIcon from "@/components/atoms/icons/ShieldIcon";
import ProfileActionButton from "@/components/molecules/profile/ProfileActionButton";
import ProfileReadOnlyField from "@/components/molecules/profile/ProfileReadOnlyField";
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
  onEditProfile: () => void;
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
        "rounded-[28px] border border-[rgba(148,163,184,0.14)]  p-5  sm:p-7",
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
  return (
    <section className="relative isolate mx-auto w-full max-w-[920px] overflow-hidden px-1 pb-8 pt-3">
      <div className="relative space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1E293B]">
            {pageTitle}
          </h1>
        </header>

        <ProfileCard>
          {isLoading ? (
            <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 rounded-[24px] bg-[#E2E8F0]" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-52 rounded-full bg-[#E2E8F0]" />
                <div className="h-4 w-44 rounded-full bg-[#E2E8F0]" />
                <div className="h-4 w-56 rounded-full bg-[#E2E8F0]" />
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
                  className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#2563EB] text-white shadow-[0px_10px_24px_rgba(37,99,235,0.32)] transition hover:bg-[#1D4ED8]"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[#1E293B]">
                  {fullName}
                </h2>
                <p className="mt-1 truncate text-base text-[#64748B]">
                  {email}
                </p>
                <p className="mt-1 text-sm font-medium text-[#94A3B8]">
                  {roleDescription}
                </p>
              </div>
            </div>
          )}
        </ProfileCard>

        <ProfileCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[#1E293B]">
                Informasi Profil
              </h2>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Data utama akun yang tersimpan di platform.
              </p>
            </div>

            <ProfileActionButton
              onClick={onEditProfile}
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
                  <div className="h-4 w-32 animate-pulse rounded-full bg-[#E2E8F0]" />
                  <div className="h-12 animate-pulse rounded-[16px] bg-[#E2E8F0]" />
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
            <div className="mt-5 flex items-start gap-2 rounded-[18px] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              <InfoCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
              <p>{infoHint}</p>
            </div>
          ) : null}
        </ProfileCard>

        <ProfileCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[#1E293B]">
                Keamanan Akun
              </h2>
              <p className="mt-1 text-sm text-[#94A3B8]">
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
          className="flex min-h-16 w-full items-center justify-center gap-3 rounded-[24px] border border-[rgba(239,68,68,0.18)] bg-[rgba(254,242,242,0.95)] px-6 py-4 text-base font-semibold text-[#DC2626]  transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>{isLogoutLoading ? "Memproses..." : logoutLabel}</span>
        </button>
      </div>
    </section>
  );
}
