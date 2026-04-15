"use client";

import StudentProfileContent from "@/components/organisms/profile/StudentProfileContent";
import { showErrorToast, showToast } from "@/libs/toast";
import { useCurrentUser, useLogout } from "@/services";
import {
  extractProfileLocation,
  normalizeProfileValue,
  resolveProfileInitial,
} from "@/utils/profile";

export default function StudentProfilePageTemplate() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const logout = useLogout();

  const studentFields = (currentUser ?? {}) as Partial<{
    nis: string;
    province: string;
    city: string;
    school: string;
  }>;

  const locationFromAddress = extractProfileLocation(currentUser?.address);

  const fullName = normalizeProfileValue(currentUser?.fullname);
  const email = normalizeProfileValue(currentUser?.email);
  const phone = normalizeProfileValue(currentUser?.phone);
  const nis = normalizeProfileValue(studentFields.nis);
  const province = normalizeProfileValue(
    studentFields.province ?? locationFromAddress.province,
  );
  const city = normalizeProfileValue(studentFields.city ?? locationFromAddress.city);
  const school = normalizeProfileValue(studentFields.school);
  const avatarInitial = resolveProfileInitial(currentUser?.fullname);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <StudentProfileContent
      isLoading={isLoading}
      fullName={fullName}
      email={email}
      phone={phone}
      nis={nis}
      province={province}
      city={city}
      school={school}
      avatarInitial={avatarInitial}
      onChangePhoto={() =>
        showToast.info("Fitur ubah foto profil siswa akan segera tersedia")
      }
      onEditProfile={() =>
        showToast.info("Fitur edit profil siswa akan segera tersedia")
      }
      onChangePassword={() =>
        showToast.info("Fitur ubah password siswa akan segera tersedia")
      }
      onLogout={handleLogout}
      isLogoutLoading={logout.isPending}
    />
  );
}
