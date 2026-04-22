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
