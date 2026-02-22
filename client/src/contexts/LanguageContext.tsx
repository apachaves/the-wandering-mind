// The Wandering Mind — Language Context
// Provides persistent language selection (EN / FR / PT-BR) via localStorage

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "fr" | "ptBR";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  fr: "Français",
  ptBR: "Português",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ptBR: "PT",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

const STORAGE_KEY = "twm-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "fr" || stored === "ptBR" || stored === "en") return stored;
    } catch {}
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
