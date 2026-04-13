"use client";

import ParentProfileContent from "@/components/organisms/profile/ParentProfileContent";
import { useCurrentUser } from "@/services";
import { showToast } from "@/libs/toast";

const EMPTY_FIELD_VALUE = "Belum diisi";

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
  const avatarInitial = resolveInitial(currentUser?.fullname);

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
    />
  );
}
