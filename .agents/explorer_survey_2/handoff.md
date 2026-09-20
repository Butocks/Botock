# Handoff Report: Client-Side Video Tools Investigation (`survey_video_tools`)

**Agent:** `explorer_survey_2`  
**Working Directory:** `/home/mir/Documents/botock/.agents/explorer_survey_2/`  
**Handoff Type:** Hard (Task Complete)  
**Primary Deliverable:** `/home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md`

---

## 1. Observation

1. **Frontend Architecture & Dependencies:**
   - File: `/home/mir/Documents/botock/frontend/package.json`
     - Line 19: `"next": "16.3.5"`
     - Line 23: `"react": "19.2.8"`
     - Line 28: Packages `@ffmpeg/ffmpeg`, `@ffmpeg/core`, `@ffmpeg/util` are not yet installed in dependencies.
2. **Current Security Headers Configuration:**
   - File: `/home/mir/Documents/botock/frontend/next.config.ts`
     - Lines 4–19:
       ```typescript
       async headers() {
         return [
           {
             source: "/tools/image-remove-bg",
             headers: [
               { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
               { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
             ],
           },
         ];
       }
       ```
     - Observation: COOP/COEP headers are currently scoped only to `/tools/image-remove-bg`. In Next.js App Router, client-side route transitions (e.g. `<Link href="...">`) do not re-request the document root; therefore, navigating from an unscoped route to a scoped route leaves `window.crossOriginIsolated === false`.
3. **Tool Registry & AI-Agent Schema Standard:**
   - File: `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
     - Lines 20–34: `ToolSchema` interface requires `id`, `name`, `description`, `category: ToolCategory`, `parameters: ToolParameter[]`, `seoTitle`, `seoDescription`, `endpoint`, `isClientSideOnly`.
     - Category type (line 10): `export type ToolCategory = "pdf" | "image" | "video" | "ai";`. The `"video"` category is already defined in the union type.
4. **Tool Pattern & Isolation Architecture:**
   - File: `/home/mir/Documents/botock/frontend/app/tools/image-remove-bg/page.tsx` (Lines 4–11): Uses `dynamic(() => import("./Client"), { loading: ... })` with Server Component for SEO and JSON-LD schema (`SoftwareApplication`).
   - File: `/home/mir/Documents/botock/frontend/app/tools/image-remove-bg/error.tsx` (Lines 1–37): React Error Boundary isolating runtime failures to the tool container.
5. **`@ffmpeg/ffmpeg` v0.12+ API Specifications:**
   - Dynamic loading requires `@ffmpeg/ffmpeg` and `@ffmpeg/util`.
   - Initialization requires `toBlobURL` to load `ffmpeg-core.js` and `ffmpeg-core.wasm` as local blob URLs to avoid cross-origin script restrictions.
   - All filesystem operations are asynchronous: `await ffmpeg.writeFile()`, `await ffmpeg.readFile()`, `await ffmpeg.deleteFile()`, and command execution is `await ffmpeg.exec(string[])`.
   - Multi-threaded core (`@ffmpeg/core-mt`) requires `SharedArrayBuffer`, strict `COOP: same-origin` and `COEP: require-corp`, and loads an extra worker script (`ffmpeg-core.worker.js`). Single-threaded core (`@ffmpeg/core`) requires no special headers.

---

## 2. Logic Chain

1. **Premise 1 (From Observation 1 & 2):** Next.js 16 with React 19 uses App Router client-side routing. When users navigate between pages using `<Link>`, document-level HTTP response headers are not refreshed.
2. **Premise 2 (From Observation 2 & 5):** If `@ffmpeg/core-mt` is selected and headers are scoped to `/tools/video*`, navigating client-side from the homepage (`/`) to `/tools/video-trim` will cause `window.crossOriginIsolated` to be `false`. In this state, `SharedArrayBuffer` is undefined in the browser, causing `@ffmpeg/core-mt` to fail with a fatal runtime exception.
3. **Premise 3 (From Observation 2):** If COOP/COEP headers are applied globally (`/(.*)`), external scripts, Supabase OAuth authentication popups (`window.opener` is severed by `same-origin`), and external CDN media without CORP headers are blocked.
4. **Premise 4 (From Survey Analysis in `survey_report.md` Section 3):** Single-threaded `@ffmpeg/core` (v0.12.6) does not use `SharedArrayBuffer` and requires zero security headers. Stream copy trimming (`video-trim` with `-c copy`) and audio extraction (`video-to-mp3` with `-vn`) perform container/audio operations that take sub-second to ~2 seconds on single-threaded WASM. Video speed and video compression can run efficiently with `-preset ultrafast` and resolution downscaling (720p).
5. **Conclusion from Chain:** Single-threaded `@ffmpeg/core` is strictly superior for Botock. It prevents cross-origin navigation crashes, preserves Supabase OAuth and platform-wide scripts, and ensures 100% crash resilience adhering to Botock Tool Architecture Rule 2.
6. **Premise 5 (From Observation 3 & 4):** A singleton engine manager (`ffmpegManager.ts`) and custom hook (`useFFmpeg.ts`) will prevent reloading the ~31MB WASM binary across tools while providing unified progress reporting (0–100%), log parsing, cancellation via `ffmpeg.terminate()`, and memory reclamation via `ffmpeg.deleteFile()`.

---

## 3. Caveats

1. **WASM Linear Memory Limits:** 32-bit WebAssembly has a hard address space limit of 2GB. Peak memory consumption in client-side FFmpeg reaches ~3.5x–4.5x the video file size due to concurrent buffers (DOM File, JS Uint8Array, Emscripten MEMFS input file, MEMFS output file, read Uint8Array, and output Blob). Files over 250MB–300MB risk memory allocation failures (`RangeError` or browser tab crash). This survey assumes UI guardrails (warning at 100MB, advisory cap at 250MB) will be enforced.
2. **Network Mode:** In offline or restricted network environments, fetching `@ffmpeg/core` from `unpkg` requires an active internet connection. An optional optimization is self-hosting `ffmpeg-core.js` and `ffmpeg-core.wasm` in `public/ffmpeg/`.
3. **Stream Copy Keyframe Snapping:** Fast stream copy trimming (`-c copy`) snaps cuts to the nearest I-frame (keyframe). A dual-mode UI (Fast Lossless Cut vs Accurate Re-encoded Cut) was designed and recommended to handle user expectations.

---

## 4. Conclusion

1. Implement the 4 video tools (`video-trim`, `video-speed`, `video-to-mp3`, `video-compress`) using single-threaded `@ffmpeg/core@0.12.6` and `@ffmpeg/util@0.12.1`.
2. Do not modify `next.config.ts` to add COOP/COEP headers for video tools, thereby keeping the application resilient, compatible with client-side navigation, and free from cross-origin resource blockage.
3. Build a shared engine module (`lib/ffmpeg/ffmpegManager.ts` and `lib/ffmpeg/useFFmpeg.ts`) to manage WASM loading, progress tracking, job cancellation, and MEMFS cleanup.
4. Implement the exact FFmpeg CLI flags documented in `survey_report.md` Section 4.
5. Register all 4 tools in `app/tools/ToolEngine.ts` using the AI-agent-ready schemas defined in `survey_report.md` Section 7.1.

---

## 5. Verification Method

To verify these findings and recommendations:
1. Inspect the comprehensive report at `/home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md`.
2. Verify package compatibility by reviewing `frontend/package.json` against the `@ffmpeg/ffmpeg` v0.12+ API requirements documented in this report.
3. Verify Next.js configuration in `frontend/next.config.ts` to confirm that avoiding COOP/COEP headers prevents route navigation conflicts.
4. Check that `ToolEngine.ts` already contains `ToolCategory = "video"`, validating that the proposed schemas integrate seamlessly.
