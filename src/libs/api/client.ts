import Cookies from "js-cookie";

// ============ CONFIGURATION ============
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "access_token";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const ACCESS_TOKEN_OPTIONS: Cookies.CookieAttributes = {
  ...COOKIE_OPTIONS,
  expires: 7,
};

// ============ TOKEN STORAGE ============
export const tokenStorage = {
  getAccessToken: (): string | undefined => {
    if (typeof window !== "undefined") {
      return Cookies.get(ACCESS_TOKEN_KEY);
    }
    return undefined;
  },

  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      Cookies.set(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_OPTIONS);
    }
  },

  removeAccessToken: (): void => {
    if (typeof window !== "undefined") {
      Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    }
  },

  clearToken: (): void => {
    tokenStorage.removeAccessToken();
  },

  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// ============ TYPES ============
// Re-export from shared types file
export type { ApiResponse, ApiError, FetchRequestConfig } from "./types";
export { ApiRequestError } from "./types";

// Internal imports for use within this file
import type { ApiResponse, ApiError, FetchRequestConfig } from "./types";
import { ApiRequestError } from "./types";

// ============ HELPERS ============
const redirectToLogin = () => {
  tokenStorage.clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

function buildHeaders(withAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // API Key — always included on every request
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  if (withAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

// ============ FETCH WRAPPER ============
async function fetchRequest<T>(
  url: string,
  config: FetchRequestConfig = {},
  withAuth: boolean,
): Promise<T> {
  const { method = "GET", body, headers: extraHeaders = {} } = config;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      ...buildHeaders(withAuth),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && withAuth) {
    redirectToLogin();
  }

  if (!res.ok) {
    let errorData: ApiError | undefined;
    try {
      errorData = await res.json();
    } catch {
      // ignore parse error
    }
    throw new ApiRequestError(
      errorData?.message || `Request failed with status ${res.status}`,
      res.status,
      errorData?.errors,
    );
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// ============ PUBLIC (no auth) ============
export async function apiPublicRequest<T>(
  url: string,
  config?: FetchRequestConfig,
): Promise<T> {
  return fetchRequest<T>(url, config, false);
}

// ============ PROTECTED (with auth) ============
export async function apiRequest<T>(
  url: string,
  config?: FetchRequestConfig,
): Promise<T> {
  return fetchRequest<T>(url, config, true);
}
