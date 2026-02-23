# Translation Strategy Analysis — Capim

## The Three Options

### Option A: Pre-translated posts at generation time
Each daily run of `generate_daily_posts.py` produces the post in EN, FR, and PT-BR simultaneously. All three versions are stored in `blogData.ts`. The reader picks a language and reads a fully pre-rendered translation.

**Pros:**
- Highest content quality — the AI translates in the same session as writing, preserving tone, nuance, and philosophical vocabulary
- Zero latency for the reader — no loading spinner, no API call
- Works offline / in static deployments with no backend
- Translations can be reviewed, edited, and version-controlled as Markdown files in the repo
- SEO-friendly — each language version is indexable

**Cons:**
- Data size grows ~3x (each post stores 3 content strings)
- Generation script takes ~3x longer per run (3 API calls per post instead of 1)
- If a post is edited after generation, all 3 translations must be re-synced

### Option B: Real-time client-side translation (browser API or third-party)
A "Translate" button calls an API (Google Translate, DeepL, or an LLM endpoint) on demand.

**Pros:**
- No storage overhead — only English is stored
- Scales to any number of languages trivially

**Cons:**
- Translation quality is significantly lower for philosophical/technical prose — machine translation struggles with nuance, metaphor, and domain-specific vocabulary
- Adds latency (1-5 seconds per post)
- Requires a backend or API key exposed to the client (security risk, or requires upgrading to web-db-user)
- Translations are ephemeral — can't be reviewed, edited, or version-controlled
- Reader experience is degraded: they see English first, then a flash of translated content
- API costs scale with readership, not with content volume

### Option C: Hybrid — pre-translate at generation time, with a fallback to real-time for new/unfinished translations
Store pre-translations when available; if a translation is missing, offer a "translate on demand" button.

**Pros:**
- Best of both worlds in theory

**Cons:**
- Complexity is high for marginal benefit
- Inconsistent UX — some posts load instantly in FR, others require a spinner
- Two code paths to maintain

## Decision

**Option A (pre-translated at generation time) is the clear winner** for this project, given the priorities:

1. **Content quality**: The blog's voice is intellectual, nuanced, and full of philosophical vocabulary. Machine translation APIs (Option B) consistently flatten this kind of prose. Pre-translating with the same LLM that writes the post — in the same session, with the same context — produces dramatically better results.

2. **Reader experience**: Zero friction. The reader selects their language and everything is already there. No spinners, no API calls, no degraded first-render.

3. **Content management**: Translations live in the same data structure as the original, are version-controlled in Git, and can be exported as Markdown files. This is simpler to manage than an API-dependent system.

4. **Risk mitigation**: The ~3x data growth is manageable — blog posts are text, not media. Even 100 posts × 3 languages × ~5KB each = ~1.5MB, well within static site limits. The generation script already takes ~30 seconds per post; adding 2 more translations per post adds ~60 seconds, which is acceptable for a daily batch job.

5. **No backend required**: The blog stays as a pure static site. No API keys, no proxy, no runtime costs.

## Implementation Plan

- Extend `BlogPost` type with `translations: { fr: { title, excerpt, content }, ptBR: { title, excerpt, content } }`
- Add a language selector (EN / FR / PT-BR) to the UI — persistent via localStorage
- Update `PostPage` and `PostCard` to read from the active language
- Update `generate_daily_posts.py` to produce all 3 languages per post
- Translate the 5 existing seed posts
