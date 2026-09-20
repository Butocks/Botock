# Baseline Frontend Architecture Survey Report

**Explorer**: `explorer_survey_1`  
**Date**: 2026-09-20  
**Target Repository**: `/home/mir/Documents/botock`  
**Target Application**: `frontend/` (Next.js 16.3.5 App Router)  
**Objective**: Comprehensive architecture and convention survey to guide implementation and verification of the 6 new client-side tools (`video-trim`, `video-speed`, `video-to-mp3`, `video-compress`, `pdf-ocr`, `pdf-compress`).

---

## 1. Dependency Audit (`frontend/package.json`)

### 1.1 Core Framework & Runtime
- **Next.js**: `16.3.5` (running App Router with Turbopack by default)
- **React / React DOM**: `19.2.8`
- **TypeScript**: `^5` (`strict: true`, `target: "ES2017"`, `moduleResolution: "bundler"`, path alias `@/*` pointing to `./*`)
- **Tailwind CSS**: `^4` (using `@tailwindcss/postcss: ^4`, `@import "tailwindcss";`, `@theme inline` in `app/globals.css`)
- **Linting**: ESLint `^9` with `eslint.config.mjs` (flat config incorporating `nextVitals` and `nextTs`)

### 1.2 Installed UI, Icons & State Libraries
- **Icons**: `lucide-react` (`^1.47.0`) — Primary iconography across all pages and tools
- **State Management**: `zustand` (`^5.0.15`) — Lightweight client-side state store (e.g. `useMediaStore.ts`)
- **File Upload / Dropzone**: `react-dropzone` (`^20.1.2`) — Standard file drop and selection handler across all tools
- **Image Cropping**: `cropperjs` (`^1.6.2`) and `react-cropper` (`^2.3.3`)
- **Client AI / Background Removal**: `@imgly/background-removal` (`^1.7.0`), `onnxruntime-web` (`^1.21.0`)
- **Image Processing**: `browser-image-compression` (`^2.0.2`), `pica` (`^10.0.3`), `@types/pica` (`^9.0.5`)
- **PDF Manipulation**: `pdf-lib` (`^1.17.1`) — **ALREADY INSTALLED and available**

### 1.3 Audit of Required Libraries for the 6 New Tools
| Library | Status in `package.json` | Used For | Notes |
|---|---|---|---|
| `@ffmpeg/ffmpeg` | ❌ **Missing** | Video tools core controller (`video-trim`, `video-speed`, `video-to-mp3`, `video-compress`) | Needs installation (typically `^0.12.x`) |
| `@ffmpeg/util` | ❌ **Missing** | Video tools helper (`fetchFile`, `toBlobURL`) | Needs installation |
| `@ffmpeg/core` | ❌ **Missing** | Single-threaded WASM core for FFmpeg | Highly recommended to avoid COOP/COEP header complications |
| `tesseract.js` | ❌ **Missing** | OCR text extraction (`pdf-ocr`) | Needs installation (typically `^5.x`) |
| `pdfjs-dist` | ❌ **Missing** | PDF rendering to canvas for OCR & rasterization | Needs installation (typically `^4.x` or `^3.x`) |
| `pdf-lib` | ✅ **INSTALLED** (`^1.17.1`) | PDF manipulation (`pdf-compress`) | Confirmed installed and working |

---

## 2. Tool Architecture Pattern (`app/tools/image-crop/` & Reference Image Tools)

Every tool in Botock adheres to a strict 3-file modular architecture within its own directory `frontend/app/tools/[tool-name]/`:
1. `page.tsx` (Server Component for SEO & Schema)
2. `Client.tsx` (or `[ToolName]Client.tsx`) (Client Component for logic & UI)
3. `error.tsx` (Client Component Error Boundary for crash isolation)

### 2.1 Server Component (`page.tsx`)
- **Role**: Server-rendered entry point ensuring full SEO crawlability and JSON-LD schema delivery.
- **Export Contract**:
  - `export const metadata: Metadata = { title, description, openGraph, keywords }`
  - `export default function Page()`
- **Dynamic Import**: Dynamically imports the Client component with a custom loading skeleton:
  ```tsx
  import dynamic from "next/dynamic";
  
  const Client = dynamic(() => import("./Client"), {
    loading: () => (
      <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
      </div>
    ),
  });
  ```
- **Page Layout**:
  - Outer wrapper: `<div className="max-w-5xl mx-auto py-12 px-4">`
  - Centered Header:
    ```tsx
    <div className="text-center mb-10">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">[Tool Title]</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">[Tool Description]</p>
    </div>
    ```
- **SoftwareApplication JSON-LD Schema**:
  Injected via a `<script type="application/ld+json">` tag:
  ```tsx
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Botock [Tool Name]",
        "operatingSystem": "Web Browser",
        "applicationCategory": "MultimediaApplication",
        "description": "[Tool Description]",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      })
    }}
  />
  ```

### 2.2 Client Component (`Client.tsx`)
- **Directives**: `"use client";`
- **Main Container**:
  ```tsx
  <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
  ```
- **File Upload / Dropzone Pattern (`react-dropzone`)**:
  - Unloaded state displays an interactive dashed drop zone:
    ```tsx
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-emerald-500 bg-emerald-500/5"
          : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drop a file here</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Supports [Formats]</p>
    </div>
    ```
- **Loaded 2-Column or 3-Column Layout**:
  - `grid grid-cols-1 lg:grid-cols-3 gap-8`
  - **Left / Main Column** (`lg:col-span-2`): Source preview container (`rounded-xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-2`) plus adjustment controls/toolbars (e.g. speed options, time sliders, quality sliders, start over/reset button).
  - **Right Column** (`border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8`):
    - Primary action button:
      ```tsx
      <button
        onClick={handleProcess}
        disabled={isProcessing}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2"
      >
        Process / Convert
      </button>
      ```
    - Progress Bar (when active):
      ```tsx
      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      ```
    - Result Preview & Download CTA:
      ```tsx
      <a
        href={resultUrl}
        download={downloadFileName}
        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
      >
        <Download className="w-4 h-4" /> Download Result
      </a>
      ```
- **Memory Management**:
  All object URLs created via `URL.createObjectURL(blob)` are revoked in `useEffect` cleanup or when a new file is loaded to prevent browser memory leaks.

### 2.3 Error Boundary (`error.tsx`)
- **Directives**: `"use client";`
- **Props**: `{ error: Error & { digest?: string }; reset: () => void }`
- **Design Pattern**:
  ```tsx
  "use client";
  import { useEffect } from "react";
  import { AlertTriangle } from "lucide-react";

  export default function ToolError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
      console.error("Tool crashed:", error);
    }, [error]);

    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          Processing Failed
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          We encountered an error while processing your file. Because of Botock's isolated architecture, the rest of the application remains unaffected.
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }
  ```

---

## 3. Tool Registry Architecture (`frontend/app/tools/ToolEngine.ts`)

`ToolEngine.ts` is the central programmatic interface for all tools.

### 3.1 Type Definitions
```typescript
export type ToolCategory = "pdf" | "image" | "video" | "ai";

export interface ToolParameter {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "enum";
  description: string;
  required: boolean;
  options?: string[]; // For enum types
}

export interface ToolSchema {
  id: string;                 // e.g., "video-trim"
  name: string;               // e.g., "Trim Video"
  description: string;        // Human and AI readable description
  category: ToolCategory;     // "video" | "pdf" | "image" | "ai"
  parameters: ToolParameter[];
  seoTitle: string;
  seoDescription: string;
  endpoint: string;           // e.g., "/tools/video-trim"
  isClientSideOnly: boolean;  // Must be true
}
```

### 3.2 Registry Class
```typescript
export class ToolRegistry {
  private static tools: Map<string, ToolSchema> = new Map();

  static registerTool(schema: ToolSchema): void
  static getTool(id: string): ToolSchema | undefined
  static getAllTools(): ToolSchema[]
  static searchTools(query: string): ToolSchema[]
}
```

### 3.3 Current Registry State
- **Currently Registered (11 tools)**:
  - `pdf-merge`, `image-crop`, `image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`, `pdf-split`, `pdf-watermark`, `pdf-rotate`, `pdf-page-delete`
- **Missing Registrations (The 6 New Tools)**:
  1. `video-trim` (category: `"video"`)
  2. `video-speed` (category: `"video"`)
  3. `video-to-mp3` (category: `"video"`)
  4. `video-compress` (category: `"video"`)
  5. `pdf-ocr` (category: `"pdf"`)
  6. `pdf-compress` (category: `"pdf"`)

### 3.4 Tools Directory Catalog (`frontend/app/tools/page.tsx`)
In `app/tools/page.tsx`, the directory displays tool cards with categories (`"ai" | "pdf" | "image" | "video" | "converters"`) and statuses (`"active" | "ready"`):
- `pdf-compress`: currently listed with status `"ready"`, href `"/tools/pdf-compress"`
- `pdf-ocr`: currently listed with status `"ready"`, href `"/tools/pdf-ocr"`
- `video-trim`: currently routed to `"/tools/video-editor?tool=trim"`
- `video-speed`: currently routed to `"/tools/video-editor?tool=speed"`
- `video-to-mp3`: currently listed with status `"ready"`, href `"/tools/video-to-mp3"`
- `video-compress`: currently listed with status `"ready"`, href `"/tools/video-compress"`
*When implementing the 6 new tools, their links should point to their dedicated routes (`/tools/[tool-name]`) and their statuses set to `"active"`.*

---

## 4. Next.js Configuration & WASM Headers (`frontend/next.config.ts`)

### 4.1 Current Configuration
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/tools/image-remove-bg",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 4.2 Security, COOP/COEP & WebAssembly Considerations
1. **Multi-threaded FFmpeg (`@ffmpeg/core-mt`)**:
   - Requires `SharedArrayBuffer`, which modern browsers only expose in a cross-origin isolated environment.
   - Requires headers:
     - `Cross-Origin-Opener-Policy: same-origin`
     - `Cross-Origin-Embedder-Policy: require-corp`
   - Scoping recommendation: Scope headers to `/tools/:path*` or `/tools/video-:path*`.
   - **Caveat**: `require-corp` forces all loaded sub-resources (fonts, images, external scripts) to include `Cross-Origin-Resource-Policy` or CORS headers.
2. **Single-threaded FFmpeg (`@ffmpeg/core`)**:
   - Does NOT use `SharedArrayBuffer`.
   - Runs cleanly inside a standard Web Worker without requiring COOP/COEP headers.
   - Recommended in `ORIGINAL_REQUEST.md`: *"Alternatively, use the single-threaded `@ffmpeg/core` to avoid header issues entirely."*
3. **Turbopack & Worker Bundling**:
   - Next.js 16 uses Turbopack by default.
   - Packages like `@ffmpeg/ffmpeg`, `tesseract.js`, and `pdfjs-dist` must be dynamically imported on the client side (`await import(...)` or `dynamic(..., { ssr: false })`).
   - For `pdfjs-dist`: The worker script (`pdf.worker.min.mjs`) must be configured to point to a reliable CDN URL (e.g. unpkg or cdnjs) or a local worker file in `public/`.

---

## 5. UI Components & Layout Inspection

### 5.1 Shared Components Directory
- Notice: `frontend/components/` does not exist; all shared components are located in `frontend/app/components/`.
- Existing components in `frontend/app/components/`:
  - `Navbar.tsx` (Global header & navigation)
  - `Footer.tsx` (Global footer)
  - `AdBanner.tsx` (Ad placement banner)
  - `ThemeToggle.tsx` (Light / Dark theme switch)
  - `ToolGlideTicker.tsx` (Continuous marquee ticker)
  - `ToolSuggestions.tsx` (Related tools suggestions card)
  - `ToolsSlider.tsx` (Tool showcase carousel)
  - `VideoGalleryShowcase.tsx` (Community video gallery)

### 5.2 Absence of Generic UI Primitives
- The codebase **does not use** a component library like shadcn/ui, Radix, or custom shared Button/Slider/FileUploader wrappers.
- Instead, each tool implements its UI natively using Tailwind CSS utility classes and `react-dropzone`.
- This ensures complete independence and zero risk of cross-tool component coupling or cascading styling regressions.

---

## 6. Baseline Verification & Build Health

### 6.1 Build Test
- Ran `npm run build` in `frontend/`:
  - Output: **Compiled successfully in 10.9s**, finished TypeScript in 24.7s, generated 30 static pages.
  - Exit code: **0** (Clean success).
  - No TypeScript or lint errors.
- Existing routes compiled cleanly:
  - 6 Image tools: `image-compress`, `image-crop`, `image-generator`, `image-remove-bg`, `image-resize`, `image-to-webp`, `image-upscale`
  - 5 PDF tools: `pdf-merge`, `pdf-page-delete`, `pdf-rotate`, `pdf-split`, `pdf-watermark`
  - 2 Video tools (initial versions): `video-editor`, `video-generator`
  - Dynamic catch-all: `[slug]` (fallback for tools under construction)

---

## 7. Actionable Synthesis for Implementation Teams

### 7.1 New Dependencies Required
To implement the 6 tools, run in `frontend/`:
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util @ffmpeg/core tesseract.js pdfjs-dist
```
*(Note: `pdf-lib` is already installed)*

### 7.2 Directory & File Layout for the 6 New Tools
```
frontend/app/tools/
├── video-trim/
│   ├── page.tsx
│   ├── Client.tsx
│   └── error.tsx
├── video-speed/
│   ├── page.tsx
│   ├── Client.tsx
│   └── error.tsx
├── video-to-mp3/
│   ├── page.tsx
│   ├── Client.tsx
│   └── error.tsx
├── video-compress/
│   ├── page.tsx
│   ├── Client.tsx
│   └── error.tsx
├── pdf-ocr/
│   ├── page.tsx
│   ├── Client.tsx
│   └── error.tsx
└── pdf-compress/
    ├── page.tsx
    ├── Client.tsx
    └── error.tsx
```

### 7.3 Integration Checklist
1. **ToolEngine Registration**: Register all 6 tools in `frontend/app/tools/ToolEngine.ts` with complete `ToolSchema` entries (parameters, categories, SEO titles/descriptions).
2. **Directory Catalog Sync**: Update `frontend/app/tools/page.tsx` tool cards to point to dedicated URLs and set status to `"active"`.
3. **COOP/COEP Headers in `next.config.ts`**: Add headers for `/tools/video-:path*` if multi-threaded WASM is used, or verify single-threaded `@ffmpeg/core` works without headers.
4. **Error Boundaries**: Every tool must contain an `error.tsx` catching runtime WASM or parsing errors without crashing the main application.
5. **Production Build**: Verify `npm run build` succeeds with exit code 0.
