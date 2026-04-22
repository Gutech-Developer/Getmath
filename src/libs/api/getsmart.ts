"use server";

/**
 * GetSmart API — Server Action Client
 *
 * File ini adalah satu-satunya entry point untuk semua request ke api.getsmart.id.
 * Semua fetch berjalan di server (Next.js Server Actions / Server Components),
 * sehingga INTERNAL_API_KEY tidak pernah terekspos ke browser.
 *
 * Mekanisme token:
 *  - access_token  : disimpan di cookie (httpOnly), masa hidup pendek
 *  - refresh_token : disimpan di cookie (httpOnly, Secure), masa hidup panjang
 *  - Ketika request mengembalikan 401, secara otomatis akan:
 *      1. Ambil refresh_token dari cookie
 *      2. Panggil POST /api/auth/refresh
 *      3. Simpan access_token baru ke cookie
 *      4. Ulangi request original
 *      5. Jika refresh gagal → hapus semua token (session habis)
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ─── Konfigurasi ──────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.GETSMART_API_URL ||
  process.env.NEXT_PUBLIC_GETSMART_API_URL ||
  "https://api.getsmart.id/api";

/** Nama key cookie yang dipakai untuk menyimpan token */
const COOKIE_KEYS = {
  accessToken: "gs_access_token",
  refreshToken: "gs_refresh_token",
} as const;

/** Durasi cookie (dalam detik) */
const COOKIE_TTL = {
  /** Access token: 15 menit */
  accessToken: 60 * 15,
  /** Refresh token: 7 hari */
  refreshToken: 60 * 60 * 24 * 7,
} as const;

// ─── Response Types ───────────────────────────────────────────────────────────

export type { GsApiResponse } from "./getsmart.types";
import {
  GsApiError as GsApiErrorClass,
  type GsApiResponse,
} from "./getsmart.types";

export interface GsTokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Request Config ───────────────────────────────────────────────────────────

export interface GsRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Kontrol cache Next.js.
   * Default: "no-store" agar data selalu fresh di Server Actions.
   */
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

async function getCookieStore() {
  return await cookies();
}

async function getAccessToken(): Promise<string | undefined> {
  const store = await getCookieStore();
  return store.get(COOKIE_KEYS.accessToken)?.value;
}

async function getRefreshToken(): Promise<string | undefined> {
  const store = await getCookieStore();
  return store.get(COOKIE_KEYS.refreshToken)?.value;
}

/**
 * Simpan token ke cookie setelah login / refresh.
 * Dipanggil dari luar (mis. auth action) untuk set token awal.
 */
export async function saveTokens(tokens: GsTokenPair): Promise<void> {
  const store = await getCookieStore();
  const isProduction = process.env.NODE_ENV === "production";

  store.set(COOKIE_KEYS.accessToken, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_TTL.accessToken,
  });

  store.set(COOKIE_KEYS.refreshToken, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_TTL.refreshToken,
  });
}

/** Hapus semua token (logout / session expired) */
export async function clearTokens(): Promise<void> {
  const store = await getCookieStore();
  store.delete(COOKIE_KEYS.accessToken);
  store.delete(COOKIE_KEYS.refreshToken);
}

// ─── Internal Headers Builder ─────────────────────────────────────────────────

function buildBaseHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Wajib ada di setiap request ke GetSmart API
    "x-internal-api-key": process.env.INTERNAL_API_KEY ?? "",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

/**
 * Deduplication guard — jika ada refresh yang sedang berjalan, caller berikutnya
 * cukup menunggu promise yang sama, bukan membuat request baru.
 *
 * Next.js server adalah proses Node.js yang berjalan lama; module-level variable
 * ini AMAN digunakan sebagai mutex antar concurrent Server Action invocations
 * dalam satu server instance.
 */
let _refreshInFlight: Promise<string | null> | null = null;

/**
 * Internal: satu kali refresh request ke backend.
 * Selalu dipanggil melalui doRefreshToken() agar terdeduplikasi.
 */
async function _doRefreshOnce(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    console.error(
      "[GS Auth] doRefreshToken: tidak ada refresh token di cookie",
    );
    return null;
  }

  // ── 1. Kirim request refresh ─────────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: buildBaseHeaders(),
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[GS Auth] doRefreshToken: network error:", err);
    return null;
  }

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
    console.error(
      `[GS Auth] doRefreshToken: endpoint mengembalikan ${res.status}. Body:`,
      body,
    );
    return null;
  }

  // ── 2. Parse response ────────────────────────────────────────────────────
  let newTokens: GsTokenPair | undefined;
  try {
    const json: GsApiResponse<{ tokens: GsTokenPair }> = await res.json();
    newTokens = json.data?.tokens;
  } catch (err) {
    console.error("[GS Auth] doRefreshToken: gagal parse response JSON:", err);
    return null;
  }

  if (!newTokens?.accessToken || !newTokens?.refreshToken) {
    console.error(
      "[GS Auth] doRefreshToken: response tidak mengandung tokens yang valid:",
      newTokens,
    );
    return null;
  }

  // ── 3. Simpan token ke cookie ────────────────────────────────────────────
  // Dipisah agar kegagalan save tidak memblokir return (retry tetap bisa jalan)
  try {
    await saveTokens(newTokens);
  } catch (err) {
    console.error(
      "[GS Auth] doRefreshToken: saveTokens gagal (token baru tidak disimpan ke cookie):",
      err,
    );
    // Tetap return accessToken baru agar retry request ini bisa sukses.
    // Request berikutnya akan trigger refresh lagi karena cookie tidak terupdate.
  }

  return newTokens.accessToken;
}

/**
 * Panggil endpoint refresh token dan simpan token baru ke cookie.
 * Mengembalikan access token baru, atau null jika refresh gagal.
 *
 * Concurrent 401 yang terjadi bersamaan akan berbagi satu promise refresh
 * (deduplication), sehingga backend hanya menerima satu request refresh dan
 * tidak ada race condition saat rotate refresh token.
 */
async function doRefreshToken(): Promise<string | null> {
  // Jika sudah ada refresh yang sedang berjalan, tunggu hasilnya
  if (_refreshInFlight) {
    console.log(
      "[GS Auth] doRefreshToken: menunggu refresh yang sudah berjalan...",
    );
    return _refreshInFlight;
  }

  // Mulai refresh baru
  _refreshInFlight = _doRefreshOnce().finally(() => {
    // Reset flag setelah selesai (berhasil maupun gagal)
    _refreshInFlight = null;
  });

  return _refreshInFlight;
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

/**
 * Core fetch internal — dipakai oleh semua helper di bawah.
 *
 * @param path    Path relatif, mis. "/auth/me" atau "/courses"
 * @param config  Request config
 * @param withAuth Apakah perlu menyertakan Bearer token
 * @param isRetry  Internal flag — jangan di-set manual
 */
async function coreFetch<T>(
  path: string,
  config: GsRequestConfig = {},
  withAuth: boolean,
  isRetry = false,
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    cache = "no-store",
    next,
  } = config;

  const accessToken = withAuth ? await getAccessToken() : undefined;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...buildBaseHeaders(accessToken),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  // ── Auto-refresh on 401 ───────────────────────────────────────────────────
  if (res.status === 401 && withAuth && !isRetry) {
    const newAccessToken = await doRefreshToken();

    if (!newAccessToken) {
      // Refresh gagal → session habis
      await clearTokens();
      redirect("/login");
    }

    // Ulangi request dengan access token baru — inject langsung agar tidak
    // bergantung pada cookie timing di edge / cache layer
    const retryRes = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...buildBaseHeaders(newAccessToken),
        ...extraHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
    });

    if (!retryRes.ok) {
      let message = `Request failed with status ${retryRes.status}`;
      let errors: Record<string, string[]> | undefined;
      try {
        const errJson = await retryRes.json();
        if (errJson?.message) message = errJson.message;
        if (errJson?.errors) errors = errJson.errors;
      } catch {
        /* ignore */
      }
      throw new GsApiErrorClass(message, retryRes.status, errors);
    }

    const retryJson: GsApiResponse<T> = await retryRes.json();
    return retryJson.data;
  }

  // ── Error Handling ────────────────────────────────────────────────────────
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let errors: Record<string, string[]> | undefined;

    try {
      const errJson = await res.json();
      if (errJson?.message) message = errJson.message;
      if (errJson?.errors) errors = errJson.errors;
    } catch {
      // Abaikan error parsing
    }

    throw new GsApiErrorClass(message, res.status, errors);
  }

  const json: GsApiResponse<T> = await res.json();
  return json.data;
}

// ─── Public Request (tanpa Auth) ─────────────────────────────────────────────

/**
 * Request publik — tidak memerlukan token sama sekali.
 * Cocok untuk: login, register, forgot-password, dll.
 */
export async function gsPublicRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<T> {
  return coreFetch<T>(path, config, false);
}

// ─── Protected Request (dengan Auth + Auto-Refresh) ───────────────────────────

/**
 * Request terproteksi — menyertakan Bearer token secara otomatis.
 * Jika access token expired (401) akan otomatis di-refresh dan di-retry.
 */
export async function gsRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<T> {
  return coreFetch<T>(path, config, true);
}

// ─── Convenience Methods ──────────────────────────────────────────────────────
//
//  Semua method di bawah pakai gsRequest (protected) kecuali yang berlabel Public.
//  Gunakan langsung dari Server Actions atau Server Components.

/** GET terproteksi */
export async function gsGet<T>(
  path: string,
  next?: NextFetchRequestConfig,
): Promise<T> {
  return gsRequest<T>(path, { method: "GET", next });
}

/** POST terproteksi */
export async function gsPost<T>(path: string, data?: unknown): Promise<T> {
  return gsRequest<T>(path, { method: "POST", body: data });
}

/** PUT terproteksi */
export async function gsPut<T>(path: string, data?: unknown): Promise<T> {
  return gsRequest<T>(path, { method: "PUT", body: data });
}

/** PATCH terproteksi */
export async function gsPatch<T>(path: string, data?: unknown): Promise<T> {
  return gsRequest<T>(path, { method: "PATCH", body: data });
}

/** DELETE terproteksi */
export async function gsDel<T>(path: string): Promise<T> {
  return gsRequest<T>(path, { method: "DELETE" });
}

/** POST publik (tanpa auth) — untuk login, register, dll. */
export async function gsPublicPost<T>(
  path: string,
  data?: unknown,
): Promise<T> {
  return gsPublicRequest<T>(path, { method: "POST", body: data });
}

/** GET publik (tanpa auth) */
export async function gsPublicGet<T>(path: string): Promise<T> {
  return gsPublicRequest<T>(path, { method: "GET" });
}
