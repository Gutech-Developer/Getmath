"use client";

import { useState } from "react";
import { cn } from "@/libs/utils";

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"siswa" | "guru" | "orangTua">("siswa");

  const stepsData = {
    siswa: [
      {
        num: "01",
        title: "Daftar & Verifikasi",
        desc: "Buat akun dengan NIS, email, dan data dirimu. Verifikasi via magic link atau Google.",
      },
      {
        num: "02",
        title: "Bergabung ke Kelas",
        desc: "Masukkan kode kelas dari gurumu atau klik link undangan untuk langsung bergabung.",
      },
      {
        num: "03",
        title: "Belajar & Berlatih",
        desc: "Baca materi interaktif, tonton video pemantik, kerjakan E-LKPD, ikuti tes diagnostik.",
      },
      {
        num: "04",
        title: "Pantau Perkembangan",
        desc: "Lihat LAD untuk grafik nilai, pola emosi belajar, peringkat kelas, dan rekomendasi.",
      },
    ],
    guru: [
      {
        num: "01",
        title: "Buat Akun Guru",
        desc: "Daftar sebagai guru dan lengkapi profil sekolah serta mata pelajaran yang diampu.",
      },
      {
        num: "02",
        title: "Buat Kelas & Modul",
        desc: "Buat kelas baru, upload materi PDF, dan rancang tes diagnostik atau remedial.",
      },
      {
        num: "03",
        title: "Undang Siswa",
        desc: "Bagikan kode unik kelas atau link kepada siswa untuk bergabung secara otomatis.",
      },
      {
        num: "04",
        title: "Analisis Hasil Belajar",
        desc: "Gunakan dashboard analytics untuk memantau nilai, emosi, dan kesulitan tiap siswa.",
      },
    ],
    orangTua: [
      {
        num: "01",
        title: "Daftar Akun",
        desc: "Buat akun orang tua menggunakan email dan lengkapi profil singkat.",
      },
      {
        num: "02",
        title: "Tautkan Akun Anak",
        desc: "Masukkan kode unik dari akun siswa untuk menghubungkan profil anak ke akunmu.",
      },
      {
        num: "03",
        title: "Pantau Aktivitas",
        desc: "Terima notifikasi real-time saat anak mengerjakan tes atau menyelesaikan materi.",
      },
      {
        num: "04",
        title: "Lihat Rapor Emosi",
        desc: "Akses laporan komprehensif tentang perkembangan kognitif dan emosi belajar anak.",
      },
    ],
  };

  const steps = stepsData[activeTab];

  return (
    <section className="bg-[#FAFBFF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Cara Menggunakan
          </p>
          <h2 className="text-3xl font-bold text-[#111827] sm:text-4xl">
            Mulai Menggunakan GetSmart
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B7280]">
            Empat langkah mudah untuk memulai perjalanan belajarmu
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mx-auto mb-16 flex max-w-fit items-center rounded-xl bg-[#E5E7EB] p-1">
          <button
            onClick={() => setActiveTab("siswa")}
            className={cn(
              "rounded-lg px-8 py-2.5 text-sm font-semibold transition-all",
              activeTab === "siswa"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#4B5563] hover:text-[#111827]"
            )}
          >
            Siswa
          </button>
          <button
            onClick={() => setActiveTab("guru")}
            className={cn(
              "rounded-lg px-8 py-2.5 text-sm font-semibold transition-all",
              activeTab === "guru"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#4B5563] hover:text-[#111827]"
            )}
          >
            Guru
          </button>
          <button
            onClick={() => setActiveTab("orangTua")}
            className={cn(
              "rounded-lg px-8 py-2.5 text-sm font-semibold transition-all",
              activeTab === "orangTua"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#4B5563] hover:text-[#111827]"
            )}
          >
            Orang Tua
          </button>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-lg font-bold text-[#2563EB]">
                {step.num}
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#111827]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#6B7280]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
