## 2026-09-21T01:21:15Z

Your working directory is /home/mir/Documents/botock/.agents/worker_word_to_pdf/.
Read:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md
- /home/mir/Documents/botock/.agents/orchestrator_4/SCOPE.md
- /home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md
- /home/mir/Documents/botock/.agents/explorer_survey_backend/survey_backend.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission: Implement the `word-to-pdf` tool in `frontend/app/tools/word-to-pdf/`.
You own exclusively:
- `frontend/app/tools/word-to-pdf/page.tsx`
- `frontend/app/tools/word-to-pdf/Client.tsx`
- `frontend/app/tools/word-to-pdf/error.tsx`

Requirements:
1. `page.tsx`:
   - Server Component.
   - Comprehensive SEO metadata: title ("Word to PDF Converter - Convert DOCX & DOC to PDF Online | Botock"), description, keywords, OpenGraph.
   - JSON-LD script for `SoftwareApplication` schema (name: "Word to PDF Converter", operatingSystem: "Web", applicationCategory: "BusinessApplication", offers: { price: "0" }).
   - Header with title, badge ("Backend Powered" / "FastAPI"), description.
   - Dynamically imports `Client.tsx` with `ssr: false` and a clean loading skeleton fallback.
2. `Client.tsx`:
   - Client Component (`"use client"`).
   - Drag-and-drop file upload using `react-dropzone` strictly accepting `.docx` and `.doc` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`).
   - Selected file display (file name, formatted file size in KB/MB, remove button).
   - State machine: `idle` -> `converting` -> `success` / `error`.
   - Clear conversion progress UI: animated spinner (`Loader2` from `lucide-react`), status text ("Converting Word document to PDF on server...").
   - API call:
     - `POST` to `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/convert/docx-to-pdf`.
     - Request body: `FormData` with field name strictly `'file'`.
     - On error: parse JSON detail if available (e.g. 501 LibreOffice not installed), display clear, dismissible alert with retry button.
     - On success: parse `res.blob()`, extract filename from `Content-Disposition` header or fallback to original name with `.pdf`. Create Blob URL, provide Download button, and auto-trigger download. Clean up Blob URL via `URL.revokeObjectURL`.
   - Modern, responsive Tailwind CSS styling consistent with `/tools/image-crop` and other tools.
3. `error.tsx`:
   - Client Component (`"use client"`).
   - React Error Boundary catching crashes in this tool, displaying an error card with error details and "Try Again" reset button.

Verify your implementation syntax and types. Document all files created in `handoff.md` and send a message when complete.
