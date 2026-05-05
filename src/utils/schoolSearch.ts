/**
 * School Search - Simplified Implementation
 * Search schools by name and send results to backend
 * No location filtering needed
 */

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

/**
 * Search schools by name using API
 * @param searchTerm - School name to search (will be converted to lowercase)
 * @returns Array of matching schools
 */
export async function searchSchoolsByName(
  searchTerm: string
): Promise<ISchoolSearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) return [];

  try {
    const BASE_URL = "https://api-sekolah-indonesia.vercel.app";
    // Use lowercase query for API
    const query = searchTerm.toLowerCase();
    const response = await fetch(`${BASE_URL}/sekolah/s?sekolah=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: ISchoolSearchResponse = await response.json();
    return Array.isArray(data.dataSekolah) ? data.dataSekolah : [];
  } catch (error) {
    console.error("School search API error:", error);
    return [];
  }
}

/**
 * Format school display name
 */
export function formatSchoolDisplay(school: ISchoolSearchResult): string {
  const status = school.status === "S" ? "(Swasta)" : "(Negeri)";
  return `${school.sekolah} ${status} - ${school.kabupaten_kota}`;
}

/**
 * Get school location data for backend
 */
export function getSchoolLocationData(school: ISchoolSearchResult) {
  return {
    province: school.propinsi,
    city: school.kabupaten_kota,
  };
}
