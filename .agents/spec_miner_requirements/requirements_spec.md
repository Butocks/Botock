# Requirements Specification: Document Conversion Tool Suite (pdf-to-word, word-to-pdf, pdf-to-excel)

**Document Version:** 1.0.0  
**Date:** 2026-09-21  
**Author:** Specification Miner Agent  
**Target Environment:** Next.js 16 (App Router) + React 19 + Tailwind CSS + Python FastAPI Backend (`http://localhost:8000`)

---

## 1. Executive Summary & Objectives

This specification defines all functional, architectural, user experience, and validation requirements for three document conversion tools on the Botock platform:
1. **`pdf-to-word`**: Converts PDF documents into editable Microsoft Word (.docx) files.
2. **`word-to-pdf`**: Converts Microsoft Word documents (.docx, .doc) into portable PDF files.
3. **`pdf-to-excel`**: Extracts tabular data from PDF documents into Microsoft Excel (.xlsx) workbooks.

Unlike Botock's client-side WASM tools (e.g. `image-crop`, `pdf-merge`), these tools utilize hybrid client-server orchestration: a rich client-side Next.js user interface coordinates asynchronous file uploads and downloads with a dedicated Python FastAPI backend service running at `http://localhost:8000`.

---

## 2. Tool Architecture Guidelines Adherence

All three tools must strictly comply with the **Botock Tool Architecture Guidelines** (`.agents/rules/tool_architecture.md`):

### 2.1 AI-Agent-Ready Tool Schema
- **Independent Modules:** Each tool is built as an independent, self-contained module under `frontend/app/tools/[tool-name]`.
- **Programmatic Interface:** Every tool must be registered in `frontend/app/tools/ToolEngine.ts` via `ToolRegistry.registerTool()`.
- **Comprehensive Schema:** Registrations must define:
  - `id`: Unique kebab-case identifier (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`).
  - `name`: Human-readable name.
  - `description`: Semantic description enabling an AI agent to select the tool based on natural language queries.
  - `category`: `"pdf"`.
  - `endpoint`: Backend API path (`http://localhost:8000/api/convert/...`) and client route (`/tools/[tool-name]`).
  - `isClientSideOnly`: `false` (explicitly marking these as backend-assisted tools).
  - `parameters`: Array of typed inputs (`file`, MIME types, accepted extensions).
  - `outputs`: Array of typed outputs (`file`, MIME type, description).
  - `seoTitle` and `seoDescription`: Search and metadata descriptors.

### 2.2 Tool Isolation & Crash Resilience
- **React Error Boundary (`error.tsx`):**
  - Every tool directory must include an `error.tsx` client component (`"use client"`).
  - If unexpected runtime exceptions or rendering errors occur, the error boundary catches them locally, displaying a dedicated failure card with a "Try Again" (`reset()`) button.
  - The crash remains strictly quarantined to the tool container; global navigation, header, theme toggles, and other tools remain fully functional.
- **Safe Network & API Handling:**
  - `Client.tsx` must wrap all `fetch` requests in `try...catch` blocks.
  - Network failures (e.g., backend offline, connection refused) and HTTP 4xx/5xx responses must be handled gracefully without throwing unhandled promise rejections.
  - User-facing error alerts must be displayed inline within the tool UI, allowing the user to retry or select a different file without resetting the whole page.
- **Resource Cleanup & Memory Safety:**
  - Browser object URLs created via `URL.createObjectURL(blob)` must be tracked in a React ref or cleanup effect and explicitly revoked via `URL.revokeObjectURL(url)` on component unmount or before instantiating a new download.
  - `AbortController` must be supported to abort in-flight uploads if the user cancels or navigates away.

### 2.3 SEO Optimization & Discoverability
- **Server-Side Rendering (`page.tsx`):**
  - The route entrypoint `page.tsx` must be a Server Component (no `"use client"`).
  - It exports a strict Next.js `Metadata` object containing unique `title`, `description`, `keywords`, and `openGraph` tags.
- **Structured Data (`SoftwareApplication` JSON-LD):**
  - An inline `<script type="application/ld+json">` tag must be embedded on each tool page with Schema.org `SoftwareApplication` metadata:
    - `@context`: `"https://schema.org"`
    - `@type`: `"SoftwareApplication"`
    - `name`: Tool display name
    - `operatingSystem`: `"Any"`
    - `applicationCategory`: `"UtilitiesApplication"` or `"BusinessApplication"`
    - `offers`: `{"@type": "Offer", "price": "0", "priceCurrency": "USD"}`
- **Clean, Semantic URLs:**
  - `frontend/app/tools/pdf-to-word` -> `/tools/pdf-to-word`
  - `frontend/app/tools/word-to-pdf` -> `/tools/word-to-pdf`
  - `frontend/app/tools/pdf-to-excel` -> `/tools/pdf-to-excel`
- **Tool Directory Integration:**
  - `frontend/app/tools/page.tsx` must update the status of `pdf-word`, `word-pdf`, and `pdf-excel` from `"ready"` (under construction) to `"active"`.

---

## 3. Authoritative Backend Specifications (FastAPI)

The backend service is located at `/home/mir/Documents/botock/backend/main.py`.

### 3.1 Server Environment & Base URL
- **Base URL:** `http://localhost:8000` (configurable on the client via `process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"`).
- **CORS Policy:** Allows origin `http://localhost:3000` with all methods and headers enabled.
- **Payload Format:** `multipart/form-data` with form field name `file`.

### 3.2 Endpoint Contracts

#### 1. PDF to Word (DOCX)
- **Route:** `POST /api/convert/pdf-to-docx`
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body field: `file: UploadFile`
- **Validation:**
  - File extension check: `not file.filename.lower().endswith('.pdf')`
  - Validation failure: HTTP 400 Bad Request `{"detail": "File must be a PDF"}`
- **Processing Engine:** `pdf2docx.Converter` converts layout, tables, and typography into a Word DOCX file.
- **Success Response:**
  - HTTP Status: `200 OK`
  - Media Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Headers: `content-disposition: attachment; filename="<original_name_without_pdf>.docx"`
  - Body: Binary DOCX stream
- **Failure Response:**
  - HTTP Status: `500 Internal Server Error`
  - Body: `{"detail": "Conversion failed: <error_message>"}`

#### 2. Word (DOC/DOCX) to PDF
- **Route:** `POST /api/convert/docx-to-pdf`
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body field: `file: UploadFile`
- **Validation:**
  - File extension check: `not file.filename.lower().endswith(('.doc', '.docx'))`
  - Validation failure: HTTP 400 Bad Request `{"detail": "File must be a Word document"}`
- **Server Dependency:** Requires `libreoffice` or `soffice` binary in system PATH.
  - If missing: HTTP 501 Not Implemented `{"detail": "LibreOffice is not installed on the server"}`
- **Processing Engine:** Headless LibreOffice CLI (`soffice --headless --convert-to pdf --outdir <temp_dir> <input_file>`).
- **Success Response:**
  - HTTP Status: `200 OK`
  - Media Type: `application/pdf`
  - Headers: `content-disposition: attachment; filename="<base_filename>.pdf"`
  - Body: Binary PDF stream
- **Failure Response:**
  - HTTP Status: `500 Internal Server Error`
  - Body: `{"detail": "Conversion failed: <error_message>"}` (e.g. conversion process failed or output PDF missing).

#### 3. PDF to Excel (XLSX)
- **Route:** `POST /api/convert/pdf-to-excel`
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body field: `file: UploadFile`
- **Validation:**
  - File extension check: `not file.filename.lower().endswith('.pdf')`
  - Validation failure: HTTP 400 Bad Request `{"detail": "File must be a PDF"}`
- **Processing Engine:** `pdfplumber` extracts tables across all PDF pages; tables are converted to pandas DataFrames and written to an Excel workbook using `openpyxl`.
  - Sheet names are formatted as `P{page_idx+1}_T{t_idx+1}` (truncated to 31 characters).
- **Table Detection Validation:**
  - If no tables are detected in the document: HTTP 400 Bad Request `{"detail": "No tables found in the PDF"}`.
- **Success Response:**
  - HTTP Status: `200 OK`
  - Media Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Headers: `content-disposition: attachment; filename="<original_name_without_pdf>.xlsx"`
  - Body: Binary XLSX stream
- **Failure Response:**
  - HTTP Status: `500 Internal Server Error`
  - Body: `{"detail": "Conversion failed: <error_message>"}`

---

## 4. Client UX & Functional Requirements

Each tool must implement an intuitive, robust user interface matching the high-standard design system established in `/tools/pdf-compress` and `/tools/image-crop`.

### 4.1 Component Structure per Tool
Every tool folder in `frontend/app/tools/[tool-name]` must contain:
```
frontend/app/tools/[tool-name]/
├── page.tsx       # Server Component: Metadata, JSON-LD, Header, renders <Client />
├── Client.tsx     # Client Component: State machine, react-dropzone, fetch POST, download
└── error.tsx      # Client Component: React Error Boundary fallback with reset button
```

### 4.2 State Machine
The client interface transitions through four distinct states:
1. **Idle / Dropzone State:**
   - Visual drag-and-drop zone using `react-dropzone`.
   - File type filter enforced at browser level:
     - `pdf-to-word`: `application/pdf`, `.pdf`
     - `word-to-pdf`: `.docx`, `.doc`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`
     - `pdf-to-excel`: `application/pdf`, `.pdf`
   - Prompt text with badge explaining format transformation and supported limits.
   - Rejection feedback if the user drops an invalid file type.

2. **File Selected / Staging State:**
   - Card displaying selected file details: name, file size (formatted in KB/MB), and format icon (PDF/Word/Excel).
   - "Remove / Change File" button to clear selection.
   - Primary action button: e.g. "Convert to Word (DOCX)", "Convert to PDF", "Extract Tables to Excel".

3. **Converting / Loading State:**
   - Primary button disabled and showing animated spinner (`Loader2` from `lucide-react`) with text "Converting Document...".
   - Status message explaining step: "Uploading file to conversion engine...", "Processing layout and formatting...".
   - Cancel / Reset action to abort the request.

4. **Completed / Download State:**
   - Success badge with `CheckCircle2` icon.
   - Result summary: Converted file name, output file size.
   - Primary "Download Converted File" button triggering instant browser download.
   - "Convert Another File" button resetting the state machine back to Idle.

### 4.3 Download Handling
- When the backend returns HTTP 200:
  - Retrieve response blob: `const blob = await response.blob()`.
  - Extract filename from `Content-Disposition` header if available:
    ```typescript
    const disposition = response.headers.get("Content-Disposition");
    let filename = defaultFilename;
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }
    ```
  - Generate object URL: `const downloadUrl = URL.createObjectURL(blob)`.
  - Automatically trigger download via synthetic anchor:
    ```typescript
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    ```
  - Provide manual download button as well for convenience.

### 4.4 Error States & User Feedback
- Errors must be rendered as prominent dismissable alert cards (`AlertCircle` icon with rose/red background).
- **Backend Offline / Connection Refused:**
  - Detected when `fetch` throws `TypeError: Failed to fetch`.
  - Message: *"Cannot connect to the conversion service. Please verify that the Botock backend server is running on http://localhost:8000."*
- **No Tables Detected (`pdf-to-excel`):**
  - Backend returns 400 with detail `"No tables found in the PDF"`.
  - Message: *"No tabular data was detected in this PDF. Please ensure the document contains structured tables or borders."*
- **Invalid File Type:**
  - Backend returns 400 with detail `"File must be a PDF"` or `"File must be a Word document"`.
  - Message: Directly display the server validation message.
- **Server Error (HTTP 500):**
  - Parse JSON `{"detail": "..."}` or display *"An unexpected error occurred during document conversion. The file may be password-protected or corrupted."*

---

## 5. ToolEngine.ts Registration Details

The 3 tools must be registered in `frontend/app/tools/ToolEngine.ts` using the following exact specifications:

```typescript
// ============================================================================
// PDF to Word Tool Registration
// ============================================================================
ToolRegistry.registerTool({
  id: "pdf-to-word",
  name: "PDF to Word Converter",
  description: "Convert PDF documents into editable Microsoft Word (.docx) files with preserved layout, formatting, and fonts.",
  category: "pdf",
  seoTitle: "Convert PDF to Word Online Free - Botock",
  seoDescription: "Convert PDF documents to editable Microsoft Word (.docx) files accurately. Free, fast document layout reconstruction.",
  endpoint: "http://localhost:8000/api/convert/pdf-to-docx",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document to convert to Word DOCX format",
      required: true,
    },
  ],
  outputs: [
    {
      name: "docxFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      description: "The converted Microsoft Word (.docx) document",
    },
  ],
});

// ============================================================================
// Word to PDF Tool Registration
// ============================================================================
ToolRegistry.registerTool({
  id: "word-to-pdf",
  name: "Word to PDF Converter",
  description: "Convert Microsoft Word documents (.docx, .doc) into high-fidelity, printable PDF files.",
  category: "pdf",
  seoTitle: "Convert Word to PDF Online Free - Botock",
  seoDescription: "Convert Word DOC and DOCX documents into clean, portable PDFs instantly with perfect layout preservation.",
  endpoint: "http://localhost:8000/api/convert/docx-to-pdf",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The Word document (.docx or .doc) to convert to PDF",
      required: true,
    },
  ],
  outputs: [
    {
      name: "pdfFile",
      type: "file",
      mimeType: "application/pdf",
      description: "The converted PDF document",
    },
  ],
});

// ============================================================================
// PDF to Excel Tool Registration
// ============================================================================
ToolRegistry.registerTool({
  id: "pdf-to-excel",
  name: "PDF to Excel Converter",
  description: "Extract data tables from PDF documents into structured Microsoft Excel (.xlsx) spreadsheets.",
  category: "pdf",
  seoTitle: "Convert PDF to Excel Online Free - Botock",
  seoDescription: "Extract tables and tabular data from PDF files into editable Excel (.xlsx) spreadsheets automatically.",
  endpoint: "http://localhost:8000/api/convert/pdf-to-excel",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document containing tables to extract into an Excel spreadsheet",
      required: true,
    },
  ],
  outputs: [
    {
      name: "excelFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      description: "The generated Excel (.xlsx) spreadsheet containing extracted tables across sheets",
    },
  ],
});
```

---

## 6. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Document Conversion | PDF to Word Endpoint | FastAPI endpoint using `pdf2docx` to reconstruct PDF layout into DOCX | `file: UploadFile` (multipart/form-data) | FileResponse with DOCX binary, MIME `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 400 if filename not `.pdf`; 500 if conversion fails | `backend/main.py:28-51` |
| 2 | Document Conversion | Word to PDF Endpoint | FastAPI endpoint using headless LibreOffice (`soffice`) to convert DOC/DOCX to PDF | `file: UploadFile` (multipart/form-data) | FileResponse with PDF binary, MIME `application/pdf` | 400 if not `.doc`/`.docx`; 501 if LibreOffice missing; 500 if CLI fails | `backend/main.py:96-138` |
| 3 | Document Conversion | PDF to Excel Endpoint | FastAPI endpoint using `pdfplumber` and `openpyxl` to extract tables into multi-sheet XLSX | `file: UploadFile` (multipart/form-data) | FileResponse with XLSX binary, MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | 400 if not `.pdf`; 400 if no tables found; 500 if conversion fails | `backend/main.py:53-95` |
| 4 | Architecture | ToolEngine Registration | Programmatic schema registry for AI agent discoverability and autonomous invocation | `ToolSchema` object with parameters and outputs | Registered in `ToolRegistry` map | Throws or fails schema assertions if required fields are omitted | `frontend/app/tools/ToolEngine.ts` |
| 5 | Architecture | Crash Isolation Boundary | Dedicated React error boundary per tool for fault containment | Unhandled error in React component tree | Renders isolated error UI with retry action (`reset()`) | Quarantines crashes to tool without breaking global application | `frontend/app/tools/pdf-compress/error.tsx` & `.agents/rules/tool_architecture.md` |
| 6 | SEO | Server-Side SEO & Schema | Server Component metadata and Schema.org `SoftwareApplication` JSON-LD | Static route render | Next.js `<head>` metadata + JSON-LD script | None; rendered during SSR/SSG | `frontend/app/tools/pdf-compress/page.tsx` & `.agents/rules/tool_architecture.md` |
| 7 | UI/UX | Drag-and-Drop Dropzone | Accessible drag-and-drop file upload zone with format constraints | User file drop or file dialog selection | Staged `File` object in React state | Rejection callback triggered on invalid MIME or extension | `react-dropzone` & `frontend/app/tools/pdf-compress/Client.tsx` |
| 8 | UI/UX | Conversion Progress Feedback | Animated loading feedback with status text during network transfer and backend processing | User click on Convert button | Spinner indicator (`Loader2`) and disabled submit button | Catch block resets loading state and surfaces error message | `frontend/app/tools/pdf-compress/Client.tsx` |
| 9 | UI/UX | Dynamic Blob Download | Memory-safe browser download generation using object URLs and synthetic anchor triggers | Binary Response Blob | Downloaded file in user's browser download folder | Catch block cleans up temporary object URLs | `frontend/app/tools/pdf-compress/Client.tsx` |
| 10 | Discoverability | Tools Directory Integration | Main tools catalog with category filters and navigation cards | Tool metadata list | Interactive card linking to `/tools/[tool-name]` | Active card styling vs "ready" under-construction badge | `frontend/app/tools/page.tsx:121-146` |

---

## 7. Edge Cases Table

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|------------------------------|
| 1 | `pdf-to-word` | File named `document.PDF` (uppercase extension) | Accepted and converted successfully (`file.filename.lower().endswith('.pdf')` handles uppercase). |
| 2 | `pdf-to-word` | Text-only or image-only scanned PDF | `pdf2docx` extracts text or embeds scanned pages as images into DOCX. If PDF is encrypted/password-protected, backend catches exception and returns HTTP 500 `Conversion failed: ...`. |
| 3 | `pdf-to-word` | File named `test.docx` uploaded to `pdf-to-word` | Client dropzone rejects file immediately; if bypassed, backend returns HTTP 400 `{"detail": "File must be a PDF"}`. |
| 4 | `word-to-pdf` | File with `.doc` legacy Word format | Accepted by backend (`.endswith(('.doc', '.docx'))`); LibreOffice converts `.doc` to `.pdf` seamlessly. |
| 5 | `word-to-pdf` | LibreOffice missing from host system | Backend returns HTTP 501 `{"detail": "LibreOffice is not installed on the server"}`. Client displays clear error informing user of server dependency. |
| 6 | `pdf-to-excel` | PDF containing no tables (e.g. plain novel or photograph) | Backend raises HTTP 400 `{"detail": "No tables found in the PDF"}`. Client surfaces friendly guidance: "No tables found in this PDF document." |
| 7 | `pdf-to-excel` | PDF with multi-page complex tables | Backend creates individual worksheets named `P{page}_T{table}` up to 31 characters, combining all detected tables into a structured XLSX. |
| 8 | All Tools | Backend server offline or port 8000 unreachable | Client `fetch` throws `TypeError: Failed to fetch`. Client catches exception and displays alert: "Cannot connect to conversion backend server at http://localhost:8000." |
| 9 | All Tools | File with special characters or spaces in filename (e.g. `My Report (Final) #2026.pdf`) | Backend preserves base name; client handles URL-encoded Content-Disposition header and falls back safely to sanitized local filename. |
| 10 | All Tools | User navigates away or unmounts component mid-conversion | Active blob URLs are revoked via `useEffect` cleanup (`URL.revokeObjectURL`); ongoing fetch is aborted if `AbortController` is attached. |
| 11 | All Tools | User rapidly clicks "Convert" button multiple times | Submit button is immediately disabled upon first click, preventing duplicate parallel uploads. |
| 12 | All Tools | Zero-byte or corrupt file | Client validates `file.size > 0`; backend catches processing exception and returns HTTP 500 with descriptive error detail. |

---

## 8. Acceptance Criteria & Build Verification

### 8.1 Functional Acceptance Criteria
- [ ] **PDF to Word Tool (`/tools/pdf-to-word`):**
  - Accepts `.pdf` files via drag-and-drop or file picker.
  - Rejects non-PDF files on client and server.
  - Sends `multipart/form-data` POST request to `http://localhost:8000/api/convert/pdf-to-docx`.
  - Downloads valid `.docx` file upon completion with filename matching original document.
  - Displays graceful error if backend is unreachable or returns 400/500.
- [ ] **Word to PDF Tool (`/tools/word-to-pdf`):**
  - Accepts `.docx` and `.doc` files via drag-and-drop or file picker.
  - Rejects non-Word files on client and server.
  - Sends `multipart/form-data` POST request to `http://localhost:8000/api/convert/docx-to-pdf`.
  - Downloads valid `.pdf` file upon completion with filename matching original document.
  - Displays graceful error if LibreOffice is missing (501) or conversion fails (500).
- [ ] **PDF to Excel Tool (`/tools/pdf-to-excel`):**
  - Accepts `.pdf` files via drag-and-drop or file picker.
  - Sends `multipart/form-data` POST request to `http://localhost:8000/api/convert/pdf-to-excel`.
  - Downloads valid `.xlsx` file upon completion with worksheets for detected tables.
  - Gracefully displays specific error message when no tables are detected in the PDF (400).
- [ ] **Navigation & Directory:**
  - Tools are accessible at `/tools/pdf-to-word`, `/tools/word-to-pdf`, and `/tools/pdf-to-excel`.
  - In `frontend/app/tools/page.tsx`, tool statuses are updated to `"active"`.

### 8.2 Architectural & SEO Acceptance Criteria
- [ ] Registered in `frontend/app/tools/ToolEngine.ts` with complete parameter and output schemas, `category: "pdf"`, and `isClientSideOnly: false`.
- [ ] Each tool directory contains `page.tsx`, `Client.tsx`, and `error.tsx`.
- [ ] `page.tsx` exports strict `Metadata` and embeds `SoftwareApplication` JSON-LD schema.
- [ ] `error.tsx` catches React tree exceptions and provides a recovery action (`reset()`).

### 8.3 Build Verification
- [ ] `npm run build` executed in `frontend/` exits with code 0 (success).
- [ ] No TypeScript compilation errors (`tsc --noEmit`).
- [ ] No unresolved imports or missing package dependencies.
- [ ] Turbopack / Next.js produces static and dynamic routes without route conflict.
