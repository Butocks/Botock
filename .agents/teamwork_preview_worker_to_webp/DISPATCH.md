## 2026-09-20T01:57:36Z
You are Worker 4: Image to WebP Converter (`image-to-webp`).
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_to_webp/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Reference report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own: `/home/mir/Documents/botock/frontend/app/tools/image-to-webp/*` (and your .agents folder).
Do NOT edit any other tool directories.

TASK:
Implement the complete client-side `image-to-webp` tool in `frontend/app/tools/image-to-webp/`:
1. `page.tsx`:
   - Server Component with SEO metadata (title, description, openGraph).
   - JSON-LD structured data (`SoftwareApplication`).
   - Dynamically imports `Client.tsx` with a loading skeleton.
2. `Client.tsx`:
   - Client Component (`"use client"`).
   - Uses `react-dropzone` for image upload (supports PNG, JPG, GIF, BMP, etc.).
   - Controls:
     - Quality slider (1 to 100, default 85)
     - Presets: Maximum (95%), High (85%), Medium (75%), Low (50%)
   - Processing logic: Uses HTML5 Canvas API (`canvas.toBlob(blob => ..., 'image/webp', quality / 100)`). 100% in-browser, no backend API calls.
   - UI shows original file format and size vs output WebP size, space saved percentage.
   - Result preview card and Download button (`<a href={resultUrl} download="Botock-Converted.webp">`).
   - "Start Over" button.
   - Emerald accent styling, dark-theme compatibility, Lucide icons matching `/tools/image-crop`.
3. `error.tsx`:
   - Next.js Error Boundary (`"use client"`).
   - Catches crashes, logs error, displays user-friendly recovery UI with a `reset()` button.

Document your implementation and verification in `/home/mir/Documents/botock/.agents/teamwork_preview_worker_to_webp/handoff.md`.
Send a completion message to the parent agent when finished.
