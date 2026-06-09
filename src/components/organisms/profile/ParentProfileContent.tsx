"use client";

import UserProfileContent from "@/components/organisms/profile/UserProfileContent";

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
  onChangePassword: () => void;
  onLogout: () => void;
  isLogoutLoading?: boolean;
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
  onChangePassword,
  onLogout,
  isLogoutLoading = false,
}: IParentProfileContentProps) {
  return (
    <UserProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      avatarInitial={avatarInitial}
      roleDescription="Orang Tua · GetMath Platform"
      fields={[
        { label: "Nama Lengkap", value: fullName },
        { label: "Nomor HP/WhatsApp", value: phone },
        { label: "Email", value: email },
      ]}
      infoHint="Data email hanya bisa diperbarui dengan bantuan admin."
      onChangePhoto={onChangePhoto}
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      isLogoutLoading={isLogoutLoading}
    />
  );
}
