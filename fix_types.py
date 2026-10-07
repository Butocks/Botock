with open('frontend/app/tools/video-generator/VideoGeneratorClient.tsx', 'r') as f:
    content = f.read()

# Fix MediaItem assignment
import re
new_item_code = """
            const newItem = {
              id: id,
              title: (prompt || "Generated Video").slice(0, 35) + "...",
              type: "video" as const,
              url: data.url,
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              prompt: prompt || "Generated Video",
            };
"""
content = re.sub(r'const newItem = \{\s*type: "video" as const,\s*url: data\.url,\s*id: id,\s*timestamp: Date\.now\(\),\s*prompt: prompt \|\| "Generated Video",\s*\};', new_item_code.strip(), content)

# Fix GuestCTA props
content = content.replace(
    '<GuestCTA onClose={() => setShowGuestCTA(false)} type="video" />',
    '<GuestCTA isOpen={true} onClose={() => setShowGuestCTA(false)} />'
)

with open('frontend/app/tools/video-generator/VideoGeneratorClient.tsx', 'w') as f:
    f.write(content)
print("Fixed types")
