// Shared types (safe to import from anywhere — no "use server" / "use client")
export {
  ApiRequestError,
  type ApiResponse,
  type ApiError,
  type FetchRequestConfig,
  type ServerFetchConfig,
} from "./types";

// API Client — client-side: TanStack Query base
export { apiRequest, apiPublicRequest, API_BASE_URL } from "./client";

// Server-side fetch utilities (Server Actions / Server Components)
export {
  serverRequest,
  serverPublicRequest,
  serverGet,
  serverPost,
  serverPut,
  serverPatch,
  serverDel,
  serverPublicGet,
  serverPublicPost,
} from "./server";

// Query Keys
export { queryKeys } from "./queryKeys";

// Hooks
export {
  useApiQuery,
  useApiPublicQuery,
  useApiMutation,
  useApiPublicMutation,
  usePost,
  usePut,
  usePatch,
  useDelete,
  usePublicPost,
} from "./hooks";
