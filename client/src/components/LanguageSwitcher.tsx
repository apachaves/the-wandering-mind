// Capim — Language Switcher
// Design: Warm Naturalist — small pill buttons, forest green active state

import { useLanguage, LANGUAGE_FLAGS, LANGUAGE_LABELS, type Language } from "@/contexts/LanguageContext";

const LANGUAGES: Language[] = ["en", "fr", "ptBR"];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language selector">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          title={LANGUAGE_LABELS[lang]}
          className="px-2 py-1 rounded-sm text-xs transition-all duration-200"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: compact ? "0.6rem" : "0.68rem",
            letterSpacing: "0.04em",
            background: language === lang ? "oklch(0.42 0.10 155)" : "transparent",
            color: language === lang ? "oklch(0.97 0.008 80)" : "oklch(0.55 0.025 70)",
            border: language === lang
              ? "1px solid oklch(0.42 0.10 155)"
              : "1px solid oklch(0.86 0.022 75)",
            fontWeight: language === lang ? 600 : 400,
          }}
        >
          {LANGUAGE_FLAGS[lang]}
        </button>
      ))}
    </div>
  );
}
