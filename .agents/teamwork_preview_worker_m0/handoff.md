# Milestone 0 Handoff Report — Dependency Setup & Route Isolation Configuration

**Agent**: Milestone 0 Worker (`teamwork_preview_worker_m0`)  
**Parent Agent**: `parent` (`8cbc3124-6506-4a70-9d3c-53b14f2fe10c`)  
**Date**: 2026-09-20  
**Target Path**: `/home/mir/Documents/botock/frontend`  

---

## 1. Observation

### 1.1 Dependency Installation
- Command executed:
  ```bash
  cd /home/mir/Documents/botock/frontend
  npm install browser-image-compression pica @types/pica @imgly/background-removal onnxruntime-web
  ```
- Command result:
  - Exit code: `0`
  - Verbatim stdout:
    ```
    added 28 packages, and audited 423 packages in 2m

    153 packages are looking for funding
      run `npm fund` for details

    found 0 vulnerabilities
    ```
- Resulting `/home/mir/Documents/botock/frontend/package.json` dependencies:
  ```json
  "dependencies": {
    "@imgly/background-removal": "^1.7.0",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.116.0",
    "@types/pica": "^9.0.5",
    "browser-image-compression": "^2.0.2",
    "cropperjs": "^1.6.2",
    "lucide-react": "^1.47.0",
    "next": "16.3.5",
    "onnxruntime-web": "^1.21.0",
    "pdf-lib": "^1.17.1",
    "pica": "^10.0.3",
    "react": "19.2.8",
    "react-cropper": "^2.3.3",
    "react-dom": "19.2.8",
    "react-dropzone": "^20.1.2",
    "zustand": "^5.0.15"
  }
  ```

### 1.2 Configuration of `next.config.ts`
- File: `/home/mir/Documents/botock/frontend/next.config.ts`
- Verbatim file content:
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

### 1.3 Production Build Verification
- Command executed:
  ```bash
  cd /home/mir/Documents/botock/frontend
  npm run build
  ```
- Command result:
  - Exit code: `0`
  - Verbatim stdout:
    ```
    > frontend@0.1.0 build
    > next build

    ▲ Next.js 16.3.5 (Turbopack)
    - Environments: .env.local
    ✓ Running next.config.ts took 202ms

      Creating an optimized production build ...
    ✓ Compiled successfully in 6.1s
      Finished TypeScript in 15.6s    ✓ Finished TypeScript in 15.6s 
      Collecting page data using 3 workers in 5.3s    ✓ Collecting page data using 3 workers in 5.3s 
    ✓ Generating static pages using 3 workers (21/21) in 3.9s
      Finalizing page optimization in 61ms    ✓ Finalizing page optimization in 61ms 

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

---

## 2. Logic Chain

1. **Step 1 (Dependency Installation)**:
   - Per dispatch requirements and Survey 3 recommendations, `react-image-file-resizer` was omitted due to legacy React 16-18 peer dependency conflicts with React 19. `pica` (`^10.0.3`) along with `@types/pica` was selected for high-performance Lanczos3 resampling.
   - `browser-image-compression` (`^2.0.2`), `@imgly/background-removal` (`^1.7.0`), and its required peer dependency `onnxruntime-web` (`^1.21.0`) were installed cleanly with 0 audit vulnerabilities.
2. **Step 2 (Isolation Configuration)**:
   - Client-side neural network background removal via ONNX/WASM multi-threading requires `SharedArrayBuffer`, which modern browsers strictly gate behind Cross-Origin Isolation headers (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`).
   - To avoid cross-origin resource breakage across general app pages, these headers were scoped exclusively to `/tools/image-remove-bg` via `async headers()` in `next.config.ts`.
3. **Step 3 (Build Integrity Verification)**:
   - Running `npm run build` verified that the updated `next.config.ts` was correctly loaded (`Running next.config.ts took 202ms`), TypeScript verification passed across the entire codebase, and all 21 static and dynamic routes compiled with exit code 0.

---

## 3. Caveats

- **WASM Dynamic Loading**: Workers implementing the background removal tool (`/tools/image-remove-bg`) must ensure that `@imgly/background-removal` is only loaded on the client side (e.g. using `next/dynamic` with `ssr: false` or inside client-side event/effect handlers), as WebAssembly and Web Worker globals do not exist during SSR.
- **Model Download Bandwidth**: The first execution of `@imgly/background-removal` in the browser downloads the neural network ONNX model files from IMG.LY's CDN (~20–40MB), which will require internet access in client browsers.

---

## 4. Conclusion

Milestone 0 is complete.
- `package.json` and `package-lock.json` have been updated with all requested image processing packages (`browser-image-compression`, `pica`, `@types/pica`, `@imgly/background-removal`, and `onnxruntime-web`).
- `next.config.ts` has been configured with COOP and COEP isolation headers for `/tools/image-remove-bg`.
- `npm run build` passes with exit code 0.
- All subsequent workers can now build their respective image processing tools against these installed dependencies.

---

## 5. Verification Method

To independently verify this milestone:
1. Check installed packages in `frontend/package.json`:
   ```bash
   node -e "const pkg = require('./frontend/package.json'); ['browser-image-compression','pica','@types/pica','@imgly/background-removal','onnxruntime-web'].forEach(p => console.log(p, ':', pkg.dependencies[p]))"
   ```
2. Inspect `frontend/next.config.ts` to confirm headers configuration.
3. Run the Next.js production build:
   ```bash
   cd /home/mir/Documents/botock/frontend && npm run build
   ```
   *Expected outcome*: Exit code 0, 0 errors, successful static page generation.
