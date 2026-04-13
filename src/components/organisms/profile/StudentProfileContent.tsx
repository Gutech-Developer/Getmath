"use client";

import UserProfileContent from "@/components/organisms/profile/UserProfileContent";

interface IStudentProfileContentProps {
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

export default function StudentProfileContent({
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
}: IStudentProfileContentProps) {
  return (
    <UserProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      avatarInitial={avatarInitial}
      roleDescription="Siswa · GetMath Platform"
      fields={[
        { label: "Nama Lengkap", value: fullName },
        { label: "NIS (Nomor Induk Siswa)", value: nis },
        { label: "Nomor HP/WhatsApp", value: phone },
        { label: "Email", value: email },
        { label: "Provinsi", value: province },
        { label: "Kota", value: city },
        { label: "Nama Sekolah", value: school, fullWidth: true },
      ]}
      infoHint="Data NIS, email, provinsi, kota, dan nama sekolah hanya bisa diperbarui dengan bantuan admin."
      onChangePhoto={onChangePhoto}
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      isLogoutLoading={isLogoutLoading}
    />
  );
}
