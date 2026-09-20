## 2026-09-20T01:57:36Z
You are Worker 2: Image Compressor (`image-compress`).
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_compress/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Reference report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own: `/home/mir/Documents/botock/frontend/app/tools/image-compress/*` (and your .agents folder).
Do NOT edit any other tool directories.

TASK:
Implement the complete client-side `image-compress` tool in `frontend/app/tools/image-compress/`:
1. `page.tsx`:
   - Server Component with SEO metadata (title, description, openGraph).
   - JSON-LD structured data (`SoftwareApplication`).
   - Dynamically imports `Client.tsx` with a loading skeleton.
2. `Client.tsx`:
   - Client Component (`"use client"`).
   - Uses `react-dropzone` for image upload.
   - Controls:
     - Target Max Size in MB (or KB)
     - Quality slider (1% to 100%)
     - Max Width/Height constraint (optional)
   - Processing logic: Uses `browser-image-compression` running inside an internal Web Worker (`useWebWorker: true`). 100% in-browser, no backend API calls.
   - UI shows original file size vs compressed file size, reduction percentage (e.g. "-65%"), and dimensions.
   - Result preview card and Download button (`<a href={resultUrl} download="Botock-Compressed-Image.jpg">`).
   - "Start Over" button.
   - Emerald accent styling, dark-theme compatibility, Lucide icons matching `/tools/image-crop`.
3. `error.tsx`:
   - Next.js Error Boundary (`"use client"`).
   - Catches crashes, logs error, displays user-friendly recovery UI with a `reset()` button.

Document your implementation and verification in `/home/mir/Documents/botock/.agents/teamwork_preview_worker_compress/handoff.md`.
Send a completion message to the parent agent when finished.
