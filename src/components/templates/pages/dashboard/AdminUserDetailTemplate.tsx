"use client";

import { useUserById } from "@/services/hooks/useUser";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import InitTemplate from "@/components/templates/init/InitTemplate";
import { formatBirthDate } from "@/libs/utils";

interface IAdminUserDetailTemplateProps {
  role: "siswa" | "guru";
}

export default function AdminUserDetailTemplate({ role }: IAdminUserDetailTemplateProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: user, isLoading, error } = useUserById(id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
        <div className="p-8 text-center text-sm text-[#6B7280]">Memuat data detail {role}...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
        <div className="p-8 text-center text-sm text-red-500">
          Gagal memuat data {role}. Data mungkin sudah terhapus atau ID tidak valid.
        </div>
        <div className="text-center">
          <button onClick={() => router.back()} className="text-blue-500 underline">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const rolePath = role === "siswa" ? "student" : "teacher";
  const userSpecificData = role === "siswa" ? user.student : user.teacher;
  const identityNumber = role === "siswa" ? user.student?.NIS : user.teacher?.NIP;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2">
            <Link
              href={`/admin/dashboard/manage-users/${rolePath}`}
              className="text-sm text-lottie-teal hover:opacity-80 transition font-semibold"
            >
              &larr; Kembali ke Daftar {role === "siswa" ? "Siswa" : "Guru"}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Detail {role === "siswa" ? "Siswa" : "Guru"}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Informasi lengkap mengenai {user.fullName}
          </p>
        </div>
      </div>

      <div className="getmath-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{user.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-base text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{role === "siswa" ? "NIS" : "NIP"}</p>
              <p className="mt-1 text-base text-gray-900">{identityNumber || "-"}</p>
            </div>
            {role === "siswa" && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                  <p className="mt-1 text-base text-gray-900">{formatBirthDate(user.student?.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
                  <p className="mt-1 text-base text-gray-900">{user.student?.gender ?? "-"}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
              <p className="mt-1 text-base text-gray-900">{user.phoneNumber || "-"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Asal Sekolah</p>
              <p className="mt-1 text-base text-lottie-teal font-semibold">{user.schoolName || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Provinsi / Kota</p>
              <p className="mt-1 text-base text-gray-900">
                {user.province ? `${user.province}, ${user.city}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bergabung Sejak</p>
              <p className="mt-1 text-base text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status Akun</p>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.isActive ? "Aktif" : "Tidak Aktif"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
