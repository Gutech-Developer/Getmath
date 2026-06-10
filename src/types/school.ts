/**
 * School Search - Simplified Implementation
 * Search schools by name and send results to backend
 * No location filtering needed
 */

import { GsPaginationMeta } from "./gs-course";

export interface ISchoolSearchResult {
  npsn: string;
  sekolah: string;
  bentuk: "SD" | "SMP" | "SMA" | "SMK";
  status: "N" | "S"; // N = Negeri (Public), S = Swasta (Private)
  alamat_jalan: string;
  propinsi: string;
  kabupaten_kota: string;
  kecamatan: string;
  lintang: string;
  bujur: string;
}

export interface ISchoolSearchResponse {
  creator?: string;
  status?: string;
  dataSekolah: ISchoolSearchResult[];
  total_data?: number;
  page?: number;
  per_page?: number;
}

export interface UseSchoolSearchProps {
  searchTerm: string;
  debounceMs?: number;
}

export interface UseSchoolSearchReturn {
  schools: ISchool[];
  isLoading: boolean;
  error: string | null;
}

export interface ISchool {
  id: string;
  name: string;
  teacherCount: string;
  studentCount: string;
  courseCount: string;
}

export interface GsPaginatedSchools {
  schools: ISchool[];
  pagination: GsPaginationMeta;
}
