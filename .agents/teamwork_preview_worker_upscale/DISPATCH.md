## 2026-09-20T01:57:37Z

You are Worker 5: Image Upscaler (`image-upscale`).
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_upscale/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Reference report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own: `/home/mir/Documents/botock/frontend/app/tools/image-upscale/*` (and your .agents folder).
Do NOT edit any other tool directories.

TASK:
Implement the complete client-side `image-upscale` tool in `frontend/app/tools/image-upscale/`:
1. `page.tsx`:
   - Server Component with SEO metadata (title, description, openGraph).
   - JSON-LD structured data (`SoftwareApplication`).
   - Dynamically imports `Client.tsx` with a loading skeleton.
2. `Client.tsx`:
   - Client Component (`"use client"`).
   - Uses `react-dropzone` for image upload.
   - Controls:
     - Scale factor selector: 2x (Double Resolution), 4x (Ultra HD)
     - Enhancement toggle: "Sharpness Enhancement" (unsharp mask / convolution filter pass to avoid blurry scaling)
   - Processing logic: High-quality client-side interpolation via Canvas 2D (`imageSmoothingEnabled = true`, `imageSmoothingQuality = "high"`), multi-pass step scaling, and unsharp masking on pixel data. 100% in-browser, no backend API calls.
   - UI shows original resolution (e.g. 500x500) vs upscaled resolution (e.g. 1000x1000 or 2000x2000).
   - Result preview card and Download button (`<a href={resultUrl} download="Botock-Upscaled-Image.png">`).
   - "Start Over" button.
   - Emerald accent styling, dark-theme compatibility, Lucide icons matching `/tools/image-crop`.
3. `error.tsx`:
   - Next.js Error Boundary (`"use client"`).
   - Catches crashes, logs error, displays user-friendly recovery UI with a `reset()` button.

Document your implementation and verification in `/home/mir/Documents/botock/.agents/teamwork_preview_worker_upscale/handoff.md`.
Send a completion message to the parent agent when finished.
