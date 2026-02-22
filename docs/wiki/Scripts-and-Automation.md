# Scripts and Automation

## Overview

The blog includes three Python scripts in the `scripts/` directory that automate content generation, translation, and export.

## `generate_daily_posts.py`

Generates one new blog post per category (5 total) using an LLM API.

### Usage

```bash
cd /path/to/the-wandering-mind
python3 scripts/generate_daily_posts.py
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | API key for the LLM endpoint |
| `OPENAI_BASE_URL` | No | Custom base URL (defaults to OpenAI) |

### What It Does

1. Reads `blogData.ts` to find existing post IDs and topics
2. Generates 5 new posts (one per category) that avoid repeating existing topics
3. Each post includes citations, current events, and a capybara image prompt
4. Appends new posts to `blogData.ts` before the auto-generated marker
5. Generates a capybara illustration for each post using the image generation API

### Post Quality Guidelines

The script instructs the LLM to:
- Write 800-1200 words of substantive content
- Include 3-5 inline citations with HTTPS links
- Reference at least one current event (2022-2026)
- Use markdown formatting: headings, bold, italic, blockquotes, lists
- Maintain the blog's calm, intellectual, cozy tone

## `translate_posts.py`

Translates all untranslated posts to French and Brazilian Portuguese.

### Usage

```bash
python3 scripts/translate_posts.py
```

### What It Does

1. Scans `blogData.ts` for posts without a `translations` field
2. Translates each post's title, excerpt, and content to French and pt-BR
3. Injects the translations as a `translations` object on each post
4. Preserves all markdown formatting, links, and citations

## `export_posts_markdown.py`

Exports all posts as standalone Markdown files and verifies link safety.

### Usage

```bash
python3 scripts/export_posts_markdown.py
```

### What It Does

1. Parses all posts from `blogData.ts`
2. Creates Markdown files organized by language and category: `posts/{lang}/{category}/{id}.md`
3. Each file includes YAML-style frontmatter (title, date, category, tags, read time)
4. Verifies all URLs are HTTPS and checks for HTTP response codes
5. Reports any unsafe or broken links

## Daily Pipeline

The recommended daily pipeline is:

```bash
# 1. Generate new posts
python3 scripts/generate_daily_posts.py

# 2. Translate new posts
python3 scripts/translate_posts.py

# 3. Export to Markdown
python3 scripts/export_posts_markdown.py

# 4. Build the site
pnpm build

# 5. Commit and push
git add -A && git commit -m "Daily posts: $(date +%Y-%m-%d)" && git push
```

This can be automated via a GitHub Action, cron job, or scheduled task.
