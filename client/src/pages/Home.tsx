// The Wandering Mind — Home Page
// Design: Biopunk Minimalism — left sidebar nav, post grid with category filters
// Dark substrate with bioluminescent teal-green accents

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { blogPosts, type Category } from "@/lib/blogData";

const CATEGORY_LABELS: Record<Category | "all", string> = {
  all: "All Posts",
  philosophy: "Philosophy",
  tech: "Tech",
  nature: "Nature",
  ml: "ML",
  games: "Games",
};

const CATEGORY_GLYPHS: Record<Category, string> = {
  philosophy: "⬡",
  tech: "⬢",
  nature: "◈",
  ml: "◉",
  games: "◆",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border rounded-sm cat-${category}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em" }}
    >
      <span>{CATEGORY_GLYPHS[category]}</span>
      {category.toUpperCase()}
    </span>
  );
}

function PostCard({ post }: { post: (typeof blogPosts)[0] }) {
  return (
    <Link href={`/post/${post.id}`}>
      <article
        className="group relative border border-border rounded-sm p-5 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer bio-emerge"
        style={{
          background: "oklch(0.10 0.018 165)",
          boxShadow: "0 0 0 0 oklch(0.72 0.18 165 / 0)",
          transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 20px oklch(0.72 0.18 165 / 0.08), inset 0 0 30px oklch(0.72 0.18 165 / 0.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 0 oklch(0.72 0.18 165 / 0)";
        }}
      >
        {/* Top row: category + date */}
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={post.category} />
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.45 0.05 165)", fontFamily: "'Fira Code', monospace" }}
          >
            {formatDate(post.date)}
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-base font-semibold mb-2 leading-snug group-hover:text-primary transition-colors duration-200"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            color: "oklch(0.88 0.04 165)",
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-3"
          style={{ color: "oklch(0.58 0.05 165)" }}
        >
          {post.excerpt}
        </p>

        {/* Footer: tags + read time */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.14 0.02 165)",
                  color: "oklch(0.50 0.08 165)",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.40 0.04 165)", fontFamily: "'Fira Code', monospace" }}
          >
            {post.readTime}m read
          </span>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
          style={{ background: "oklch(0.72 0.18 165 / 0.6)" }}
        />
      </article>
    </Link>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

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
      style={{ background: "oklch(0.07 0.015 165)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "oklch(0.09 0.016 165)",
          borderColor: "oklch(0.16 0.025 165)",
        }}
      >
        {/* Logo / Title */}
        <div className="p-6 border-b" style={{ borderColor: "oklch(0.16 0.025 165)" }}>
          <div
            className="text-xs font-mono mb-1 pulse-line"
            style={{ color: "oklch(0.72 0.18 165)", fontFamily: "'Fira Code', monospace" }}
          >
            ◈ WANDERING.MIND
          </div>
          <h1
            className="text-xl font-bold bio-glow"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "oklch(0.88 0.04 165)",
              letterSpacing: "-0.03em",
            }}
          >
            The Wandering Mind
          </h1>
          <p
            className="text-xs mt-1.5 leading-relaxed"
            style={{ color: "oklch(0.45 0.05 165)" }}
          >
            Simic dispatches on nature, code, and the space between.
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div
            className="text-xs font-mono mb-3 uppercase tracking-widest"
            style={{ color: "oklch(0.38 0.04 165)", fontFamily: "'Fira Code', monospace" }}
          >
            Categories
          </div>
          <ul className="space-y-1">
            {(["all", "philosophy", "tech", "nature", "ml", "games"] as const).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-all duration-200"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    background:
                      activeCategory === cat
                        ? "oklch(0.15 0.025 165)"
                        : "transparent",
                    color:
                      activeCategory === cat
                        ? "oklch(0.72 0.18 165)"
                        : "oklch(0.58 0.05 165)",
                    borderLeft:
                      activeCategory === cat
                        ? "2px solid oklch(0.72 0.18 165)"
                        : "2px solid transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {cat !== "all" && (
                      <span style={{ color: "oklch(0.50 0.08 165)" }}>
                        {CATEGORY_GLYPHS[cat as Category]}
                      </span>
                    )}
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: "oklch(0.38 0.04 165)",
                      fontFamily: "'Fira Code', monospace",
                    }}
                  >
                    {counts[cat] || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="p-4 border-t text-xs"
          style={{
            borderColor: "oklch(0.16 0.025 165)",
            color: "oklch(0.35 0.04 165)",
            fontFamily: "'Fira Code', monospace",
          }}
        >
          <div>Deus sive Natura</div>
          <div className="mt-1">Green × Blue // Simic</div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
          style={{
            background: "oklch(0.09 0.016 165)",
            borderColor: "oklch(0.16 0.025 165)",
          }}
        >
          <h1
            className="text-lg font-bold bio-glow"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "oklch(0.88 0.04 165)",
            }}
          >
            The Wandering Mind
          </h1>
          <span
            className="text-xs font-mono pulse-line"
            style={{ color: "oklch(0.72 0.18 165)", fontFamily: "'Fira Code', monospace" }}
          >
            ◈ LIVE
          </span>
        </div>

        {/* Mobile category pills */}
        <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b" style={{ borderColor: "oklch(0.16 0.025 165)" }}>
          {(["all", "philosophy", "tech", "nature", "ml", "games"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-3 py-1 text-xs rounded-sm border transition-all duration-200"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                background: activeCategory === cat ? "oklch(0.72 0.18 165)" : "transparent",
                color: activeCategory === cat ? "oklch(0.07 0.015 165)" : "oklch(0.58 0.05 165)",
                borderColor: activeCategory === cat ? "oklch(0.72 0.18 165)" : "oklch(0.20 0.03 165)",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Post list header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ borderColor: "oklch(0.16 0.025 165)" }}
        >
          <div>
            <h2
              className="text-lg font-semibold"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: "oklch(0.88 0.04 165)",
                letterSpacing: "-0.02em",
              }}
            >
              {CATEGORY_LABELS[activeCategory]}
            </h2>
            <p
              className="text-xs mt-0.5 font-mono"
              style={{ color: "oklch(0.40 0.04 165)", fontFamily: "'Fira Code', monospace" }}
            >
              {filtered.length} dispatch{filtered.length !== 1 ? "es" : ""}
            </p>
          </div>
          <div
            className="text-xs font-mono"
            style={{ color: "oklch(0.35 0.04 165)", fontFamily: "'Fira Code', monospace" }}
          >
            sorted by recency
          </div>
        </div>

        {/* Posts grid */}
        <div className="p-6">
          {filtered.length === 0 ? (
            <div
              className="text-center py-16"
              style={{ color: "oklch(0.40 0.04 165)" }}
            >
              <div className="text-4xl mb-4" style={{ color: "oklch(0.25 0.03 165)" }}>◈</div>
              <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                No dispatches in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
