## 2026-09-20T01:57:36Z
You are Worker 3: AI Background Remover (\`image-remove-bg\`).
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Reference report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own: \`/home/mir/Documents/botock/frontend/app/tools/image-remove-bg/*\` (and your .agents folder).
Do NOT edit any other tool directories.

TASK:
Implement the complete client-side \`image-remove-bg\` tool in \`frontend/app/tools/image-remove-bg/\`:
1. \`page.tsx\`:
   - Server Component with SEO metadata (title, description, openGraph).
   - JSON-LD structured data (\`SoftwareApplication\`).
   - Dynamically imports \`Client.tsx\` (\`dynamic(() => import("./Client"), { ssr: false, loading: ... })\`).
2. \`Client.tsx\`:
   - Client Component (\`"use client"\`).
   - Uses \`react-dropzone\` for image upload.
   - Processing logic: Calls \`@imgly/background-removal\` (\`removeBackground(imageSource, { progress: (key, current, total) => ... })\`).
     IMPORTANT: Dynamically import or call \`@imgly/background-removal\` strictly in the client/browser context to prevent any SSR window/worker errors.
   - Loading UI: Displays an animated spinner and progress percentage/status ("Loading neural network model...", "Processing image...", etc.).
   - Result preview: Displays the cut-out image on a standard checkerboard transparency grid pattern (\`bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]\` or checkered CSS) so transparency is immediately visible.
   - Download button: Downloads transparent PNG (\`<a href={resultUrl} download="Botock-No-Background.png">\`).
   - "Start Over" button.
   - Emerald accent styling, dark-theme compatibility, Lucide icons matching \`/tools/image-crop\`.
3. \`error.tsx\`:
   - Next.js Error Boundary (\`"use client"\`).
   - Catches crashes, logs error, displays recovery UI with \`reset()\` button.

Document your implementation and verification in \`/home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/handoff.md\`.
Send a completion message to the parent agent when finished.
