"use client";

/**
 * GetSmart API — Auth Hooks
 * TanStack Query hooks untuk semua operasi autentikasi.
 *
 * saveTokens / clearTokens adalah server actions yang bisa dipanggil dari client.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { queryKeys } from "@/libs/api";
import {
  gsPublicPost,
  gsPost,
  gsGet,
  saveTokens,
  clearTokens,
} from "@/libs/api/getsmart";
import { decodeGsJWT, getDashboardPath } from "@/libs/gs-jwt";
import type {
  GsAuthResponse,
  GsLoginInput,
  GsRegisterInput,
  GsForgotPasswordInput,
  GsResetPasswordInput,
  GsResendActivationInput,
  GsUser,
  GsMessageResponse,
} from "@/types/gs-auth";

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export function useGsCurrentUser(options?: { enabled?: boolean }) {
  return useQuery<GsUser, Error>({
    queryKey: queryKeys.gsAuth.me(),
    queryFn: () => gsGet<GsUser>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 menit
    ...options,
  });
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export function useGsLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<GsAuthResponse, Error, GsLoginInput>({
    mutationFn: (input) => gsPublicPost<GsAuthResponse>("/auth/login", input),
    onSuccess: async (data) => {
      // Simpan token ke httpOnly cookie via server action
      await saveTokens(data.tokens);

      // Simpan user ke cache TanStack Query
      queryClient.setQueryData(queryKeys.gsAuth.me(), data.user);

      // Decode JWT untuk menentukan dashboard berdasar role
      const payload = decodeGsJWT(data.tokens.accessToken);
      const path = getDashboardPath(payload?.role ?? data.user.role);

      router.push(path);
      router.refresh();
    },
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export function useGsRegister() {
  return useMutation<GsAuthResponse, Error, GsRegisterInput>({
    mutationFn: (input) =>
      gsPublicPost<GsAuthResponse>("/auth/register", input),
  });
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export function useGsLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await gsPost<void>("/auth/logout");
      } finally {
        // Selalu bersihkan token lokal meskipun request gagal
        await clearTokens();
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
    onError: async () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

export function useGsForgotPassword() {
  return useMutation<GsMessageResponse, Error, GsForgotPasswordInput>({
    mutationFn: (input) =>
      gsPublicPost<GsMessageResponse>("/auth/forgot-password", input),
  });
}

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

export function useGsResetPassword() {
  return useMutation<GsMessageResponse, Error, GsResetPasswordInput>({
    mutationFn: (input) =>
      gsPublicPost<GsMessageResponse>("/auth/reset-password", input),
  });
}

// ─── POST /api/auth/activation/resend ────────────────────────────────────────

export function useGsResendActivation() {
  return useMutation<GsMessageResponse, Error, GsResendActivationInput>({
    mutationFn: (input) =>
      gsPublicPost<GsMessageResponse>("/auth/activation/resend", input),
  });
}
