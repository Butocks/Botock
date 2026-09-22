# Original User Request

## Initial Request — 2026-09-20T01:47:04Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Launch multiple agents to build and verify 5 Image Tools concurrently.
> Requested team: A full team for parallel building and rigorous testing.

Build a suite of 5 client-side Image Processing tools in Next.js (React), ensuring they are highly performant, bug-free, and thoroughly tested before completion. 

Working directory: /home/mir/Documents/botock/frontend
Integrity mode: development

## Requirements

### R1. Implement 5 Image Tools
Create the following tools in `app/tools/[tool-name]`:
1. `image-resize` (using `react-image-file-resizer` or `pica`)
2. `image-compress` (using `browser-image-compression`)
3. `image-remove-bg` (using `@imgly/background-removal`)
4. `image-to-webp` (using Canvas API)
5. `image-upscale` (using a client-side upscaling method or standard high-quality interpolation via canvas)

### R2. Adhere to Architecture Guidelines
- Each tool must have a `page.tsx` (Server Component) for SEO.
- Each tool must have a `Client.tsx` (Client Component) for the logic.
- Each tool must have an `error.tsx` for crash isolation.
- Register all 5 tools in `app/tools/ToolEngine.ts`.
- Follow the design pattern established in `/tools/image-crop`.

### R3. Thorough Local Verification
- Before finishing, run the Next.js build (`npm run build`).
- Do not stop until all TypeScript and compilation errors are resolved.
- Ensure no tool relies on paid third-party APIs (everything must run in the browser).

## Acceptance Criteria

### Functionality & Independence
- [ ] Users can upload an image, process it, and download the result in all 5 tools.
- [ ] No tool communicates with a backend server for image processing (100% privacy).

### Build Integrity
- [ ] `npm run build` exits with code 0 (success).
- [ ] No `Module not found` or `any` type errors in the new tools.

## Follow-up — 2026-09-20T18:44:31Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Launch multiple agents to build and verify the Video Suite and Advanced PDF Tools concurrently.
> Requested team: A full team for parallel building and rigorous testing.

Build a suite of 6 client-side tools in Next.js (React), ensuring they are highly performant, bug-free, use WebAssembly (WASM) correctly, and are thoroughly tested before completion. 

Working directory: /home/mir/Documents/botock/frontend
Integrity mode: development

## Requirements

### R1. Implement 4 Video Tools & 2 PDF Tools
Create the following tools in `app/tools/[tool-name]`:
1. `video-trim` (using `@ffmpeg/ffmpeg` for fast stream copy trimming)
2. `video-speed` (using `@ffmpeg/ffmpeg` to alter playback speed)
3. `video-to-mp3` (using `@ffmpeg/ffmpeg` to extract audio)
4. `video-compress` (using `@ffmpeg/ffmpeg` to reduce file size)
5. `pdf-ocr` (using `tesseract.js` + `pdfjs-dist` to extract text from scanned PDFs)
6. `pdf-compress` (using `pdf-lib` and HTML5 Canvas to downsample embedded images)

### R2. Adhere to Architecture Guidelines
- Each tool must have a `page.tsx` (Server Component) with strict SEO tags (`SoftwareApplication` JSON-LD).
- Each tool must have a `Client.tsx` (Client Component) for the logic.
- Each tool must have an `error.tsx` for crash isolation.
- Register all 6 tools in `app/tools/ToolEngine.ts`.
- Follow the design pattern established in `/tools/image-crop`.
- **CRITICAL SECURITY NOTE:** If using multi-threaded `@ffmpeg/core-mt`, you MUST modify `next.config.ts` to add COOP/COEP headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) strictly scoped to `/tools/video*`. Alternatively, use the single-threaded `@ffmpeg/core` to avoid header issues entirely.

### R3. Thorough Local Verification
- Before finishing, run the Next.js build (`npm run build`).
- Do not stop until all TypeScript and compilation errors are resolved.
- Ensure no tool relies on backend servers for processing (100% privacy).

## Acceptance Criteria

### Functionality & Independence
- [ ] Users can upload files, process them via WASM in the browser, and download the result.
- [ ] No tool communicates with a backend server for processing.

### Build Integrity
- [ ] `npm run build` exits with code 0 (success).
- [ ] No `Module not found` or `any` type errors in the new tools.

## Follow-up — 2026-09-21T01:13:40Z

# Teamwork Project Prompt — Backend Frontend Integration

> Status: Ready for launch.
> Goal: Launch multiple agents to build the Next.js UI components for the backend-powered document conversion tools.
> Requested team: A full team for parallel building and rigorous testing.

Build a suite of 3 client-side tools in Next.js (React) that interact with our new Python FastAPI backend (`http://localhost:8000`).

Working directory: /home/mir/Documents/botock/frontend
Integrity mode: development

## Requirements

### R1. Implement 3 Conversion Tools
Create the following tools in `app/tools/[tool-name]`:
1. `pdf-to-word` (POSTs to `http://localhost:8000/api/convert/pdf-to-docx`)
2. `word-to-pdf` (POSTs to `http://localhost:8000/api/convert/docx-to-pdf`)
3. `pdf-to-excel` (POSTs to `http://localhost:8000/api/convert/pdf-to-excel`)

### R2. Adhere to Architecture Guidelines
- Each tool must have a `page.tsx` (Server Component) with strict SEO tags.
- Each tool must have a `Client.tsx` (Client Component).
- Each tool must have an `error.tsx` for crash isolation.
- Register all 3 tools in `app/tools/ToolEngine.ts`.
- **UI Logic:** The `Client.tsx` should allow the user to select a file, show a loading spinner, POST the file as `multipart/form-data` using `fetch`, and trigger a file download from the binary response.

### R3. Thorough Local Verification
- Before finishing, run the Next.js build (`npm run build`).
- Do not stop until all TypeScript and compilation errors are resolved.

## Acceptance Criteria
- [ ] Users can upload files and download the converted results.
- [ ] `npm run build` exits with code 0 (success).

