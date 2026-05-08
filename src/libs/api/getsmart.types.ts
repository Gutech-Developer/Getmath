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
export type GsFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      status: number;
      errors?: Record<string, string[]>;
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
    public readonly errors?: Record<string, string[]>,
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
}
