# Handoff Report: Frontend Survey & Integration Architecture

**Agent**: `explorer_survey_frontend`  
**Date**: 2026-09-21T01:19:30Z  
**Type**: Hard (Task Complete)  
**Report Document**: `/home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md`

---

## 1. Observation

1. **Tool File Layout (`frontend/app/tools/[tool-name]/`)**:
   - Every tool is isolated in its own route folder containing:
     - `page.tsx`: Server Component defining SEO metadata, JSON-LD `SoftwareApplication` schema, and dynamic import of the client component with a loading skeleton (`frontend/app/tools/image-crop/page.tsx:4-11`, `frontend/app/tools/image-resize/page.tsx:4-11`, `frontend/app/tools/pdf-compress/page.tsx:50-68`).
     - `Client.tsx`: Client Component (`"use client";`) containing drag-and-drop file ingestion via `react-dropzone` (`frontend/app/tools/image-resize/Client.tsx:127-138`), progress and loading states (`Loader2` spinner), binary blob handling (`URL.createObjectURL`), and file download triggers via anchor download tags (`frontend/app/tools/image-resize/Client.tsx:618-624`).
     - `error.tsx`: Client Component (`"use client";`) implementing a React error boundary catching render and runtime errors with `AlertTriangle` visual alert and a `reset()` button (`frontend/app/tools/image-resize/error.tsx:1-38`, `frontend/app/tools/video-to-mp3/error.tsx:1-51`).

2. **ToolEngine Architecture (`frontend/app/tools/ToolEngine.ts`)**:
   - Defines `ToolCategory = "pdf" | "image" | "video" | "ai"` (`line 10`).
   - Defines `ToolParameter` interface (`lines 18-29`) supporting `file`, `string`, `number`, `boolean`, `enum`.
   - Defines `ToolOutput` interface (`lines 31-36`) supporting `file`, `string`, etc. with `mimeType`.
   - Defines `ToolSchema` interface (`lines 38-53`) with `id`, `name`, `description`, `category`, `parameters`, `outputs`, `seoTitle`, `seoDescription`, `endpoint`, and `isClientSideOnly`.
   - Client-side tools use `isClientSideOnly: true`. Backend-powered tools require `isClientSideOnly: false`.
   - Provides static registry `ToolRegistry.registerTool(schema: ToolSchema)` (`lines 63-86`).

3. **Tool Directory Listing (`frontend/app/tools/page.tsx`)**:
   - Lines 121–146 already pre-populate directory entries for:
     - `pdf-word` (`href: "/tools/pdf-to-word"`, `category: "pdf"`, `status: "ready"`, `icon: FileText`)
     - `word-pdf` (`href: "/tools/word-to-pdf"`, `category: "pdf"`, `status: "ready"`, `icon: FileText`)
     - `pdf-excel` (`href: "/tools/pdf-to-excel"`, `category: "pdf"`, `status: "ready"`, `icon: FileText`)
   - `status: "ready"` displays a `<Clock /> Ready` badge; updating to `status: "active"` displays a `<CheckCircle2 /> Live Now` badge.

4. **Dependencies & Styling (`frontend/package.json`, `frontend/app/globals.css`)**:
   - `package.json`: Next.js `16.3.5`, React `19.2.8`, `lucide-react` `^1.47.0`, `react-dropzone` `^20.1.2`, Tailwind CSS `^4`.
   - `globals.css`: Dark mode `@variant dark`, CSS variables for theme (`--color-primary`, `--background`, `--card`, `--border`). Consistent UI classes (`glass-card`, `obsidian-card`, `emerald-500` / `emerald-600` for primary action buttons).

5. **Backend Communication & URL Resolution (`frontend/utils/runtime-urls.ts`, `backend/main.py`)**:
   - `frontend/utils/runtime-urls.ts:13-19`: `getBackendUrl()` checks `process.env.NEXT_PUBLIC_BACKEND_URL`. If unset, it falls back to `getSiteUrl()`, which returns `window.location.origin` (port 3000 in local dev).
   - `backend/main.py:17-22`: FastAPI runs on port 8000 and allows CORS origin `http://localhost:3000`.
   - `backend/main.py:28-138`: Endpoints:
     - `POST /api/convert/pdf-to-docx`: parameter `file: UploadFile = File(...)`. Validates `.pdf`. Returns `.docx` binary `FileResponse`.
     - `POST /api/convert/docx-to-pdf`: parameter `file: UploadFile = File(...)`. Validates `.doc`/`.docx`. Returns `.pdf` binary `FileResponse`.
     - `POST /api/convert/pdf-to-excel`: parameter `file: UploadFile = File(...)`. Validates `.pdf`. Returns `.xlsx` binary `FileResponse`.

6. **Current Build Integrity (`npm run build`)**:
   - Ran `npm run build` via background task `task-124`.
   - Command completed with exit code 0.
   - Compiled successfully in 9.9s, finished TypeScript in 17.4s, generated 36/36 static pages.

---

## 2. Logic Chain

1. **Design Conformance**: Because all existing tools (`image-crop`, `image-resize`, `pdf-compress`, `pdf-ocr`, etc.) strictly enforce the 3-file pattern (`page.tsx`, `Client.tsx`, `error.tsx`), the 3 new backend conversion tools (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`) must implement this exact structure to guarantee SEO indexability, dynamic loading, and crash isolation.
2. **AI-Agent Schema Readiness**: Because `ToolEngine.ts` is the central registry querying tool capabilities, registering each tool with `isClientSideOnly: false`, input parameters (`file`), output MIME types (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`), and `category: "pdf"` fulfills Rule 1 of `tool_architecture.md`.
3. **Directory Discoverability**: Because `frontend/app/tools/page.tsx` already contains placeholders with `status: "ready"`, changing their status to `"active"` upon tool implementation will immediately surface them as "Live Now" in the user-facing tools directory.
4. **Backend URL Fallback Necessity**: Because `getBackendUrl()` in `runtime-urls.ts` defaults to `window.location.origin` (port 3000) when `NEXT_PUBLIC_BACKEND_URL` is omitted, direct calls without a fallback to `http://localhost:8000` will fail in local development. Therefore, the conversion client logic must explicitly default to `http://localhost:8000` (`process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"`).
5. **Memory Leak Prevention**: Because `URL.createObjectURL(blob)` retains blob data in browser memory until explicitly released, `Client.tsx` must maintain a ref to the created URL and call `URL.revokeObjectURL()` during component unmount and before creating new URLs.

---

## 3. Caveats

1. **Backend Server Running State**: The frontend build passes statically (`npm run build` succeeds), but end-to-end conversion execution requires the FastAPI backend (`uvicorn app.main:app` or `backend/run.py` / `backend/main.py`) to be actively listening on `http://localhost:8000`.
2. **Word to PDF Dependencies**: As observed in `backend/main.py:102`, `docx-to-pdf` conversion relies on headless `libreoffice` or `soffice` installed on the host machine. If LibreOffice is not installed, the backend returns HTTP 501. The frontend client must gracefully surface this error message from `errorJson.detail`.

---

## 4. Conclusion

The Next.js frontend architecture is well-structured, modular, and fully prepared for backend document conversion tools.
- Implement each tool in `frontend/app/tools/[pdf-to-word, word-to-pdf, pdf-to-excel]/` with `page.tsx`, `Client.tsx`, and `error.tsx`.
- Register the 3 tools in `frontend/app/tools/ToolEngine.ts` with `category: "pdf"` and `isClientSideOnly: false`.
- Update `frontend/app/tools/page.tsx` status to `"active"`.
- Use `FormData` with field name `"file"`, resolve API base with fallback `http://localhost:8000`, convert response to `blob`, and manage object URLs cleanly.
- Full architectural survey and implementation blueprint documented in `/home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md`.

---

## 5. Verification Method

To independently verify the survey observations:
1. **Inspect Survey Report**:
   `view_file /home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md`
2. **Inspect Reference Tool Implementations**:
   - `view_file /home/mir/Documents/botock/frontend/app/tools/image-resize/page.tsx`
   - `view_file /home/mir/Documents/botock/frontend/app/tools/image-resize/Client.tsx`
   - `view_file /home/mir/Documents/botock/frontend/app/tools/image-resize/error.tsx`
3. **Inspect ToolEngine & Directory**:
   - `view_file /home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
   - `view_file /home/mir/Documents/botock/frontend/app/tools/page.tsx`
4. **Run Build Verification Command**:
   ```bash
   cd /home/mir/Documents/botock/frontend && npm run build
   ```
   Invalidation condition: Build fails with TypeScript compilation or Next.js route errors.
