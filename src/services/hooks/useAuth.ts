/**
 * Auth Hooks
 * Custom React Query hooks untuk Authentication
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../auth.service";
import { queryKeys } from "@/libs/api";
import {
  ICounselorLoginInput,
  ICounselorRegisterInput,
  IParentLoginInput,
  IParentRegisterInput,
  IChangePasswordInput,
  IUpdateCounselorInput,
  IUpdateParentInput,
  IForgotPasswordInput,
  IResetPasswordInput,
} from "@/types/auth";
import { useRouter } from "next/navigation";

// ============ QUERIES ============

/**
 * Hook untuk get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============ MUTATIONS ============

/**
 * Hook untuk login counselor
 */
export function useLoginCounselor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICounselorLoginInput) =>
      authService.loginCounselor(data),
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      // Redirect ke counselor dashboard
      router.push("/counselor/dashboard");
    },
  });
}

/**
 * Hook untuk register counselor
 */
export function useRegisterCounselor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICounselorRegisterInput) =>
      authService.registerCounselor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      router.push("/login");
    },
  });
}

/**
 * Hook untuk login parent
 */
export function useLoginParent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IParentLoginInput) => authService.loginParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      // Redirect ke parent dashboard
      router.push("/parent/dashboard");
    },
  });
}

/**
 * Hook untuk register parent
 */
export function useRegisterParent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IParentRegisterInput) =>
      authService.registerParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      router.push("/login");
    },
  });
}

/**
 * Hook untuk change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: IChangePasswordInput) =>
      authService.changePassword(data),
  });
}

/**
 * Hook untuk update counselor profile
 */
export function useUpdateCounselorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateCounselorInput) =>
      authService.updateCounselorProfile(data),
    onSuccess: () => {
      // Invalidate current user query to refresh profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

/**
 * Hook untuk update parent profile
 */
export function useUpdateParentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateParentInput) =>
      authService.updateParentProfile(data),
    onSuccess: () => {
      // Invalidate current user query to refresh profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

/**
 * Hook untuk logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect ke login
      router.push("/login");
    },
  });
}

/**
 * Hook untuk forgot password (request reset)
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: IForgotPasswordInput) =>
      authService.forgotPassword(data),
  });
}

/**
 * Hook untuk reset password dengan token
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: IResetPasswordInput) => authService.resetPassword(data),
    onSuccess: () => {
      // Redirect ke login setelah berhasil reset password
      router.push("/login");
    },
  });
}
