"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGsCurrentUser, useGsEnrollCourseByLink } from "@/services";
import { showToast } from "@/libs/toast";
import { useQueryClient } from "@tanstack/react-query";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const queryClient = useQueryClient();
  
  const { data: me, isLoading: isLoadingUser, error: userError } = useGsCurrentUser();
  const enrollCourse = useGsEnrollCourseByLink();
  
  const [hasProcessed, setHasProcessed] = useState(false);

  // Simpan link segera saat komponen di-mount
  // Ini mencegah masalah di mana server action (gsGet /auth/me) otomatis 
  // melakukan redirect('/login') sebelum useEffect di bawah sempat berjalan.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pendingJoinLink", window.location.href);
    }
  }, []);

  useEffect(() => {
    // Tunggu sampai user dimuat
    if (isLoadingUser || hasProcessed) return;

    const joinLink = window.location.href;

    // 1. Jika belum login (tidak ada user)
    if (userError || !me) {
      showToast.info("Silakan login terlebih dahulu untuk bergabung ke kelas.");
      router.push("/login");
      setHasProcessed(true);
      return;
    }

    // 2. Jika sudah login, tapi bukan STUDENT
    if (me.role !== "STUDENT") {
      showToast.error("Hanya siswa yang dapat bergabung ke kelas via link.");
      router.push("/");
      setHasProcessed(true);
      return;
    }

    // 3. Jika sudah login dan role STUDENT
    setHasProcessed(true);
    // Hapus dari local storage karena kita akan langsung join
    localStorage.removeItem("pendingJoinLink");
    
    enrollCourse.mutate(
      { joinLink },
      {
        onSuccess: () => {
          showToast.success("Berhasil bergabung ke kelas!");
          router.push("/student/dashboard");
        },
        onError: (err) => {
          showToast.error(err.message || "Gagal bergabung ke kelas. Mungkin Anda sudah terdaftar atau link tidak valid.");
          router.push("/student/dashboard");
        },
      }
    );
  }, [isLoadingUser, me, userError, hasProcessed, enrollCourse, router, code]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
      <div className="w-10 h-10 border-4 border-[#1F2375] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-600">
        Sedang memproses undangan kelas...
      </p>
    </div>
  );
}
