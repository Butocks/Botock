## 2026-09-20T18:54:00Z
You are worker_m1, an implementation worker subagent for Milestone 1.
Your working directory is: /home/mir/Documents/botock/.agents/worker_m1/
The project root is: /home/mir/Documents/botock
The frontend directory is: /home/mir/Documents/botock/frontend
The user request document is: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Tool architecture rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md
Project specification: /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md

MANDATORY FIRST STEP: Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md, /home/mir/Documents/botock/.agents/rules/tool_architecture.md, and /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md.
Also read the survey reports:
- /home/mir/Documents/botock/.agents/explorer_survey_1/survey_report.md
- /home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md
- /home/mir/Documents/botock/.agents/explorer_survey_3/survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You have exclusive write ownership of:
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/lib/ffmpeg/ffmpegManager.ts`
- `frontend/lib/ffmpeg/useFFmpeg.ts`
- `frontend/lib/pdf/pdfOcrHelper.ts`
- `frontend/lib/pdf/pdfCompressHelper.ts`
Do NOT write to files outside this list.

YOUR OBJECTIVE:
Implement Milestone 1 (Dependencies & Shared WASM/PDF Infrastructure):
1. In `frontend/`, install the required production packages:
   `npm install @ffmpeg/ffmpeg@^0.12.15 @ffmpeg/util@^0.12.2 @ffmpeg/core@^0.12.10 tesseract.js@^5.1.1 pdfjs-dist@^3.11.174`
   (Verify package installation completes cleanly without dependency peer conflicts; use `--legacy-peer-deps` only if strictly needed).
2. Create `frontend/lib/ffmpeg/ffmpegManager.ts`:
   - Singleton WASM manager wrapping `new FFmpeg()`.
   - Uses single-threaded `@ffmpeg/core` (e.g. from unpkg or cdnjs CDN via `@ffmpeg/util` `toBlobURL`, with fallback URLs or local public if needed).
   - Singleton pattern: `getFFmpegInstance()`, `load()`, `isLoaded()`, `terminate()`.
   - Thread safety / concurrency guard: ensure concurrent calls wait for the active load promise.
   - Progress callback attachment (`ffmpeg.on('progress', ...)`).
   - Helper methods: `writeFile(name, data)`, `readFile(name)`, `deleteFile(name)`, `exec(args)`.
3. Create `frontend/lib/ffmpeg/useFFmpeg.ts`:
   - React hook `useFFmpeg()` providing:
     `{ loaded, loading, error, load, exec, writeFile, readFile, deleteFile, progress, terminate }`
   - Automatically cleans up or provides state updates for React components.
4. Create `frontend/lib/pdf/pdfOcrHelper.ts`:
   - Configures `pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"` (client-side only).
   - Functions:
     - `renderPdfPageToCanvas(pdfDoc, pageNum, scale = 2.0)` -> returns canvas.
     - `extractTextFromPage(canvas, language = 'eng', progressCallback)` -> runs `tesseract.js` worker, returns text and confidence.
     - `processPdfOcr(fileOrBuffer, language, onProgress)` -> loops through all pages, extracts text, cleans up canvas memory after each page (`canvas.width = 0; canvas.height = 0`), returns `{ pages: OCRPageResult[], fullText: string }`.
5. Create `frontend/lib/pdf/pdfCompressHelper.ts`:
   - Uses `pdf-lib` to inspect indirect objects (`pdfDoc.context.enumerateIndirectObjects()`), find image streams (`Subtype === 'Image'`).
   - Downsamples images via HTML5 Canvas (JPEG quality presets, e.g. 0.45, 0.65, 0.80, scaling max dimension if needed).
   - Replaces stream bytes in-place using `pdfDoc.context.assign(ref, newStream)`.
   - Saves with `{ useObjectStreams: true }` and returns `{ blob, originalSize, compressedSize, savedBytes, ratio, imagesCompressed }`.
6. Run `npm run build` or `npx tsc --noEmit` in `frontend/` to verify zero TypeScript errors and successful compilation.

COMPLETION CRITERIA:
- All packages installed and verified.
- All 4 helper files created with full, genuine implementations (no placeholders, stubs, or mocks).
- Build / typecheck succeeds with exit code 0.
- Write a detailed `handoff.md` in your working directory and notify parent via `send_message`.
