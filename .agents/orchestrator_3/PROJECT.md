# Project: Botock Client-Side Video & PDF Tools Suite

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind CSS v4.
- **Client-Side Execution Only**: 100% in-browser processing via WebAssembly and HTML5 Canvas. Zero backend server calls (100% privacy).
- **WASM Threading Model**: Single-threaded `@ffmpeg/core` (v0.12.6) for video processing. Eliminates multi-threading `SharedArrayBuffer` requirement, avoiding COOP/COEP isolation issues on client-side route transitions and third-party resource blocking.
- **Shared Video WASM Engine**: Singleton `ffmpegManager` (`lib/ffmpeg/ffmpegManager.ts`) with custom React hook (`lib/ffmpeg/useFFmpeg.ts`) providing unified lifecycle management, progress tracking (0-100%), error handling, cancellation, and virtual filesystem cleanup.
- **PDF Engine**:
  - `pdf-ocr`: `pdfjs-dist` (v3.11.174) with unpkg CDN worker rendering pages at 2.0x scale (144 DPI) to HTML5 Canvas + `tesseract.js` (v5) worker with multi-language support (English, Spanish, French, German), progressive OCR, copy, and .txt download.
  - `pdf-compress`: `pdf-lib` (v1.17.1) indirect object stream traversal, extracting image streams, downsampling via HTML5 Canvas (JPEG quality presets 0.45, 0.65, 0.80), and in-place reference replacement with object stream compaction.
- **Tool Architecture Pattern**:
  - `page.tsx`: Server Component for SEO (`Metadata`, `SoftwareApplication` JSON-LD schema, semantic headings).
  - `Client.tsx`: `"use client"` interactive component (`useDropzone`, 2/3 column layout, parameter controls, processing status, preview, download).
  - `error.tsx`: `"use client"` Crash Isolation Error Boundary with AlertTriangle, friendly error message, and retry button.
- **Platform Registry**: All 6 tools registered in `frontend/app/tools/ToolEngine.ts` and enabled with status `"active"` in `frontend/app/tools/page.tsx`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependencies & Shared WASM Engine | Install `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `@ffmpeg/core`, `tesseract.js`, `pdfjs-dist`. Create `lib/ffmpeg/ffmpegManager.ts` & `lib/ffmpeg/useFFmpeg.ts` + PDF helpers. | M1 | survey |
| 2 | video-trim | Stream copy trimming (`-ss`, `-to`, `-c copy`) with fast cut & accurate cut options | M2 | survey |
| 3 | video-speed | Playback speed alteration (0.5x, 0.75x, 1.25x, 1.5x, 2.0x, >2.0x atempo chaining) | M2 | survey |
| 4 | video-to-mp3 | Audio extraction to MP3 (`-vn -c:a libmp3lame`) with quality/bitrate presets | M2 | survey |
| 5 | video-compress | Video size reduction via CRF presets (24/28/32), ultrafast preset, resolution scaling | M2 | survey |
| 6 | pdf-ocr | Scanned PDF text extraction via `pdfjs-dist` canvas rendering & `tesseract.js` worker | M3 | survey |
| 7 | pdf-compress | PDF image downsampling via `pdf-lib` stream replacement and Canvas JPEG compression | M3 | survey |
| 8 | Platform Registration & SEO | Register in `ToolEngine.ts`, update `app/tools/page.tsx`, ensure JSON-LD schemas | M4 | survey |
| 9 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test harness and test cases for all 6 tools | E2E | survey |
| 10| E2E Verification & Hardening | Run all E2E tests, fix any regressions, execute adversarial challenge and forensic audit | M5 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Dependencies & Shared WASM/PDF Infrastructure | Install packages, build singleton WASM loader, React hook & PDF helpers | none | DONE |
| E2E| E2E Test Suite Creation | Opaque-box test suite for all 6 tools (Tiers 1-4) -> TEST_READY.md | none | DONE |
| M2 | Video Tools Suite | Build video-trim, video-speed, video-to-mp3, video-compress (page, Client, error) | M1 | IN_PROGRESS |
| M3 | PDF Tools Suite | Build pdf-ocr, pdf-compress (page, Client, error) | M1 | IN_PROGRESS |
| M4 | ToolEngine Registration & UI Consistency | Register in ToolEngine.ts, update tools catalog page, verify npm run build | M2, M3 | PLANNED |
| M5 | E2E Test Pass & Adversarial Hardening | Pass 100% E2E tests, Tier 5 adversarial testing, Forensic Audit | M4, E2E | PLANNED |

## Interface Contracts
### Video WASM Hook (`lib/ffmpeg/useFFmpeg.ts`)
```typescript
export interface FFmpegProgress {
  ratio: number; // 0 to 1
  percent: number; // 0 to 100
  time?: number;
}

export interface UseFFmpegReturn {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, data: Uint8Array | string) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  deleteFile: (path: string) => Promise<void>;
  progress: FFmpegProgress;
  terminate: () => Promise<void>;
}
```

### PDF OCR Helper (`lib/pdf/pdfOcrHelper.ts`)
```typescript
export interface OCRPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
}

export interface OCRProgress {
  currentPage: number;
  totalPages: number;
  status: string;
  progress: number; // 0 to 100
}
```

### PDF Compression Helper (`lib/pdf/pdfCompressHelper.ts`)
```typescript
export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  ratio: number; // percentage
  blob: Blob;
  imagesCompressed: number;
}
```

## Code Layout & File Ownership
- `frontend/package.json`: Owned by M1 Worker
- `frontend/lib/ffmpeg/`: Owned by M1 Worker (`ffmpegManager.ts`, `useFFmpeg.ts`)
- `frontend/lib/pdf/`: Owned by M1 Worker (`pdfOcrHelper.ts`, `pdfCompressHelper.ts`)
- `frontend/app/tools/video-trim/`: Owned by M2 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/video-speed/`: Owned by M2 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/video-to-mp3/`: Owned by M2 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/video-compress/`: Owned by M2 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/pdf-ocr/`: Owned by M3 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/pdf-compress/`: Owned by M3 Worker (`page.tsx`, `Client.tsx`, `error.tsx`)
- `frontend/app/tools/ToolEngine.ts`: Owned by M4 Worker
- `frontend/app/tools/page.tsx`: Owned by M4 Worker
- `frontend/__tests__/e2e/`: Owned by E2E Test Writer
