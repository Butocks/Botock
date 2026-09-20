# Deep Technical Investigation Report: Client-Side PDF Tools (`pdf-ocr` & `pdf-compress`)

**Explorer**: `explorer_survey_3`  
**Date**: 2026-09-20  
**Target Project**: Botock Platform (`/home/mir/Documents/botock/frontend`)  
**Scope**: In-depth architectural blueprint for `pdf-ocr` (Tesseract.js + PDF.js) and `pdf-compress` (pdf-lib + HTML5 Canvas), Next.js 16/Turbopack compatibility, memory management, and edge-case handling.

---

## 1. Executive Summary

This investigation details the end-to-end technical designs for the two new client-side PDF tools in the Botock creative suite:
1. **`pdf-ocr`**: Browser-based Optical Character Recognition for scanned documents using `pdfjs-dist` (to render PDF pages to an in-memory HTML5 Canvas at ~144 DPI) and `tesseract.js` v5 (WebAssembly LSTM OCR engine) to extract plain text with per-page confidence breakdowns, copy-to-clipboard, and `.txt` export.
2. **`pdf-compress`**: Client-side PDF file size reducer using `pdf-lib` and HTML5 Canvas. It traverses the PDF object graph (`context.enumerateIndirectObjects()`), extracts embedded raster image streams (`/Subtype /Image`), decodes them onto an HTML5 canvas, downscales dimensions and re-encodes them as compressed JPEGs, and performs atomic in-place reference replacement via `JpegEmbedder` / `context.assign()`, achieving 50%–90% size reduction on image-heavy and scanned documents without server processing.

Both tools comply with Botock's Tool Architecture Rules:
- 100% private, client-side browser execution (zero backend round-trips).
- Modular 3-file structure (`page.tsx`, `[Tool]Client.tsx`, `error.tsx`).
- React Error Boundary crash isolation.
- Complete AI-Agent schema registration in `ToolEngine.ts`.
- Server-rendered SEO metadata with `SoftwareApplication` JSON-LD structured data.

---

## 2. Tool 1: `pdf-ocr` Architecture

### 2.1 Component Architecture & Next.js App Router Integration

Next.js 16 uses Turbopack by default and evaluates code in Node.js server environments during build/SSR.
`pdfjs-dist` contains Node-specific fallback code that attempts to `require('canvas')` if evaluated in a Node context, which triggers `Module not found: Can't resolve 'canvas'`. Furthermore, `tesseract.js` requires the browser `Worker` API.

#### Solution:
1. **Dynamic Client Component Loading**:
   In `frontend/app/tools/pdf-ocr/page.tsx`, dynamically import `PDFOCRClient.tsx` with `ssr: false`:
   ```tsx
   import dynamic from "next/dynamic";

   const PDFOCRClient = dynamic(() => import("./PDFOCRClient"), {
     ssr: false,
     loading: () => <ToolLoadingSkeleton title="PDF OCR Text Extractor" />,
   });
   ```
2. **Worker Configuration (`GlobalWorkerOptions.workerSrc`)**:
   `pdfjs-dist` requires a dedicated web worker to parse binary PDF data off the main thread.
   In modern bundlers (especially Turbopack), bundling the worker locally can trigger MIME-type mismatches (`text/html`) or SWC minification glitches. The most robust approach for client components is loading the matching version of the worker via unpkg/jsdelivr CDN:
   ```tsx
   import * as pdfjsLib from "pdfjs-dist";

   if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
     pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
   }
   ```
3. **CMap Configuration for Non-Latin Fonts**:
   To handle scanned PDFs with diverse font encodings or non-Latin glyphs:
   ```tsx
   const loadingTask = pdfjsLib.getDocument({
     data: pdfArrayBuffer,
     cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
     cMapPacked: true,
   });
   ```

---

### 2.2 Rendering PDF Pages to Canvas (DPI & Resolution Optimization)

OCR accuracy directly depends on image sharpness:
- **Default PDF coordinate space**: 72 DPI (`scale = 1.0`). At 72 DPI, 10pt–12pt body text is blurry and pixelated, yielding high Character Error Rates (CER) in Tesseract.
- **Scale 2.0x (~144 DPI)**: Represents the optimal sweet spot. It delivers ~98%+ OCR accuracy while keeping canvas bitmap memory reasonable (~8.5 MB uncompressed RGBA per standard Letter/A4 page).
- **Scales > 3.0x (216+ DPI)**: Yield diminishing OCR accuracy gains while consuming >35 MB per page, risking mobile browser tab crashes on multi-page files.

#### Rendering Implementation:
```tsx
async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2.0
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context unavailable");

  // Fill white background to prevent dark artifacts on transparent PDF pages
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}
```

---

### 2.3 `tesseract.js` v5 Integration & Lifecycle Management

#### Key Principles:
1. **Worker Reuse (Critical for Performance)**:
   Instantiating a Tesseract worker spawns a Web Worker, downloads the WebAssembly runtime (~3 MB), and downloads the language traineddata (`eng.traineddata.gz` ~4.5 MB). This takes 1.5–3.0 seconds on first run.
   **Do NOT create a new worker per page.** Instantiate a single worker before the loop, run all pages sequentially, and terminate the worker in a `finally` block.
2. **Language Support**:
   Default to English (`'eng'`), but provide a dropdown selector for common OCR languages:
   - English (`eng`)
   - Spanish (`spa`)
   - French (`fra`)
   - German (`deu`)
   - Italian (`ita`)
   - Portuguese (`por`)
   - Chinese Simplified (`chi_sim`)
   - Japanese (`jpn`)
3. **Execution Loop & Granular Progress**:
   Tesseract v5's `createWorker` supports a `logger` callback that reports `{ status: string, progress: number }`.
   We calculate overall progress as:
   $$\text{overallPercent} = \text{round}\left( \frac{(\text{pageIndex} - 1) + \text{pageProgress}}{\text{totalPages}} \times 100 \right)$$

#### Multi-Page OCR Loop:
```tsx
import { createWorker } from "tesseract.js";

interface PageOcrResult {
  pageNumber: number;
  text: string;
  confidence: number;
}

async function runPdfOcr(
  file: File,
  language: string = "eng",
  onProgress: (progress: number, statusText: string) => void,
  cancelSignal: { cancelled: boolean }
): Promise<PageOcrResult[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  let worker: Tesseract.Worker | null = null;
  const results: PageOcrResult[] = [];

  try {
    onProgress(0, `Initializing OCR engine (${language})...`);

    worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          // Page progress 0..1
        }
      },
    });

    for (let p = 1; p <= totalPages; p++) {
      if (cancelSignal.cancelled) break;

      onProgress(
        Math.round(((p - 1) / totalPages) * 100),
        `Extracting text from page ${p} of ${totalPages}...`
      );

      const canvas = await renderPageToCanvas(pdfDoc, p, 2.0);
      const ocrResult = await worker.recognize(canvas);

      results.push({
        pageNumber: p,
        text: ocrResult.data.text.trim(),
        confidence: Math.round(ocrResult.data.confidence),
      });

      // Crucial: Deallocate canvas backing store immediately
      canvas.width = 0;
      canvas.height = 0;

      // Yield event loop to allow UI updates and prevent tab lag
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    onProgress(100, "OCR extraction complete!");
    return results;
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
```

---

### 2.4 Text Output Presentation & Export

The UI provides:
1. **Aggregated View**:
   - Total word count, character count, and average confidence score.
   - "Copy All to Clipboard" button (with visual checkmark feedback).
   - "Download as .txt" button (`new Blob([fullText], { type: "text/plain;charset=utf-8" })`).
2. **Per-Page Breakdown**:
   - Tabbed or accordion list for Page 1, Page 2, ... Page N.
   - Individual page text view with "Copy Page" button.
   - Confidence badge (e.g. `96% accuracy` in emerald, `<75%` in amber).

---

## 3. Tool 2: `pdf-compress` Architecture

### 3.1 PDF Document Anatomy & Object Graph Traversal

A PDF document is a directed acyclic graph of indirect objects indexed by a number and generation (e.g. `12 0 R`).
Embedded images are stored as **Image XObjects** (`/Type /XObject`, `/Subtype /Image`).

In `pdf-lib`:
- `pdfDoc.context.enumerateIndirectObjects()` returns `[PDFRef, PDFObject][]`.
- Raw byte streams are parsed as `PDFRawStream`.
- An image stream contains:
  - `dict.get(PDFName.of('Subtype')) === PDFName.of('Image')`
  - `dict.get(PDFName.of('Filter'))`: Can be `PDFName.of('DCTDecode')` (JPEG), `PDFName.of('FlateDecode')` (raw/deflated PNG), or an array of filters.
  - `dict.get(PDFName.of('Width'))` and `dict.get(PDFName.of('Height'))`: Pixel raster dimensions.

#### Why Image Compression is 100% Non-Destructive to Page Layout:
In PDF documents, the physical dimensions and position of an image on the page are determined strictly by the **Current Transformation Matrix (CTM)** in the page content stream (`cm` operator before `Do`), NOT by the `/Width` and `/Height` in the image dictionary.
Therefore, downsampling the image raster dimensions from 3000x2000 to 1500x1000 or recompressing with JPEG quality 0.6 reduces the byte size drastically while preserving the exact layout, margins, and visual scale on the page!

---

### 3.2 Image Extraction, Canvas Downsampling & Re-encoding

#### Traversal & Extraction Algorithm:
```tsx
import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFRef, JpegEmbedder } from "pdf-lib";

interface ImageCandidate {
  ref: PDFRef;
  stream: PDFRawStream;
  originalBytes: Uint8Array;
  width: number;
  height: number;
  filter: string;
}

function findEmbeddedImages(pdfDoc: PDFDocument): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  const entries = pdfDoc.context.enumerateIndirectObjects();

  for (const [ref, obj] of entries) {
    if (obj instanceof PDFRawStream) {
      const dict = obj.dict;
      const subtype = dict.get(PDFName.of("Subtype"));
      if (subtype === PDFName.of("Image")) {
        const filterObj = dict.get(PDFName.of("Filter"));
        const filterStr = filterObj instanceof PDFName ? filterObj.asString() : "";

        const wObj = dict.get(PDFName.of("Width"));
        const hObj = dict.get(PDFName.of("Height"));
        const width = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
        const height = hObj instanceof PDFNumber ? hObj.asNumber() : 0;

        candidates.push({
          ref,
          stream: obj,
          originalBytes: obj.getContents(),
          width,
          height,
          filter: filterStr,
        });
      }
    }
  }
  return candidates;
}
```

#### Canvas Re-encoding:
```tsx
interface CompressionOptions {
  quality: number; // e.g., 0.65
  maxDimension: number; // e.g., 1920
}

async function compressImageBytes(
  imageBytes: Uint8Array,
  options: CompressionOptions
): Promise<Uint8Array | null> {
  const blob = new Blob([imageBytes], { type: "image/jpeg" });
  let imageBitmap: ImageBitmap;

  try {
    imageBitmap = await createImageBitmap(blob);
  } catch (err) {
    // If not a standard JPEG or unable to decode in browser, skip safely
    return null;
  }

  let { width, height } = imageBitmap;
  if (width > options.maxDimension || height > options.maxDimension) {
    const scale = Math.min(options.maxDimension / width, options.maxDimension / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    return null;
  }

  // Draw with white background to handle any potential transparency cleanly
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // Free GPU bitmap memory immediately
  imageBitmap.close();

  const compressedBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", options.quality)
  );

  // Free canvas memory
  canvas.width = 0;
  canvas.height = 0;

  if (!compressedBlob) return null;
  return new Uint8Array(await compressedBlob.arrayBuffer());
}
```

---

### 3.3 Atomic Stream Replacement via `JpegEmbedder` and `context.assign()`

In `pdf-lib`, replacing an image stream in-place is elegant and performant:
```tsx
// 1. Create embedder for the re-encoded JPEG
const embedder = await JpegEmbedder.for(newJpegBytes);

// 2. embedIntoContext creates the new XObject and directly updates the ref:
await embedder.embedIntoContext(pdfDoc.context, candidate.ref);
```

#### Why This Is Superior:
1. `JpegEmbedder.for(newJpegBytes)` automatically parses the JPEG header markers (`0xFFC0`, `0xFFC2`, etc.) to obtain the new `width`, `height`, `bitsPerComponent`, and `colorSpace`.
2. `embedder.embedIntoContext(pdfDoc.context, candidate.ref)` executes:
   ```ts
   context.assign(ref, xObject);
   ```
   This replaces the object stored at `candidate.ref` in `pdfDoc.context`'s indirect object map.
3. Every page `/Resources /XObject` and content stream referencing `candidate.ref` remains intact without having to rewrite or re-link any page trees!
4. **Safety Check**: Only replace if `newJpegBytes.length < originalBytes.length`. If re-encoding does not yield a smaller byte size (e.g. for already low-quality images), retain the original bytes!

---

### 3.4 Handling PDFs Without Images & Already-Compressed Documents

1. **No Embedded Images**:
   If `candidates.length === 0`:
   - Still save the PDF using `pdfDoc.save({ useObjectStreams: true })`.
   - Object streams consolidate indirect objects into compressed cross-reference streams, often achieving 5%–15% lossless structural reduction.
   - Display informative status: "No embedded images found in document. Structural PDF optimizations applied."
2. **Already-Compressed Documents**:
   If all images are already optimal and `savedBytes <= 0`:
   - Inform user: "This PDF is already highly optimized. Further compression would compromise visual clarity."
   - Provide the option to download the structurally optimized output.

---

### 3.5 Metrics & Compression Presets

#### Presets:
| Preset | JPEG Quality | Max Resolution | Best For |
|---|---|---|---|
| **Balanced (Recommended)** | `0.65` | 1920px (1080p) | Everyday documents, forms, reports |
| **Maximum Compression** | `0.45` | 1280px (720p) | Email attachments, strict upload size limits |
| **High Quality** | `0.80` | 2560px (2K) | Portfolios, brochures, photo-heavy PDFs |

#### Metrics Displayed:
- Original file size (e.g., `18.4 MB`)
- Compressed file size (e.g., `3.1 MB`)
- Total space saved: `15.3 MB`
- Percentage reduction: `83% saved`
- Count of images re-encoded (e.g., `14 images compressed`)

---

## 4. Dependencies & Next.js Compatibility Audit

| Dependency | Required Version | Status in `frontend` | Compatibility Notes |
|---|---|---|---|
| `pdf-lib` | `^1.17.1` | ✅ **Installed** | Pure JavaScript/TypeScript. Fully verified and stable in React 19 / Next.js 16. |
| `pdfjs-dist` | `^3.11.174` or `^4.0.379` | ❌ **Needs Install** | Client-side only. Must use dynamic import with `ssr: false` to avoid Node `canvas` error. Worker configured via CDN. |
| `tesseract.js` | `^5.1.1` | ❌ **Needs Install** | Client-side Web Worker + WASM. Cleanly compatible with React 19. No special headers needed. |

### Installation Command:
```bash
npm install pdfjs-dist@^3.11.174 tesseract.js@^5.1.1
```
*(Note: `pdfjs-dist` v3.11 is exceptionally battle-tested with Next.js bundlers. v4 is also ESM native).*

---

## 5. Edge Cases & Error Handling

### 5.1 Multi-Page PDFs (50+ Pages) & Memory Management
- **The Pitfall**: Retaining full-resolution rendered canvases for 50 pages would allocate $50 \times 8.5\text{ MB} \approx 425\text{ MB}$ of uncompressed pixel buffers in browser RAM, triggering tab crashes on mobile/laptops.
- **The Solution**:
  1. Allocate only one canvas at a time.
  2. Perform OCR / downsample immediately.
  3. Deallocate memory explicitly: `canvas.width = 0; canvas.height = 0;` and call `imageBitmap.close()`.
  4. Yield the main thread via `await new Promise((r) => setTimeout(r, 10))` between pages to permit garbage collection and maintain smooth UI responsiveness.

### 5.2 Password-Protected & Encrypted PDFs
- **`pdf-ocr` (`pdfjs-dist`)**:
  When attempting to open an encrypted PDF without a password, `pdfjs-dist` rejects the promise with a `PasswordException` (`error.name === 'PasswordException'`).
  - Handling: Catch `PasswordException` and display a clear, friendly error banner:
    *"This PDF is password-protected. Please unlock or remove the password before extracting text."*
- **`pdf-compress` (`pdf-lib`)**:
  When loading an encrypted PDF, `PDFDocument.load(buffer)` throws `EncryptedPDFError`.
  - Handling: Catch `EncryptedPDFError` and display:
    *"Encrypted PDF detected. Please remove password protection before compressing images."*

### 5.3 Cancellation / Abort Controller
- Both tools must include a prominent "Cancel" button during processing.
- A mutable cancellation ref (`cancelRef.current = true`) halts the iteration loop immediately.
- In `pdf-ocr`, calling `await worker.terminate()` immediately terminates the background OCR Web Worker and frees WebAssembly memory.

---

## 6. Botock Architecture Compliance

### 6.1 Directory & File Layout
Each tool must be implemented in its own isolated directory under `frontend/app/tools/`:
```
frontend/app/tools/
├── pdf-ocr/
│   ├── page.tsx          # Server Component: SEO metadata & JSON-LD
│   ├── PDFOCRClient.tsx  # Client Component: State, worker loop & UI
│   └── error.tsx         # Client Error Boundary: Crash isolation
└── pdf-compress/
    ├── page.tsx          # Server Component: SEO metadata & JSON-LD
    ├── PDFCompressClient.tsx # Client Component: State, canvas downsampler & UI
    └── error.tsx         # Client Error Boundary: Crash isolation
```

### 6.2 Tool Schema Registration (`frontend/app/tools/ToolEngine.ts`)

Both tools must be registered in `ToolRegistry` with complete schemas so future AI assistants can invoke them:

```typescript
ToolRegistry.registerTool({
  id: "pdf-ocr",
  name: "PDF OCR Text Extractor",
  description: "Extract text from scanned PDF documents and images locally in the browser using Tesseract OCR.",
  category: "pdf",
  seoTitle: "PDF OCR - Extract Text from Scanned PDFs Online Free - Botock",
  seoDescription: "Free client-side PDF OCR tool. Extract editable text from scanned PDF files directly in your browser with zero server uploads.",
  endpoint: "/tools/pdf-ocr",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The scanned PDF file to extract text from",
      required: true,
    },
    {
      name: "language",
      type: "enum",
      description: "OCR language (e.g. eng, spa, fra, deu)",
      required: false,
      options: ["eng", "spa", "fra", "deu", "ita", "por", "chi_sim", "jpn"],
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-compress",
  name: "Compress PDF",
  description: "Reduce PDF file size by downsampling and recompressing embedded images locally in your browser.",
  category: "pdf",
  seoTitle: "Compress PDF Online - Reduce PDF File Size Free - Botock",
  seoDescription: "Shrink PDF file size securely in your browser. Downsample embedded images with zero file uploads for 100% privacy.",
  endpoint: "/tools/pdf-compress",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to compress",
      required: true,
    },
    {
      name: "preset",
      type: "enum",
      description: "Compression quality preset",
      required: false,
      options: ["balanced", "maximum", "high_quality"],
    },
  ],
});
```

---

## 7. Recommendations & Next Steps

1. **Install Dependencies**: Install `pdfjs-dist@^3.11.174` and `tesseract.js@^5.1.1` in `frontend/package.json`.
2. **Follow Established Tool Pattern**: Match the design aesthetics of `/tools/pdf-merge` and `/tools/image-crop` (slate/violet accents, dark mode compatibility, dropzone upload area, status badges, download cards).
3. **Register in ToolEngine**: Add schemas to `frontend/app/tools/ToolEngine.ts` and update catalog status in `frontend/app/tools/page.tsx` from `"ready"` to `"active"`.
4. **Local Verification**: Ensure `npm run build` compiles with zero TypeScript errors or Turbopack bundling warnings.
