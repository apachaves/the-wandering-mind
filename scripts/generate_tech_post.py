#!/usr/bin/env python3
"""
Generate a single tech post and inject it into blogData.ts
"""
import os
import re
import json
import sys
import time
from datetime import date
from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DATA_FILE = PROJECT_ROOT / "client" / "src" / "lib" / "blogData.ts"
TODAY = date.today().isoformat()
API_KEY = os.environ.get("OPENAI_API_KEY", "")
BASE_URL = (os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
COMPLETIONS_URL = f"{BASE_URL}/chat/completions"
MODEL = "gpt-4.1-mini"

BLOG_IDENTITY = """
Capim is a personal journal blog exploring the tension between organic/holistic worldviews 
and engineering/optimization worldviews. Tone: calm, cozy, intellectual. Like a warm conversation 
in a well-worn library. The author is Brazilian.
"""

SYSTEM_PROMPT = f"""You are a writer for Capim blog.
{BLOG_IDENTITY}

Write a tech blog post in the Capim style. Return ONLY valid JSON with these exact fields:
- title: string
- excerpt: string (1-2 sentences)
- content: string (markdown, 600-900 words, use ## headings)
- tags: array of 3-5 strings
- readTime: integer (minutes)
- capybaraImagePrompt: string (prompt for a capybara watercolor illustration)

CRITICAL: The content field must use only simple escape sequences. Do NOT use backslash before any character except n, t, r, \\, and ". Avoid all other escape sequences.
Return ONLY the JSON object, no markdown fences, no extra text."""

USER_PROMPT = f"""Write a tech post for {TODAY} about formal verification, type systems, or proof-based software correctness.
Explore the tension between mathematical certainty and the organic complexity of real-world software.
Avoid repeating topics already covered (AI safety, quantum computing, blockchain, etc.)."""

def generate_tech_post():
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        "temperature": 0.8,
        "max_tokens": 2000,
    }
    print(f"Calling API for tech post...")
    resp = requests.post(COMPLETIONS_URL, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    # Strip markdown fences if present
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Parse error: {e}")
        print(f"Raw (first 500): {raw[:500]}")
        # Try to fix common escape issues
        fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', raw)
        return json.loads(fixed)

def post_to_ts(post: dict, post_id: str) -> str:
    title = post["title"].replace('"', '\\"')
    excerpt = post["excerpt"].replace('"', '\\"')
    content = post["content"]
    content = content.replace("\\", "\\\\")
    content = content.replace("`", "\\`")
    content = content.replace("${", "\\${")
    tags_str = ", ".join(f'"{t}"' for t in post["tags"])
    return f'''  {{
    id: "{post_id}",
    title: "{title}",
    category: "tech",
    date: "{TODAY}",
    excerpt: "{excerpt}",
    content: `{content}`,
    tags: [{tags_str}],
    readTime: {post["readTime"]},
  }}'''

def inject_post(new_post_ts: str) -> bool:
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    closing_idx = content.rfind("];")
    if closing_idx == -1:
        print("Could not find closing ]; in blogData.ts")
        return False
    new_content = content[:closing_idx] + f"\n{new_post_ts},\n" + content[closing_idx:]
    BLOG_DATA_FILE.write_text(new_content, encoding="utf-8")
    print(f"Injected tech post into blogData.ts")
    return True

def main():
    if not API_KEY:
        print("No API key set.")
        sys.exit(1)
    post = generate_tech_post()
    print(f"Generated: {post['title']}")
    ts = post_to_ts(post, "tech-007")
    if inject_post(ts):
        print("Done!")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
