#!/usr/bin/env python3
"""
Inject capybaraImage CDN URLs into the new posts in blogData.ts
"""
import re
from pathlib import Path

BLOG_DATA_FILE = Path(__file__).parent.parent / "client" / "src" / "lib" / "blogData.ts"

# Map post ID -> CDN URL
CDN_URLS = {
    "phil-010": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/njOujLuUlmFCnxil.png",
    "nature-007": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/TjHmgLfIvgXkDYsV.png",
    "ml-007": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/sFgHlUKaPmtzvpaX.png",
    "games-007": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/EABvvWUvKrqqrEVz.png",
    "tech-007": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/SHelxOuaAgVCVkxa.png",
}

def inject_capybara_urls():
    content = BLOG_DATA_FILE.read_text(encoding="utf-8")
    
    for post_id, cdn_url in CDN_URLS.items():
        # Find the post block by ID and inject capybaraImage after readTime
        # Pattern: find the post with this id, then find its readTime line, add capybaraImage after it
        # We look for readTime: N, followed by optional whitespace/newlines and then },
        # and insert capybaraImage before the closing }
        
        # Find the position of the id field for this post
        id_pattern = f'id: "{post_id}"'
        id_pos = content.find(id_pattern)
        if id_pos == -1:
            print(f"  ✗ Could not find post {post_id}")
            continue
        
        # Check if capybaraImage already exists for this post
        # Find the next closing }; after the id
        next_close = content.find('\n  },', id_pos)
        if next_close == -1:
            next_close = content.find('\n  }', id_pos)
        
        post_block = content[id_pos:next_close]
        
        if 'capybaraImage:' in post_block:
            print(f"  ✓ {post_id} already has capybaraImage, updating...")
            # Replace existing URL
            content = re.sub(
                rf'(id: "{re.escape(post_id)}".*?capybaraImage: ")[^"]*(")',
                rf'\g<1>{cdn_url}\g<2>',
                content,
                flags=re.DOTALL
            )
        else:
            # Find readTime line within this post block and insert capybaraImage after it
            # Look for "readTime: N," within the post block
            readtime_pattern = re.compile(r'(    readTime: \d+,)')
            # Find the readTime within the post block range
            block_end = next_close
            block_start = id_pos
            
            # Search for readTime in this specific block
            match = readtime_pattern.search(content, block_start, block_end)
            if match:
                insert_pos = match.end()
                capybara_line = f'\n    capybaraImage: "{cdn_url}",'
                content = content[:insert_pos] + capybara_line + content[insert_pos:]
                print(f"  ✓ Injected capybaraImage for {post_id}")
            else:
                print(f"  ✗ Could not find readTime for {post_id}")
    
    BLOG_DATA_FILE.write_text(content, encoding="utf-8")
    print(f"\n✓ Updated {BLOG_DATA_FILE.name}")

if __name__ == "__main__":
    inject_capybara_urls()
