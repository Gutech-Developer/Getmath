// ============ SHARED API TYPES ============
// File ini tidak menggunakan "use server" atau "use client"
// sehingga bisa diimport dari mana saja.

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface FetchRequestConfig {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ServerFetchConfig {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export class ApiRequestError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
  isAuthError: boolean;

  constructor(
    message: string,
    statusCode?: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isAuthError = statusCode === 401;
  }
}
