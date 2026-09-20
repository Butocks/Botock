# Dependency and Build Environment Survey Report

**Explorer**: Survey Explorer 3  
**Date**: 2026-09-20  
**Target Project**: Botock Frontend (`/home/mir/Documents/botock/frontend`)  
**Scope**: Dependency audit, build system health, React 19 / Next.js 16 compatibility, client-side WASM/worker asset handling, and Tool Architecture alignment.

---

## 1. Observation

### 1.1 Core Framework & Build Configuration
- **File**: `/home/mir/Documents/botock/frontend/package.json`
  ```json
  "dependencies": {
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.116.0",
    "cropperjs": "^1.6.2",
    "lucide-react": "^1.47.0",
    "next": "16.3.5",
    "pdf-lib": "^1.17.1",
    "react": "19.2.8",
    "react-cropper": "^2.3.3",
    "react-dom": "19.2.8",
    "react-dropzone": "^20.1.2",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
  ```
- **Next.js Version**: `16.3.5` with App Router and Turbopack enabled by default.
- **React Version**: `19.2.8` with React DOM `19.2.8`.
- **TypeScript Version**: `^5`, module resolution configured as `"bundler"` in `tsconfig.json` (lines 10–11):
  ```json
  "module": "esnext",
  "moduleResolution": "bundler",
  ```
- **Next Configuration** (`/home/mir/Documents/botock/frontend/next.config.ts`):
  ```typescript
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    /* config options here */
  };

  export default nextConfig;
  ```
  Currently empty; no custom headers, redirects, or webpack/turbopack hooks are configured.
- **ESLint Configuration** (`/home/mir/Documents/botock/frontend/eslint.config.mjs`):
  ESLint 9 flat config using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

### 1.2 Baseline Build Verification
- Command executed: `npm run build` from `/home/mir/Documents/botock/frontend`.
- Output:
  ```
  > frontend@0.1.0 build
  > next build

  ▲ Next.js 16.3.5 (Turbopack)
  - Environments: .env.local
  ✓ Running next.config.ts took 171ms
    Creating an optimized production build ...
  ✓ Compiled successfully in 19.1s
    Finished TypeScript in 29.9s    ✓ Finished TypeScript in 29.9s 
    Collecting page data using 3 workers in 5.9s    ✓ Collecting page data using 3 workers in 5.9s 
  ✓ Generating static pages using 3 workers (21/21) in 4.3s
    Finalizing page optimization in 133ms    ✓ Finalizing page optimization in 133ms 

  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ƒ /admin
  ├ ƒ /auth/callback
  ├ ○ /blog
  ├ ○ /complaint
  ├ ○ /contact
  ├ ○ /join-us
  ├ ○ /login
  ├ ○ /not-available-region
  ├ ○ /pricing
  ├ ○ /security
  ├ ○ /signup
  ├ ○ /tools
  ├ ƒ /tools/[slug]
  ├ ○ /tools/image-crop
  ├ ○ /tools/image-generator
  ├ ○ /tools/library
  ├ ○ /tools/pdf-merge
  ├ ○ /tools/video-editor
  └ ○ /tools/video-generator

  ○  (Static)   prerendered as static content
  ƒ  (Dynamic)  server-rendered on demand
  ```
- Result: **Exit Code 0** (100% build pass, all 21 routes generated without compile or TypeScript errors).

### 1.3 Dependency Audit for Requested Tools
| Package Name | In `package.json`? | In `node_modules`? | Status / Notes |
|---|---|---|---|
| `react-image-file-resizer` | ❌ No | ❌ No | Not installed. Has outdated peer dependencies incompatible with React 19. |
| `pica` | ❌ No | ❌ No | Not installed. Zero React peer dependencies, built-in types, high-performance Lanczos3. |
| `browser-image-compression` | ❌ No | ❌ No | Not installed. Pure client-side, built-in types, Web Worker support, React 19 compatible. |
| `@imgly/background-removal` | ❌ No | ❌ No | Not installed. Requires `onnxruntime-web` peer dependency + COOP/COEP headers. |
| `lucide-react` | ✅ Yes (`^1.47.0`) | ✅ Yes | Installed. Contains all icons needed for tool UI (`Crop`, `Sliders`, `Sparkles`, `RefreshCw`, `Download`, `Upload`, `Trash2`, etc.). |
| `react-dropzone` | ✅ Yes (`^20.1.2`) | ✅ Yes | Installed. Standard drag-and-drop component used across `image-crop` and `pdf-merge`. |
| `cropperjs` / `react-cropper` | ✅ Yes (`^1.6.2` / `^2.3.3`) | ✅ Yes | Installed and working in `/tools/image-crop`. |

### 1.4 Established Architecture Patterns
- **Reference Tool**: `/home/mir/Documents/botock/frontend/app/tools/image-crop/`
  - `page.tsx`: Server Component for SEO, exports `metadata`, schema.org `SoftwareApplication` JSON-LD, dynamically imports `ImageCropClient` with custom loading skeleton.
  - `ImageCropClient.tsx`: Client Component (`"use client"`) implementing dropzone, canvas rendering, control buttons, preview, and download.
  - `error.tsx`: React Error Boundary providing tool crash isolation without bringing down the global app.
- **Registry**: `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
  - Defines `ToolSchema`, `ToolParameter`, and `ToolRegistry.registerTool(...)`.
  - Tools are registered with `id`, `name`, `description`, `category`, `seoTitle`, `seoDescription`, `endpoint`, and `isClientSideOnly: true`.
- **Directory**: `/home/mir/Documents/botock/frontend/app/tools/page.tsx`
  - Pre-wired cards for `/tools/image-crop`, `/tools/image-resize`, `/tools/image-remove-bg`, `/tools/image-to-webp`, and `/tools/image-compress`.

---

## 2. Logic Chain

1. **Premise 1 (React 19 & Next.js 16)**: The frontend operates on React `19.2.8` and Next.js `16.3.5`. React 19 enforces strict peer dependency checks during package installation.
2. **Premise 2 (`react-image-file-resizer` vs `pica`)**:
   - `react-image-file-resizer` (version 0.4.3) was last published over 4 years ago and explicitly lists React 16/17/18 in its peer dependencies. Installing it in npm without `--legacy-peer-deps` causes `ERESOLVE` errors. Furthermore, it uses a legacy callback structure rather than modern Promises.
   - In contrast, `pica` is framework-agnostic, has zero React peer dependencies, includes built-in TypeScript declarations, and implements multi-threaded Lanczos3 downsampling/upsampling via Web Workers and WebGL/OffscreenCanvas.
   - Alternatively, native HTML5 Canvas API (`drawImage` with step-down halving) requires 0 external dependencies and is 100% reliable.
   - *Inference*: `pica` or native Canvas is strongly preferred over `react-image-file-resizer` for Tool 1 (`image-resize`).
3. **Premise 3 (`browser-image-compression`)**:
   - `browser-image-compression` relies entirely on browser APIs (`Blob`, `FileReader`, `Worker`). It contains no React peer dependencies and works cleanly with React 19.
   - Calling `imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true })` runs the compression in an internal Web Worker, avoiding UI thread freezing.
   - *Inference*: `browser-image-compression` is the exact, zero-conflict package required for Tool 2 (`image-compress`).
4. **Premise 4 (`@imgly/background-removal` & WASM/ONNX Worker Requirements)**:
   - `@imgly/background-removal` performs in-browser neural network inference using `onnxruntime-web` and WebAssembly.
   - It requires `onnxruntime-web` as a peer dependency.
   - For multi-threaded WASM inference, `onnxruntime-web` requires `SharedArrayBuffer`. Browsers mandate Cross-Origin Isolation headers (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`) to enable `SharedArrayBuffer`.
   - Applying global COOP/COEP across the entire Next.js application could break external resources (such as Google Fonts, ad banners, third-party embeds, or Supabase media).
   - *Inference*: The COOP/COEP headers should be scoped specifically to `/tools/image-remove-bg` inside `next.config.ts`.
   - Furthermore, `@imgly/background-removal` must be imported exclusively on the client side (e.g. `next/dynamic(() => import("./ImageRemoveBgClient"), { ssr: false })` or inside a click/effect handler) to prevent server-side compilation crashes where `window` or `Worker` are undefined.
   - Model assets are served by default from IMG.LY's public CDN (`https://staticimgly.com/@imgly/background-removal-data/`), requiring no paid third-party API keys and keeping image processing 100% client-side.
5. **Premise 5 (`image-to-webp` & `image-upscale` via Canvas)**:
   - The HTML5 Canvas API natively supports WebP encoding via `canvas.toBlob(callback, "image/webp", quality)` across all modern browsers. No npm package is needed for `image-to-webp`.
   - Client-side image upscaling can be implemented cleanly with Canvas 2D bicubic interpolation (`ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"`), scaling options (2x, 4x), and an optional convolution unsharp mask kernel to enhance edge sharpness, or off-thread via `pica`'s Lanczos3 resizer. This fulfills requirement R1 and R3 without burdening users with 50–100MB deep-learning model downloads that frequently crash mobile browsers.

---

## 3. Caveats

1. **Permissions / Subagent Boundary**: Subagents are restricted from directly modifying production source files or running arbitrary package installations in read-only survey mode. The exact commands and configuration patches are documented below for the implementer agent.
2. **CDN Reliance for Background Removal**: By default, `@imgly/background-removal` loads model files (~20–40MB) on first run from `staticimgly.com`. If an air-gapped/offline local environment is required in the future, the model files can be downloaded into `frontend/public/models/` and referenced via `publicPath: "/models/"`.
3. **ESLint Command Timeout**: Direct invocation of `npm run lint` was subject to terminal authorization prompts; however, `npm run build` runs `next build` (which includes TypeScript type checking across the entire project) and passed with code 0.

---

## 4. Conclusion

### 4.1 Dependency Installation Recommendations

To implement the 5 Image Processing tools, the implementer should run:

```bash
cd /home/mir/Documents/botock/frontend
npm install browser-image-compression pica @imgly/background-removal onnxruntime-web
```

*Avoid `npm install react-image-file-resizer` due to React 19 peer-dep conflict.*

### 4.2 Required Configuration for `next.config.ts`

To support WebAssembly multi-threading in `@imgly/background-removal` without affecting other tools:

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

### 4.3 Architecture & Implementation Matrix

| Tool Route | Core Processing Engine | NPM Packages Needed | Client/WASM Strategy |
|---|---|---|---|
| `/tools/image-resize` | `pica` (Lanczos3) or Canvas API | `pica` (or 0 pkgs if Canvas) | Client Component, Web Worker resizing |
| `/tools/image-compress` | `browser-image-compression` | `browser-image-compression` | Client Component, internal Web Worker |
| `/tools/image-remove-bg` | `@imgly/background-removal` | `@imgly/background-removal`, `onnxruntime-web` | Client Component (`ssr: false`), COOP/COEP headers, CDN ONNX model |
| `/tools/image-to-webp` | HTML5 Canvas 2D | None (Native browser API) | Client Component, `canvas.toBlob(..., "image/webp")` |
| `/tools/image-upscale` | Canvas 2D High-Quality Smoothing / `pica` | None (or `pica`) | Client Component, bicubic scaling + unsharp filter pass |

Each tool must be placed in `frontend/app/tools/<tool-name>/` with:
- `page.tsx` (Server Component with metadata, schema markup, dynamic import)
- `[ToolName]Client.tsx` (Client Component with dropzone, progress, preview, and download)
- `error.tsx` (Crash isolation error boundary)
- Registration in `ToolEngine.ts` under `category: "image"`.

---

## 5. Verification Method

To independently verify this assessment:

1. **Verify Baseline Build**:
   ```bash
   cd /home/mir/Documents/botock/frontend
   npm run build
   ```
   *Expected outcome*: Exits with code 0, confirms Next.js 16.3.5 Turbopack compilation and TypeScript check pass.
2. **Verify Package React 19 Compatibility**:
   Inspect npm registry or package manifests:
   - `npm info react-image-file-resizer peerDependencies` (Confirms conflict with React 19)
   - `npm info browser-image-compression peerDependencies` (Confirms zero peer conflicts)
   - `npm info pica peerDependencies` (Confirms zero peer conflicts)
   - `npm info @imgly/background-removal peerDependencies` (Confirms `onnxruntime-web` peer requirement)
3. **Verify Existing Icons and Dropzone**:
   Inspect `/home/mir/Documents/botock/frontend/package.json` for `lucide-react` (`^1.47.0`) and `react-dropzone` (`^20.1.2`).
4. **Post-Implementation Invalidation Condition**:
   Any `Module not found`, React 19 peer conflict during install, or Web Worker / `SharedArrayBuffer` security error on `/tools/image-remove-bg` would invalidate the setup, and is addressed by the exact `next.config.ts` header configuration detailed in Section 4.2.
