## 2026-09-21T01:15:30Z

Your working directory is /home/mir/Documents/botock/.agents/spec_miner_requirements/.
Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md (especially the 2026-09-21 prompt) and /home/mir/Documents/botock/.agents/rules/tool_architecture.md.

Mission: Extract, formalize, and document all explicit and implicit requirements for the 3 document conversion tools:
1. pdf-to-word (POSTs to http://localhost:8000/api/convert/pdf-to-docx)
2. word-to-pdf (POSTs to http://localhost:8000/api/convert/docx-to-pdf)
3. pdf-to-excel (POSTs to http://localhost:8000/api/convert/pdf-to-excel)

Specifically document:
- Tool Architecture Guidelines adherence:
  1. AI-Agent-Ready Tool Schema (ToolEngine interface, inputs/outputs specification).
  2. Tool Isolation & Crash Resilience (error.tsx boundary, safe fetch handling).
  3. SEO Optimization (page.tsx metadata, SoftwareApplication JSON-LD, readable routes).
- Client UX and functionality requirements:
  - File picker / drag-and-drop with accepted file types (.pdf for pdf-to-word and pdf-to-excel, .docx/.doc for word-to-pdf).
  - Loading feedback (spinner, status message during conversion).
  - POST multipart/form-data fetch to FastAPI backend.
  - Binary response handling: create blob URL and trigger download with appropriate filename.
  - Error handling: graceful error messages on network failure or backend 4xx/5xx responses.
- ToolEngine.ts registration details (id, name, description, category, endpoint, parameters).
- Acceptance criteria for functional behavior and build verification (npm run build).

Document your full specification in /home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md.
Update your progress.md and send a message when complete.
