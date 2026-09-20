# Handoff Report: Baseline Frontend Architecture Survey

**Agent**: `explorer_survey_1`  
**Milestone**: Baseline Architecture & Convention Survey for 6 New Tools  
**Handoff Type**: Hard (Task Complete)  
**Report Reference**: `/home/mir/Documents/botock/.agents/explorer_survey_1/survey_report.md`

---

## 1. Observation

1. **`frontend/package.json` Audit**:
   - Next.js version: `16.3.5`
   - React / React DOM: `19.2.8`
   - Tailwind CSS: `^4` (with `@tailwindcss/postcss: ^4`, `@import "tailwindcss";`, `@theme inline` in `app/globals.css`)
   - TypeScript: `^5` (with `"strict": true`, `"moduleResolution": "bundler"`, `"paths": { "@/*": ["./*"] }`)
   - Icons: `lucide-react` (`^1.47.0`)
   - UI / File Drop: `react-dropzone` (`^20.1.2`)
   - State: `zustand` (`^5.0.15`)
   - PDF library: `pdf-lib` (`^1.17.1`) is **already installed**
   - Missing dependencies for the 6 new tools:
     - `@ffmpeg/ffmpeg`: NOT installed
     - `@ffmpeg/util`: NOT installed
     - `@ffmpeg/core`: NOT installed
     - `tesseract.js`: NOT installed
     - `pdfjs-dist`: NOT installed

2. **Tool Architecture Pattern (`app/tools/image-crop/` & Reference Image Tools)**:
   - Each tool directory resides in `frontend/app/tools/[tool-name]/` with a uniform 3-file structure:
     - `page.tsx`: Server Component defining `metadata: Metadata`, dynamic import with loading skeleton (`dynamic(() => import("./Client"), { loading: ... })`), centered header (`<h1 className="text-3xl font-black mb-4">`), and `<script type="application/ld+json">` containing `SoftwareApplication` schema.
     - `Client.tsx` (or `[ToolName]Client.tsx`): Client Component (`"use client"`) using `useDropzone` for drag-and-drop, 2/3 column layout (`grid grid-cols-1 lg:grid-cols-3 gap-8`), action button (`bg-emerald-600 hover:bg-emerald-500`), progress indicator (`w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden`), result preview, and download anchor (`<a href={resultUrl} download="...">`). All object URLs are revoked upon reset or unmount.
     - `error.tsx`: React Error Boundary Client Component (`"use client"`) receiving `{ error, reset }`, logging error to console, displaying isolated error card with `AlertTriangle`, and providing a `Try Again` button calling `reset()`.

3. **Tool Registry & Catalog (`frontend/app/tools/ToolEngine.ts` and `frontend/app/tools/page.tsx`)**:
   - `ToolCategory` type: `"pdf" | "image" | "video" | "ai"`
   - `ToolSchema` interface requires: `id`, `name`, `description`, `category`, `parameters` (array of `ToolParameter`), `seoTitle`, `seoDescription`, `endpoint`, `isClientSideOnly`.
   - `ToolRegistry.registerTool(...)` is called for 11 existing tools.
   - None of the 6 new tools (`video-trim`, `video-speed`, `video-to-mp3`, `video-compress`, `pdf-ocr`, `pdf-compress`) are currently registered in `ToolEngine.ts`.
   - `frontend/app/tools/page.tsx` has `video-trim` and `video-speed` pointing to `/tools/video-editor?tool=...`, and `pdf-compress`, `pdf-ocr`, `video-to-mp3`, `video-compress` marked with status `"ready"`.

4. **Next.js Configuration (`frontend/next.config.ts`)**:
   - Only `/tools/image-remove-bg` currently has headers configured (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`).
   - For multi-threaded FFmpeg (`@ffmpeg/core-mt`), COOP/COEP headers must be added for `/tools/video-:path*`. Alternatively, single-threaded `@ffmpeg/core` avoids COOP/COEP headers.

5. **Components Directory**:
   - `frontend/components/` does not exist. Components live in `frontend/app/components/` (`Navbar`, `Footer`, `AdBanner`, `ThemeToggle`, etc.).
   - No generic shared UI library (e.g. custom Button, Slider, or FileUploader) exists; each tool is self-contained with inline Tailwind classes.

6. **Baseline Build Integrity**:
   - Executed `npm run build` in `frontend/`:
   - Result: Compiled successfully in 10.9s, TypeScript checks passed in 24.7s, 30 static pages generated, exit code 0.

---

## 2. Logic Chain

1. **Dependency Analysis**:
   - The user request requires: 4 video tools (`video-trim`, `video-speed`, `video-to-mp3`, `video-compress`) using FFmpeg, 1 PDF OCR tool (`pdf-ocr`) using `tesseract.js` + `pdfjs-dist`, and 1 PDF compression tool (`pdf-compress`) using `pdf-lib` and Canvas.
   - Observation shows `pdf-lib` is already installed.
   - Therefore, only `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `@ffmpeg/core`, `tesseract.js`, and `pdfjs-dist` need to be installed.

2. **Architectural Consistency**:
   - The 5 existing image tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`) and `image-crop` all follow the identical 3-file pattern (`page.tsx`, `Client.tsx`, `error.tsx`).
   - Adhering to this exact structure for the 6 new tools satisfies both rule requirements (`tool_architecture.md`: isolated error boundaries, SEO JSON-LD schema, client-side execution) and user prompt expectations.

3. **COOP/COEP Header Strategy**:
   - Next.js 16.3.5 Turbopack builds all pages statically.
   - If `@ffmpeg/core` (single-threaded) is used, no SharedArrayBuffer is required, eliminating cross-origin resource blocking.
   - If `@ffmpeg/core-mt` is used, `next.config.ts` must be extended with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` scoped strictly to `/tools/video-:path*`.

4. **Self-Contained Tool UI Design**:
   - Because `frontend/components/` does not host shared UI primitives, tools should not create coupled cross-tool dependencies. Instead, each tool implements its UI inline using Tailwind utility classes, `react-dropzone`, and `lucide-react`, matching the look-and-feel of `image-crop` and `image-remove-bg`.

---

## 3. Caveats

1. **WASM Asset Loading & Turbopack**:
   - `pdfjs-dist` and `tesseract.js` rely on web workers and external trained data / worker scripts. In Next.js client components, worker scripts must be loaded dynamically or configured with external CDN URLs / public directory paths to prevent Turbopack bundler resolution errors.
2. **FFmpeg Core Selection**:
   - Single-threaded `@ffmpeg/core` is simpler and header-free, but large video transcode operations can take longer than multi-threaded `@ffmpeg/core-mt`. For client-side browser performance, video operations should be tested with representative test files (e.g. small MP4 clips).
3. **PDF Compression via Canvas**:
   - `pdf-lib` alone cannot downsample raster images in a PDF directly; it requires parsing or extracting images, downscaling/compressing via Canvas, and re-embedding. Alternatively, rendering pages to Canvas with `pdfjs-dist` and generating a re-compressed PDF using `pdf-lib` is an effective pattern.

---

## 4. Conclusion

The existing codebase is clean, modern, and in a healthy baseline state (`npm run build` exits 0). All architectural patterns (RSC `page.tsx` with JSON-LD, isolated `error.tsx` error boundaries, client-side `"use client"` `Client.tsx`, and `ToolEngine.ts` schema registration) are clearly defined and tested in the previous image tools milestone. The 6 new tools can be implemented directly following these proven blueprints once the missing packages (`@ffmpeg/ffmpeg`, `@ffmpeg/util`, `@ffmpeg/core`, `tesseract.js`, `pdfjs-dist`) are installed.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Check Dependencies**:
   ```bash
   node -e 'const pkg = require("./frontend/package.json"); console.log(pkg.dependencies);'
   ```
   Verify `pdf-lib` exists, and `@ffmpeg/*`, `tesseract.js`, `pdfjs-dist` are not present.

2. **Inspect Reference Tool Structure**:
   ```bash
   ls frontend/app/tools/image-crop/
   # Expect: ImageCropClient.tsx, error.tsx, page.tsx
   ```

3. **Verify Existing Build Baseline**:
   ```bash
   npm --prefix frontend run build
   # Expect: Exit code 0, 30 static routes generated
   ```

4. **Inspect ToolEngine Registry**:
   ```bash
   grep "ToolRegistry.registerTool" frontend/app/tools/ToolEngine.ts
   # Expect: 11 existing tools registered; 6 new tools not yet present
   ```
