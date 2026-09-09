"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/providers/I18nProvider";
import { DEMO_ACCOUNTS, IDemoAccount } from "@/constant/demoAccounts";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import EyeIcon from "@/components/atoms/icons/EyeIcon";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DemoAccountSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"all" | "guru" | "siswa">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useGSAP(
    () => {
      gsap.from(".demo-title-animate", {
        scrollTrigger: {
          trigger: ".demo-title-animate",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".demo-guide-animate", {
        scrollTrigger: {
          trigger: ".demo-guide-animate",
          start: "top 85%",
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(".demo-controls-animate", {
        scrollTrigger: {
          trigger: ".demo-controls-animate",
          start: "top 85%",
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  const handleCopy = (text: string, key: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast.success(`${label} berhasil disalin!`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2500);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAccounts = useMemo(() => {
    return DEMO_ACCOUNTS.filter((acc) => {
      // Role filter
      if (activeTab === "guru" && acc.role !== "guru") return false;
      if (activeTab === "siswa" && acc.role !== "siswa") return false;

      // Search filter (debounced)
      if (!debouncedSearchQuery.trim()) return true;
      const q = debouncedSearchQuery.toLowerCase().trim();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.nis.toLowerCase().includes(q) ||
        acc.roleLabel.toLowerCase().includes(q)
      );
    });
  }, [activeTab, debouncedSearchQuery]);

  const guruAccounts = useMemo(
    () => filteredAccounts.filter((a) => a.role === "guru"),
    [filteredAccounts]
  );
  const siswaAccounts = useMemo(
    () => filteredAccounts.filter((a) => a.role === "siswa"),
    [filteredAccounts]
  );

  return (
    <section
      ref={sectionRef}
      id="akun-uji-coba"
      className="bg-[#ededed] py-20 md:py-28 relative overflow-hidden math-grid-bg border-b border-lottie-mist/60 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="mb-14 text-center demo-title-animate">
          

          <h2 className="mt-4 font-dm-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-lottie-midnight leading-tight">
            {t("demoAccounts.titlePrefix")}
            <span className="text-[#1F2375] font-semibold">
              {t("demoAccounts.titleHighlight")}
            </span>
            {t("demoAccounts.titleSuffix")}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-lottie-zinc-500 leading-relaxed">
            {t("demoAccounts.subtitle")}
          </p>
        </div>

        {/* Quick Guide Strip */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 demo-guide-animate">
          {/* Step 1 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md p-5 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#1F2375] font-bold">
              <ThreeUserGroupIcon className="w-5 h-5 text-[#1F2375]" />
            </div>
            <div>
              <h3 className="font-dm-sans text-lg font-bold text-lottie-midnight leading-snug">
                {t("demoAccounts.step1Title")}
              </h3>
              <p className="mt-1 font-inter text-xs text-lottie-zinc-500 leading-relaxed">
                {t("demoAccounts.step1Desc")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md p-5 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
              <CopyIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-dm-sans text-lg font-bold text-lottie-midnight leading-snug">
                {t("demoAccounts.step2Title")}
              </h3>
              <p className="mt-1 font-inter text-xs text-lottie-zinc-500 leading-relaxed">
                {t("demoAccounts.step2Desc")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md p-5 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold">
              <DashboardIcon className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="font-dm-sans text-lg font-bold text-lottie-midnight leading-snug">
                {t("demoAccounts.step3Title")}
              </h3>
              <p className="mt-1 font-inter text-xs text-lottie-zinc-500 leading-relaxed">
                {t("demoAccounts.step3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 demo-controls-animate">
          {/* Tabs Container (Mobile Dropdown & Desktop Pill Tabs) */}
          <div className="w-full md:w-auto">
            {/* Mobile Dropdown (sm:hidden) */}
            <div className="sm:hidden w-full relative">
              <label htmlFor="mobile-role-filter" className="sr-only">
                Filter Role Akun
              </label>
              <div className="relative">
                <select
                  id="mobile-role-filter"
                  aria-label="Filter role akun"
                  value={activeTab}
                  onChange={(e) =>
                    setActiveTab(e.target.value as "all" | "guru" | "siswa")
                  }
                  className="w-full appearance-none rounded-2xl border border-white/90 bg-white/80 py-2.5 pl-4 pr-10 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md outline-none transition focus:border-[#1F2375] focus:bg-white focus:ring-2 focus:ring-[#1F2375]/15 cursor-pointer"
                >
                  <option value="all">
                    {t("demoAccounts.tabAll")} (11 Akun)
                  </option>
                  <option value="guru">
                    {t("demoAccounts.tabTeacher")}
                  </option>
                  <option value="siswa">
                    {t("demoAccounts.tabStudent")}
                  </option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Desktop / Tablet Pill Tabs (hidden sm:inline-flex) */}
            <div className="hidden sm:inline-flex items-center rounded-2xl border border-white/80 bg-white/60 p-1.5 shadow-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === "all"
                    ? "bg-[#1F2375] text-white shadow-sm"
                    : "text-lottie-zinc-600 hover:text-lottie-midnight hover:bg-white/50"
                )}
              >
                <span>{t("demoAccounts.tabAll")}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeTab === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  11
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("guru")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === "guru"
                    ? "bg-[#1F2375] text-white shadow-sm"
                    : "text-lottie-zinc-600 hover:text-lottie-midnight hover:bg-white/50"
                )}
              >
                <span>{t("demoAccounts.tabTeacher")}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeTab === "guru"
                      ? "bg-white/20 text-white"
                      : "bg-indigo-100 text-indigo-800"
                  )}
                >
                  1
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("siswa")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === "siswa"
                    ? "bg-[#1F2375] text-white shadow-sm"
                    : "text-lottie-zinc-600 hover:text-lottie-midnight hover:bg-white/50"
                )}
              >
                <span>{t("demoAccounts.tabStudent")}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeTab === "siswa"
                      ? "bg-white/20 text-white"
                      : "bg-sky-100 text-sky-800"
                  )}
                >
                  10
                </span>
              </button>
            </div>
          </div>

          {/* Search and View Mode Switcher */}
          <div className="flex items-center gap-3">
            {/* Search Input with Debounce */}
            <div className="relative flex-1 sm:w-72">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("demoAccounts.searchPlaceholder")}
                className="w-full rounded-2xl border border-white/80 bg-white/70 py-2.5 pl-10 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-xs backdrop-blur-md outline-none transition focus:border-[#1F2375] focus:bg-white focus:ring-2 focus:ring-[#1F2375]/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center rounded-2xl border border-white/80 bg-white/60 p-1 shadow-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  viewMode === "cards"
                    ? "bg-[#1F2375] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title={t("demoAccounts.viewCard")}
              >
                {t("demoAccounts.viewCard")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-[#1F2375] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title={t("demoAccounts.viewTable")}
              >
                {t("demoAccounts.viewTable")}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {filteredAccounts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center backdrop-blur-xs">
            <p className="text-sm font-medium text-slate-500">
              {t("demoAccounts.noResults")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-3 text-xs font-bold text-[#1F2375] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === "cards" ? (
          /* ========================================================== */
          /* CARD VIEW                                                  */
          /* ========================================================== */
          <div className="space-y-8">
            {/* FEATURED GURU CARD */}
            {guruAccounts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-[#1F2375]">
                    <DashboardIcon className="w-3.5 h-3.5" />
                    {t("demoAccounts.tabTeacher")}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    • {t("demoAccounts.teacherHighlight")}
                  </span>
                </div>

                {guruAccounts.map((guru) => {
                  const emailKey = `${guru.id}-email`;
                  const passKey = `${guru.id}-pass`;
                  const isPasswordShown = revealedPasswords[guru.id];
                  const loginUrl = `/login?email=${encodeURIComponent(guru.email)}&password=${encodeURIComponent(guru.password)}`;

                  return (
                    <div
                      key={guru.id}
                      className="rounded-[32px] border-2 border-indigo-200/80 bg-gradient-to-br from-white/90 via-indigo-50/40 to-white/90 backdrop-blur-md p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Decorative background glow */}
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                        {/* Left Info */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1F2375] to-indigo-600 text-white font-bold text-base shadow-sm">
                              {guru.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-dm-sans text-2xl font-bold text-slate-900 leading-tight">
                                  {guru.name}
                                </h3>
                                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-[#1F2375]">
                                  {guru.roleLabel}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Akun Pengajar Utama untuk evaluasi dan simulasi kelas
                              </p>
                            </div>
                          </div>

                          <p className="font-inter text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {guru.description}
                          </p>

                          {/* Features Badges */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {guru.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#1F2375] shadow-2xs"
                              >
                                <span className="text-emerald-600">✓</span> {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right Credentials & Action */}
                        <div className="lg:col-span-5 rounded-2xl border border-indigo-100/90 bg-white/90 p-5 shadow-xs flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            {/* Email */}
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {t("demoAccounts.colEmail")}
                              </span>
                              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs sm:text-sm font-mono text-slate-800">
                                <span className="truncate font-semibold select-all">
                                  {guru.email}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(guru.email, emailKey, "Email Guru")
                                  }
                                  className={cn(
                                    "ml-2 inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                    copiedKey === emailKey
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-white text-[#1F2375] hover:bg-indigo-50 border border-indigo-100 shadow-2xs"
                                  )}
                                  title={t("demoAccounts.copyEmail")}
                                >
                                  {copiedKey === emailKey ? (
                                    <>
                                      <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Tersalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <CopyIcon className="w-3.5 h-3.5" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Password */}
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {t("demoAccounts.colPassword")}
                              </span>
                              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs sm:text-sm font-mono text-slate-800">
                                <span className="font-semibold select-all">
                                  {isPasswordShown ? guru.password : "••••••••••••"}
                                </span>
                                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(guru.id)}
                                    className="p-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                    title={
                                      isPasswordShown
                                        ? t("demoAccounts.hidePassword")
                                        : t("demoAccounts.showPassword")
                                    }
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(guru.password, passKey, "Password Guru")
                                    }
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                      copiedKey === passKey
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-white text-[#1F2375] hover:bg-indigo-50 border border-indigo-100 shadow-2xs"
                                    )}
                                    title={t("demoAccounts.copyPassword")}
                                  >
                                    {copiedKey === passKey ? (
                                      <>
                                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Tersalin</span>
                                      </>
                                    ) : (
                                      <>
                                        <CopyIcon className="w-3.5 h-3.5" />
                                        <span>Salin</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Login Action Button */}
                          <Link
                            href={loginUrl}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1F2375] px-5 text-sm font-bold text-white transition-all hover:bg-[#161a5e] hover:shadow-md active:scale-[0.99] shadow-sm"
                          >
                            <span>{t("demoAccounts.useAccount")} (Guru)</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STUDENT CARDS GRID */}
            {siswaAccounts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                    <NotebookIcon className="w-3.5 h-3.5" />
                    {t("demoAccounts.tabStudent")}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    • 10 akun siswa untuk simulasi tes & deteksi emosi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                  {siswaAccounts.map((siswa) => {
                    const emailKey = `${siswa.id}-email`;
                    const passKey = `${siswa.id}-pass`;
                    const isPasswordShown = revealedPasswords[siswa.id];
                    const loginUrl = `/login?email=${encodeURIComponent(siswa.email)}&password=${encodeURIComponent(siswa.password)}`;

                    return (
                      <div
                        key={siswa.id}
                        className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-md p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between gap-4"
                      >
                        <div>
                          {/* Card Header: Avatar, Name & NIS */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white text-xs font-bold shadow-2xs",
                                  siswa.avatarColor
                                )}
                              >
                                {siswa.initials}
                              </div>
                              <div>
                                <h4 className="font-dm-sans text-base font-bold text-slate-900 leading-tight">
                                  {siswa.name}
                                </h4>
                                <span className="inline-flex items-center mt-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                                  NIS: {siswa.nis}
                                </span>
                              </div>
                            </div>
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                              Siswa
                            </span>
                          </div>

                          {/* Credentials Boxes */}
                          <div className="space-y-2 mt-3 text-xs">
                            {/* Email */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5">
                              <span className="truncate font-mono text-slate-700 select-all max-w-[190px]">
                                {siswa.email}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(siswa.email, emailKey, `Email ${siswa.name}`)
                                }
                                className={cn(
                                  "p-1 rounded-md transition cursor-pointer shrink-0",
                                  copiedKey === emailKey
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-white"
                                )}
                                title={t("demoAccounts.copyEmail")}
                              >
                                {copiedKey === emailKey ? (
                                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <CopyIcon className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Password */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5">
                              <span className="font-mono text-slate-700 select-all">
                                {isPasswordShown ? siswa.password : "••••••••••••"}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(siswa.id)}
                                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title={
                                    isPasswordShown
                                      ? t("demoAccounts.hidePassword")
                                      : t("demoAccounts.showPassword")
                                  }
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      siswa.password,
                                      passKey,
                                      `Password ${siswa.name}`
                                    )
                                  }
                                  className={cn(
                                    "p-1 rounded-md transition cursor-pointer",
                                    copiedKey === passKey
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "text-slate-400 hover:text-slate-700 hover:bg-white"
                                  )}
                                  title={t("demoAccounts.copyPassword")}
                                >
                                  {copiedKey === passKey ? (
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <CopyIcon className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Link */}
                        <Link
                          href={loginUrl}
                          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#1F2375]/15 bg-white text-xs font-bold text-[#1F2375] hover:bg-[#1F2375] hover:text-white transition-all duration-200 shadow-2xs"
                        >
                          <span>{t("demoAccounts.useAccount")}</span>
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================== */
          /* TABLE VIEW (Spreadsheet format matching client's table)   */
          /* ========================================================== */
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 backdrop-blur-md shadow-xs">
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-100/60 font-inter text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">{t("demoAccounts.colRole")}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t("demoAccounts.colName")}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t("demoAccounts.colNis")}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t("demoAccounts.colEmail")}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t("demoAccounts.colPassword")}</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">{t("demoAccounts.colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-inter">
                  {filteredAccounts.map((acc) => {
                    const emailKey = `${acc.id}-email`;
                    const passKey = `${acc.id}-pass`;
                    const isPasswordShown = revealedPasswords[acc.id];
                    const isGuru = acc.role === "guru";
                    const loginUrl = `/login?email=${encodeURIComponent(acc.email)}&password=${encodeURIComponent(acc.password)}`;

                    return (
                      <tr
                        key={acc.id}
                        className={cn(
                          "transition-colors hover:bg-indigo-50/40",
                          isGuru ? "bg-indigo-50/20 font-medium" : ""
                        )}
                      >
                        {/* Role */}
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold",
                              isGuru
                                ? "bg-indigo-100 text-[#1F2375]"
                                : "bg-sky-100 text-sky-800"
                            )}
                          >
                            {acc.role}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap text-slate-900 font-semibold">
                          {acc.name}
                        </td>

                        {/* NIS */}
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap font-mono text-slate-600">
                          {acc.nis}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800 select-all">
                              {acc.email}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(acc.email, emailKey, `Email ${acc.name}`)
                              }
                              className={cn(
                                "p-1 rounded-md transition cursor-pointer",
                                copiedKey === emailKey
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              )}
                              title={t("demoAccounts.copyEmail")}
                            >
                              {copiedKey === emailKey ? (
                                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <CopyIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800 select-all">
                              {isPasswordShown ? acc.password : "••••••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(acc.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={
                                isPasswordShown
                                  ? t("demoAccounts.hidePassword")
                                  : t("demoAccounts.showPassword")
                              }
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(acc.password, passKey, `Password ${acc.name}`)
                              }
                              className={cn(
                                "p-1 rounded-md transition cursor-pointer",
                                copiedKey === passKey
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              )}
                              title={t("demoAccounts.copyPassword")}
                            >
                              {copiedKey === passKey ? (
                                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <CopyIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                          <Link
                            href={loginUrl}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs",
                              isGuru
                                ? "bg-[#1F2375] text-white hover:bg-[#161a5e]"
                                : "border border-[#1F2375]/20 bg-white text-[#1F2375] hover:bg-[#1F2375] hover:text-white"
                            )}
                          >
                            <span>{t("demoAccounts.loginDirect")}</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
