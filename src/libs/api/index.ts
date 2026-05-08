// GetSmart API — Server Action client (api.getsmart.id)
// Semua fetch berjalan di server; INTERNAL_API_KEY tidak pernah ke browser.
export {
  // Core
  gsRequest,
  gsPublicRequest,
  // Convenience helpers
  gsGet,
  gsPost,
  gsPut,
  gsPatch,
  gsDel,
  gsPublicGet,
  gsPublicPost,
} from "./gsAction";

export {
  // Token management (tetap server action — butuh cookies)
  saveTokens,
  clearTokens,
  // Types
  type GsApiResponse,
  type GsTokenPair,
  type GsRequestConfig,
  type GsFetchResult,
} from "./getsmart";

// Error class — exported from non-"use server" file
export { GsApiError } from "./getsmart.types";

// Query Keys
export { queryKeys } from "./queryKeys";

// GetSmart API — TanStack Query Hooks
export {
  useGsQuery,
  useGsPublicQuery,
  useGsPost,
  useGsDynamicPost,
  useGsPut,
  useGsPatch,
  useGsDelete,
  useGsPublicPost,
  useGsInvalidate,
} from "./hooks.getsmart";
