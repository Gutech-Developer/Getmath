/**
 * GetSmart API — Shared types & error class
 * File ini TIDAK mengandung "use server" agar bisa diimpor
 * baik di server maupun client code.
 */

export interface GsApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Discriminated union untuk return value dari Server Action fetch.
 *
 * Server Actions di Next.js 15+ mengganti pesan error (dari throw) dengan
 * pesan generik "An error occurred in the Server Components render..." di sisi
 * client. Solusinya: Server Action TIDAK throw, tapi RETURN error info lewat
 * tipe ini. Client wrapper (gsAction.ts) yang kemudian throw Error sendiri
 * dari sisi client, sehingga pesan asli backend tetap terbaca.
 */
export interface GsApiFieldError {
  field: string;
  message: string;
}

export type GsApiErrors =
  | GsApiFieldError[]
  | Record<string, string[]>;

export function getGsFieldErrors(
  errors: GsApiErrors | undefined,
): GsApiFieldError[] {
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })),
  );
}

export type GsFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      status: number;
      errors?: GsApiErrors;
    };

export interface GsTokenPairInternal {
  accessToken: string;
  refreshToken: string;
}

/** Error yang dilempar saat request API GetSmart gagal */
export class GsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: GsApiErrors,
  ) {
    super(message);
    this.name = "GsApiError";
  }

  get isAuthError() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isValidationError() {
    return this.status === 422;
  }
  get isBadRequest() {
    return this.status === 400;
  }
}
