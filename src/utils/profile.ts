const EMPTY_PROFILE_FIELD = "Belum diisi";

export { EMPTY_PROFILE_FIELD };

export function normalizeProfileValue(value?: string | null): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return EMPTY_PROFILE_FIELD;
  }

  return trimmedValue;
}

export function resolveProfileInitial(fullName?: string | null): string {
  const normalizedName = fullName?.trim();
  if (!normalizedName) {
    return "?";
  }

  return normalizedName.charAt(0).toUpperCase();
}

export function extractProfileLocation(address?: string | null): {
  city: string;
  province: string;
} {
  const normalizedAddress = address?.trim();
  if (!normalizedAddress) {
    return {
      city: EMPTY_PROFILE_FIELD,
      province: EMPTY_PROFILE_FIELD,
    };
  }

  const segments = normalizedAddress
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return {
      city: EMPTY_PROFILE_FIELD,
      province: EMPTY_PROFILE_FIELD,
    };
  }

  if (segments.length === 1) {
    return {
      city: segments[0],
      province: EMPTY_PROFILE_FIELD,
    };
  }

  return {
    city: segments[segments.length - 2],
    province: segments[segments.length - 1],
  };
}
