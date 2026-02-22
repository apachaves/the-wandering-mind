#!/usr/bin/env python3
"""
The Wandering Mind — Daily Post Generator
=========================================
Playbook:
1. Read existing posts from client/src/lib/blogData.ts (extract_existing_posts)
2. For each category, generate a new post via the AI API (BUILT_IN_FORGE_API_KEY or OPENAI_API_KEY)
3. Inject new posts into blogData.ts before the AUTO-GENERATED marker
4. Run pnpm build to compile the updated TypeScript
5. Exit 0 on success (checkpoint is saved by the calling agent)

Blog identity: Green × Blue MTG (Simic), pantheism vs transhumanism, nature vs nurture.
Categories: philosophy | tech | nature | ml | games
"""

import os
import re
import json
import subprocess
import sys
import textwrap
from datetime import date
from pathlib import Path

import requests

# ── Configuration ──────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DATA_FILE = PROJECT_ROOT / "client" / "src" / "lib" / "blogData.ts"
TODAY = date.today().isoformat()

CATEGORIES = ["philosophy", "tech", "nature", "ml", "games"]

# API setup — prefer BUILT_IN_FORGE_API_KEY, fall back to OPENAI_API_KEY
API_KEY = (
    os.environ.get("BUILT_IN_FORGE_API_KEY")
    or os.environ.get("OPENAI_API_KEY")
    or ""
)
API_URL = (
    os.environ.get("BUILT_IN_FORGE_API_URL")
    or os.environ.get("OPENAI_BASE_URL")
    or os.environ.get("OPENAI_API_BASE")
    or "https://api.manus.im/api/llm-proxy/v1"
)
# Ensure we hit the completions endpoint
if not API_URL.endswith("/"):
    API_URL = API_URL.rstrip("/")
COMPLETIONS_URL = f"{API_URL}/chat/completions"

MODEL = "gpt-4.1-mini"

BLOG_IDENTITY = """
The Wandering Mind is a personal journal blog with a strong identity:
- Aesthetic: Green × Blue MTG (Simic) — the guild that combines nature and technology
- Central tension: pantheism vs transhumanism, nature vs nurture
- Tone: intellectually rigorous, personal, exploratory — not academic but not casual
- Style: long-form essays with concrete examples, code snippets where relevant, MTG lore references welcome
- Voice: first-person, opinionated, willing to sit with contradiction
- The blog explores what it means to engineer life, to be part of nature while also transcending it
"""

CATEGORY_PROMPTS = {
    "philosophy": """
Write a philosophy post for The Wandering Mind blog.
Topics to explore (pick one angle): consciousness, free will, emergence, the hard problem,
Spinoza/pantheism, Deleuze and becoming, the ethics of enhancement, what it means to be natural,
the relationship between mind and matter, process philosophy, Whitehead, Buddhist impermanence
vs Western substance metaphysics.
The post should engage with a specific philosophical problem, not just survey a topic.
""",
    "tech": """
Write a tech post for The Wandering Mind blog.
Topics to explore (pick one): Rust/systems programming as ecological metaphor, distributed systems
as ecosystems, the philosophy of type systems, functional programming and immutability, 
version control as memory, the ethics of open source, WASM and the future of computation,
programming language design philosophy, formal verification, the aesthetics of code.
The post should have at least one code snippet if relevant, and connect technical concepts
to broader themes of nature, systems, or consciousness.
""",
    "nature": """
Write a nature post for The Wandering Mind blog.
Topics to explore (pick one): mycorrhizal networks, epigenetics and nature/nurture,
convergent evolution, the Gaia hypothesis (critically), extremophiles and the definition of life,
CRISPR and the ethics of gene editing, rewilding, the microbiome as identity, 
phenotypic plasticity, the evolution of cooperation, endosymbiosis.
The post should engage with actual biology while connecting to philosophical themes.
""",
    "ml": """
Write an ML/AI post for The Wandering Mind blog.
Topics to explore (pick one): the alignment problem as an evolutionary mismatch,
emergent capabilities and phase transitions, attention mechanisms and consciousness,
the difference between optimization and understanding, generalization vs memorization,
the bitter lesson and its implications, neural scaling laws, mechanistic interpretability,
the relationship between compression and intelligence, embodied cognition vs LLMs.
The post should be technically grounded but philosophically engaged.
""",
    "games": """
Write a games post for The Wandering Mind blog.
Topics to explore (pick one): MTG lore (Simic, Phyrexia, Eldrazi, Urza's legacy),
game design as systems thinking, roguelikes and emergence, the philosophy of procedural generation,
Dwarf Fortress and simulated ecology, Dark Souls and the philosophy of difficulty,
Elden Ring's open world as ecosystem, the ethics of player choice in games,
speedrunning as optimization, game balance as evolutionary pressure.
The post should treat games as a serious lens for thinking about the blog's themes.
""",
}


# ── Step 1: Extract existing posts ────────────────────────────────────────────

def extract_existing_posts(content: str) -> list[dict]:
    """Parse blogData.ts and extract post metadata (id, title, category, date, tags)."""
    posts = []
    
    # Find all post objects by extracting id, title, category, date fields
    id_pattern = re.compile(r'id:\s*["\']([^"\']+)["\']')
    title_pattern = re.compile(r'title:\s*["\']([^"\']+)["\']')
    category_pattern = re.compile(r'category:\s*["\']([^"\']+)["\']')
    date_pattern = re.compile(r'date:\s*["\']([^"\']+)["\']')
    tags_pattern = re.compile(r'tags:\s*\[([^\]]+)\]')
    
    # Split into post blocks by looking for opening braces with id fields
    # Use a simple approach: find each { id: "..." block
    blocks = re.split(r'\n\s*\{', content)
    
    for block in blocks[1:]:  # skip first split (before any post)
        id_match = id_pattern.search(block)
        title_match = title_pattern.search(block)
        category_match = category_pattern.search(block)
        date_match = date_pattern.search(block)
        tags_match = tags_pattern.search(block)
        
        if id_match and title_match and category_match and date_match:
            tags = []
            if tags_match:
                raw_tags = tags_match.group(1)
                tags = [t.strip().strip('"\'') for t in raw_tags.split(',') if t.strip()]
            
            posts.append({
                "id": id_match.group(1),
                "title": title_match.group(1),
                "category": category_match.group(1),
                "date": date_match.group(1),
                "tags": tags,
            })
    
    return posts


# ── Step 2: Generate a post via AI ────────────────────────────────────────────

def generate_post(category: str, existing_posts: list[dict]) -> dict | None:
    """Call the AI API to generate a new blog post for the given category."""
    
    # Summarize existing posts in this category to avoid repetition
    category_posts = [p for p in existing_posts if p["category"] == category]
    existing_summary = ""
    if category_posts:
        existing_summary = "EXISTING POSTS IN THIS CATEGORY (do NOT repeat these topics):\n"
        for p in category_posts:
            existing_summary += f"- [{p['date']}] {p['title']} (tags: {', '.join(p['tags'])})\n"
    
    all_titles = [p["title"] for p in existing_posts]
    all_titles_str = "\n".join(f"- {t}" for t in all_titles)
    
    system_prompt = f"""You are the author of The Wandering Mind, a personal journal blog.
{BLOG_IDENTITY}

Your task is to write ONE new blog post for the category: {category.upper()}

{CATEGORY_PROMPTS[category]}

{existing_summary}

ALL EXISTING POST TITLES (for reference, do not repeat):
{all_titles_str}

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no explanation):
{{
  "id": "unique-id-like-{category}-NNN",
  "title": "The post title",
  "category": "{category}",
  "date": "{TODAY}",
  "excerpt": "A 1-2 sentence hook that captures the post's central tension (max 200 chars)",
  "content": "Full markdown content of the post (600-1200 words). Use ## for section headers, **bold**, *italic*, and ``` for code blocks. Write in first person.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": 7
}}

The readTime should be estimated based on content length (avg 200 words/min).
The id should follow the pattern: {category}-NNN where NNN is a 3-digit number higher than any existing {category} post id.
"""

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Write a new {category} post for today ({TODAY}). Make it intellectually engaging and true to the blog's Simic identity."},
        ],
        "temperature": 0.85,
        "max_tokens": 2000,
    }
    
    print(f"  → Calling API for category: {category}...")
    
    try:
        response = requests.post(
            COMPLETIONS_URL,
            headers=headers,
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        
        raw_content = data["choices"][0]["message"]["content"].strip()
        
        # Strip markdown code fences if present
        if raw_content.startswith("```"):
            raw_content = re.sub(r'^```(?:json)?\n?', '', raw_content)
            raw_content = re.sub(r'\n?```$', '', raw_content)
            raw_content = raw_content.strip()
        
        post_data = json.loads(raw_content)
        
        # Validate required fields
        required = ["id", "title", "category", "date", "excerpt", "content", "tags", "readTime"]
        for field in required:
            if field not in post_data:
                raise ValueError(f"Missing field: {field}")
        
        # Ensure category matches
        post_data["category"] = category
        post_data["date"] = TODAY
        
        print(f"  ✓ Generated: {post_data['title'][:60]}...")
        return post_data
        
    except requests.RequestException as e:
        print(f"  ✗ API error for {category}: {e}")
        return None
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        print(f"  ✗ Parse error for {category}: {e}")
        if 'raw_content' in locals():
            print(f"    Raw response (first 300 chars): {raw_content[:300]}")
        return None


# ── Step 3: Convert post dict to TypeScript object literal ────────────────────

def post_to_ts(post: dict) -> str:
    """Convert a post dict to a TypeScript object literal string."""
    
    def escape_ts_string(s: str) -> str:
        """Escape a string for use in a TypeScript template literal or quoted string."""
        # Use backtick template literals for content (handles newlines and quotes)
        return s
    
    tags_str = ", ".join(f'"{t}"' for t in post["tags"])
    
    # Escape backticks and ${} in content for template literal
    content = post["content"]
    content = content.replace("\\", "\\\\")
    content = content.replace("`", "\\`")
    content = content.replace("${", "\\${")
    
    # Escape double quotes in title and excerpt
    title = post["title"].replace('"', '\\"')
    excerpt = post["excerpt"].replace('"', '\\"')
    
    ts = f'''  {{
    id: "{post["id"]}",
    title: "{title}",
    category: "{post["category"]}",
    date: "{post["date"]}",
    excerpt: "{excerpt}",
    content: `{content}`,
    tags: [{tags_str}],
    readTime: {post["readTime"]},
  }}'''
    
    return ts


# ── Step 4: Inject posts into blogData.ts ─────────────────────────────────────

INJECTION_MARKER = "// ── AUTO-GENERATED POSTS (do not edit this marker) ──────────────────────────"

def inject_posts(new_posts: list[dict]) -> bool:
    """Inject new posts into blogData.ts before the AUTO-GENERATED marker."""
    
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    
    if INJECTION_MARKER not in content:
        print(f"  ✗ Injection marker not found in {BLOG_DATA_FILE}")
        print(f"    Looking for: {INJECTION_MARKER!r}")
        return False
    
    # Build the TS snippets for each new post
    ts_snippets = []
    for post in new_posts:
        ts_snippets.append(post_to_ts(post))
    
    # Join with commas and newlines
    new_block = ",\n".join(ts_snippets)
    
    # Insert before the marker — add a leading comma to connect to previous last post
    insertion = f",\n{new_block}\n\n  {INJECTION_MARKER}\n"
    
    # Replace the marker line with injection + marker
    new_content = content.replace(
        f"  {INJECTION_MARKER}\n",
        insertion,
    )
    
    # If the marker wasn't indented, try without indentation
    if new_content == content:
        new_content = content.replace(
            f"{INJECTION_MARKER}\n",
            f",\n{new_block}\n\n{INJECTION_MARKER}\n",
        )
    
    if new_content == content:
        print("  ✗ Failed to inject: content unchanged after replacement")
        return False
    
    BLOG_DATA_FILE.write_text(new_content, encoding="utf-8")
    print(f"  ✓ Injected {len(new_posts)} posts into {BLOG_DATA_FILE.name}")
    return True


# ── Step 5: Run pnpm build ────────────────────────────────────────────────────

def run_build() -> bool:
    """Run pnpm build in the project root."""
    print("\n── Running pnpm build ──────────────────────────────────────────────────")
    result = subprocess.run(
        ["pnpm", "build"],
        cwd=PROJECT_ROOT,
        capture_output=False,
        text=True,
    )
    if result.returncode == 0:
        print("✓ Build succeeded")
        return True
    else:
        print(f"✗ Build failed (exit code {result.returncode})")
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"The Wandering Mind — Daily Post Generator")
    print(f"Date: {TODAY}")
    print(f"API URL: {COMPLETIONS_URL}")
    print(f"API Key: {'SET (' + API_KEY[:8] + '...)' if API_KEY else 'NOT SET'}")
    print("=" * 60)
    
    if not API_KEY:
        print("✗ No API key found. Set BUILT_IN_FORGE_API_KEY or OPENAI_API_KEY.")
        sys.exit(1)
    
    # Step 1: Read existing posts
    print("\n── Reading existing posts ──────────────────────────────────────────────")
    if not BLOG_DATA_FILE.exists():
        print(f"✗ blogData.ts not found at {BLOG_DATA_FILE}")
        sys.exit(1)
    
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    existing_posts = extract_existing_posts(content)
    print(f"✓ Found {len(existing_posts)} existing posts:")
    for p in existing_posts:
        print(f"  [{p['category']:12s}] {p['date']} — {p['title'][:50]}")
    
    # Step 2: Generate new posts
    print("\n── Generating new posts ────────────────────────────────────────────────")
    new_posts = []
    failed_categories = []
    
    for category in CATEGORIES:
        print(f"\n[{category.upper()}]")
        post = generate_post(category, existing_posts)
        if post:
            new_posts.append(post)
        else:
            failed_categories.append(category)
            print(f"  ⚠ Skipping {category} — will continue with others")
    
    if not new_posts:
        print("\n✗ All categories failed. Aborting.")
        sys.exit(1)
    
    print(f"\n✓ Generated {len(new_posts)}/{len(CATEGORIES)} posts")
    if failed_categories:
        print(f"⚠ Failed categories: {', '.join(failed_categories)}")
    
    # Step 3: Inject posts
    print("\n── Injecting posts into blogData.ts ────────────────────────────────────")
    success = inject_posts(new_posts)
    if not success:
        print("✗ Injection failed. Aborting.")
        sys.exit(1)
    
    # Step 4: Build
    build_ok = run_build()
    if not build_ok:
        print("\n✗ Build failed. The injected posts may have syntax errors.")
        print("  Restoring original blogData.ts...")
        BLOG_DATA_FILE.write_text(content, encoding="utf-8")
        print("  ✓ Restored original file.")
        sys.exit(1)
    
    # Summary
    print("\n" + "=" * 60)
    print(f"✓ Daily post generation complete!")
    print(f"  Posts generated: {len(new_posts)}")
    for p in new_posts:
        print(f"  [{p['category']:12s}] {p['title'][:55]}")
    if failed_categories:
        print(f"  Failed: {', '.join(failed_categories)}")
    print("=" * 60)
    
    sys.exit(0)


if __name__ == "__main__":
    main()
