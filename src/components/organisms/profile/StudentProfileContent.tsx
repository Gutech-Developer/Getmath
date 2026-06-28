"use client";

import UserProfileContent from "@/components/organisms/profile/UserProfileContent";
import { formatBirthDate } from "@/libs/utils";

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
  onEditProfile?: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  isLogoutLoading?: boolean;
  birthDate?: string | null;
  gender?: string | null;
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
  birthDate,
  gender,
}: IStudentProfileContentProps) {
  return (
    <UserProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      phone={phone}
      avatarInitial={avatarInitial}
      roleDescription="Siswa · GetMath Platform"
      fields={[
        { label: "Nama Lengkap", value: fullName },
        { label: "NIS (Nomor Induk Siswa)", value: nis },
        { label: "Tanggal Lahir", value: formatBirthDate(birthDate) },
        { label: "Jenis Kelamin", value: gender ?? "-" },
        { label: "Nomor HP/WhatsApp", value: phone },
        { label: "Email", value: email },
        { label: "Provinsi", value: province },
        { label: "Kota", value: city },
        { label: "Nama Sekolah", value: school, fullWidth: true },
      ]}
      infoHint="Data NIS, email, provinsi, kota, dan nama sekolah hanya bisa diperbarui dengan bantuan admin. Hubungi admin melalui email berikut : prp.pmri@fkip.usk.ac.id"
      onChangePhoto={onChangePhoto}
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onLogout={onLogout}
      isLogoutLoading={isLogoutLoading}
      birthDate={birthDate}
      gender={gender}
      isStudent={true}
    />
  );
}
