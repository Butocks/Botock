# Project: Botock Client-Side Image Suite

## Architecture
- **Framework**: Next.js 16.3.5 (Turbopack, App Router) + React 19.2.8 + TypeScript 5
- **Design Philosophy**: 100% Client-side execution. Zero server-side API dependencies, zero external network calls for processing, 100% privacy-preserving.
- **Tool Architecture Pattern**:
  - Each tool lives in `frontend/app/tools/[tool-name]/`
  - `page.tsx`: Server Component for SEO, OpenGraph metadata, JSON-LD `SoftwareApplication` schema, dynamic client import with loading skeleton.
  - `Client.tsx`: Client Component (`"use client"`) with `react-dropzone`, reactive controls, progress/spinner feedback, Canvas/Worker execution, preview, and download.
  - `error.tsx`: React Error Boundary providing tool crash isolation without affecting the rest of the application.
- **Engine & Registry**:
  - `frontend/app/tools/ToolEngine.ts`: Central schema registry (`ToolSchema`, `ToolParameter`, `ToolRegistry.registerTool`).
  - `frontend/app/tools/page.tsx`: Directory grid showing tool cards with active status badges.
- **Dual Track Orchestration**:
  - Implementation Track: Sequential/parallel modular tool build and integration.
  - E2E Testing Track: Independent opaque-box test harness validating requirements, input boundaries, error handling, and build integrity.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Tool Dependencies & Config | Install required packages (`pica`, `browser-image-compression`, `@imgly/background-removal`, `onnxruntime-web`) and configure Next.js COOP/COEP headers for WASM | M0 | Survey 3 |
| 2 | Image Resizer (`image-resize`) | Resize by width, height, or percentage using `pica` (Lanczos3) or Canvas API, with aspect ratio lock, preview, and download | M1 | ORIGINAL_REQUEST R1.1 |
| 3 | Image Compressor (`image-compress`) | Compress images using `browser-image-compression` with max size MB and quality slider, showing before/after size stats | M2 | ORIGINAL_REQUEST R1.2 |
| 4 | Background Remover (`image-remove-bg`) | Remove background using client-side AI (`@imgly/background-removal`), showing spinner/progress bar, transparency grid preview, and PNG download | M3 | ORIGINAL_REQUEST R1.3 |
| 5 | Image to WebP Converter (`image-to-webp`) | Convert JPG/PNG/etc. to optimized WebP format with quality control and size comparison using HTML5 Canvas API | M4 | ORIGINAL_REQUEST R1.4 |
| 6 | Image Upscaler (`image-upscale`) | Upscale image resolution (2x, 4x) using high-quality Canvas bicubic smoothing and unsharp sharpening pass | M5 | ORIGINAL_REQUEST R1.5 |
| 7 | ToolEngine Registration | Register all 5 tools in `frontend/app/tools/ToolEngine.ts` with complete `ToolSchema` specifications | M6 | ORIGINAL_REQUEST R2 |
| 8 | Directory & Navigation Sync | Update `frontend/app/tools/page.tsx` to set status to `"active"` and add missing tools | M6 | Survey 2 |
| 9 | Crash Isolation (Error Boundaries) | Ensure every tool has an `error.tsx` catching local failures gracefully without app crash | M1–M5 | ORIGINAL_REQUEST R2 & Rules |
| 10 | SEO & JSON-LD Markup | Ensure every tool `page.tsx` has Metadata + `SoftwareApplication` JSON-LD schema | M1–M5 | ORIGINAL_REQUEST R2 & Rules |
| 11 | Production Build Integrity | `npm run build` exits 0 with zero TypeScript or compilation errors | M7 | ORIGINAL_REQUEST R3 |
| 12 | Opaque-Box E2E Testing Suite | Multi-tier test suite (Tiers 1-4) validating tools independently of implementation | E2E Track | Architecture & Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Dependency & Build Config | Install `browser-image-compression`, `pica`, `@types/pica`, `@imgly/background-removal`, `onnxruntime-web`; update `next.config.ts` | none | DONE |
| M1 | Tool: `image-resize` | `frontend/app/tools/image-resize/` (`page.tsx`, `Client.tsx`, `error.tsx`) | M0 | DONE |
| M2 | Tool: `image-compress` | `frontend/app/tools/image-compress/` (`page.tsx`, `Client.tsx`, `error.tsx`) | M0 | DONE |
| M3 | Tool: `image-remove-bg` | `frontend/app/tools/image-remove-bg/` (`page.tsx`, `Client.tsx`, `error.tsx`) | M0 | DONE |
| M4 | Tool: `image-to-webp` | `frontend/app/tools/image-to-webp/` (`page.tsx`, `Client.tsx`, `error.tsx`) | none | DONE |
| M5 | Tool: `image-upscale` | `frontend/app/tools/image-upscale/` (`page.tsx`, `Client.tsx`, `error.tsx`) | none | DONE |
| M6 | Engine Registry & Navigation | Update `ToolEngine.ts` and `app/tools/page.tsx` | M1, M2, M3, M4, M5 | DONE |
| M7 | Final E2E Pass & Build Verification | Run full build (`npm run build`) and pass 100% of E2E test suite | M6, E2E Track | DONE |
| E2E | E2E Testing Suite Track | Design and construct opaque-box test suite (Tiers 1-4), emit `TEST_READY.md` | none | DONE |

## Interface Contracts

### 1. Tool Page & Client Export Contract
Every tool folder `frontend/app/tools/[tool-name]` must export:
- `page.tsx`:
  - `export const metadata: Metadata`
  - `export default function Page()` (Server Component rendering header, JSON-LD schema, and dynamically imported Client component)
- `Client.tsx`:
  - `export default function Client()` (Client Component `"use client"` implementing drag-drop, controls, processing, preview, download)
- `error.tsx`:
  - `export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void })`

### 2. ToolEngine Schema Contract (`ToolEngine.ts`)
Each tool must be registered with:
```typescript
ToolRegistry.registerTool({
  id: string,
  name: string,
  description: string,
  category: "image",
  seoTitle: string,
  seoDescription: string,
  endpoint: string,
  isClientSideOnly: true,
  parameters: ToolParameter[]
});
```

### 3. File Processing Contract
- Input: Image file from `react-dropzone` (`acceptedFiles[0]`).
- Processing: Local in-browser Canvas / Web Worker / WASM.
- Output: Data URL or Blob URL with download attribute `<a href={resultUrl} download="filename">`.

## Code Layout
- `frontend/app/tools/image-resize/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/image-compress/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/image-remove-bg/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/image-to-webp/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
- `frontend/app/tools/image-upscale/`
  - `page.tsx`
  - `Client.tsx`
  - `error.tsx`
  - `upscaler.ts`
- `frontend/app/tools/ToolEngine.ts`
- `frontend/app/tools/page.tsx`
- `frontend/next.config.ts`
- `frontend/package.json`

---

# Sub-Project: Backend Document Conversion Suite (orchestrator_4)

## Architecture
- Framework: Next.js 16.3.5 App Router + React 19.2.8 + TypeScript 5
- Backend: Python FastAPI (`http://localhost:8000`)
- Tools: `pdf-to-word`, `word-to-pdf`, `pdf-to-excel`

## Feature Inventory (Document Conversion)
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 13 | `pdf-to-word` Tool | Server page with SEO, dropzone (.pdf), multipart POST to `/api/convert/pdf-to-docx`, .docx download | M1 | ORIGINAL_REQUEST R1.1 |
| 14 | `word-to-pdf` Tool | Server page with SEO, dropzone (.docx/.doc), multipart POST to `/api/convert/docx-to-pdf`, .pdf download | M2 | ORIGINAL_REQUEST R1.2 |
| 15 | `pdf-to-excel` Tool | Server page with SEO, dropzone (.pdf), multipart POST to `/api/convert/pdf-to-excel`, .xlsx download | M3 | ORIGINAL_REQUEST R1.3 |
| 16 | Crash Isolation (`error.tsx`) | Error Boundary per tool for client crash resilience | M1, M2, M3 | tool_architecture.md §2 |
| 17 | SEO & JSON-LD Schemas | Metadata + SoftwareApplication JSON-LD schema per tool | M1, M2, M3 | tool_architecture.md §3 |
| 18 | ToolEngine Registration | AI-Agent-Ready ToolSchema registration in `ToolEngine.ts` | M4 | tool_architecture.md §1 |
| 19 | Tool Directory Integration | Update status to "active" in `app/tools/page.tsx` | M4 | survey_frontend |
| 20 | E2E Conversion Test Suite | Opaque-box test suite for document conversion tools | E2E Track | Architecture |
| 21 | Production Build & Integrity Audit | `npm run build` exits 0, forensic audit verification | M5 | ORIGINAL_REQUEST R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design opaque-box test runner, publish `TEST_READY.md` | Survey | DONE |
| M1 | Tool `pdf-to-word` | `app/tools/pdf-to-word/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M2 | Tool `word-to-pdf` | `app/tools/word-to-pdf/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M3 | Tool `pdf-to-excel` | `app/tools/pdf-to-excel/` (`page.tsx`, `Client.tsx`, `error.tsx`) | Survey | DONE |
| M4 | ToolEngine & Directory Sync | `ToolEngine.ts` & `app/tools/page.tsx` | M1, M2, M3 | DONE |
| M5 | Build & Integrity Verification | `npm run build`, E2E tests, forensic audit | E2E, M4 | DONE |

