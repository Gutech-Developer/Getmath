"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RolesSection() {
  const rolesRef = useRef<HTMLDivElement>(null);
  const roles = [
    {
      title: "Siswa",
      color: "bg-lottie-teal",
      shadow: "shadow-[rgba(31,35,117,0.2)_0px_4px_12px]",
      isPrimary: true,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      ),
      desc: "Tingkatkan pemahaman matematika dengan modul interaktif, tes diagnostik, dan analytics belajar.",
      points: [
        "Baca modul materi interaktif dengan E-LKPD",
        "Kerjakan tes diagnostik dengan pantauan emosi",
        "Tonton video remedial per soal jika perlu",
        "Diskusi di forum dan tanya AI Chatbot",
        "Pantau perkembangan belajar di LAD Siswa",
        "Bergabung ke kelas via kode dari guru",
      ],
      linkText: "Daftar sebagai Siswa",
      linkHref: "/register/student",
    },
    {
      title: "Guru",
      color: "bg-[#ffbf00]",
      shadow: "shadow-[rgba(255,191,0,0.2)_0px_4px_12px]",
      isPrimary: false,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      desc: "Kelola kelas, buat materi dan tes, pantau perkembangan setiap siswa secara detail.",
      points: [
        "Buat dan kelola kelas dengan kode atau link",
        "Upload modul materi PDF dengan E-LKPD",
        "Buat tes diagnostik dengan paket soal",
        "Pantau progress dan emosi seluruh siswa",
        "Diskusi di forum dan balas pertanyaan",
        "Export laporan aktivitas siswa",
      ],
      linkText: "Daftar sebagai Guru",
      linkHref: "/register/teacher",
    },
    {
      title: "Orang Tua",
      color: "bg-[#ff6b9d]",
      shadow: "shadow-[rgba(255,107,157,0.2)_0px_4px_12px]",
      isPrimary: false,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      desc: "Pantau aktivitas dan perkembangan belajar anak kapan saja, di mana saja.",
      points: [
        "Pantau nilai dan skor tes diagnostik anak",
        "Lihat visualisasi emosi anak saat belajar",
        "Monitor durasi dan aktivitas belajar harian",
        "Ketahui kelas dan materi yang dipelajari",
        "Manajemen lebih dari satu anak",
        "Akses dari perangkat mobile kapan saja",
      ],
      linkText: "Daftar sebagai Orang Tua",
      linkHref: "/register/parent",
    },
  ];

  useGSAP(() => {
    // Title entrance
    gsap.from(".roles-title-animate", {
      scrollTrigger: {
        trigger: ".roles-title-animate",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        // Draw the double brush lines
        gsap.to([".roles-brush-1", ".roles-brush-2"], {
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power1.inOut",
        });
      }
    });

    // Cards staggered slide up & inner phone mockup slide
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".roles-card-animate",
        start: "top 80%",
      }
    });

    tl.from(".roles-card-animate", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });

    tl.from(".roles-circles-animate", {
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.5)"
    }, "-=0.4");

    tl.from([".roles-phone-siswa", ".roles-phone-ortu"], {
      y: 150,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
    }, "-=0.6");

    tl.from(".roles-phone-guru", {
      y: -150,
      duration: 0.8,
      ease: "power2.out",
    }, "-=0.6");
  }, { scope: rolesRef });

  return (
    <section
      ref={rolesRef}
      id="peran"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden"
    >
      {/* Yellow hand-drawn star doodle in left margin */}
      <div className="absolute left-[5%] top-[20%] pointer-events-none z-0 hidden lg:block select-none animate-pulse">
        <svg
          width="45"
          height="45"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#eab308"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 5 C20 15, 25 20, 35 20 C25 20, 20 25, 20 35 C20 25, 15 20, 5 20 C15 20, 20 15, 20 5 Z"
            fill="#fffbeb"
          />
        </svg>
      </div>

      {/* Pink hand-drawn star doodle in right margin */}
      <div className="absolute right-[5%] bottom-[25%] pointer-events-none z-0 hidden lg:block select-none animate-[pulse_3s_infinite]">
        <svg
          width="35"
          height="35"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#ec4899"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 5 C20 15, 25 20, 35 20 C25 20, 20 25, 20 35 C20 25, 15 20, 5 20 C15 20, 20 15, 20 5 Z"
            fill="#fff1f2"
          />
        </svg>
      </div>

      {/* Hand-drawn purple loop arrow */}
      <div className="absolute right-[8%] top-[12%] pointer-events-none z-0 hidden xl:block select-none opacity-80">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 10 70 C 20 50, 20 20, 40 20 C 60 20, 60 50, 40 50 C 30 50, 25 35, 30 15" />
          <path d="M 23 20 L 30 15 L 35 23" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center roles-title-animate">
          <span className="inline-flex items-center rounded-full text-lottie-teal px-3 py-1 text-base font-semibold font-inter uppercase tracking-wide">
            Untuk Siapa
          </span>
          <h2 className="mt-4 font-dm-sans text-4xl font-normal tracking-[-0.03em] text-lottie-midnight sm:text-[48px] leading-[1.12]">
            GetSmart untuk{" "}
            <span className="relative inline-block px-1">
              Semua Peran
              {/* Yellow brush double underline */}
              <svg
                className="absolute left-0 bottom-[-6px] w-full h-[12px] pointer-events-none z-0"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  className="roles-brush-1"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  d="M 5 3 Q 100 8 195 3"
                  stroke="#eab308"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  className="roles-brush-2"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  d="M 12 7 Q 100 11 188 8"
                  stroke="#eab308"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-inter text-base text-lottie-zinc-500">
            Satu platform, tiga perspektif yang saling melengkapi untuk
            pengalaman belajar terbaik.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {/* Card 1: Siswa */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            {/* Text Content (Top) */}
            <div className="relative z-10">
              {/* Badge & Link Row */}
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-[#1F2375] font-inter">
                  Siswa
                </span>
                <Link
                  href="/register/student"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1F2375] hover:underline font-inter"
                >
                  Daftar{" "}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                {roles[0].title}
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {roles[0].desc}
              </p>
            </div>

            {/* Concentric circles SVG behind the phone */}
            <div className="absolute bottom-[60px] lg:bottom-[80px] left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.08] z-0 roles-circles-animate">
              <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
                <circle
                  cx="160"
                  cy="160"
                  r="45"
                  stroke="#1F2375"
                  strokeWidth="2.5"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="90"
                  stroke="#1F2375"
                  strokeWidth="2.0"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="135"
                  stroke="#1F2375"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Phone mockup */}
            <div className="absolute bottom-[-50px] lg:bottom-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-t-[32px] shadow-2xl flex flex-col pt-3 lg:pt-4 select-none pointer-events-auto overflow-hidden roles-phone-siswa">
              {/* Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-3.5 bg-slate-950 rounded-full z-30" />

              {/* Screen */}
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col gap-2 rounded-t-[22px] text-slate-800">
                {/* Profile Row */}
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-200 flex-shrink-0 bg-white">
                    <img
                      src="/images/student_avatar.png"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                      Alya Nabila
                    </p>
                    <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                      Siswa • Lvl 12
                    </p>
                  </div>
                </div>

                {/* Access features */}
                <div className="flex-1 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">📚</span>
                    <div className="leading-tight">
                      <span className="font-bold text-[#1F2375] block">
                        E-LKPD & Modul
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Akses materi interaktif
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">🧠</span>
                    <div className="leading-tight">
                      <span className="font-bold text-emerald-800 block">
                        Kuis Emosi AI
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Evaluasi adaptif & fokus
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">🎥</span>
                    <div className="leading-tight">
                      <span className="font-bold text-amber-800 block">
                        Video Remedial
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Solusi pembahasan soal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Guru */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            {/* Concentric circles SVG behind the phone */}
            <div className="absolute top-[60px] lg:top-[80px] left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.08] z-0 roles-circles-animate">
              <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
                <circle
                  cx="160"
                  cy="160"
                  r="45"
                  stroke="#1F2375"
                  strokeWidth="2.5"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="90"
                  stroke="#1F2375"
                  strokeWidth="2.0"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="135"
                  stroke="#1F2375"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Phone mockup */}
            <div className="absolute top-[-50px] lg:top-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-b-[32px] border-t-0 shadow-2xl flex flex-col  pb-3 lg:pb-4 select-none pointer-events-auto overflow-hidden roles-phone-guru">
              {/* Screen */}
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col justify-between rounded-b-[22px] text-slate-800">
                <div className="flex flex-col gap-2">
                  {/* Profile Row */}
                  <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#ffbf00] flex items-center justify-center text-[9px] font-bold text-amber-950 border border-amber-200 flex-shrink-0">
                      BD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                        Budi, M.Pd.
                      </p>
                      <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                        Guru Matematika
                      </p>
                    </div>
                  </div>

                  {/* Access features */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">🏫</span>
                      <div className="leading-tight">
                        <span className="font-bold text-[#1F2375] block">
                          Kelola Kelas Cerdas
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          Buat grup belajar siswa
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">😊</span>
                      <div className="leading-tight">
                        <span className="font-bold text-emerald-800 block">
                          Monitor Emosi
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          90% siswa stabil/fokus
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[8px] lg:text-[9px]">
                      <span className="text-xs">📈</span>
                      <div className="leading-tight">
                        <span className="font-bold text-rose-800 block">
                          Rapor Belajar
                        </span>
                        <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                          Export hasil evaluasi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Home indicator bar inside the screen */}
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2 flex-shrink-0" />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="mt-auto z-10 relative">
              {/* Badge & Link Row */}
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 font-inter">
                  Guru
                </span>
                <Link 
                  href="/register/teacher"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline font-inter"
                >
                  Daftar{" "}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                {roles[1].title}
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {roles[1].desc}
              </p>
            </div>
          </div>

          {/* Card 3: Orang Tua */}
          <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-md p-8 shadow-[rgba(31,35,117,0.02)_0px_8px_24px_0px] hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden h-[480px] lg:h-[500px] group roles-card-animate">
            {/* Text Content (Top) */}
            <div className="relative z-10">
              {/* Badge & Link Row */}
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 font-inter">
                  Orang Tua
                </span>
                <Link
                  href="/register/parent"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:underline font-inter"
                >
                  Daftar{" "}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>

              <h3 className="mb-2 font-dm-sans text-2xl font-bold tracking-tight text-lottie-midnight">
                {roles[2].title}
              </h3>
              <p className="font-inter text-xs leading-relaxed text-lottie-zinc-500 max-w-[85%]">
                {roles[2].desc}
              </p>
            </div>

            {/* Concentric circles SVG behind the phone */}
            <div className="absolute bottom-[60px] lg:bottom-[80px] left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.08] z-0 roles-circles-animate">
              <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
                <circle
                  cx="160"
                  cy="160"
                  r="45"
                  stroke="#1F2375"
                  strokeWidth="2.5"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="90"
                  stroke="#1F2375"
                  strokeWidth="2.0"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="135"
                  stroke="#1F2375"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Phone mockup */}
            <div className="absolute bottom-[-50px] lg:bottom-[-60px] left-1/2 -translate-x-1/2 z-10 w-[170px] lg:w-[200px] h-[270px] lg:h-[320px] border-[5px] lg:border-[6px] border-slate-950 bg-slate-950 rounded-t-[32px] shadow-2xl flex flex-col pt-3 lg:pt-4 select-none pointer-events-auto overflow-hidden roles-phone-ortu">
              {/* Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 lg:w-16 h-3 lg:h-3.5 bg-slate-950 rounded-full z-30" />

              {/* Screen */}
              <div className="flex-1 bg-slate-50 p-2.5 pt-3.5 flex flex-col gap-2 rounded-t-[22px] text-slate-800">
                {/* Profile Row */}
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#ff6b9d] flex items-center justify-center text-[9px] font-bold text-white border border-pink-200 flex-shrink-0">
                    RN
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-800 truncate leading-none">
                      Ibu Rina
                    </p>
                    <p className="text-[6px] font-medium text-slate-400 leading-none mt-1">
                      Anak: Alya Nabila
                    </p>
                  </div>
                </div>

                {/* Access features */}
                <div className="flex-1 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">📈</span>
                    <div className="leading-tight">
                      <span className="font-bold text-[#1F2375] block">
                        Pantau Progress
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Skor rata-rata: 92%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">😊</span>
                    <div className="leading-tight">
                      <span className="font-bold text-emerald-800 block">
                        Deteksi Emosi
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Stabil saat belajar
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[8px] lg:text-[9px]">
                    <span className="text-xs">⏱️</span>
                    <div className="leading-tight">
                      <span className="font-bold text-amber-800 block">
                        Durasi Belajar
                      </span>
                      <span className="text-slate-500 text-[6.5px] lg:text-[7px]">
                        Hari ini: 45 menit
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
