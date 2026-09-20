## 2026-09-20T19:02:31Z

You are worker_m3, an implementation worker subagent for Milestone 3 (PDF Tools Suite).
Your working directory is: /home/mir/Documents/botock/.agents/worker_m3/
The project root is: /home/mir/Documents/botock
The frontend directory is: /home/mir/Documents/botock/frontend
The user request document is: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Tool architecture rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md
Project specification: /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md

MANDATORY FIRST STEP: Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md, /home/mir/Documents/botock/.agents/rules/tool_architecture.md, and /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md.
Also read the PDF survey report: /home/mir/Documents/botock/.agents/explorer_survey_3/survey_report.md
and the reference design pattern in: /home/mir/Documents/botock/frontend/app/tools/image-crop/

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You have exclusive write ownership of:
- \`frontend/app/tools/pdf-ocr/\` (\`page.tsx\`, \`Client.tsx\`, \`error.tsx\`)
- \`frontend/app/tools/pdf-compress/\` (\`page.tsx\`, \`Client.tsx\`, \`error.tsx\`)
Do NOT write to any files outside these directories.

YOUR OBJECTIVE:
Implement the complete, production-ready PDF Tools Suite (\`pdf-ocr\` and \`pdf-compress\`) following the exact design pattern of \`app/tools/image-crop/\`:
For BOTH tools:
1. \`page.tsx\`:
   - Server Component with metadata (SEO title, description, keywords, OpenGraph).
   - \`SoftwareApplication\` JSON-LD schema with \`applicationCategory: "UtilitiesApplication"\`, \`operatingSystem: "Any"\`, and \`offers: { price: "0" }\`.
   - Header with icon, title, description, and privacy badge ("100% Client-Side • Private & Secure").
   - \`dynamic(() => import("./Client"), { ssr: false, loading: ... })\`.
2. \`error.tsx\`:
   - \`"use client"\` crash isolation error boundary.
   - Catches errors locally, displays AlertTriangle, user-friendly error message, and "Try Again" reset button.
3. \`Client.tsx\`:
   - \`"use client"\` interactive component using the helpers in \`@/lib/pdf/pdfOcrHelper\` and \`@/lib/pdf/pdfCompressHelper\`.
   - Drag & drop PDF uploader via \`react-dropzone\` (accepts \`application/pdf\`), file size display, page count detection.
   - Tool-specific features:
     - \`pdf-ocr\`:
       - Language selection dropdown (English \`'eng'\`, Spanish \`'spa'\`, French \`'fra'\`, German \`'deu'\`).
       - Page selection option (All Pages, or Page Range like 1-5).
       - Processing status with real-time page-by-page progress bar (e.g. "Processing page 2 of 5... 40%").
       - Results display: unified plain text editor/textarea with "Copy All to Clipboard" and "Download as .txt" buttons, plus page-by-page accordion showing individual page text and OCR confidence score.
     - \`pdf-compress\`:
       - Compression preset selection cards: "Balanced" (Recommended: quality 0.65, max 1920px), "Maximum Compression" (quality 0.45, max 1280px), "High Quality / Low Compression" (quality 0.80, max 2560px).
       - Processing status with progress indicator.
       - Results card displaying: Original file size, Compressed file size, Saved bytes / percentage saved (e.g. "Saved 65% (4.2 MB)"), number of images downsampled, and "Download Compressed PDF" button.
       - Handles text-only PDFs gracefully (informing user if no raster images were found to compress, returning the compacted document).
   - Proper memory cleanup (\`URL.revokeObjectURL\`) when changing files or unmounting.

VERIFICATION:
Run \`npm run build\` or \`npx tsc --noEmit\` in \`frontend/\` to confirm that both tools compile with zero TypeScript errors and zero build errors.
Write \`handoff.md\` in your working directory and notify parent via \`send_message\`.
