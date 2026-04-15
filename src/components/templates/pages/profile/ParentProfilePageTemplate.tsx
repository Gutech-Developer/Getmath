"use client";

import ParentProfileContent from "@/components/organisms/profile/ParentProfileContent";
import { useCurrentUser } from "@/services";
import { showErrorToast, showToast } from "@/libs/toast";
import { useLogout } from "@/services";
import {
  extractProfileLocation,
  normalizeProfileValue,
  resolveProfileInitial,
} from "@/utils/profile";

export default function ParentProfilePageTemplate() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const logout = useLogout();

  const parentExtraFields = (currentUser ?? {}) as Partial<{
    nis: string;
    province: string;
    city: string;
    school: string;
  }>;

  const locationFromAddress = extractProfileLocation(currentUser?.address);

  const fullName = normalizeProfileValue(currentUser?.fullname);
  const email = normalizeProfileValue(currentUser?.email);
  const phone = normalizeProfileValue(currentUser?.phone);
  const nis = normalizeProfileValue(parentExtraFields.nis);
  const province = normalizeProfileValue(
    parentExtraFields.province ?? locationFromAddress.province,
  );
  const city = normalizeProfileValue(
    parentExtraFields.city ?? locationFromAddress.city,
  );
  const school = normalizeProfileValue(parentExtraFields.school);
  const avatarInitial = resolveProfileInitial(currentUser?.fullname);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <ParentProfileContent
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
        showToast.info("Fitur ubah foto profil akan segera tersedia")
      }
      onEditProfile={() =>
        showToast.info("Fitur edit profil akan segera tersedia")
      }
      onChangePassword={() =>
        showToast.info("Fitur ubah password akan segera tersedia")
      }
      onLogout={handleLogout}
      isLogoutLoading={logout.isPending}
    />
  );
}
