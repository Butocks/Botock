# Project Scope: Backend Document Conversion Suite (orchestrator_4)

## Architecture
- **Framework**: Next.js 16.3.5 (Turbopack, App Router) + React 19.2.8 + TypeScript 5
- **Backend Service**: Python 3.13 FastAPI backend (`http://localhost:8000`), endpoints under `/api/convert/`
- **Tool Architecture Pattern**:
  - Each tool lives in `frontend/app/tools/[tool-name]/`:
    - `page.tsx`: Server Component for SEO, OpenGraph metadata, JSON-LD `SoftwareApplication` schema, dynamic client import with loading skeleton.
    - `Client.tsx`: Client Component (`"use client"`) with `react-dropzone`, state machine (idle, converting, success, error), multipart `fetch` to backend, Blob/URL download handler, error alerts.
    - `error.tsx`: React Error Boundary providing tool crash isolation without affecting the rest of the application.
- **Engine & Registry**:
  - `frontend/app/tools/ToolEngine.ts`: Central schema registry (`ToolSchema`, `ToolParameter`, `ToolRegistry.registerTool`). Registered with `category: "pdf"`, `isClientSideOnly: false`, input/output schemas.
  - `frontend/app/tools/page.tsx`: Directory grid showing tool cards with `"active"` status badges.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | `pdf-to-word` Tool | Next.js tool page, dropzone for `.pdf`, POST to `/api/convert/pdf-to-docx`, binary `.docx` download, error boundary | M1 | ORIGINAL_REQUEST R1.1 | DONE |
| 2 | `word-to-pdf` Tool | Next.js tool page, dropzone for `.docx`/`.doc`, POST to `/api/convert/docx-to-pdf`, binary `.pdf` download, error boundary | M2 | ORIGINAL_REQUEST R1.2 | DONE |
| 3 | `pdf-to-excel` Tool | Next.js tool page, dropzone for `.pdf`, POST to `/api/convert/pdf-to-excel`, binary `.xlsx` download, handles "No tables found", error boundary | M3 | ORIGINAL_REQUEST R1.3 | DONE |
| 4 | Crash Isolation (`error.tsx`) | Independent Error Boundary for all 3 tools to isolate client exceptions | M1, M2, M3 | tool_architecture.md §2 | DONE |
| 5 | SEO & JSON-LD Schemas | Rich Metadata + `SoftwareApplication` JSON-LD schema on each tool page | M1, M2, M3 | tool_architecture.md §3 | DONE |
| 6 | ToolEngine Schema Registration | Programmatic AI-Agent-Ready tool registration in `ToolEngine.ts` with parameter schemas | M4 | tool_architecture.md §1 | DONE |
| 7 | Tool Directory Integration | Update `frontend/app/tools/page.tsx` status to `"active"` for the 3 tools | M4 | survey_frontend | DONE |
| 8 | E2E Testing Suite | Independent opaque-box test runner covering Tiers 1-4 for the 3 tools | E2E Track | Architecture & Pattern | DONE |
| 9 | Production Build Integrity | `npm run build` exits 0 with zero TypeScript or compilation errors (39 static pages) | M5 | ORIGINAL_REQUEST R3 | DONE |
| 10 | Forensic Integrity Audit | Systematic integrity forensics ensuring genuine implementation without mock shortcuts | M5 | Integrity Policy | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Test Suite Track | Build opaque-box test runner and publish `TEST_READY.md` | Survey | DONE |
| M1 | Tool `pdf-to-word` | `frontend/app/tools/pdf-to-word/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M2 | Tool `word-to-pdf` | `frontend/app/tools/word-to-pdf/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M3 | Tool `pdf-to-excel` | `frontend/app/tools/pdf-to-excel/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M4 | ToolEngine & Directory Sync | Register tools in `ToolEngine.ts` & update status in `app/tools/page.tsx` | M1, M2, M3 | DONE |
| M5 | Final Verification & Audit | Run `npm run build`, execute full E2E suite, review, challenge, and forensic audit | E2E, M4 | DONE |

## Interface Contracts

### 1. File Upload & API Contract
- Method: `POST`
- Base URL: `(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, '')`
- Header: Browser sets `Content-Type: multipart/form-data; boundary=...` automatically
- Body: `FormData` with single field named `"file"`:
  - `pdf-to-word`: `POST /api/convert/pdf-to-docx`, accepts `.pdf`, returns `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `word-to-pdf`: `POST /api/convert/docx-to-pdf`, accepts `.docx`, `.doc`, returns `application/pdf`
  - `pdf-to-excel`: `POST /api/convert/pdf-to-excel`, accepts `.pdf`, returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Response Handling:
  - Status 200: Parse `res.blob()`, extract filename from `Content-Disposition` header or fallback to `<original-name>.<ext>`, trigger download link, cleanup via `URL.revokeObjectURL`.
  - Status 400 / 422 / 500 / 501: Parse `res.json()`, extract `detail` message, display user-friendly error alert.
  - Network Error: Display server unreachable notice.

### 2. Component Exports Contract
Every `frontend/app/tools/[tool-name]/`:
- `page.tsx`:
  - `export const metadata: Metadata`
  - `export default function Page()` (Server Component rendering header, JSON-LD, dynamically imported Client with skeleton fallback)
- `Client.tsx`:
  - `export default function Client()` (Client Component `"use client"` with dropzone, state machine, download trigger)
- `error.tsx`:
  - `export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void })`

### 3. ToolEngine Schema Contract (`ToolEngine.ts`)
```typescript
ToolRegistry.registerTool({
  id: "pdf-to-word" | "word-to-pdf" | "pdf-to-excel",
  name: string,
  description: string,
  category: "pdf",
  seoTitle: string,
  seoDescription: string,
  endpoint: "/api/convert/...",
  isClientSideOnly: false,
  parameters: ToolParameter[]
});
```

## Code Layout
- `frontend/app/tools/pdf-to-word/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/word-to-pdf/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/pdf-to-excel/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/ToolEngine.ts`
- `frontend/app/tools/page.tsx`
- `frontend/scripts/test-conversion-e2e.mjs`
