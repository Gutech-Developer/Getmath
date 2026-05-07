/**
 * useSchoolSearch - Hook untuk mencari sekolah dengan debouncing
 * Prevents excessive API calls while user is typing
 */

import { useState, useEffect, useCallback } from "react";
import { searchSchoolsByName } from "@/utils/schoolSearch";
import type { ISchoolSearchResult } from "@/utils/schoolSearch";

interface UseSchoolSearchProps {
  searchTerm: string;
  debounceMs?: number;
}

interface UseSchoolSearchReturn {
  schools: ISchoolSearchResult[];
  isLoading: boolean;
  error: string | null;
}

export function useSchoolSearch({
  searchTerm,
  debounceMs = 500,
}: UseSchoolSearchProps): UseSchoolSearchReturn {
  const [schools, setSchools] = useState<ISchoolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSchools([]);
      setError(null);
      return;
    }

    // Set a timeout for debouncing
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchSchoolsByName(searchTerm);
        setSchools(results);
        if (results.length === 0 && searchTerm.length >= 2) {
          setError("Tidak ada sekolah yang ditemukan");
        }
      } catch (err) {
        setError("Gagal mencari sekolah");
        setSchools([]);
        console.error("School search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return {
    schools,
    isLoading,
    error,
  };
}
