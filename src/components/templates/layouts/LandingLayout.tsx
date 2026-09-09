"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent, ReactNode } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/providers/I18nProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
}

// Height of the sticky header (h-16 = 64px) plus breathing room
const HEADER_OFFSET = 72;

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const { locale, setLocale, t } = useI18n();

  const handleAnchorClick = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const id = href.startsWith("#") ? href.slice(1) : href;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    gsap.killTweensOf(window);

    // Smoothly scroll to the section, offset by the sticky header
    gsap.to(window, {
      duration: 1.1,
      ease: "power3.inOut",
      scrollTo: { y: target, offsetY: HEADER_OFFSET, autoKill: true },
      onComplete: () => {
        // Replay the section's load animation so it shows on every click
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger && target.contains(st.trigger) && st.animation) {
            st.animation.restart();
          }
        });
        ScrollTrigger.refresh();
      },
    });

    // Keep the URL hash in sync without triggering a native jump
    window.history.replaceState(null, "", href);
  };

  return (
    <div className="min-h-screen bg-lottie-pearl font-inter text-lottie-midnight antialiased selection:bg-lottie-mint-wash selection:text-lottie-midnight">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-lottie-teal/20 bg-[#ededed]/90 backdrop-blur-md shadow-[rgba(31,35,117,0.03)_0px_4px_16px_0px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src={"/img/logo/logo.png"}
              alt="GetSmart Logo"
              width={100}
              height={100}
              className="w-auto h-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
            <Link
              href="#tentang"
              onClick={(e) => handleAnchorClick(e, "#tentang")}
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="#fitur"
              onClick={(e) => handleAnchorClick(e, "#fitur")}
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              {t("nav.features")}
            </Link>
            
           
         
            <Link
              href="#peran"
              onClick={(e) => handleAnchorClick(e, "#peran")}
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              {t("nav.roles")}
            </Link>
            <Link
              href="#cara-kerja"
              onClick={(e) => handleAnchorClick(e, "#cara-kerja")}
              className="text-sm font-medium text-lottie-midnight hover:text-lottie-teal transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>
           
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher Capsule Button */}
            <div
              className="inline-flex items-center rounded-xl border border-white/70 bg-white/60 p-1 shadow-sm backdrop-blur-sm"
              role="group"
              aria-label="Language Switcher"
            >
              <button
                type="button"
                onClick={() => setLocale("id")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  locale === "id"
                    ? "bg-[#1F2375] text-white shadow-sm"
                    : "text-lottie-zinc-600 hover:text-lottie-midnight hover:bg-white/50"
                }`}
                title="Bahasa Indonesia"
              >
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  locale === "en"
                    ? "bg-[#1F2375] text-white shadow-sm"
                    : "text-lottie-zinc-600 hover:text-lottie-midnight hover:bg-white/50"
                }`}
                title="English"
              >
                <span>EN</span>
              </button>
            </div>

            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-lottie-teal px-4 sm:px-5 text-sm font-medium text-white transition-all hover:bg-lottie-teal/95 active:scale-[0.98] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
            >
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-lottie-mist bg-white pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 xl:gap-24 mb-12">
            {/* Logo and About */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src={"/img/logo/logo.png"}
                  alt="GetSmart Logo"
                  width={110}
                  height={110}
                  className="w-auto h-auto object-contain"
                />
              </Link>
              <p className="mb-6 text-sm leading-relaxed text-lottie-zinc-500 max-w-sm">
                {t("footer.tagline")}
              </p>
              <div className="flex items-center gap-3 rounded-2xl border border-lottie-mist bg-lottie-pearl p-3 w-max">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <Image
                    src={"/img/logo/logo_PRP-PMRI.png"}
                    alt="PRP PMRI USK"
                    width={100}
                    height={100}
                    className="w-auto h-auto object-contain"
                  />
                </Link>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                {t("footer.product")}
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#fitur"
                    onClick={(e) => handleAnchorClick(e, "#fitur")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.productFeatures")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#e-worksheet"
                    onClick={(e) => handleAnchorClick(e, "#e-worksheet")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.productModules")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#tes-diagnostik"
                    onClick={(e) => handleAnchorClick(e, "#tes-diagnostik")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.productDiagnostic")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#peran"
                    onClick={(e) => handleAnchorClick(e, "#peran")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.productLAD")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#ai-emotion"
                    onClick={(e) => handleAnchorClick(e, "#ai-emotion")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.productAiChatbot")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#akun-uji-coba"
                    onClick={(e) => handleAnchorClick(e, "#akun-uji-coba")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("nav.demoAccounts")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                {t("footer.users")}
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#peran"
                    onClick={(e) => handleAnchorClick(e, "#peran")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.forStudents")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#peran"
                    onClick={(e) => handleAnchorClick(e, "#peran")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.forTeachers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#peran"
                    onClick={(e) => handleAnchorClick(e, "#peran")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.forParents")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-lottie-teal transition-colors font-medium text-lottie-teal"
                  >
                    {t("footer.startRegister")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.loginAccount")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-lottie-midnight">
                {t("footer.company")}
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-lottie-zinc-500">
                <li>
                  <Link
                    href="#tentang"
                    onClick={(e) => handleAnchorClick(e, "#tentang")}
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-lottie-teal transition-colors"
                  >
                    {t("footer.contact")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-lottie-mist pt-8 gap-4 text-center md:text-left">
            <p className="text-xs text-lottie-fog">
              &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-4 text-xs text-lottie-fog">
              <span>{t("footer.tagline")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
