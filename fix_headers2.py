with open('frontend/next.config.ts', 'r') as f:
    content = f.read()

import re

# Find the start and end of async headers()
headers_pattern = r'async headers\(\) \{[\s\S]*?\},\n\s*\}\;'
match = re.search(headers_pattern, content)

new_headers = """async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: https:; media-src 'self' blob: https:; worker-src 'self' blob:; frame-src 'self' https://accounts.google.com; upgrade-insecure-requests",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://botock.app",
          },
        ],
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
      },
    ];
  },
};"""

content = re.sub(headers_pattern, new_headers, content)

with open('frontend/next.config.ts', 'w') as f:
    f.write(content)
