// The Wandering Mind — Post Page
// Design: Biopunk Minimalism — full-width reading view with sidebar context
// Renders markdown content as styled prose

import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { blogPosts, type Category } from "@/lib/blogData";

const CATEGORY_GLYPHS: Record<Category, string> = {
  philosophy: "⬡",
  tech: "⬢",
  nature: "◈",
  ml: "◉",
  games: "◆",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Simple markdown-to-HTML renderer (handles headings, bold, italic, code, blockquote, lists, paragraphs)
function renderMarkdown(md: string): string {
  let html = md
    // Fenced code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // H2
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // H3
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list items
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Paragraphs (double newline)
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h2>") || trimmed.startsWith("<h3>") ||
          trimmed.startsWith("<pre>") || trimmed.startsWith("<blockquote>") ||
          trimmed.startsWith("<ul>")) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const post = useMemo(
    () => blogPosts.find((p) => p.id === params.id),
    [params.id]
  );

  const renderedContent = useMemo(
    () => (post ? renderMarkdown(post.content) : ""),
    [post]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [post]);

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.07 0.015 165)" }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ color: "oklch(0.25 0.03 165)" }}>◈</div>
          <p
            className="text-lg mb-4"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "oklch(0.55 0.05 165)",
            }}
          >
            Dispatch not found.
          </p>
          <Link
            href="/"
            className="text-sm"
            style={{ color: "oklch(0.72 0.18 165)" }}
          >
            ← Return to archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.07 0.015 165)" }}
    >
      {/* Top nav bar */}
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center gap-4"
        style={{
          background: "oklch(0.09 0.016 165 / 0.95)",
          borderColor: "oklch(0.16 0.025 165)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition-colors duration-200"
          style={{ color: "oklch(0.55 0.05 165)" }}
        >
          <span>←</span>
          <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            The Wandering Mind
          </span>
        </Link>
        <span style={{ color: "oklch(0.25 0.03 165)" }}>/</span>
        <span
          className={`text-xs font-mono cat-${post.category}`}
          style={{ fontFamily: "'Fira Code', monospace" }}
        >
          {CATEGORY_GLYPHS[post.category]} {post.category.toUpperCase()}
        </span>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-mono border px-2 py-0.5 rounded-sm cat-${post.category}`}
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: "0.08em" }}
            >
              {CATEGORY_GLYPHS[post.category]} {post.category.toUpperCase()}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: "oklch(0.40 0.04 165)", fontFamily: "'Fira Code', monospace" }}
            >
              {post.readTime} min read
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold mb-4 leading-tight bio-glow"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "oklch(0.92 0.04 165)",
              letterSpacing: "-0.03em",
            }}
          >
            {post.title}
          </h1>

          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: "oklch(0.60 0.06 165)", fontStyle: "italic" }}
          >
            {post.excerpt}
          </p>

          <div
            className="flex items-center gap-3 text-xs font-mono pb-6 border-b"
            style={{
              color: "oklch(0.40 0.04 165)",
              borderColor: "oklch(0.16 0.025 165)",
              fontFamily: "'Fira Code', monospace",
            }}
          >
            <span>{formatDate(post.date)}</span>
            <span style={{ color: "oklch(0.25 0.03 165)" }}>·</span>
            <span>dispatch #{post.id}</span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose-bio"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Tags */}
        <div
          className="mt-10 pt-6 border-t flex flex-wrap gap-2"
          style={{ borderColor: "oklch(0.16 0.025 165)" }}
        >
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: "oklch(0.12 0.018 165)",
                color: "oklch(0.50 0.08 165)",
                fontFamily: "'Fira Code', monospace",
                border: "1px solid oklch(0.18 0.025 165)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section
          className="max-w-2xl mx-auto px-6 pb-16"
        >
          <div
            className="border-t pt-8"
            style={{ borderColor: "oklch(0.16 0.025 165)" }}
          >
            <h3
              className="text-xs font-mono uppercase tracking-widest mb-4"
              style={{
                color: "oklch(0.40 0.04 165)",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              More in {post.category}
            </h3>
            <div className="space-y-3">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/post/${rp.id}`}>
                  <div
                    className="group flex items-start gap-3 p-3 rounded-sm border transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: "oklch(0.16 0.025 165)",
                      background: "oklch(0.09 0.016 165)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.72 0.18 165 / 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.16 0.025 165)";
                    }}
                  >
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: "oklch(0.35 0.04 165)" }}
                    >
                      {CATEGORY_GLYPHS[rp.category]}
                    </span>
                    <div>
                      <div
                        className="text-sm font-medium group-hover:text-primary transition-colors duration-200"
                        style={{
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          color: "oklch(0.80 0.04 165)",
                        }}
                      >
                        {rp.title}
                      </div>
                      <div
                        className="text-xs mt-0.5 font-mono"
                        style={{
                          color: "oklch(0.40 0.04 165)",
                          fontFamily: "'Fira Code', monospace",
                        }}
                      >
                        {new Date(rp.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
