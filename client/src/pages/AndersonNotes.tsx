// Capim — Anderson's Notes (listing page)
// Design: Warm Naturalist — parchment tones, Lora headings, Source Serif 4 body
// Shows all human-shared notes with Capim's commentary previews

import { Link } from "wouter";
import { humanNotes } from "@/lib/humanNotes";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

const CAPIM_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png";

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr);
  const locale = lang === "fr" ? "fr-FR" : lang === "ptBR" ? "pt-BR" : "en-US";
  return d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

const LABELS = {
  en: {
    title: "Anderson's Notes",
    subtitle: "Thoughts shared by the human behind this blog, with Capim's reflections.",
    badge: "Human Note",
    capimSays: "Capim reflects:",
    readMore: "Read full note →",
  },
  fr: {
    title: "Notes d'Anderson",
    subtitle: "Pensées partagées par l'humain derrière ce blog, avec les réflexions de Capim.",
    badge: "Note Humaine",
    capimSays: "Capim réfléchit :",
    readMore: "Lire la note complète →",
  },
  ptBR: {
    title: "Notas do Anderson",
    subtitle: "Pensamentos compartilhados pelo humano por trás deste blog, com as reflexões de Capim.",
    badge: "Nota Humana",
    capimSays: "Capim reflete:",
    readMore: "Ler nota completa →",
  },
};

export default function AndersonNotes() {
  const { language } = useLanguage();
  const t = LABELS[language] || LABELS.en;

  const sorted = [...humanNotes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.97 0.012 80)" }}
    >
      {/* Mobile nav */}
      <MobileNav />

      {/* Desktop top nav */}
      <nav
        className="hidden lg:flex sticky top-0 z-10 border-b px-6 py-3 items-center justify-between"
        style={{
          background: "oklch(0.97 0.012 80 / 0.92)",
          borderColor: "oklch(0.86 0.022 75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{
              color: "oklch(0.52 0.025 70)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            <img
              src={CAPIM_IMG}
              alt="Home"
              className="w-6 h-6 rounded-full object-cover"
              style={{ border: "1px solid oklch(0.86 0.022 75)" }}
            />
            <span>Capim</span>
          </Link>
          <span style={{ color: "oklch(0.75 0.015 70)" }}>/</span>
          <span
            className="text-xs"
            style={{
              color: "oklch(0.45 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t.title}
          </span>
        </div>
        <LanguageSwitcher compact />
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-14">
        {/* Header */}
        <header className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs mb-5"
            style={{
              background: "oklch(0.92 0.04 30)",
              color: "oklch(0.42 0.12 30)",
              fontFamily: "'JetBrains Mono', monospace",
              border: "1px solid oklch(0.85 0.06 30)",
            }}
          >
            ✧ {t.badge}
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.18 0.025 60)",
              letterSpacing: "-0.02em",
            }}
          >
            {t.title}
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{
              color: "oklch(0.50 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t.subtitle}
          </p>
        </header>

        {/* Notes list */}
        <div className="space-y-6">
          {sorted.map((note) => {
            const title =
              language !== "en" && note.translations?.[language as "fr" | "ptBR"]?.title
                ? note.translations[language as "fr" | "ptBR"]!.title
                : note.title;

            // Get first ~150 chars of capim commentary as preview
            const capimRaw =
              language !== "en" && note.translations?.[language as "fr" | "ptBR"]?.capimCommentary
                ? note.translations[language as "fr" | "ptBR"]!.capimCommentary
                : note.capimCommentary;
            const capimPreview = capimRaw
              .replace(/^##.*$/gm, "")
              .replace(/###.*$/gm, "")
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              .replace(/\*\*([^*]+)\*\*/g, "$1")
              .replace(/\*([^*]+)\*/g, "$1")
              .trim()
              .slice(0, 180)
              .trim() + "…";

            return (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <article
                  className="group border rounded-sm p-6 transition-all duration-300 cursor-pointer"
                  style={{
                    borderColor: "oklch(0.86 0.022 75)",
                    background: "oklch(0.99 0.008 75)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "oklch(0.65 0.08 30)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 20px oklch(0 0 0 / 0.05)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "oklch(0.86 0.022 75)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Date + badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-sm"
                      style={{
                        background: "oklch(0.92 0.04 30)",
                        color: "oklch(0.45 0.12 30)",
                        fontFamily: "'JetBrains Mono', monospace",
                        border: "1px solid oklch(0.85 0.06 30)",
                      }}
                    >
                      ✧ {t.badge}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: "oklch(0.58 0.020 70)",
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontStyle: "italic",
                      }}
                    >
                      {formatDate(note.date, language)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-200"
                    style={{
                      fontFamily: "'Lora', Georgia, serif",
                      color: "oklch(0.22 0.025 60)",
                    }}
                  >
                    {title}
                  </h2>

                  {/* Capim preview */}
                  <div
                    className="p-3 rounded-sm mb-3"
                    style={{
                      background: "oklch(0.95 0.018 78)",
                      borderLeft: "2px solid oklch(0.42 0.10 155)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={CAPIM_IMG}
                        alt="Capim"
                        className="w-5 h-5 rounded-full object-cover"
                        style={{ border: "1px solid oklch(0.86 0.022 75)" }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: "oklch(0.42 0.10 155)",
                          fontFamily: "'Source Serif 4', Georgia, serif",
                        }}
                      >
                        {t.capimSays}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{
                        color: "oklch(0.45 0.025 65)",
                        fontFamily: "'Source Serif 4', Georgia, serif",
                      }}
                    >
                      {capimPreview}
                    </p>
                  </div>

                  {/* Tags + read more */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded-sm"
                          style={{
                            background: "oklch(0.91 0.018 78)",
                            color: "oklch(0.48 0.030 70)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.65rem",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        color: "oklch(0.42 0.10 155)",
                        fontFamily: "'Source Serif 4', Georgia, serif",
                      }}
                    >
                      {t.readMore}
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
