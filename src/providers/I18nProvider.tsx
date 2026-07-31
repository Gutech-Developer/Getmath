"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import idDict from "@/locales/id.json";
import enDict from "@/locales/en.json";

export type Locale = "id" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string) => string;
}

const dictionaries: Record<Locale, Record<string, any>> = {
  id: idDict,
  en: enDict,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const COOKIE_NAME = "NEXT_LOCALE";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    // 1. Try to read from cookie or localStorage
    const savedCookie = Cookies.get(COOKIE_NAME) as Locale | undefined;
    const savedLocal = typeof window !== "undefined" ? (localStorage.getItem(COOKIE_NAME) as Locale | undefined) : undefined;
    
    const initialLocale = savedCookie || savedLocal || "id";
    if (initialLocale === "id" || initialLocale === "en") {
      setLocaleState(initialLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    Cookies.set(COOKIE_NAME, newLocale, { expires: 365, path: "/" });
    if (typeof window !== "undefined") {
      localStorage.setItem(COOKIE_NAME, newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  /**
   * Helper function to resolve nested keys like "hero.badge" or "stats.activeStudents"
   */
  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current: any = dictionaries[locale];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to ID dictionary if missing in current locale
        let fallback: any = dictionaries["id"];
        for (const k of keys) {
          if (fallback && typeof fallback === "object" && k in fallback) {
            fallback = fallback[k];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === "string" ? fallback : keyPath;
      }
    }

    return typeof current === "string" ? current : keyPath;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
