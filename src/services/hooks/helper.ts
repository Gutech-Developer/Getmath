import { GsPaginationParams } from "@/types";

export function buildQuery(params?: GsPaginationParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}
