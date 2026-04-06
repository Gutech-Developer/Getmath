"use server";

import { cookies } from "next/headers";
import type { ApiResponse, ApiError, ServerFetchConfig } from "./types";

// ============ CONFIGURATION ============
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "access_token";

// ============ INTERNAL HELPERS ============
async function buildServerHeaders(
  withAuth: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // API Key — preferably server-only env var (not exposed to browser)
  const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  if (withAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function serverFetch<T>(
  url: string,
  config: ServerFetchConfig,
  withAuth: boolean,
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    cache,
    next,
  } = config;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      ...(await buildServerHeaders(withAuth)),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  if (!res.ok) {
    let errorData: ApiError | undefined;
    try {
      errorData = await res.json();
    } catch {
      // ignore parse error
    }
    const { ApiRequestError } = await import("./types");
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
export async function serverPublicRequest<T>(
  url: string,
  config: ServerFetchConfig = {},
): Promise<T> {
  return serverFetch<T>(url, config, false);
}

// ============ PROTECTED (with auth) ============
export async function serverRequest<T>(
  url: string,
  config: ServerFetchConfig = {},
): Promise<T> {
  return serverFetch<T>(url, config, true);
}

// ============ CONVENIENCE METHODS ============
export async function serverGet<T>(url: string): Promise<T> {
  return serverRequest<T>(url, { method: "GET" });
}

export async function serverPost<T>(url: string, data?: unknown): Promise<T> {
  return serverRequest<T>(url, { method: "POST", body: data });
}

export async function serverPut<T>(url: string, data?: unknown): Promise<T> {
  return serverRequest<T>(url, { method: "PUT", body: data });
}

export async function serverPatch<T>(url: string, data?: unknown): Promise<T> {
  return serverRequest<T>(url, { method: "PATCH", body: data });
}

export async function serverDel<T>(url: string): Promise<T> {
  return serverRequest<T>(url, { method: "DELETE" });
}

export async function serverPublicGet<T>(url: string): Promise<T> {
  return serverPublicRequest<T>(url, { method: "GET" });
}

export async function serverPublicPost<T>(
  url: string,
  data?: unknown,
): Promise<T> {
  return serverPublicRequest<T>(url, { method: "POST", body: data });
}
