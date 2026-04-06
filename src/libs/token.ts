"use client";

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

/**
 * Client-side token storage using js-cookie.
 * Hanya bisa dipakai di Client Components / client-side code.
 * Untuk server-side, gunakan cookies() dari next/headers.
 */
export const tokenStorage = {
  getAccessToken: (): string | undefined => {
    if (typeof window !== "undefined") {
      return Cookies.get(ACCESS_TOKEN_KEY);
    }
    return undefined;
  },

  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      Cookies.set(ACCESS_TOKEN_KEY, token, { ...COOKIE_OPTIONS, expires: 7 });
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
