import InitTemplate from "@/components/templates/init/InitTemplate";

interface IAdminManageUsersTemplateProps {
  role: "siswa" | "guru";
}

export default function AdminManageUsersTemplate({ role }: IAdminManageUsersTemplateProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Manajemen User - {role === "siswa" ? "Siswa" : "Guru"}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Kelola data {role} yang terdaftar dalam sistem
          </p>
        </div>
      </div>

      <InitTemplate
        title={role === "siswa" ? "Daftar Siswa" : "Daftar Guru"}
        description={`Halaman ini akan menampilkan tabel daftar ${role} beserta fitur tambah, edit, dan hapus.`}
      >
        <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-sm text-[#475569]">
          <div className="text-center">
            <p className="font-semibold text-[#334155]">
              UI Tabel {role === "siswa" ? "Siswa" : "Guru"}
            </p>
            <p className="mt-1">
              (Data akan dimuat dari API endpoint khusus {role === "siswa" ? "siswa" : "guru"})
            </p>
          </div>
        </div>
      </InitTemplate>
    </div>
  );
}
