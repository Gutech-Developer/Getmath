"use client";

/**
 * useSchoolSearch - Hook untuk mencari sekolah dengan debouncing
 * Menggunakan endpoint /schools/public dari backend
 */

import { useState, useEffect } from "react";
import { usePublicSchools } from "./useGsSchool";

interface UseSchoolSearchProps {
  searchTerm: string;
  debounceMs?: number;
}

export function useSchoolSearch({
  searchTerm,
  debounceMs = 500,
}: UseSchoolSearchProps) {
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setDebouncedTerm("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const { data, isLoading, error } = usePublicSchools({
    search: debouncedTerm,
    limit: 20,
  });

  return {
    schools: data?.schools || [],
    isLoading: isLoading && debouncedTerm.length >= 2,
    error: error ? error.message : null,
  };
}
