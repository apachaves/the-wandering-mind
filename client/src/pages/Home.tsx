// The Wandering Mind — Home Page
// Design: Warm Naturalist — parchment sidebar, serif typography, cozy card grid
// Mood: calm, intellectual, like browsing a well-curated library

import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { blogPosts, type Category } from "@/lib/blogData";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedPost } from "@/lib/getLocalizedPost";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

const PAGE_TITLE = "The Wandering Mind \u2014 Notes on Nature, Technology & Philosophy";

const CATEGORY_LABELS: Record<Category | "all", string> = {
  all: "All Notes",
  philosophy: "Philosophy",
  tech: "Technology",
  nature: "Nature",
  ml: "Machine Learning",
  games: "Games & Fiction",
};

const CATEGORY_ICONS: Record<Category, string> = {
  philosophy: "◎",
  tech: "⌘",
  nature: "❧",
  ml: "∿",
  games: "◈",
};

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr);
  const locale = lang === "fr" ? "fr-FR" : lang === "ptBR" ? "pt-BR" : "en-US";
  return d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border rounded-sm cat-${category}`}
      style={{ fontFamily: "'Lora', Georgia, serif", letterSpacing: "0.03em" }}
    >
      <span className="text-[10px]">{CATEGORY_ICONS[category]}</span>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

function PostCard({ post, index }: { post: (typeof blogPosts)[0]; index: number }) {
  const { language } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <Link href={`/post/${post.id}`}>
      <article
        className="group relative border border-border rounded-sm bg-card hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden gentle-emerge"
        style={{
          animationDelay: `${index * 0.05}s`,
          animationFillMode: "both",
        }}
      >
        {/* Capybara image strip — if available */}
        {post.capybaraImage && (
          <div className="w-full h-36 overflow-hidden">
            <img
              src={post.capybaraImage}
              alt={`Illustration for: ${localized.title}`}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-5">
          {/* Top row: category + date */}
          <div className="flex items-center justify-between mb-3">
            <CategoryBadge category={post.category} />
            <span
              className="text-xs"
              style={{
                color: "oklch(0.58 0.020 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {formatDate(post.date, language)}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-base font-semibold mb-2 leading-snug group-hover:text-primary transition-colors duration-200"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.20 0.025 60)",
              letterSpacing: "-0.01em",
            }}
          >
            {localized.title}
          </h2>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed mb-4 line-clamp-3"
            style={{
              color: "oklch(0.45 0.022 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            {localized.excerpt}
          </p>

          {/* Footer: tags + read time */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: "oklch(0.91 0.018 78)",
                    color: "oklch(0.48 0.030 70)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.7rem",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span
              className="text-xs"
              style={{
                color: "oklch(0.62 0.018 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {post.readTime} min
            </span>
          </div>
        </div>

        {/* Bottom accent line on hover */}
        <div
          className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
          style={{ background: "oklch(0.42 0.10 155 / 0.5)" }}
        />
      </article>
    </Link>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const { language } = useLanguage();

  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...blogPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (activeCategory === "all") return sorted;
    return sorted.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: blogPosts.length };
    blogPosts.forEach((p) => {
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.97 0.012 80)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "oklch(0.95 0.018 78)",
          borderColor: "oklch(0.86 0.022 75)",
        }}
      >
        {/* Mascot + Title */}
        <div className="p-6 border-b" style={{ borderColor: "oklch(0.86 0.022 75)" }}>
          {/* Capybara mascot */}
          <div className="mb-4 flex justify-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png"
              alt="The Wandering Mind mascot — a cozy capybara"
              className="w-28 h-28 object-cover rounded-full"
              style={{
                border: "3px solid oklch(0.86 0.022 75)",
                boxShadow: "0 2px 12px oklch(0.42 0.10 155 / 0.12)",
              }}
            />
          </div>

          <h1
            className="text-xl font-bold text-center"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.20 0.025 60)",
              letterSpacing: "-0.02em",
            }}
          >
            The Wandering Mind
          </h1>
          <p
            className="text-xs mt-2 text-center leading-relaxed"
            style={{
              color: "oklch(0.52 0.025 70)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            Notes on nature, technology,<br />and the space between.
          </p>

          {/* Language switcher */}
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{
              color: "oklch(0.62 0.018 70)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Browse
          </div>
          <ul className="space-y-0.5">
            {(["all", "philosophy", "tech", "nature", "ml", "games"] as const).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm transition-all duration-200"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    background:
                      activeCategory === cat
                        ? "oklch(0.90 0.030 145)"
                        : "transparent",
                    color:
                      activeCategory === cat
                        ? "oklch(0.35 0.10 155)"
                        : "oklch(0.40 0.025 65)",
                    borderLeft:
                      activeCategory === cat
                        ? "2px solid oklch(0.42 0.10 155)"
                        : "2px solid transparent",
                    fontWeight: activeCategory === cat ? "500" : "400",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {cat !== "all" && (
                      <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {CATEGORY_ICONS[cat as Category]}
                      </span>
                    )}
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: "oklch(0.65 0.015 70)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {counts[cat] || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar links */}
        <div className="px-4 pb-2 space-y-0.5">
          {[
            { href: "/notes", icon: "✧", label: "Anderson's Notes" },
            { href: "/about", icon: "✦", label: "About Us" },
            { href: "/support", icon: "♡", label: "Support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm w-full transition-all duration-200"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "oklch(0.40 0.025 65)",
                borderLeft: "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "oklch(0.90 0.030 145)";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.35 0.10 155)";
                (e.currentTarget as HTMLElement).style.borderLeftColor = "oklch(0.42 0.10 155)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.40 0.025 65)";
                (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
              }}
            >
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-5 border-t"
          style={{ borderColor: "oklch(0.86 0.022 75)" }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{
              color: "oklch(0.60 0.020 70)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            "The question is not whether to intervene in nature — we've been intervening for ten thousand years. The question is how to intervene wisely."
          </p>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {/* Mobile header with navigation menu */}
        <MobileNav />

        {/* Mobile category pills */}
        <div
          className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b"
          style={{ borderColor: "oklch(0.86 0.022 75)" }}
        >
          {(["all", "philosophy", "tech", "nature", "ml", "games"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-3 py-1.5 text-xs rounded-sm border transition-all duration-200"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                background: activeCategory === cat ? "oklch(0.42 0.10 155)" : "transparent",
                color: activeCategory === cat ? "oklch(0.97 0.008 80)" : "oklch(0.45 0.025 65)",
                borderColor: activeCategory === cat ? "oklch(0.42 0.10 155)" : "oklch(0.86 0.022 75)",
              }}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div
          className="px-6 py-5 border-b flex items-end justify-between"
          style={{ borderColor: "oklch(0.86 0.022 75)" }}
        >
          <div>
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                color: "oklch(0.20 0.025 60)",
                letterSpacing: "-0.02em",
              }}
            >
              {CATEGORY_LABELS[activeCategory]}
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{
                color: "oklch(0.60 0.020 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {filtered.length} {filtered.length === 1 ? "note" : "notes"}, sorted by recency
            </p>
          </div>
        </div>

        {/* Posts grid */}
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="text-4xl mb-4"
                style={{ color: "oklch(0.80 0.020 75)" }}
              >
                ❧
              </div>
              <p
                style={{
                  color: "oklch(0.55 0.020 70)",
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                No notes in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
