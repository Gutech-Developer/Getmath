"use client";

import UserProfileContent from "@/components/organisms/profile/UserProfileContent";

interface ITeacherProfileContentProps {
  isLoading: boolean;
  fullName: string;
  email: string;
  phone: string;
  nip: string;
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

export default function TeacherProfileContent({
  isLoading,
  fullName,
  email,
  phone,
  nip,
  province,
  city,
  school,
  avatarInitial,
  onChangePhoto,
  onEditProfile,
  onChangePassword,
  onLogout,
  isLogoutLoading = false,
}: ITeacherProfileContentProps) {
  return (
    <UserProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      avatarInitial={avatarInitial}
      roleDescription="Guru · GetMath Platform"
      fields={[
        { label: "Nama Lengkap", value: fullName },
        { label: "NIP (Nomor Induk Pegawai)", value: nip },
        { label: "Nomor HP/WhatsApp", value: phone },
        { label: "Email", value: email },
        { label: "Provinsi", value: province },
        { label: "Kota", value: city },
        { label: "Nama Sekolah", value: school, fullWidth: true },
      ]}
      infoHint="Data NIP, email, provinsi, kota, dan nama sekolah hanya bisa diperbarui dengan bantuan admin."
      onChangePhoto={onChangePhoto}
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      isLogoutLoading={isLogoutLoading}
    />
  );
}
