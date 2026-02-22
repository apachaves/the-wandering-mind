#!/usr/bin/env python3
"""
The Wandering Mind — Markdown Post Exporter
============================================
Exports all blog posts from blogData.ts as individual Markdown files,
organized by language and category. Also verifies link safety.

Usage:
    python3 scripts/export_posts_markdown.py

Creates:
    posts/
      en/
        philosophy/
          phil-001-the-spinoza-problem.md
        ...
      fr/
        ...
      pt-br/
        ...
"""

import os
import re
import sys
from pathlib import Path

import requests

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DATA_FILE = PROJECT_ROOT / "client" / "src" / "lib" / "blogData.ts"
POSTS_DIR = PROJECT_ROOT / "posts"


def extract_top_level_objects(content: str, start_idx: int) -> list[str]:
    """
    Extract top-level object blocks from a TS array, handling template literals
    (backtick strings) that may contain unbalanced braces.
    """
    blocks = []
    i = start_idx
    length = len(content)
    
    while i < length:
        c = content[i]
        
        # Skip to the first {
        if c == ']':
            break
        
        if c == '{':
            # Start of an object
            brace_depth = 1
            block_start = i
            i += 1
            
            while i < length and brace_depth > 0:
                c = content[i]
                
                if c == '`':
                    # Skip template literal entirely
                    i += 1
                    while i < length:
                        if content[i] == '\\':
                            i += 2  # skip escaped char
                            continue
                        if content[i] == '`':
                            i += 1
                            break
                        i += 1
                    continue
                elif c == '"':
                    # Skip double-quoted string
                    i += 1
                    while i < length:
                        if content[i] == '\\':
                            i += 2
                            continue
                        if content[i] == '"':
                            i += 1
                            break
                        i += 1
                    continue
                elif c == "'":
                    # Skip single-quoted string
                    i += 1
                    while i < length:
                        if content[i] == '\\':
                            i += 2
                            continue
                        if content[i] == "'":
                            i += 1
                            break
                        i += 1
                    continue
                elif c == '{':
                    brace_depth += 1
                elif c == '}':
                    brace_depth -= 1
                
                i += 1
            
            block = content[block_start:i]
            blocks.append(block)
        else:
            i += 1
    
    return blocks


def extract_template_literal(block: str, field: str) -> str | None:
    """Extract a template literal value for a given field name."""
    pattern = field + r':\s*`'
    m = re.search(pattern, block)
    if not m:
        return None
    
    start = m.end()
    i = start
    while i < len(block):
        if block[i] == '\\':
            i += 2
            continue
        if block[i] == '`':
            return block[start:i]
        i += 1
    return None


def extract_string_field(block: str, field: str) -> str | None:
    """Extract a double-quoted string value for a given field name."""
    pattern = field + r':\s*"([^"]*)"'
    m = re.search(pattern, block)
    return m.group(1) if m else None


def parse_post_block(block: str) -> dict | None:
    """Parse a single post object block."""
    post_id = extract_string_field(block, "id")
    title = extract_string_field(block, "title")
    category = extract_string_field(block, "category")
    date = extract_string_field(block, "date")
    excerpt = extract_string_field(block, "excerpt")
    content = extract_template_literal(block, "content")
    
    readtime_m = re.search(r'readTime:\s*(\d+)', block)
    tags_m = re.search(r'tags:\s*\[([^\]]+)\]', block)
    
    if not all([post_id, title, category, date, content]):
        return None
    
    tags = []
    if tags_m:
        tags = [t.strip().strip('"\'') for t in tags_m.group(1).split(',') if t.strip()]
    
    post = {
        "id": post_id,
        "title": title,
        "category": category,
        "date": date,
        "excerpt": excerpt or "",
        "content": content,
        "tags": tags,
        "readTime": int(readtime_m.group(1)) if readtime_m else 5,
        "translations": {},
    }
    
    # Extract translations
    for lang_code in ["fr", "ptBR"]:
        # Find the language block within translations
        lang_idx = block.find(f"{lang_code}:")
        if lang_idx == -1:
            continue
        
        # Look for title, excerpt, content within this sub-block
        sub = block[lang_idx:]
        t_title = extract_string_field(sub, "title")
        t_excerpt = extract_string_field(sub, "excerpt")
        t_content = extract_template_literal(sub, "content")
        
        if t_title and t_content:
            post["translations"][lang_code] = {
                "title": t_title,
                "excerpt": t_excerpt or "",
                "content": t_content,
            }
    
    return post


def slugify(text: str) -> str:
    """Convert text to a URL-safe slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = text.strip('-')
    return text[:60]


def post_to_markdown(post: dict, lang: str = "en") -> str:
    """Convert a post to a Markdown document with YAML frontmatter."""
    if lang == "en":
        title = post["title"]
        excerpt = post["excerpt"]
        content = post["content"]
    elif lang in post.get("translations", {}):
        t = post["translations"][lang]
        title = t["title"]
        excerpt = t["excerpt"]
        content = t["content"]
    else:
        return ""
    
    # Unescape template literal escapes
    content = content.replace("\\`", "`")
    content = content.replace("\\${", "${")
    content = content.replace("\\\\", "\\")
    
    tags_str = ", ".join(f'"{t}"' for t in post["tags"])
    
    md = f"""---
id: "{post['id']}"
title: "{title}"
category: "{post['category']}"
date: "{post['date']}"
excerpt: "{excerpt}"
tags: [{tags_str}]
readTime: {post['readTime']}
language: "{lang}"
---

# {title}

*{excerpt}*

---

{content.strip()}

---

*Tags: {", ".join("#" + t for t in post["tags"])}*
*Read time: ~{post["readTime"]} minutes*
"""
    return md


def extract_urls(content: str) -> list[str]:
    """Extract all URLs from markdown content."""
    urls = re.findall(r'https?://[^\s\)\`"\'>\]]+', content)
    return list(set(urls))


def check_url_safety(url: str) -> dict:
    """Check if a URL is safe (HTTPS, responds, no suspicious patterns)."""
    result = {"url": url, "safe": True, "issues": []}
    
    if not url.startswith("https://"):
        result["safe"] = False
        result["issues"].append("Non-HTTPS URL")
    
    suspicious = [
        r'\.exe$', r'\.bat$', r'\.cmd$', r'\.scr$', r'\.vbs$',
        r'\.msi$', r'\.dll$',
    ]
    for pattern in suspicious:
        if re.search(pattern, url, re.IGNORECASE):
            result["safe"] = False
            result["issues"].append(f"Suspicious pattern: {pattern}")
    
    try:
        resp = requests.head(url, timeout=10, allow_redirects=True)
        if resp.status_code >= 400:
            result["issues"].append(f"HTTP {resp.status_code}")
        if resp.url and not resp.url.startswith("https://"):
            result["issues"].append(f"Redirects to non-HTTPS: {resp.url}")
    except requests.RequestException as e:
        result["issues"].append(f"Connection error: {str(e)[:80]}")
    
    return result


LANG_DIR_MAP = {"en": "en", "fr": "fr", "ptBR": "pt-br"}


def main():
    print("=" * 60)
    print("The Wandering Mind — Markdown Post Exporter")
    print("=" * 60)

    if not BLOG_DATA_FILE.exists():
        print(f"✗ blogData.ts not found at {BLOG_DATA_FILE}")
        sys.exit(1)

    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    
    # Find the array start
    arr_decl = content.find("blogPosts")
    if arr_decl == -1:
        print("✗ Could not find blogPosts in file")
        sys.exit(1)
    
    eq_bracket = content.find("= [", arr_decl)
    if eq_bracket == -1:
        print("✗ Could not find array start")
        sys.exit(1)
    
    arr_start = eq_bracket + 2  # position of the actual [
    
    # Extract top-level object blocks
    blocks = extract_top_level_objects(content, arr_start + 1)
    print(f"\n✓ Found {len(blocks)} post blocks")
    
    # Parse each block
    posts = []
    for block in blocks:
        post = parse_post_block(block)
        if post:
            posts.append(post)
    
    print(f"✓ Parsed {len(posts)} posts")

    # Export posts as Markdown
    print("\n── Exporting Markdown files ────────────────────────────────────────────")
    
    all_urls = set()
    
    for post in posts:
        for lang in ["en", "fr", "ptBR"]:
            lang_dir = LANG_DIR_MAP[lang]
            cat_dir = POSTS_DIR / lang_dir / post["category"]
            cat_dir.mkdir(parents=True, exist_ok=True)
            
            md = post_to_markdown(post, lang)
            if not md:
                print(f"  ⚠ No {lang} translation for {post['id']}")
                continue
            
            slug = slugify(post["title"])
            filename = f"{post['id']}-{slug}.md"
            filepath = cat_dir / filename
            filepath.write_text(md, encoding="utf-8")
            
            urls = extract_urls(md)
            all_urls.update(urls)
        
        trans_langs = list(post.get("translations", {}).keys())
        print(f"  ✓ {post['id']}: {post['title'][:50]} [translations: {', '.join(trans_langs) or 'none'}]")

    # Verify link safety
    print(f"\n── Verifying {len(all_urls)} unique URLs ─────────────────────────────────────")
    
    unsafe_urls = []
    for url in sorted(all_urls):
        result = check_url_safety(url)
        if result["issues"]:
            status = "⚠" if result["safe"] else "✗"
            print(f"  {status} {url[:70]} — {', '.join(result['issues'])}")
            if not result["safe"]:
                unsafe_urls.append(result)
        else:
            print(f"  ✓ {url[:70]}")
    
    if unsafe_urls:
        print(f"\n⚠ Found {len(unsafe_urls)} potentially unsafe URLs:")
        for u in unsafe_urls:
            print(f"  ✗ {u['url']} — {', '.join(u['issues'])}")
    else:
        print("\n✓ All URLs passed safety checks")

    print(f"\n✓ Exported {len(posts)} posts × 3 languages to {POSTS_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
