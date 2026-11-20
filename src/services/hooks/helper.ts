import { GsPaginationParams } from "@/types";

export function buildQuery(params?: GsPaginationParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  if (params.schoolId) q.set("schoolId", params.schoolId);
  if (params.teacherId) q.set("teacherId", params.teacherId);
  if (params.status) q.set("status", params.status);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}
