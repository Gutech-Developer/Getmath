"use server";

/**
 * GetSmart API — Server Action Client
 *
 * File ini adalah satu-satunya entry point untuk semua request ke api.getsmart.id.
 * Semua fetch berjalan di server (Next.js Server Actions / Server Components),
 * sehingga INTERNAL_API_KEY tidak pernah terekspos ke browser.
 *
 * Mekanisme token:
 * - access_token  : disimpan di cookie (httpOnly), masa hidup pendek
 * - refresh_token : disimpan di cookie (httpOnly, Secure), masa hidup panjang
 * - Ketika request mengembalikan 401, secara otomatis akan:
 * 1. Ambil refresh_token dari cookie
 * 2. Panggil POST /api/auth/refresh
 * 3. Simpan access_token baru ke cookie
 * 4. Ulangi request original
 * 5. Jika refresh gagal → hapus semua token (session habis)
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { gsLogger } from "@/utils/logger";

// ─── 1. IMPORT MODUL HTTP & HTTPS BAWAN NODE.JS ─────────────────────────────
import HTTP from "http";
import HTTPS from "https";

// ─── Konfigurasi ──────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.GETSMART_API_URL ||
  process.env.NEXT_PUBLIC_GETSMART_API_URL ||
  "";

// ─── 2. INISIALISASI HTTP/HTTPS KEEPALIVE AGENT (CONNECTION POOLING) ──────────
const isHttps = BASE_URL.startsWith("https");
const agentOptions = {
  keepAlive: true, // Menjaga koneksi tetap terbuka setelah request selesai
  maxSockets: 100, // Maksimal 100 koneksi simultan ke Go Fiber
  maxFreeSockets: 10, // Menyisakan 10 koneksi stand-by dalam pool
  timeout: 60000, // Timeout koneksi 60 detik (sinkron dengan IdleTimeout Go Fiber)
};

const globalHttpAgent = isHttps
  ? new HTTPS.Agent(agentOptions)
  : new HTTP.Agent(agentOptions);

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

export type { GsApiResponse, GsFetchResult } from "./getsmart.types";
import {
  GsApiError as GsApiErrorClass,
  type GsApiResponse,
  type GsFetchResult,
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

  try {
    // Set cookies (httpOnly)
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

    if (IS_GS_API_DEBUG) {
      gsLogger.info(
        "[GS Auth] saveTokens: accessToken present, refreshToken present",
      );
      try {
        // read back from cookie store to verify
        const maybeAccess = store.get(COOKIE_KEYS.accessToken)?.value;
        const maybeRefresh = store.get(COOKIE_KEYS.refreshToken)?.value;
        gsLogger.info("[GS Auth] saveTokens: verify store access:", {
          accessTokenExists: !!maybeAccess,
          refreshTokenExists: !!maybeRefresh,
        });
      } catch (err) {
        gsLogger.info("[GS Auth] saveTokens: verify readback failed", err);
      }
    }
  } catch (err) {
    console.error("[GS Auth] saveTokens: gagal menyimpan cookie:", err);
    throw err;
  }
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

const IS_GS_API_DEBUG = process.env.NODE_ENV === "development";

function logGsApiRequest(params: {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  payload?: unknown;
}): void {
  gsLogger.request(
    params.method,
    params.endpoint,
    params.headers,
    params.payload,
  );
}

function logGsApiResponse(params: {
  method: string;
  endpoint: string;
  status: number;
  response: unknown;
}): void {
  gsLogger.response(
    params.method,
    params.endpoint,
    params.status,
    params.response,
  );
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

/**
 * Deduplication guard — jika ada refresh yang sedang berjalan, caller berikutnya
 * cukup menunggu promise yang sama, bukan membuat request baru.
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

  if (IS_GS_API_DEBUG) {
    try {
      gsLogger.info(
        "[GS Auth] doRefreshToken: found refresh token in cookie (length)",
        refreshToken.length,
      );
    } catch (err) {
      gsLogger.info(
        "[GS Auth] doRefreshToken: failed to read refresh token length",
        err,
      );
    }
  }

  // ── 1. Kirim request refresh ─────────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: buildBaseHeaders(),
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      // @ts-ignore - menyisipkan agent pooling agar proses refresh juga cepat
      agent: globalHttpAgent,
    });
  } catch (err) {
    console.error("[GS Auth] doRefreshToken: network error:", err);
    return null;
  }

  if (IS_GS_API_DEBUG) {
    try {
      const sc = res.headers.get("set-cookie");
      gsLogger.info("[GS Auth] doRefreshToken: refresh response status:", {
        status: res.status,
        hasSetCookie: !!sc,
      });
    } catch (err) {
      gsLogger.info(
        "[GS Auth] doRefreshToken: failed to read response headers",
        err,
      );
    }
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

  if (IS_GS_API_DEBUG) {
    gsLogger.info("[GS Auth] doRefreshToken: parsed tokens presence", {
      access: !!newTokens?.accessToken,
      refresh: !!newTokens?.refreshToken,
    });
  }

  if (!newTokens?.accessToken || !newTokens?.refreshToken) {
    console.error(
      "[GS Auth] doRefreshToken: response tidak mengandung tokens yang valid:",
      newTokens,
    );
    return null;
  }

  // ── 3. Simpan token ke cookie ────────────────────────────────────────────
  try {
    if (IS_GS_API_DEBUG) {
      gsLogger.info(
        "[GS Auth] doRefreshToken: menerima tokens dari endpoint refresh. saving...",
      );
    }
    await saveTokens(newTokens);
    if (IS_GS_API_DEBUG) {
      gsLogger.info("[GS Auth] doRefreshToken: saveTokens completed");
    }
  } catch (err) {
    console.error(
      "[GS Auth] doRefreshToken: saveTokens gagal (token baru tidak disimpan ke cookie):",
      err,
    );
  }

  return newTokens.accessToken;
}

/**
 * Panggil endpoint refresh token dan simpan token baru ke cookie.
 * Mengembalikan access token baru, atau null jika refresh gagal.
 */
async function doRefreshToken(): Promise<string | null> {
  if (_refreshInFlight) {
    gsLogger.info(
      "[GS Auth] doRefreshToken: menunggu refresh yang sudah berjalan...",
    );
    return _refreshInFlight;
  }

  _refreshInFlight = _doRefreshOnce().finally(() => {
    _refreshInFlight = null;
  });

  return _refreshInFlight;
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

/**
 * Core fetch internal — dipakai oleh semua helper di bawah.
 */
async function coreFetch<T>(
  path: string,
  config: GsRequestConfig = {},
  withAuth: boolean,
  isRetry = false,
): Promise<GsFetchResult<T>> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    cache = "no-store",
    next,
  } = config;

  const accessToken = withAuth ? await getAccessToken() : undefined;
  const endpoint = `${BASE_URL}${path}`;
  const headers = {
    ...buildBaseHeaders(accessToken),
    ...extraHeaders,
  };

  logGsApiRequest({
    method,
    endpoint,
    headers,
    payload: body,
  });

  // ── 3. SISIPKAN AGENT KE FETCH UTAMA ───────────────────────────────────────
  const res = await fetch(endpoint, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
    // @ts-ignore - native fetch Node.js menerima custom agent
    agent: globalHttpAgent,
  });

  // ── Auto-refresh on 401 ───────────────────────────────────────────────────
  if (res.status === 401 && withAuth && !isRetry) {
    const newAccessToken = await doRefreshToken();

    if (!newAccessToken) {
      // Refresh gagal → session habis → redirect
      await clearTokens();
      redirect("/login");
    }

    // ── 4. SISIPKAN AGENT KE FETCH RETRY (ULANG REQUEST) ─────────────────────
    const retryRes = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...buildBaseHeaders(newAccessToken),
        ...extraHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
      // @ts-ignore
      agent: globalHttpAgent,
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
      return { ok: false, message, status: retryRes.status, errors };
    }

    const retryJson: GsApiResponse<T> = await retryRes.json();
    logGsApiResponse({
      method,
      endpoint,
      status: retryRes.status,
      response: retryJson.data,
    });
    return { ok: true, data: retryJson.data };
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
      /* ignore */
    }

    logGsApiResponse({
      method,
      endpoint,
      status: res.status,
      response: { message, errors },
    });
    return { ok: false, message, status: res.status, errors };
  }

  const json: GsApiResponse<T> = await res.json();
  logGsApiResponse({
    method,
    endpoint,
    status: res.status,
    response: json.data,
  });
  return { ok: true, data: json.data };
}

// ─── Public Request (tanpa Auth) ─────────────────────────────────────────────

/** Request publik — tidak memerlukan token sama sekali */
export async function gsPublicRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<GsFetchResult<T>> {
  return coreFetch<T>(path, config, false);
}

// ─── Protected Request (dengan Auth + Auto-Refresh) ───────────────────────────

export async function gsRequest<T>(
  path: string,
  config?: GsRequestConfig,
): Promise<GsFetchResult<T>> {
  return coreFetch<T>(path, config, true);
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

/** GET terproteksi */
export async function gsGet<T>(
  path: string,
  next?: NextFetchRequestConfig,
): Promise<GsFetchResult<T>> {
  return gsRequest<T>(path, { method: "GET", next });
}

/** POST terproteksi */
export async function gsPost<T>(
  path: string,
  data?: unknown,
): Promise<GsFetchResult<T>> {
  return gsRequest<T>(path, { method: "POST", body: data });
}

/** PUT terproteksi */
export async function gsPut<T>(
  path: string,
  data?: unknown,
): Promise<GsFetchResult<T>> {
  return gsRequest<T>(path, { method: "PUT", body: data });
}

/** PATCH terproteksi */
export async function gsPatch<T>(
  path: string,
  data?: unknown,
): Promise<GsFetchResult<T>> {
  return gsRequest<T>(path, { method: "PATCH", body: data });
}

/** DELETE terproteksi */
export async function gsDel<T>(path: string): Promise<GsFetchResult<T>> {
  return gsRequest<T>(path, { method: "DELETE" });
}

/** POST publik (tanpa auth) — untuk login, register, dll. */
export async function gsPublicPost<T>(
  path: string,
  data?: unknown,
): Promise<GsFetchResult<T>> {
  return gsPublicRequest<T>(path, { method: "POST", body: data });
}

/** GET publik (tanpa auth) */
export async function gsPublicGet<T>(path: string): Promise<GsFetchResult<T>> {
  return gsPublicRequest<T>(path, { method: "GET" });
}

/** Upload file via FormData */
export async function gsUploadFile(
  formData: FormData,
): Promise<GsFetchResult<{ url: string }>> {
  const accessToken = await getAccessToken();
  const endpoint = `${BASE_URL}/upload`;
  const headers: Record<string, string> = {
    "x-internal-api-key": process.env.INTERNAL_API_KEY ?? "",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
      // @ts-ignore
      agent: globalHttpAgent,
    });

    if (!res.ok) {
      let message = `Upload failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.message) message = errJson.message;
      } catch {}
      return { ok: false, message, status: res.status };
    }

    const json = await res.json();
    return { ok: true, data: json.data };
  } catch (err: any) {
    return { ok: false, message: err.message || "Network error", status: 500 };
  }
}

/** Delete uploaded file */
export async function gsDeleteFile(url: string): Promise<GsFetchResult<void>> {
  return gsRequest<void>("/upload", {
    method: "DELETE",
    body: { url },
  });
}

/** Download file as Base64 (untuk transfer dari Server Action ke client) */
export async function gsDownloadFile(
  path: string,
  isRetry = false,
): Promise<
  GsFetchResult<{ base64: string; contentType: string; filename: string }>
> {
  const accessToken = await getAccessToken();
  const endpoint = `${BASE_URL}${path}`;
  const headers = {
    ...buildBaseHeaders(accessToken),
  };

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers,
      cache: "no-store",
      // @ts-ignore
      agent: globalHttpAgent,
    });

    if (res.status === 401 && !isRetry) {
      const newAccessToken = await doRefreshToken();
      if (!newAccessToken) {
        await clearTokens();
        redirect("/login");
      }
      return gsDownloadFile(path, true);
    }

    if (!res.ok) {
      let message = `Download failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.message) message = errJson.message;
      } catch {}
      return { ok: false, message, status: res.status };
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType =
      res.headers.get("content-type") || "application/octet-stream";

    const contentDisposition = res.headers.get("content-disposition") || "";
    let filename = "download.zip";
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;\n]*)/,
    );
    if (filenameStarMatch && filenameStarMatch[1]) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    }

    return {
      ok: true,
      data: {
        base64,
        contentType,
        filename,
      },
    };
  } catch (err: any) {
    return { ok: false, message: err.message || "Network error", status: 500 };
  }
}
