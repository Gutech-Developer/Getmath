/**
 * gsAction — Client-side wrapper untuk Server Action fetch functions
 *
 * MENGAPA FILE INI ADA:
 * Next.js 15+ mengganti pesan error dari Server Actions (yang di-throw) dengan
 * pesan generik "An error occurred in the Server Components render..." di sisi
 * client. Ini adalah fitur keamanan Next.js yang tidak bisa dinonaktifkan.
 *
 * Solusinya:
 * 1. getsmart.ts ("use server") mengembalikan GsFetchResult<T> alih-alih throw
 * 2. File ini (BUKAN "use server") menerima return value tersebut
 * 3. Jika ada error, file ini yang throw — karena kode ini berjalan di sisi
 *    client, Next.js TIDAK mengganti pesannya → pesan asli backend terbaca
 *
 * Semua hooks di src/services/hooks/ mengimpor dari sini, BUKAN dari getsmart.ts
 * (kecuali saveTokens dan clearTokens yang tetap dari getsmart.ts).
 */

import {
  gsGet as _gsGet,
  gsPost as _gsPost,
  gsPut as _gsPut,
  gsPatch as _gsPatch,
  gsDel as _gsDel,
  gsPublicGet as _gsPublicGet,
  gsPublicPost as _gsPublicPost,
  gsRequest as _gsRequest,
  gsPublicRequest as _gsPublicRequest,
  type GsRequestConfig,
} from "./getsmart";
import { GsApiError } from "./getsmart.types";
import type { GsFetchResult } from "./getsmart.types";

/** Unwrap GsFetchResult — throw Error client-side jika gagal */
function unwrap<T>(result: GsFetchResult<T>): T {
  if (!result.ok) {
    throw new GsApiError(result.message, result.status, result.errors);
  }
  return result.data;
}

// ── Protected ─────────────────────────────────────────────────────────────────

export async function gsGet<T>(
  path: string,
  next?: NextFetchRequestConfig,
): Promise<T> {
  return unwrap(await _gsGet<T>(path, next));
}

export async function gsPost<T>(path: string, data?: unknown): Promise<T> {
  return unwrap(await _gsPost<T>(path, data));
}

export async function gsPut<T>(path: string, data?: unknown): Promise<T> {
  return unwrap(await _gsPut<T>(path, data));
}

export async function gsPatch<T>(path: string, data?: unknown): Promise<T> {
  return unwrap(await _gsPatch<T>(path, data));
}

export async function gsDel<T>(path: string): Promise<T> {
  return unwrap(await _gsDel<T>(path));
}

export async function gsRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<T> {
  return unwrap(await _gsRequest<T>(path, config));
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function gsPublicGet<T>(path: string): Promise<T> {
  return unwrap(await _gsPublicGet<T>(path));
}

export async function gsPublicPost<T>(
  path: string,
  data?: unknown,
): Promise<T> {
  return unwrap(await _gsPublicPost<T>(path, data));
}

export async function gsPublicRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<T> {
  return unwrap(await _gsPublicRequest<T>(path, config));
}
