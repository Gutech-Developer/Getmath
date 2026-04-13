"use client";

import { useEffect, useMemo, useState } from "react";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import ProfileIcon from "@/components/atoms/icons/ProfileIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";

export interface IManagedChild {
  id: string;
  fullname: string;
  nis: string;
  classroom: string;
}

interface ChildManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChildren?: IManagedChild[];
}

const CLASSROOM_PRESET = [
  "Kelas X-1",
  "Kelas IX-2",
  "Kelas XI-1",
  "Kelas VIII-3",
];

function getChildInitial(fullname: string) {
  const normalizedName = fullname.trim();

  if (!normalizedName) {
    return "?";
  }

  return normalizedName.charAt(0).toUpperCase();
}

export default function ChildManagementModal({
  isOpen,
  onClose,
  initialChildren = [],
}: ChildManagementModalProps) {
  const [children, setChildren] = useState<IManagedChild[]>(initialChildren);
  const [fullnameInput, setFullnameInput] = useState("");
  const [nisInput, setNisInput] = useState("");

  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const isAddDisabled = useMemo(
    () => fullnameInput.trim().length < 3 || nisInput.trim().length < 4,
    [fullnameInput, nisInput],
  );

  const handleAddChild = () => {
    if (isAddDisabled) {
      return;
    }

    const newChild: IManagedChild = {
      id: `child-${Date.now()}`,
      fullname: fullnameInput.trim(),
      nis: nisInput,
      classroom: CLASSROOM_PRESET[children.length % CLASSROOM_PRESET.length],
    };

    setChildren((prev) => [...prev, newChild]);
    setFullnameInput("");
    setNisInput("");
  };

  const handleDeleteChild = (id: string) => {
    setChildren((prev) => prev.filter((child) => child.id !== id));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/45 p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Tutup modal manajemen anak"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0px_20px_60px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white">
              <ProfileIcon className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Manajemen Anak
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#374151]"
            aria-label="Tutup modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 pb-6 pt-5 md:px-6 md:pb-7 md:pt-6">
          <section>
            <h3 className="text-[1.35rem] font-bold text-[#1F2937]">
              Anak yang Terdaftar
            </h3>

            <div className="mt-4 space-y-3">
              {children.length > 0 ? (
                children.map((child, index) => (
                  <div
                    key={child.id}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3",
                      index === 0
                        ? "border-[#C7D2FE] bg-[#EEF2FF]"
                        : "border-[#E5E7EB] bg-[#F8FAFC]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white">
                        {getChildInitial(child.fullname)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold leading-tight text-[#1F2937]">
                          {child.fullname}
                        </p>
                        <p className="mt-1 text-sm text-[#9CA3AF]">
                          NIS: {child.nis} · {child.classroom}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteChild(child.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FFF1F2] text-[#EF4444] transition hover:bg-[#FFE4E6]"
                      aria-label={`Hapus ${child.fullname}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-4 py-5 text-sm text-[#6B7280]">
                  Belum ada anak yang terdaftar. Tambahkan data anak baru
                  melalui form di bawah.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-[1.35rem] font-bold text-[#1F2937]">
              Tambah Anak Baru
            </h3>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#4B5563]">
                  Nama Lengkap Anak
                </label>
                <input
                  type="text"
                  value={fullnameInput}
                  onChange={(event) => setFullnameInput(event.target.value)}
                  placeholder="cth: Ahmad Rizki"
                  className="h-12 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm text-[#1F2937] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#C7D2FE] placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#4B5563]">
                  NIS (Nomor Induk Siswa)
                </label>
                <input
                  type="text"
                  value={nisInput}
                  onChange={(event) =>
                    setNisInput(
                      event.target.value.replace(/\D/g, "").slice(0, 15),
                    )
                  }
                  inputMode="numeric"
                  placeholder="cth: 10234"
                  className="h-12 w-full rounded-xl border border-[#D1D5DB] px-4 text-sm text-[#1F2937] outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#C7D2FE] placeholder:text-[#9CA3AF]"
                />
              </div>

              <button
                type="button"
                disabled={isAddDisabled}
                onClick={handleAddChild}
                className={cn(
                  "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition",
                  isAddDisabled
                    ? "cursor-not-allowed bg-[#E5E7EB] text-white"
                    : "bg-[#1F2375] text-white hover:bg-[#171B5A]",
                )}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Anak
              </button>
            </div>

            <p className="mt-5 text-xs leading-5 text-[#9CA3AF]">
              Catatan: Setelah menambahkan anak, sistem akan memverifikasi NIS
              dengan database sekolah. Data anak akan otomatis tersinkronisasi
              dengan akun siswa yang terdaftar.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
