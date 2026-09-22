# Handoff Report: Document Conversion Tools Requirements Specification

**Agent:** Specification Miner (`spec_miner_requirements`)  
**Target:** Parent Orchestrator (`49b23d1b-4b16-4dea-b77b-e6fa46949290`)  
**Task:** Extract, formalize, and document all explicit and implicit requirements for `pdf-to-word`, `word-to-pdf`, and `pdf-to-excel`.  
**Artifact Generated:** `/home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md`

---

## 1. Observation

Direct observations from codebase inspection, specification sources, and tool runs:

1. **User Request & Prompts (`.agents/ORIGINAL_REQUEST.md`, lines 95-131):**
   - Goal: *"Build a suite of 3 client-side tools in Next.js (React) that interact with our new Python FastAPI backend (`http://localhost:8000`)."*
   - Tools specified:
     1. `pdf-to-word` (POSTs to `http://localhost:8000/api/convert/pdf-to-docx`)
     2. `word-to-pdf` (POSTs to `http://localhost:8000/api/convert/docx-to-pdf`)
     3. `pdf-to-excel` (POSTs to `http://localhost:8000/api/convert/pdf-to-excel`)
   - Architecture: `page.tsx` (Server Component with strict SEO tags), `Client.tsx` (Client Component), `error.tsx` (crash isolation), registered in `app/tools/ToolEngine.ts`.
   - UI logic: Select file, loading spinner, POST `multipart/form-data` with `fetch`, trigger file download from binary response.

2. **Backend API Endpoints (`backend/main.py`):**
   - Line 28: `@app.post("/api/convert/pdf-to-docx")`
     - Validates: `if not file.filename.lower().endswith('.pdf'): raise HTTPException(status_code=400, detail="File must be a PDF")`
     - Uses `pdf2docx.Converter` to generate DOCX.
     - Returns `FileResponse` with `media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"`.
   - Line 53: `@app.post("/api/convert/pdf-to-excel")`
     - Validates `.pdf` extension; opens with `pdfplumber.open`; calls `page.extract_tables()`.
     - Validates: `if not tables_found: raise HTTPException(status_code=400, detail="No tables found in the PDF")`.
     - Returns `FileResponse` with `media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"`.
   - Line 96: `@app.post("/api/convert/docx-to-pdf")`
     - Validates: `if not file.filename.lower().endswith(('.doc', '.docx')): raise HTTPException(status_code=400, detail="File must be a Word document")`.
     - Validates LibreOffice binary in PATH: `if not shutil.which("libreoffice") and not shutil.which("soffice"): raise HTTPException(status_code=501, detail="LibreOffice is not installed on the server")`.
     - Runs headless LibreOffice CLI subprocess: `soffice --headless --convert-to pdf --outdir <out_dir> <in_path>`.
     - Returns `FileResponse` with `media_type="application/pdf"`.
   - Verified that `/bin/libreoffice` and `/bin/soffice` are present on the host system.
   - Tested venv dependencies in `backend/venv`: `fastapi`, `pdf2docx`, `pdfplumber`, `pandas`, `openpyxl` imported cleanly.

3. **Tool Architecture Guidelines (`.agents/rules/tool_architecture.md`):**
   - Rule 1: AI-Agent-Ready Tool Schema (clear programmatic schema detailing purpose, inputs, outputs for autonomous AI invocation).
   - Rule 2: Tool Isolation & Crash Resilience (React error boundaries, isolated API routes, zero cascade).
   - Rule 3: SEO Optimization (dedicated landing page, SSR/SSG metadata, SoftwareApplication JSON-LD, readable URLs).

4. **Existing Tool Implementations & Registry (`frontend/app/tools/ToolEngine.ts`):**
   - Registry defines `ToolSchema` with `id`, `name`, `description`, `category`, `parameters`, `outputs`, `seoTitle`, `seoDescription`, `endpoint`, and `isClientSideOnly`.
   - PDF tools currently registered: `pdf-merge`, `pdf-split`, `pdf-watermark`, `pdf-rotate`, `pdf-page-delete`, `pdf-ocr`, `pdf-compress`.
   - The 3 document conversion tools (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`) are not yet registered in `ToolEngine.ts`.
   - In `frontend/app/tools/page.tsx` (lines 121-146), `pdf-word`, `word-pdf`, and `pdf-excel` are already listed with paths `/tools/pdf-to-word`, `/tools/word-to-pdf`, and `/tools/pdf-to-excel`, marked with status `"ready"`.

---

## 2. Logic Chain

1. **Input Contract Deduction:**
   - From Backend Observation (`backend/main.py:28-138`), the FastAPI routes expect a single form field named `file` submitted via `multipart/form-data`.
   - `pdf-to-word` and `pdf-to-excel` require `.pdf` extensions.
   - `word-to-pdf` supports both `.docx` and `.doc` extensions.
   - Therefore, the client `react-dropzone` file picker must configure `accept` mappings matching these exact MIME types and extensions.

2. **Error Handling Contract Deduction:**
   - The backend explicitly issues HTTP 400 for invalid file extensions and for PDFs with no tables (`pdf-to-excel`).
   - If LibreOffice is absent, the backend issues HTTP 501.
   - If conversion fails (e.g. encrypted or damaged file), HTTP 500 is returned with a JSON object `{ "detail": "Conversion failed: ..." }`.
   - When the backend service is offline, browser `fetch` throws `TypeError: Failed to fetch`.
   - Therefore, `Client.tsx` must implement an inline error alert state that intercepts these status codes and displays clear, user-friendly messages rather than unhandled exceptions.

3. **Isolation and SEO Architecture Deduction:**
   - Per Tool Architecture Guidelines and existing tools (`pdf-compress`), each tool requires:
     - `page.tsx`: Server component exporting `Metadata` (keywords, OpenGraph) and embedding Schema.org `SoftwareApplication` JSON-LD.
     - `Client.tsx`: Client component containing dropzone, state machine, fetch POST, progress feedback, and blob download.
     - `error.tsx`: React error boundary providing failure containment and a `reset()` button.
   - Registering `isClientSideOnly: false` in `ToolEngine.ts` accurately reflects the hybrid client-backend execution model.

---

## 3. Caveats

1. **Backend Service Process:** The FastAPI backend is not continuously running by default and must be launched (e.g., via `uvicorn backend.main:app --port 8000` or `python backend/run.py` pointing to `backend/main.py`) during interactive testing.
2. **CORS Origin:** The backend in `backend/main.py` configures `allow_origins=["http://localhost:3000"]`. If the frontend is run on a different host/port, CORS settings in the backend or frontend reverse proxy must be configured accordingly.
3. **Large File Uploads:** Very large documents (>50MB) may experience prolonged upload/conversion latency. The client UI should display a loading message and support cancellation.

---

## 4. Conclusion

All requirements for the 3 document conversion tools have been extracted, formalized, and verified against both the backend source code (`backend/main.py`) and frontend architecture guidelines. The complete specification document has been created at:
`/home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md`.

It provides implementers with:
- Exact endpoint signatures and payload formats
- ToolEngine registration definitions (with parameter and output schemas)
- Client UX and state machine specifications
- Comprehensive error handling matrix
- Features Discovered and Edge Cases tables
- Acceptance criteria and build verification steps

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Inspect Specification File:**
   ```bash
   cat /home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md
   ```
2. **Verify Backend Endpoints & Logic:**
   ```bash
   grep -n "@app.post" /home/mir/Documents/botock/backend/main.py
   ```
3. **Verify ToolEngine Schema Definitions:**
   ```bash
   head -n 60 /home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts
   ```
4. **Verify LibreOffice and Python Dependencies:**
   ```bash
   which soffice libreoffice
   /home/mir/Documents/botock/backend/venv/bin/python -c "import fastapi, pdf2docx, pdfplumber, pandas, openpyxl; print('OK')"
   ```
