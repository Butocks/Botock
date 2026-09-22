# Frontend Architectural Survey & Integration Guide

**Author**: `explorer_survey_frontend`  
**Date**: 2026-09-21  
**Target Subsystem**: Next.js 16.3.5 Frontend (`/home/mir/Documents/botock/frontend`)  
**Objective**: Survey architectural patterns, existing tool implementations, shared utilities, and conventions to establish the blueprint for backend-powered document conversion tools (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`).

---

## 1. Executive Summary & Context

The Botock platform is a Next.js 16 (React 19, Turbopack, Tailwind CSS v4) creative and utility platform. Prior tools (Milestones 1–3) have focused on in-browser client-side execution (via Canvas, Pica, browser-image-compression, FFmpeg WASM, and PDF.js / Tesseract.js). 

The new milestone introduces **backend-powered conversion tools** that connect to a Python FastAPI backend (`http://localhost:8000`) for heavy document processing:
1. `pdf-to-word`: converts `.pdf` to `.docx` via `/api/convert/pdf-to-docx`
2. `word-to-pdf`: converts `.doc`/`.docx` to `.pdf` via `/api/convert/docx-to-pdf`
3. `pdf-to-excel`: converts `.pdf` tables to `.xlsx` via `/api/convert/pdf-to-excel`

This survey establishes the standard design pattern, component structure, error handling, ToolEngine registration, directory linking, and API communication rules required for these tools.

---

## 2. Existing Tool Implementation Patterns in `frontend/app/tools/`

Every tool follows a strict three-file architecture inside its dedicated route directory `frontend/app/tools/[tool-name]/`:
1. `page.tsx` — Server Component (SEO metadata, JSON-LD schema, dynamic import of client component with fallback skeleton).
2. `Client.tsx` — Client Component (`"use client";`, UI layout, file drag-and-drop, state machine, conversion request, binary blob handling, and download triggers).
3. `error.tsx` — React Error Boundary (`"use client";`, crash containment, user recovery button, diagnostics logging).

### 2.1 Structure of `page.tsx` (Server Component)

Reference implementations:
- `frontend/app/tools/image-crop/page.tsx`
- `frontend/app/tools/image-resize/page.tsx`
- `frontend/app/tools/pdf-compress/page.tsx`

#### Core Responsibilities:
1. **Metadata Export (`export const metadata: Metadata`)**:
   - `title`: SEO-targeted page title (e.g. `"Convert PDF to Word Online Free - Botock"`).
   - `description`: Detailed meta description emphasizing privacy, speed, and accuracy.
   - `keywords`: Targeted search terms.
   - `openGraph`: Social sharing tags (`title`, `description`).
2. **JSON-LD `SoftwareApplication` Structured Data**:
   - Injected via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />`.
   - Fields: `@context`, `@type: "SoftwareApplication"`, `name`, `operatingSystem: "Web Browser"` or `"Any"`, `applicationCategory: "UtilitiesApplication"`, `description`, `offers: { "@type": "Offer", "price": "0", "priceCurrency": "USD" }`.
3. **Dynamic Client Import with Loading Skeleton**:
   - Dynamically imports `Client.tsx` using `next/dynamic` to ensure clean client hydration and avoid SSR mismatches with browser APIs.
   - Skeleton provides a dashed container (`border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 min-h-[400px]`) with a centered spinner (`animate-spin border-4 border-emerald-500 border-t-transparent rounded-full`) and descriptive text.
4. **Header Banner**:
   - Centered container (`max-w-5xl mx-auto py-12 px-4`).
   - Feature badge (e.g. `<ShieldCheck /> Fast & Secure Document Conversion`).
   - Main `<h1>` title and informative description `<p>`.

#### Standard `page.tsx` Template:
```tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileText, ShieldCheck } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Conversion Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Convert PDF to Word Online Free - DOCX Converter - Botock",
  description: "Convert PDF documents to editable Microsoft Word (DOCX) files online. Fast, secure, and preserves formatting.",
  openGraph: {
    title: "Convert PDF to Word Online Free - Botock",
    description: "Convert PDF documents to editable DOCX files instantly.",
  },
};

export default function PdfToWordPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Fast &amp; Secure Document Conversion</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Convert PDF to Word
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Transform your PDF files into editable Microsoft Word documents with high formatting accuracy.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF to Word Converter",
            "operatingSystem": "Any",
            "applicationCategory": "UtilitiesApplication",
            "description": "Convert PDF documents into editable Microsoft Word DOCX files.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <Client />
    </div>
  );
}
```

---

### 2.2 Structure of `Client.tsx` (Client Component)

Reference implementations:
- `frontend/app/tools/image-resize/Client.tsx`
- `frontend/app/tools/image-to-webp/Client.tsx`
- `frontend/app/tools/pdf-compress/Client.tsx`

#### Core Responsibilities:
1. **File Ingestion via `react-dropzone`**:
   - Configured with `accept` MIME types and extensions:
     - PDF tools: `accept: { "application/pdf": [".pdf"] }`
     - Word to PDF: `accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "application/msword": [".doc"] }`
   - Limits: `maxFiles: 1`, `multiple: false`.
   - Clear visual states when drag active (`border-emerald-500 bg-emerald-500/5`).
2. **State Machine (`idle` | `converting` | `success` | `error`)**:
   - `file: File | null` — Selected file object.
   - `isConverting: boolean` / `status: 'idle' | 'converting' | 'success' | 'error'`.
   - `errorMessage: string | null` — Human-friendly error message extracted from API or network failure.
   - `resultBlobUrl: string | null` — Object URL created via `URL.createObjectURL(blob)`.
   - `resultFilename: string` — Derived output filename (e.g. `document.docx`).
   - `resultSize: number | null` — Byte size of the output file.
3. **Progress Indicators & Spinners**:
   - Spinner icon: `<Loader2 className="w-5 h-5 animate-spin" />` from `lucide-react`.
   - Dynamic status message (e.g. `"Uploading document...", "Converting pages...", "Finalizing..."`).
4. **Backend Fetch & Binary Blob Handling**:
   - Create `FormData`:
     ```ts
     const formData = new FormData();
     formData.append("file", file);
     ```
   - POST to backend URL:
     ```ts
     const response = await fetch(`${API_BASE}/api/convert/pdf-to-docx`, {
       method: "POST",
       body: formData,
     });
     ```
   - Handle error JSON if `!response.ok`:
     ```ts
     if (!response.ok) {
       let errorMsg = `Conversion failed (${response.status})`;
       try {
         const errorJson = await response.json();
         if (errorJson.detail) errorMsg = errorJson.detail;
       } catch {
         // fallback
       }
       throw new Error(errorMsg);
     }
     ```
   - Extract Blob from successful response:
     ```ts
     const blob = await response.blob();
     const url = URL.createObjectURL(blob);
     ```
5. **Download Trigger & Memory Cleanup**:
   - Anchor download tag:
     ```tsx
     <a
       href={resultBlobUrl}
       download={resultFilename}
       className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
     >
       <Download className="w-4 h-4" /> Download Converted File
     </a>
     ```
   - **Crucial Memory Management**: Revoke existing object URLs upon new upload or component unmount:
     ```ts
     useEffect(() => {
       return () => {
         if (resultBlobUrlRef.current) {
           URL.revokeObjectURL(resultBlobUrlRef.current);
         }
       };
     }, []);
     ```

---

### 2.3 Structure of `error.tsx` (Crash Isolation)

Reference implementations:
- `frontend/app/tools/image-resize/error.tsx`
- `frontend/app/tools/video-to-mp3/error.tsx`
- `frontend/app/tools/error.tsx` (parent fallback)

Next.js App Router error boundaries require `"use client";`. They catch any unhandled runtime exception within their route folder without crashing the root application or navbar/footer.

#### Standard `error.tsx` Pattern:
```tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tool crash caught by boundary:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        Document Conversion Failed
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        We encountered an unexpected error while converting your document. This might be due to a corrupted file, password protection, or temporary backend unavailability. Thanks to Botock&apos;s isolated architecture, the rest of the application remains unaffected.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95 shadow-md cursor-pointer hover:opacity-90"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
```

---

## 3. ToolEngine Specification & Registry (`frontend/app/tools/ToolEngine.ts`)

`ToolEngine.ts` is the architectural backbone that exposes every tool to future autonomous AI agent assistants.

### 3.1 Interface Specifications

```typescript
export type ToolCategory = "pdf" | "image" | "video" | "ai";

export interface ToolParameterBounds {
  min?: number;
  max?: number;
  step?: number;
}

export interface ToolParameter {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "enum";
  description: string;
  required: boolean;
  options?: string[]; // For enum types
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  bounds?: ToolParameterBounds;
}

export interface ToolOutput {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "object";
  mimeType?: string;
  description: string;
}

export interface ToolSchema {
  id: string; // Route slug: e.g., "pdf-to-word"
  name: string; // Human title: e.g., "PDF to Word"
  description: string; // Clear description for human and AI
  category: ToolCategory; // "pdf" | "image" | "video" | "ai"
  parameters: ToolParameter[];
  outputs?: ToolOutput[];
  
  // SEO Metadata
  seoTitle: string;
  seoDescription: string;
  
  // Executable endpoint
  endpoint: string; // e.g., "/tools/pdf-to-word"
  isClientSideOnly: boolean; // MUST BE FALSE for backend-powered tools!
}

export class ToolRegistry {
  private static tools: Map<string, ToolSchema> = new Map();

  static registerTool(schema: ToolSchema);
  static getTool(id: string): ToolSchema | undefined;
  static getAllTools(): ToolSchema[];
  static searchTools(query: string): ToolSchema[];
}
```

### 3.2 Key Rules for Backend Conversion Tools in `ToolEngine.ts`:
- **`category`**: `"pdf"` (all three tools operate on or produce PDF/Office documents).
- **`isClientSideOnly`**: `false` (in contrast to WASM/Canvas tools which have `true`).
- **`endpoint`**: `"/tools/pdf-to-word"`, `"/tools/word-to-pdf"`, `"/tools/pdf-to-excel"`.
- **`parameters`**: Exactly specifies the input file requirement (`type: "file"`, `required: true`).
- **`outputs`**: Specifies the output file with proper MIME type (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

### 3.3 Registration Snippets for the 3 Conversion Tools

```typescript
// ============================================================================
// Backend Document Conversion Tools (Milestone 4)
// ============================================================================

ToolRegistry.registerTool({
  id: "pdf-to-word",
  name: "PDF to Word",
  description: "Convert PDF documents into editable Microsoft Word DOCX files with formatting preservation.",
  category: "pdf",
  seoTitle: "Convert PDF to Word Online Free - DOCX Converter - Botock",
  seoDescription: "Convert PDF documents to editable Microsoft Word DOCX files online. Fast, secure, and preserves formatting.",
  endpoint: "/tools/pdf-to-word",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to convert to Word DOCX",
      required: true,
    },
  ],
  outputs: [
    {
      name: "docxFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      description: "Converted editable Microsoft Word document (.docx)",
    },
  ],
});

ToolRegistry.registerTool({
  id: "word-to-pdf",
  name: "Word to PDF",
  description: "Convert Microsoft Word DOC and DOCX documents into clean, portable PDF files.",
  category: "pdf",
  seoTitle: "Convert Word to PDF Online Free - DOCX to PDF - Botock",
  seoDescription: "Convert Word DOC and DOCX files into portable PDF documents online with high fidelity.",
  endpoint: "/tools/word-to-pdf",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The Microsoft Word file (.doc or .docx) to convert",
      required: true,
    },
  ],
  outputs: [
    {
      name: "pdfFile",
      type: "file",
      mimeType: "application/pdf",
      description: "Converted portable document format file (.pdf)",
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-to-excel",
  name: "PDF to Excel",
  description: "Extract spreadsheet tables from PDF documents into Microsoft Excel XLSX workbooks.",
  category: "pdf",
  seoTitle: "Convert PDF to Excel Online Free - Extract Tables to XLSX - Botock",
  seoDescription: "Extract tables from PDF files into Microsoft Excel spreadsheets (.xlsx) instantly.",
  endpoint: "/tools/pdf-to-excel",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file containing tables to extract to Excel",
      required: true,
    },
  ],
  outputs: [
    {
      name: "excelFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      description: "Extracted Excel workbook (.xlsx)",
    },
  ],
});
```

---

## 4. Directory Grid & Navigation (`frontend/app/tools/page.tsx`)

`frontend/app/tools/page.tsx` displays the searchable directory of all Botock tools.

### 4.1 Current Status of the 3 Tools
In lines 121–146 of `frontend/app/tools/page.tsx`, the three conversion tools are already defined:
```typescript
    {
      id: "pdf-word",
      name: "PDF to Word (DOCX)",
      desc: "Convert PDF documents into fully editable Microsoft Word files.",
      category: "pdf",
      status: "ready",
      href: "/tools/pdf-to-word",
      icon: FileText,
    },
    {
      id: "word-pdf",
      name: "Word to PDF",
      desc: "Convert Word DOC/DOCX documents into clean, portable PDFs.",
      category: "pdf",
      status: "ready",
      href: "/tools/word-to-pdf",
      icon: FileText,
    },
    {
      id: "pdf-excel",
      name: "PDF to Excel",
      desc: "Extract spreadsheet tables from PDFs into XLSX spreadsheets.",
      category: "pdf",
      status: "ready",
      href: "/tools/pdf-to-excel",
      icon: FileText,
    },
```

### 4.2 Status Badge Transition:
- Currently: `status: "ready"` (displays `<Clock className="w-3 h-3" /> Ready` badge in primary purple).
- When implemented: Update to `status: "active"` (displays `<CheckCircle2 className="w-3 h-3" /> Live Now` badge in emerald green).
- Icon note: `FileText` is currently imported. `FileSpreadsheet` can also be imported from `lucide-react` for `pdf-to-excel` if desired.

---

## 5. Dependencies, Styling & UI Conventions

### 5.1 Package Dependencies
From `frontend/package.json`:
- Next.js: `16.3.5` (Turbopack, App Router)
- React: `19.2.8`
- `lucide-react`: `^1.47.0` (Comprehensive icon set)
- `react-dropzone`: `^20.1.2` (File drag-and-drop)
- Tailwind CSS: `^4` (`@tailwindcss/postcss: ^4`)

### 5.2 Tailwind CSS v4 Theme & Classes
From `frontend/app/globals.css`:
- Theme variables:
  - `bg-card`: Card background (`#ffffff` in light mode, `#111114` in dark mode)
  - `border-border`: Border color (`#e2e8f0` light, `rgba(255, 255, 255, 0.08)` dark)
  - `text-foreground`: Text color (`#0f172a` light, `#fafafa` dark)
  - `text-muted-foreground`: Secondary text (`#64748b` light, `#94a3b8` dark)
  - Primary accent: `emerald-500` / `emerald-600` for tool action buttons, success states, and badges.
  - Secondary accent: `violet-600` / `primary` (`#7c3aed`) for general platform links.
  - Error state: `rose-500` / `bg-rose-500/10` / `border-rose-500/20` for error banners.
- Key utility classes:
  - Container: `max-w-5xl mx-auto py-12 px-4`
  - Card: `w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm`
  - Dropzone: `border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]`

---

## 6. Backend Integration & API Conventions

### 6.1 Backend URL Resolution Convention
In `frontend/utils/runtime-urls.ts`:
```typescript
export function getBackendUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }

  return getSiteUrl();
}
```
**CRITICAL OBSERVATION**:
If `NEXT_PUBLIC_BACKEND_URL` is unset, `getBackendUrl()` falls back to `getSiteUrl()`, which returns `window.location.origin` (the Next.js host, e.g. `http://localhost:3000`), NOT the FastAPI server (`http://localhost:8000`).

**Recommendation**:
In client code and/or a shared conversion utility, resolve the backend URL with an explicit fallback to `http://localhost:8000`:
```typescript
export function getConversionBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://localhost:8000";
}
```

### 6.2 Backend Endpoints Specification (from `backend/main.py`)

| Tool Route | Backend Endpoint | Method | Form Field | Accepted Extensions | Response MIME Type | Default Download Filename |
|---|---|---|---|---|---|---|
| `/tools/pdf-to-word` | `/api/convert/pdf-to-docx` | `POST` | `file` (`UploadFile`) | `.pdf` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `[name].docx` |
| `/tools/word-to-pdf` | `/api/convert/docx-to-pdf` | `POST` | `file` (`UploadFile`) | `.doc`, `.docx` | `application/pdf` | `[name].pdf` |
| `/tools/pdf-to-excel` | `/api/convert/pdf-to-excel` | `POST` | `file` (`UploadFile`) | `.pdf` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `[name].xlsx` |

### 6.3 Request Execution Pattern:
```typescript
const formData = new FormData();
formData.append("file", file); // Must match UploadFile param name: 'file'

const backendUrl = getConversionBackendUrl();
const response = await fetch(`${backendUrl}/api/convert/pdf-to-docx`, {
  method: "POST",
  body: formData,
  // Note: Do NOT set Content-Type header manually; the browser automatically sets
  // multipart/form-data with the correct boundary string.
});
```

### 6.4 Response Handling & Error Mapping:
FastAPI returns:
- `400 Bad Request`: Invalid file format or `"No tables found in the PDF"`.
- `422 Unprocessable Entity`: Missing form field or invalid input.
- `500 Internal Server Error`: Conversion failure (detail: `"Conversion failed: ..."`).
- `501 Not Implemented`: LibreOffice missing on backend (for `docx-to-pdf`).

Frontend extraction logic:
```typescript
if (!response.ok) {
  let message = `Conversion failed (HTTP ${response.status})`;
  try {
    const errorJson = await response.json();
    if (errorJson.detail) {
      message = typeof errorJson.detail === "string" 
        ? errorJson.detail 
        : JSON.stringify(errorJson.detail);
    }
  } catch {
    // If response is not JSON
  }
  throw new Error(message);
}

const blob = await response.blob();
const objectUrl = URL.createObjectURL(blob);
```

### 6.5 CORS Configuration Alignment:
`backend/main.py` explicitly allows:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This is fully compatible with local Next.js client-side requests from `http://localhost:3000`.

---

## 7. Implementation Blueprint for the 3 Conversion Tools

### 7.1 Shared Helper Utility (Recommended)
Create `frontend/lib/conversion/api.ts` (or inline per client):
```typescript
import { getBackendUrl } from "@/utils/runtime-urls";

export function getConversionApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  return "http://localhost:8000";
}

export async function convertDocument(
  endpoint: string,
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.("Uploading document...");
  const formData = new FormData();
  formData.append("file", file);

  const apiBase = getConversionApiBase();
  onProgress?.("Processing conversion on server...");
  const res = await fetch(`${apiBase}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let detail = `Error ${res.status}: ${res.statusText}`;
    try {
      const err = await res.json();
      if (err.detail) detail = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    } catch {
      // not JSON
    }
    throw new Error(detail);
  }

  onProgress?.("Downloading converted file...");
  const blob = await res.blob();
  
  // Extract filename from Content-Disposition if present
  let filename = "";
  const disposition = res.headers.get("Content-Disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  return { blob, filename };
}
```

### 7.2 Tool File Paths Checklist
Each tool must reside in:
1. `frontend/app/tools/pdf-to-word/`
   - `page.tsx`
   - `Client.tsx`
   - `error.tsx`
2. `frontend/app/tools/word-to-pdf/`
   - `page.tsx`
   - `Client.tsx`
   - `error.tsx`
3. `frontend/app/tools/pdf-to-excel/`
   - `page.tsx`
   - `Client.tsx`
   - `error.tsx`
4. Register all 3 in `frontend/app/tools/ToolEngine.ts`
5. Switch status from `"ready"` to `"active"` in `frontend/app/tools/page.tsx`

---

## 8. Verification & Next Steps
- Run `npm run build` in `/home/mir/Documents/botock/frontend` after implementing to verify 0 build, TypeScript, and lint errors.
- Ensure automated e2e / integration tests verify error boundaries, dropzone events, and binary download responses.
