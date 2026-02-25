#!/usr/bin/env python3
"""Generate a single nature post and inject into blogData.ts"""
import os
import re
import json
import sys
from datetime import date
from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DATA_FILE = PROJECT_ROOT / "client" / "src" / "lib" / "blogData.ts"
TODAY = date.today().isoformat()

API_KEY = os.environ.get("OPENAI_API_KEY") or ""
BASE_URL = (os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
COMPLETIONS_URL = f"{BASE_URL}/chat/completions"
MODEL = "gpt-4.1-mini"

BLOG_IDENTITY = """
Capim is a personal journal blog exploring the tension between organic/emergent worldviews 
and engineered/optimized worldviews. Tone: calm, cozy, intellectual. Like a warm conversation 
in a well-worn library. Curious, not preachy. Willing to sit with contradiction.
The author is Brazilian.
"""

NATURE_PROMPT = """
Write a nature post about a biological or ecological phenomenon that challenges our assumptions 
about individuality, intelligence, or design. Ground it in actual research.
Possible angles: mycorrhizal networks and distributed cognition, slime mold optimization,
the microbiome and the self, epigenetics and inheritance, the holobiont concept,
ant colony intelligence, the Wood Wide Web, plant communication, the extended phenotype.

IMPORTANT: Avoid using backslash characters (\\) in the content unless absolutely necessary for markdown.
If you need to show a backslash, write it as a literal backslash only once.
Avoid escaped characters like \\n, \\t, etc. in the JSON content field.

Return a JSON object with these exact fields:
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 7,
  "capybaraImagePrompt": "A watercolor capybara illustration showing..."
}

The content field should be markdown with ## headings. 
Do NOT use escaped characters in the content - write natural text.
"""

def generate_nature_post():
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": BLOG_IDENTITY},
            {"role": "user", "content": NATURE_PROMPT}
        ],
        "temperature": 0.8,
        "response_format": {"type": "json_object"}
    }
    resp = requests.post(COMPLETIONS_URL, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"]
    # Clean up any problematic escape sequences
    raw_clean = raw.replace('\\n', '\n').replace('\\t', '\t')
    try:
        return json.loads(raw_clean)
    except json.JSONDecodeError as e:
        print(f"Parse error: {e}")
        print(f"Raw (first 500 chars): {raw[:500]}")
        # Try a more aggressive cleanup
        raw2 = re.sub(r'\\(?!["\\/bfnrtu])', r'', raw)
        return json.loads(raw2)

def get_next_nature_id():
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    ids = re.findall(r'id:\s*"nature-(\d+)"', content)
    if not ids:
        return "nature-001"
    max_num = max(int(x) for x in ids)
    return f"nature-{max_num + 1:03d}"

def post_to_ts(post, post_id):
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
    category: "nature",
    date: "{TODAY}",
    excerpt: "{excerpt}",
    content: `{content}`,
    tags: [{tags_str}],
    readTime: {post["readTime"]},
  }}'''

def inject_post(ts_post):
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    closing_idx = content.rfind("];")
    if closing_idx == -1:
        print("Could not find closing ]; in blogData.ts")
        return False
    new_content = content[:closing_idx] + f"\n{ts_post},\n" + content[closing_idx:]
    BLOG_DATA_FILE.write_text(new_content, encoding="utf-8")
    return True

def main():
    print(f"Generating nature post for {TODAY}...")
    post = generate_nature_post()
    print(f"Generated: {post['title']}")
    print(f"Image prompt: {post.get('capybaraImagePrompt', 'N/A')}")
    
    post_id = get_next_nature_id()
    print(f"Post ID: {post_id}")
    
    ts = post_to_ts(post, post_id)
    if inject_post(ts):
        print(f"Injected {post_id} into blogData.ts")
    else:
        print("Injection failed")
        sys.exit(1)
    
    # Save the image prompt for later use
    with open("/tmp/nature_image_prompt.txt", "w") as f:
        f.write(post.get("capybaraImagePrompt", f"A watercolor capybara in a lush forest surrounded by glowing mycorrhizal networks, soft botanical illustration style"))
    
    print("Done!")

if __name__ == "__main__":
    main()
