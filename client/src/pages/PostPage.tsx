// The Wandering Mind — Post Page
// Design: Warm Naturalist — full reading view with capybara illustration
// Renders markdown content as warm prose

import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { blogPosts, type Category } from "@/lib/blogData";

const CATEGORY_ICONS: Record<Category, string> = {
  philosophy: "◎",
  tech: "⌘",
  nature: "❧",
  ml: "∿",
  games: "◈",
};

const CATEGORY_LABELS: Record<Category, string> = {
  philosophy: "Philosophy",
  tech: "Technology",
  nature: "Nature",
  ml: "Machine Learning",
  games: "Games & Fiction",
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

// Markdown renderer: headings, bold, italic, links, code, blockquote, lists, paragraphs
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
    // Italic (but not inside links)
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    // Markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list items
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Paragraphs
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
        trimmed.startsWith("<ul>")
      ) {
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
        style={{ background: "oklch(0.97 0.012 80)" }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ color: "oklch(0.80 0.020 75)" }}>❧</div>
          <p
            className="text-lg mb-4"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "oklch(0.52 0.025 70)",
              fontStyle: "italic",
            }}
          >
            This entry could not be found.
          </p>
          <Link
            href="/"
            style={{
              color: "oklch(0.38 0.10 155)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              textDecoration: "underline",
            }}
          >
            ← Return to the archive
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
      {/* Top nav */}
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.97 0.012 80 / 0.92)",
          borderColor: "oklch(0.86 0.022 75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition-colors duration-200"
          style={{
            color: "oklch(0.52 0.025 70)",
            fontFamily: "'Source Serif 4', Georgia, serif",
          }}
        >
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png"
            alt="Home"
            className="w-6 h-6 rounded-full object-cover"
            style={{ border: "1px solid oklch(0.86 0.022 75)" }}
          />
          <span>The Wandering Mind</span>
        </Link>
        <span style={{ color: "oklch(0.75 0.015 70)" }}>/</span>
        <span
          className={`text-xs border px-2 py-0.5 rounded-sm cat-${post.category}`}
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category]}
        </span>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs border px-2.5 py-0.5 rounded-sm cat-${post.category}`}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category]}
            </span>
            <span
              className="text-xs"
              style={{
                color: "oklch(0.60 0.020 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {post.readTime} min read
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
            {post.title}
          </h1>

          <p
            className="text-base leading-relaxed mb-5"
            style={{
              color: "oklch(0.45 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {post.excerpt}
          </p>

          <div
            className="flex items-center gap-3 text-xs pb-6 border-b"
            style={{
              color: "oklch(0.60 0.018 70)",
              borderColor: "oklch(0.86 0.022 75)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            <span>{formatDate(post.date)}</span>
          </div>
        </header>

        {/* Capybara illustration */}
        {post.capybaraImage && (
          <div
            className="mb-10 rounded-sm overflow-hidden"
            style={{
              border: "1px solid oklch(0.86 0.022 75)",
              boxShadow: "0 2px 16px oklch(0.42 0.10 155 / 0.08)",
            }}
          >
            <img
              src={post.capybaraImage}
              alt={`Illustration for: ${post.title}`}
              className="w-full"
              style={{ display: "block" }}
            />
            <div
              className="px-4 py-2 text-xs text-center"
              style={{
                background: "oklch(0.95 0.018 78)",
                color: "oklch(0.60 0.020 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
                borderTop: "1px solid oklch(0.86 0.022 75)",
              }}
            >
              Our capybara contemplates the themes of this dispatch.
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose-warm"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Tags */}
        <div
          className="mt-10 pt-6 border-t flex flex-wrap gap-2"
          style={{ borderColor: "oklch(0.86 0.022 75)" }}
        >
          {post.tags.map((tag) => (
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
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <div
            className="border-t pt-8"
            style={{ borderColor: "oklch(0.86 0.022 75)" }}
          >
            <h3
              className="text-xs uppercase tracking-widest mb-5"
              style={{
                color: "oklch(0.60 0.018 70)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              More in {CATEGORY_LABELS[post.category]}
            </h3>
            <div className="space-y-3">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/post/${rp.id}`}>
                  <div
                    className="group flex items-start gap-3 p-4 rounded-sm border transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: "oklch(0.86 0.022 75)",
                      background: "oklch(0.99 0.008 75)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.42 0.10 155 / 0.5)";
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(0.97 0.015 145)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.86 0.022 75)";
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(0.99 0.008 75)";
                    }}
                  >
                    {rp.capybaraImage && (
                      <img
                        src={rp.capybaraImage}
                        alt=""
                        className="w-14 h-10 rounded-sm object-cover shrink-0"
                        style={{ border: "1px solid oklch(0.86 0.022 75)" }}
                      />
                    )}
                    <div>
                      <div
                        className="text-sm font-medium group-hover:text-primary transition-colors duration-200"
                        style={{
                          fontFamily: "'Lora', Georgia, serif",
                          color: "oklch(0.25 0.025 60)",
                        }}
                      >
                        {rp.title}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{
                          color: "oklch(0.60 0.018 70)",
                          fontFamily: "'Source Serif 4', Georgia, serif",
                          fontStyle: "italic",
                        }}
                      >
                        {new Date(rp.date).toLocaleDateString("en-US", {
                          month: "long",
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
