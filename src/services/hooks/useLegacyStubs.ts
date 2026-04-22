"use client";

/**
 * Legacy alias hooks — thin wrappers for old naming conventions.
 * Remove entries here as the consuming code is migrated.
 */

// Old auth hook names still referenced by some components
export { useGsCurrentUser as useCurrentUser } from "./useGsAuth";
export { useGsLogout as useLogout } from "./useGsAuth";
