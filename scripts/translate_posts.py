#!/usr/bin/env python3
"""
The Wandering Mind — Post Translation Script
=============================================
Translates all existing blog posts to French and Brazilian Portuguese.
Injects translations into blogData.ts as a `translations` field on each post.

Usage:
    python3 scripts/translate_posts.py

Environment variables required:
    OPENAI_API_KEY   — OpenAI API key (or compatible endpoint key)
    OPENAI_BASE_URL  — Optional: custom base URL
"""

import os
import re
import json
import sys
import time
from pathlib import Path

import requests

# ── Configuration ──────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DATA_FILE = PROJECT_ROOT / "client" / "src" / "lib" / "blogData.ts"

API_KEY = os.environ.get("OPENAI_API_KEY") or os.environ.get("BUILT_IN_FORGE_API_KEY") or ""
BASE_URL = (
    os.environ.get("OPENAI_BASE_URL")
    or os.environ.get("BUILT_IN_FORGE_API_URL")
    or "https://api.openai.com/v1"
).rstrip("/")

COMPLETIONS_URL = f"{BASE_URL}/chat/completions"
MODEL = "gpt-4.1-mini"

LANGUAGES = {
    "fr": {
        "name": "French",
        "instructions": "Translate to French (France). Use natural, literary French appropriate for an intellectual blog. Preserve philosophical nuance and technical terms where appropriate. Keep markdown formatting, links, and code blocks intact."
    },
    "ptBR": {
        "name": "Brazilian Portuguese",
        "instructions": "Translate to Brazilian Portuguese (pt-BR). Use natural, literary Brazilian Portuguese appropriate for an intellectual blog. Preserve philosophical nuance and technical terms where appropriate. Keep markdown formatting, links, and code blocks intact."
    }
}


def extract_posts_with_positions(content: str) -> list[dict]:
    """Extract post IDs, titles, excerpts, and content with their positions in the file."""
    posts = []
    # Find each post object block by looking for id: patterns
    pattern = re.compile(
        r'(\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{|\n\];))',
        re.DOTALL
    )
    
    for match in pattern.finditer(content):
        block = match.group(1)
        post_id = match.group(2)
        start = match.start()
        end = match.end()
        
        # Extract title
        title_m = re.search(r'title:\s*"([^"]+)"', block)
        # Extract excerpt
        excerpt_m = re.search(r'excerpt:\s*"([^"]+)"', block)
        # Extract content (template literal)
        content_m = re.search(r'content:\s*`([\s\S]*?)`', block)
        
        if title_m and excerpt_m and content_m:
            posts.append({
                "id": post_id,
                "title": title_m.group(1),
                "excerpt": excerpt_m.group(1),
                "content": content_m.group(1),
                "start": start,
                "end": end,
                "has_translations": "translations:" in block,
            })
    
    return posts


def translate_post(post: dict, lang_code: str, lang_info: dict) -> dict | None:
    """Translate a post's title, excerpt, and content to the target language."""
    system_prompt = f"""You are a professional literary translator for The Wandering Mind blog.

{lang_info['instructions']}

RULES:
- Translate the title, excerpt, and full content
- Preserve ALL markdown formatting: ## headings, **bold**, *italic*, [links](urls), `code`, blockquotes, lists
- Do NOT translate URLs or code snippets
- Do NOT translate proper nouns (names of people, specific technologies, etc.) unless they have established translations
- Keep the same intellectual, calm, cozy tone
- Preserve citation formats: [text](url) and (Book: "Title" by Author, Year)
- For book titles: keep the original title in quotes, add the translated title in parentheses if a well-known translation exists

OUTPUT FORMAT: Respond with ONLY a valid JSON object (no markdown wrapper):
{{
  "title": "translated title",
  "excerpt": "translated excerpt",
  "content": "translated full markdown content"
}}"""

    user_msg = f"""Translate this blog post to {lang_info['name']}:

TITLE: {post['title']}

EXCERPT: {post['excerpt']}

CONTENT:
{post['content']}"""

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_msg},
        ],
        "temperature": 0.3,  # Lower temp for more faithful translations
        "max_tokens": 3000,
    }

    try:
        resp = requests.post(COMPLETIONS_URL, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"].strip()
        
        # Strip markdown fences if present
        raw = re.sub(r'^```(?:json)?\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw.strip())
        
        result = json.loads(raw)
        for field in ["title", "excerpt", "content"]:
            if field not in result:
                raise ValueError(f"Missing field: {field}")
        
        return result
    except requests.RequestException as e:
        print(f"    ✗ API error: {e}")
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        print(f"    ✗ Parse error: {e}")
        if 'raw' in locals():
            print(f"      Raw (first 300 chars): {raw[:300]}")
    return None


def escape_ts_template(s: str) -> str:
    """Escape a string for use inside a TypeScript template literal."""
    s = s.replace("\\", "\\\\")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


def escape_ts_string(s: str) -> str:
    """Escape a string for use inside a TypeScript double-quoted string."""
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    return s


def build_translations_block(translations: dict) -> str:
    """Build the TypeScript translations object literal."""
    parts = []
    for lang_code, data in translations.items():
        title = escape_ts_string(data["title"])
        excerpt = escape_ts_string(data["excerpt"])
        content = escape_ts_template(data["content"])
        parts.append(f"""      {lang_code}: {{
        title: "{title}",
        excerpt: "{excerpt}",
        content: `{content}`,
      }}""")
    
    return "    translations: {\n" + ",\n".join(parts) + "\n    },"


def inject_translations(content: str, post_id: str, translations_block: str) -> str:
    """Inject translations into a specific post in blogData.ts."""
    # Find the post block by its id
    # Look for the closing of the post object (before the next post or end of array)
    # We'll insert the translations block before the closing }
    
    # Pattern: find the post by id, then find its capybaraImage or readTime line (last field before })
    id_pattern = re.compile(
        r'(id:\s*"' + re.escape(post_id) + r'".*?)((\s*capybaraImage:[^\n]*\n)|(\s*readTime:\s*\d+,\s*\n))',
        re.DOTALL
    )
    
    # Simpler approach: find the post block and insert before its closing }
    # Find `id: "post_id"` then find the next `  }` or `  },`
    post_start = content.find(f'id: "{post_id}"')
    if post_start == -1:
        print(f"    ✗ Could not find post {post_id}")
        return content
    
    # Check if translations already exist for this post
    # Find the closing brace of this post object
    brace_depth = 0
    i = content.rfind("{", 0, post_start)  # Find the opening { before the id
    search_start = i
    
    for j in range(i, len(content)):
        if content[j] == "{":
            brace_depth += 1
        elif content[j] == "}":
            brace_depth -= 1
            if brace_depth == 0:
                # This is the closing } of the post object
                post_end = j
                break
    
    post_block = content[search_start:post_end + 1]
    
    # Remove existing translations if present
    if "translations:" in post_block:
        # Remove old translations block
        trans_start = post_block.find("translations:")
        # Find the matching closing brace
        depth = 0
        started = False
        for k in range(trans_start, len(post_block)):
            if post_block[k] == "{":
                depth += 1
                started = True
            elif post_block[k] == "}":
                depth -= 1
                if started and depth == 0:
                    trans_end = k + 1
                    # Also remove trailing comma and whitespace
                    while trans_end < len(post_block) and post_block[trans_end] in ",\n ":
                        trans_end += 1
                    old_trans = post_block[trans_start:trans_end]
                    post_block = post_block[:trans_start] + post_block[trans_end:]
                    content = content[:search_start] + post_block + content[post_end + 1:]
                    # Recalculate post_end
                    post_end = search_start + len(post_block) - 1
                    break
    
    # Insert translations before the closing }
    # Find the last real field line before }
    insert_pos = search_start + len(content[search_start:post_end].rstrip())
    
    # Actually, just insert before the closing }
    close_brace_pos = content.rfind("}", search_start, post_end + 1)
    if close_brace_pos == -1:
        close_brace_pos = post_end
    
    new_content = content[:close_brace_pos] + "\n" + translations_block + "\n  " + content[close_brace_pos:]
    
    return new_content


def main():
    print("=" * 60)
    print("The Wandering Mind — Post Translation Script")
    print(f"Model: {MODEL}")
    print(f"API: {'SET' if API_KEY else 'NOT SET'}")
    print("=" * 60)

    if not API_KEY:
        print("✗ No API key. Set OPENAI_API_KEY.")
        sys.exit(1)

    if not BLOG_DATA_FILE.exists():
        print(f"✗ blogData.ts not found at {BLOG_DATA_FILE}")
        sys.exit(1)

    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    posts = extract_posts_with_positions(content)
    print(f"\n✓ Found {len(posts)} posts to translate")

    # Filter to posts that don't already have translations
    untranslated = [p for p in posts if not p["has_translations"]]
    print(f"  → {len(untranslated)} posts need translations")
    
    if not untranslated:
        print("✓ All posts already have translations. Nothing to do.")
        return

    for i, post in enumerate(untranslated):
        print(f"\n[{i+1}/{len(untranslated)}] Translating: {post['title'][:55]}...")
        
        translations = {}
        for lang_code, lang_info in LANGUAGES.items():
            print(f"  → {lang_info['name']}...")
            result = translate_post(post, lang_code, lang_info)
            if result:
                translations[lang_code] = result
                print(f"    ✓ {lang_info['name']}: {result['title'][:50]}")
            else:
                print(f"    ✗ {lang_info['name']} translation failed")
            time.sleep(0.5)
        
        if translations:
            translations_block = build_translations_block(translations)
            content = inject_translations(content, post["id"], translations_block)
            print(f"  ✓ Injected {len(translations)} translations for {post['id']}")
        
        time.sleep(0.5)

    # Write back
    BLOG_DATA_FILE.write_text(content, encoding="utf-8")
    print(f"\n✓ Updated {BLOG_DATA_FILE.name}")
    print("=" * 60)


if __name__ == "__main__":
    main()
