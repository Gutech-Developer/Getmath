"use client";

import UserProfileContent from "@/components/organisms/profile/UserProfileContent";

interface IAdminProfileContentProps {
  isLoading: boolean;
  fullName: string;
  email: string;
  phone: string;
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

export default function AdminProfileContent({
  isLoading,
  fullName,
  email,
  phone,
  province,
  city,
  school,
  avatarInitial,
  onChangePhoto,
  onEditProfile,
  onChangePassword,
  onLogout,
  isLogoutLoading = false,
}: IAdminProfileContentProps) {
  return (
    <UserProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      avatarInitial={avatarInitial}
      roleDescription="Administrator · GetMath Platform"
      fields={[
        { label: "Nama Lengkap", value: fullName },
        { label: "Nomor HP/WhatsApp", value: phone },
        { label: "Email", value: email },
        { label: "Provinsi", value: province },
        { label: "Kota", value: city },
        { label: "Nama Sekolah", value: school, fullWidth: true },
      ]}
      infoHint="Data email, provinsi, kota, dan nama sekolah hanya bisa diperbarui dengan bantuan superadmin."
      onChangePhoto={onChangePhoto}
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      isLogoutLoading={isLogoutLoading}
    />
  );
}
