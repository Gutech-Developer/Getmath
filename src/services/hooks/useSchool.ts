"use client";

import { gsGet } from "@/libs/api/gsAction";
import {
  ISchool,
  UseSchoolSearchProps,
  UseSchoolSearchReturn,
} from "@/types/school";
import { useState, useEffect } from "react";
import { buildQuery } from "./helper";

export function useSchoolSearch({
  searchTerm,
  debounceMs = 500,
}: UseSchoolSearchProps): UseSchoolSearchReturn {
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Jika input kurang dari 2 karakter, langsung bersihkan dropdown
    if (!searchTerm || searchTerm.length < 2) {
      setSchools([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const handler = setTimeout(() => {
      // Eksekusi pemanggilan data menggunakan IIFE async
      (async () => {
        try {
          const res = await gsGet<any>(
            `/schools/public${buildQuery({ limit: 5, search: searchTerm })}`,
          );

          // Membaca data baik bertipe amplop (.data.schools) atau langsung root (.schools) sesuai JSON Anda
          const fetchedSchools = res?.data?.schools ?? res?.schools;

          if (Array.isArray(fetchedSchools)) {
            setSchools(fetchedSchools);

            if (fetchedSchools.length === 0) {
              setError("Tidak ada sekolah yang ditemukan");
            }
          } else {
            setError("Gagal memuat data sekolah");
            setSchools([]);
          }
        } catch (err) {
          setError("Gagal mencari sekolah");
          setSchools([]);
          console.error("School search error:", err);
        } finally {
          setIsLoading(false);
        }
      })();
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceMs]);

  return {
    schools,
    isLoading,
    error,
  };
}
