with open('frontend/next.config.ts', 'r') as f:
    content = f.read()

# Remove the COOP and COEP headers from the global rule
import re

content = re.sub(r'\{\s*key:\s*"Cross-Origin-Opener-Policy"[^}]*\},\s*', '', content)
content = re.sub(r'\{\s*key:\s*"Cross-Origin-Embedder-Policy"[^}]*\},\s*', '', content)

# Now add a new rule specifically for tools that need it.
# Actually, the easiest way is to add a new block before the `];` of the headers array.
# Let's find the end of the headers array.
headers_end_pattern = r'(\n\s*],\s*\n\s*\}\s*,?\s*\n\s*\];\s*\n\s*\})'
match = re.search(headers_end_pattern, content)
if match:
    new_rule = """
      },
      {
        source: "/tools/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
"""
    content = content[:match.start()] + new_rule + content[match.start() + 7:]

with open('frontend/next.config.ts', 'w') as f:
    f.write(content)
