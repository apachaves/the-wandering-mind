# Multilingual Support

## Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | Primary (all content written in English first) |
| `fr` | French (France) | Pre-translated at generation time |
| `ptBR` | Brazilian Portuguese | Pre-translated at generation time |

## Architecture Decision

We chose **pre-translation at generation time** over real-time machine translation for several reasons:

1. **Quality**: The blog's intellectual, philosophical tone requires nuanced translation. Real-time services (Google Translate, DeepL) flatten literary prose. By using the same LLM that writes the posts, translations preserve metaphor, tone, and domain vocabulary.

2. **Zero latency**: Readers switch languages instantly — no loading spinners, no API calls, no third-party dependencies.

3. **Version control**: All translations are stored in `blogData.ts` and exported as Markdown files. They can be reviewed, corrected, and tracked in git.

4. **Offline capability**: Since translations are baked into the static site, the blog works without any external services.

## How It Works

### Data Model

Each post has an optional `translations` field:

```typescript
interface BlogPost {
  id: string;
  title: string;
  content: string;  // Markdown, English
  // ...
  translations?: {
    fr?: { title: string; excerpt: string; content: string };
    ptBR?: { title: string; excerpt: string; content: string };
  };
}
```

### Language Context

The `LanguageContext` (React context) stores the user's language preference in `localStorage`. The `LanguageSwitcher` component appears on every page.

### Localization Helper

The `getLocalizedPost()` function returns the appropriate title, excerpt, and content based on the active language, falling back to English if a translation is missing.

## Adding a New Language

1. Add the language code and instructions to `LANGUAGES` in `translate_posts.py`
2. Add the language option to `LanguageSwitcher.tsx`
3. Add the language to `LanguageContext.tsx`
4. Add localized labels to each page component's `LABELS` object
5. Run `python3 scripts/translate_posts.py` to generate translations for all existing posts
