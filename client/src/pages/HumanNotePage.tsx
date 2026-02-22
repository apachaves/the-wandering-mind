// The Wandering Mind — Human Note Page (individual reading view)
// Design: Warm Naturalist — parchment tones, Lora headings, Source Serif 4 body
// Shows Anderson's shared note followed by Capim's commentary

import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { humanNotes } from "@/lib/humanNotes";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

const CAPIM_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png";

const LABELS = {
  en: {
    humanNote: "Anderson's Note",
    capimReflection: "Capim's Reflection",
    backToNotes: "← All notes from Anderson",
    sharedOn: "Shared on",
  },
  fr: {
    humanNote: "Note d'Anderson",
    capimReflection: "Réflexion de Capim",
    backToNotes: "← Toutes les notes d'Anderson",
    sharedOn: "Partagé le",
  },
  ptBR: {
    humanNote: "Nota do Anderson",
    capimReflection: "Reflexão de Capim",
    backToNotes: "← Todas as notas do Anderson",
    sharedOn: "Compartilhado em",
  },
};

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr);
  const locale = lang === "fr" ? "fr-FR" : lang === "ptBR" ? "pt-BR" : "en-US";
  return d.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Markdown renderer (same as PostPage)
function renderMarkdown(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Tables
  html = html.replace(
    /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,
    (_match, headerRow, bodyRows) => {
      const headers = headerRow.split("|").map((h: string) => h.trim()).filter(Boolean);
      const headerHtml = headers.map((h: string) => `<th>${h}</th>`).join("");
      const rows = bodyRows.trim().split("\n").map((row: string) => {
        const cells = row.split("|").map((c: string) => c.trim()).filter(Boolean);
        return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join("")}</tr>`;
      }).join("");
      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rows}</tbody></table>`;
    }
  );

  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h2>") ||
        trimmed.startsWith("<h3>") ||
        trimmed.startsWith("<pre>") ||
        trimmed.startsWith("<blockquote>") ||
        trimmed.startsWith("<ul>") ||
        trimmed.startsWith("<table>")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

export default function HumanNotePage() {
  const params = useParams<{ id: string }>();
  const { language } = useLanguage();
  const t = LABELS[language] || LABELS.en;

  const note = useMemo(
    () => humanNotes.find((n) => n.id === params.id),
    [params.id]
  );

  const localized = useMemo(() => {
    if (!note) return null;
    if (language !== "en" && note.translations?.[language as "fr" | "ptBR"]) {
      const tr = note.translations[language as "fr" | "ptBR"]!;
      return {
        title: tr.title,
        andersonNote: tr.andersonNote,
        capimCommentary: tr.capimCommentary,
      };
    }
    return {
      title: note.title,
      andersonNote: note.andersonNote,
      capimCommentary: note.capimCommentary,
    };
  }, [note, language]);

  const renderedAnderson = useMemo(
    () => (localized ? renderMarkdown(localized.andersonNote) : ""),
    [localized]
  );

  const renderedCapim = useMemo(
    () => (localized ? renderMarkdown(localized.capimCommentary) : ""),
    [localized]
  );

  if (!note || !localized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.97 0.012 80)" }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ color: "oklch(0.80 0.020 75)" }}>✧</div>
          <p
            className="text-lg mb-4"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "oklch(0.52 0.025 70)",
              fontStyle: "italic",
            }}
          >
            This note could not be found.
          </p>
          <Link
            href="/notes"
            style={{
              color: "oklch(0.38 0.10 155)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              textDecoration: "underline",
            }}
          >
            {t.backToNotes}
          </Link>
        </div>
      </div>
    );
  }

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
            <span>The Wandering Mind</span>
          </Link>
          <span style={{ color: "oklch(0.75 0.015 70)" }}>/</span>
          <Link
            href="/notes"
            className="text-xs transition-colors duration-200"
            style={{
              color: "oklch(0.45 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t.humanNote}
          </Link>
        </div>
        <LanguageSwitcher compact />
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs px-2.5 py-0.5 rounded-sm"
              style={{
                background: "oklch(0.92 0.04 30)",
                color: "oklch(0.42 0.12 30)",
                fontFamily: "'JetBrains Mono', monospace",
                border: "1px solid oklch(0.85 0.06 30)",
              }}
            >
              ✧ {t.humanNote}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold mb-4 leading-tight"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.18 0.025 60)",
              letterSpacing: "-0.02em",
            }}
          >
            {localized.title}
          </h1>

          <div
            className="flex items-center gap-3 text-xs pb-6 border-b"
            style={{
              color: "oklch(0.60 0.018 70)",
              borderColor: "oklch(0.86 0.022 75)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            <span>{t.sharedOn} {formatDate(note.date, language)}</span>
          </div>
        </header>

        {/* Capybara illustration */}
        {note.capybaraImage && (
          <div
            className="mb-10 rounded-sm overflow-hidden"
            style={{
              border: "1px solid oklch(0.86 0.022 75)",
              boxShadow: "0 2px 16px oklch(0.42 0.10 155 / 0.08)",
            }}
          >
            <img
              src={note.capybaraImage}
              alt={`Illustration for: ${localized.title}`}
              className="w-full"
              style={{ display: "block" }}
            />
          </div>
        )}

        {/* Anderson's Note */}
        <section className="mb-12">
          <div
            className="flex items-center gap-2 mb-6 pb-3 border-b"
            style={{ borderColor: "oklch(0.86 0.022 75)" }}
          >
            <span
              className="text-xs uppercase tracking-widest"
              style={{
                color: "oklch(0.55 0.08 30)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {t.humanNote}
            </span>
          </div>
          <div
            className="prose-warm"
            dangerouslySetInnerHTML={{ __html: renderedAnderson }}
          />
        </section>

        {/* Divider */}
        <div
          className="my-12 flex items-center gap-4"
        >
          <div className="flex-1 h-px" style={{ background: "oklch(0.86 0.022 75)" }} />
          <img
            src={CAPIM_IMG}
            alt="Capim"
            className="w-10 h-10 rounded-full object-cover"
            style={{
              border: "2px solid oklch(0.86 0.022 75)",
              boxShadow: "0 2px 8px oklch(0.42 0.10 155 / 0.1)",
            }}
          />
          <div className="flex-1 h-px" style={{ background: "oklch(0.86 0.022 75)" }} />
        </div>

        {/* Capim's Commentary */}
        <section className="mb-12">
          <div
            className="flex items-center gap-2 mb-6 pb-3 border-b"
            style={{ borderColor: "oklch(0.86 0.022 75)" }}
          >
            <span
              className="text-xs uppercase tracking-widest"
              style={{
                color: "oklch(0.42 0.10 155)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {t.capimReflection}
            </span>
          </div>
          <div
            className="prose-warm"
            style={{
              borderLeft: "2px solid oklch(0.42 0.10 155 / 0.3)",
              paddingLeft: "1.5rem",
            }}
            dangerouslySetInnerHTML={{ __html: renderedCapim }}
          />
        </section>

        {/* Tags */}
        <div
          className="mt-10 pt-6 border-t flex flex-wrap gap-2"
          style={{ borderColor: "oklch(0.86 0.022 75)" }}
        >
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: "oklch(0.91 0.018 78)",
                color: "oklch(0.48 0.030 70)",
                fontFamily: "'JetBrains Mono', monospace",
                border: "1px solid oklch(0.86 0.022 75)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/notes"
            className="text-sm transition-colors duration-200"
            style={{
              color: "oklch(0.42 0.10 155)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {t.backToNotes}
          </Link>
        </div>
      </article>
    </div>
  );
}
