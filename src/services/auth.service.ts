/**
 * Authentication Service
 *
 * Service untuk handle semua operasi authentication:
 * - Login (Counselor & Parent)
 * - Register (Counselor & Parent)
 * - Logout
 * - Get current user
 * - Change password
 *
 * NOTE: Auth service tidak menggunakan "use server" karena login/register
 * perlu menyimpan token ke cookies browser (tokenStorage.setAccessToken).
 * Fetch yang dilakukan auth service menggunakan server.ts untuk keamanan API key,
 * namun tokenStorage tetap dioperasikan di sisi client via hooks.
 */

import {
  serverPublicPost,
  serverPost,
  serverGet,
  serverPut,
} from "@/libs/api/server";
import { tokenStorage } from "@/libs/token";
import {
  ICounselorLoginInput,
  ICounselorLoginResponse,
  ICounselorRegisterInput,
  IParentLoginInput,
  IParentLoginResponse,
  IParentRegisterInput,
  IChangePasswordInput,
  ICurrentUser,
  ICounselor,
  IParent,
  IUpdateCounselorInput,
  IUpdateParentInput,
  IForgotPasswordInput,
  IForgotPasswordResponse,
  IResetPasswordInput,
} from "@/types/auth";

// ============ AUTH SERVICE ============

/**
 * Login sebagai Counselor
 */
async function loginCounselor(
  input: ICounselorLoginInput,
): Promise<ICounselorLoginResponse> {
  const response = await serverPublicPost<ICounselorLoginResponse>(
    "/auth/login/counselor",
    input,
  );

  // Simpan token ke cookies
  tokenStorage.setAccessToken(response.token);

  return response;
}

/**
 * Register Counselor baru
 */
async function registerCounselor(
  input: ICounselorRegisterInput,
): Promise<ICounselorLoginResponse> {
  const response = await serverPublicPost<ICounselorLoginResponse>(
    "/auth/register/counselor",
    input,
  );

  // Simpan token ke cookies setelah register
  tokenStorage.setAccessToken(response.token);

  return response;
}

/**
 * Login sebagai Parent
 */
async function loginParent(
  input: IParentLoginInput,
): Promise<IParentLoginResponse> {
  const response = await serverPublicPost<IParentLoginResponse>(
    "/auth/login/parent",
    input,
  );

  // Simpan token ke cookies
  tokenStorage.setAccessToken(response.token);

  return response;
}

/**
 * Register Parent baru
 */
async function registerParent(
  input: IParentRegisterInput,
): Promise<IParentLoginResponse> {
  const response = await serverPublicPost<IParentLoginResponse>(
    "/auth/register/parent",
    input,
  );

  // Simpan token ke cookies setelah register
  tokenStorage.setAccessToken(response.token);

  return response;
}

/**
 * Get current user info
 */
async function getCurrentUser(): Promise<ICurrentUser> {
  return await serverGet<ICurrentUser>("/auth/current-user");
}

/**
 * Change password
 */
async function changePassword(input: IChangePasswordInput): Promise<void> {
  return await serverPost<void>("/auth/change-password", input);
}

/**
 * Update counselor profile
 */
async function updateCounselorProfile(
  input: IUpdateCounselorInput,
): Promise<ICounselor> {
  return await serverPut<ICounselor>("/counselor", input);
}

/**
 * Update parent profile
 */
async function updateParentProfile(
  input: IUpdateParentInput,
): Promise<IParent> {
  return await serverPut<IParent>("/parent", input);
}

/**
 * Logout user
 */
async function logout(): Promise<void> {
  try {
    await serverPost<void>("/auth/logout");
  } finally {
    // Clear token dari cookies
    tokenStorage.clearToken();
  }
}

/**
 * Request forgot password
 */
async function forgotPassword(
  input: IForgotPasswordInput,
): Promise<IForgotPasswordResponse> {
  return await serverPublicPost<IForgotPasswordResponse>(
    "/auth/forgot-password",
    input,
  );
}

/**
 * Reset password with token
 */
async function resetPassword(input: IResetPasswordInput): Promise<void> {
  return await serverPublicPost<void>("/auth/reset-password", input);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
  return tokenStorage.isAuthenticated();
}

// Export auth service
export const authService = {
  loginCounselor,
  registerCounselor,
  loginParent,
  registerParent,
  getCurrentUser,
  changePassword,
  updateCounselorProfile,
  updateParentProfile,
  logout,
  forgotPassword,
  resetPassword,
  isAuthenticated,
};
