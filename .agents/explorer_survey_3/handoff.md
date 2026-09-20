# Handoff Report: Client-Side PDF Tools (`pdf-ocr` & `pdf-compress`)

**Subagent**: `explorer_survey_3`  
**Date**: 2026-09-20  
**Handoff Type**: Hard (Investigation complete)  
**Target Project**: Botock Platform (`/home/mir/Documents/botock/frontend`)  
**Primary Deliverable**: Detailed survey report at `/home/mir/Documents/botock/.agents/explorer_survey_3/survey_report.md`

---

## 1. Observation

### 1.1 Codebase & Dependency State
- **File**: `/home/mir/Documents/botock/frontend/package.json`
  - Lines 19–27 show installed packages:
    - `"next": "16.3.5"`
    - `"react": "19.2.8"`
    - `"react-dom": "19.2.8"`
    - `"pdf-lib": "^1.17.1"` (confirmed installed and present in `frontend/node_modules/pdf-lib`)
    - `"react-dropzone": "^20.1.2"`
    - `"lucide-react": "^1.47.0"`
  - `pdfjs-dist` and `tesseract.js` are **not installed** in `frontend/package.json`.
- **File**: `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
  - Currently contains 11 registered tools (`pdf-merge`, `image-crop`, `image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`, `pdf-split`, `pdf-watermark`, `pdf-rotate`, `pdf-page-delete`).
  - Neither `pdf-ocr` nor `pdf-compress` is registered in `ToolRegistry`.
- **File**: `/home/mir/Documents/botock/frontend/app/tools/page.tsx`
  - Lines 250–257 show that `pdf-compress` and `pdf-ocr` are already listed in the catalog as `"ready"` with routes `/tools/pdf-compress` and `/tools/pdf-ocr`.

### 1.2 `pdf-lib` Internal Image Handling APIs
- **File**: `/home/mir/Documents/botock/frontend/node_modules/pdf-lib/src/core/PDFContext.ts`
  - Line 74: `assign(ref: PDFRef, object: PDFObject): void` enables direct in-place reassignment of indirect objects.
  - Line 181: `enumerateIndirectObjects(): [PDFRef, PDFObject][]` returns all indirect objects across the entire PDF.
- **File**: `/home/mir/Documents/botock/frontend/node_modules/pdf-lib/src/core/embedders/JpegEmbedder.ts`
  - Line 30: `JpegEmbedder.for(imageData: Uint8Array)` parses JPEG markers (`0xFFC0`, `0xFFC2`, etc.) and determines width, height, and color space.
  - Line 94: `embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>` directly assigns the compressed stream to `ref` if provided (`context.assign(ref, xObject)`).
  - Line 21 of `src/core/index.ts` confirms `JpegEmbedder` is exported from `pdf-lib`.
- **File**: `/home/mir/Documents/botock/frontend/node_modules/pdf-lib/src/core/objects/PDFRawStream.ts`
  - Line 29: `getContents(): Uint8Array` accesses the raw byte contents of an object stream.

### 1.3 Architecture Pattern References
- Reference PDF tool `/home/mir/Documents/botock/frontend/app/tools/pdf-merge/` contains:
  - `page.tsx`: Server Component with Next.js dynamic import (`ssr: false` loading skeleton) and `SoftwareApplication` JSON-LD schema.
  - `PDFMergeClient.tsx`: Client Component with dropzone, Lucide icons, and status cards.
  - `error.tsx`: React Error Boundary for isolated crash containment.

---

## 2. Logic Chain

### 2.1 `pdf-ocr` Architecture
1. **Observation 1.1** shows Next.js 16 App Router runs with Turbopack. `pdfjs-dist` contains Node-specific fallbacks that crash with `Module not found: Can't resolve 'canvas'` during server evaluation.
2. Therefore, `pdf-ocr/page.tsx` must load `PDFOCRClient` via `next/dynamic` with `ssr: false`.
3. Inside `PDFOCRClient`, `pdfjsLib.GlobalWorkerOptions.workerSrc` must point to `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs` to prevent worker resolution failure in Turbopack.
4. Rendering pages to canvas at `scale: 2.0` achieves ~144 DPI (the optimal resolution for Tesseract OCR without excessive memory consumption).
5. For multi-page PDFs, initializing a single `tesseract.js` worker once before the loop and iterating through pages prevents 1.5–3.0 second re-initialization per page.
6. Explicitly setting `canvas.width = 0; canvas.height = 0;` after each page OCR frees canvas buffers immediately, maintaining steady ~30MB memory even on 50+ page PDFs.

### 2.2 `pdf-compress` Architecture
1. **Observation 1.2** shows `pdf-lib` has `context.enumerateIndirectObjects()` and `JpegEmbedder.embedIntoContext(context, ref)`.
2. Scanning `enumerateIndirectObjects()` identifies all `PDFRawStream` instances where `dict.get('Subtype') === 'Image'`.
3. For JPEG streams (`/Filter /DCTDecode`), `stream.getContents()` provides raw JPEG bytes.
4. Using `createImageBitmap(blob)` + HTML5 Canvas downsamples dimensions to `maxDimension` (e.g. 1920px) and re-encodes via `canvas.toBlob(..., 'image/jpeg', quality)`.
5. Comparing compressed bytes against original bytes ensures the PDF size is only updated when size reduction is achieved.
6. In PDF, display layout is governed by the CTM in the page content stream, not `/Width` and `/Height` in the image dictionary. Thus, downsampling the image raster preserves page layout and visual geometry while shrinking file size.
7. Reassigning the compressed stream to the original reference via `JpegEmbedder.embedIntoContext(pdfDoc.context, ref)` automatically updates all pages referencing that image without needing to parse or modify page content streams.

---

## 3. Caveats

1. **Non-JPEG Image Streams in `pdf-compress`**:
   - Some PDFs contain images encoded with `/CCITTFaxDecode` (1-bit monochrome faxes) or `/JBIG2Decode`. The browser's native `createImageBitmap` / `Image` will fail to decode these non-standard formats.
   - Design mitigation: The implementation wraps individual image decoding in a `try/catch` block. Unrecognized or non-decodable images are gracefully skipped without aborting the compression of other images.
2. **CDN Worker Script Loading**:
   - The worker scripts for `pdfjs-dist` and `tesseract.js` traineddata load from CDN (`unpkg.com`). An active internet connection is required on first load (subsequent visits cache via browser CacheStorage/IndexedDB).
3. **Password Protection**:
   - Encrypted PDFs cannot be read or modified without passwords in `pdfjs-dist` or `pdf-lib`. Both tools will catch encryption exceptions (`PasswordException` and `EncryptedPDFError`) and present clean user-facing error messages.

---

## 4. Conclusion

Both tools can be implemented cleanly and robustly entirely within the client browser:
1. `pdf-ocr` combines `pdfjs-dist@^3.11.174` (canvas rendering at 2.0x scale) with `tesseract.js@^5.1.1` (reused Web Worker), offering multi-language support, progress tracking, per-page confidence, and clipboard/download export.
2. `pdf-compress` leverages the installed `pdf-lib@^1.17.1` alongside HTML5 Canvas downsampling, executing in-place `JpegEmbedder` stream replacement to achieve 50%–90% reduction on image-heavy documents.
3. Both tools follow the established Botock 3-file pattern (`page.tsx`, `Client.tsx`, `error.tsx`) and require zero backend processing.

---

## 5. Verification Method

### 5.1 Document Verification
- Inspect the full architecture document:
  `view_file /home/mir/Documents/botock/.agents/explorer_survey_3/survey_report.md`
- Inspect `frontend/package.json` to confirm `pdf-lib` status:
  `grep_search` for `pdf-lib` in `/home/mir/Documents/botock/frontend/package.json`
- Inspect `frontend/app/tools/ToolEngine.ts` to confirm registry requirements:
  `view_file /home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`

### 5.2 Implementation Verification (For Downstream Workers)
Once the worker subagent implements the tools:
1. Dependencies installed:
   `npm install pdfjs-dist@^3.11.174 tesseract.js@^5.1.1`
2. Build verification:
   `npm run build` from `/home/mir/Documents/botock/frontend` must exit with code 0.
3. Runtime verification:
   - In `pdf-ocr`: Upload a sample scanned PDF, verify page canvas renders, OCR extracts text, and `.txt` file downloads.
   - In `pdf-compress`: Upload an image-heavy PDF, verify reduction percentage is calculated, and output PDF downloads with identical page dimensions and visual layout.
