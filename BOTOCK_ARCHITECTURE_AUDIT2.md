# Botock — Shared Infrastructure Audit & Implementation Spec

Scope note: this document is built strictly from the files actually shown in the
repository (frontend/app/tools/**, frontend/lib/**, backend/app/**). Where a
file wasn't provided (e.g. pdf-to-word, pdf-to-excel, word-to-pdf, image-crop's
error boundary details already seen), findings are marked **[unverified]** and
should be confirmed before acting. Nothing below is guessed architecture —
every claim cites a real file/line pattern from the sources given.

---

## 1. THE CORE QUESTION: Is processing logic shared or duplicated per tool?

**Answer: partially shared, and the split is inconsistent — some tool families
have real shared infrastructure, others duplicate the same ~150 lines of
boilerplate 5–6 times.**

### 1.1 Where shared infrastructure genuinely exists (good)

| Layer | File | Used by | Verdict |
|---|---|---|---|
| WASM engine singleton | `frontend/lib/ffmpeg/ffmpegManager.ts` | video-trim, video-speed, video-to-mp3, video-compress | ✅ Real shared infra. Single `FFmpeg` instance, load-once, shared progress/log pub-sub via `onProgress`/`onLog`. |
| Processing hook | `frontend/lib/ffmpeg/useFFmpeg.ts` | same 4 video tools | ✅ Wraps manager, exposes `run()` that does write→exec→read→cleanup in one call. This is the right pattern. |
| PDF compression logic | `frontend/lib/pdf/pdfCompressHelper.ts` | pdf-compress only | ✅ Correctly separated from UI. `compressPdf()` is a pure async function with progress callback + cancel signal. |
| PDF OCR logic | `frontend/lib/pdf/pdfOcrHelper.ts` | pdf-ocr's `PDFOCRView.tsx` | ⚠️ Partially used — `PDFOCRView.tsx` actually **reimplements** its own page loop (`pdfjsLib.getDocument`, its own `createWorker`, its own page render/extract loop) instead of calling `processPdfOcr()` from the helper it imports `renderPdfPageToCanvas`/`extractTextFromPage` from. The helper's top-level `processPdfOcr()` orchestrator is never called — dead code duplicated by hand in the component. |
| Canvas-math engine | `frontend/app/tools/image-upscale/upscaler.ts` | image-upscale only | ✅ Correctly separated (unsharp mask + multi-pass scaling is pure, testable, no React). |

### 1.2 Where every tool reinvents the same wheel (confirmed duplication)

**A. The 5 "simple PDF" tools — no shared helper at all**
`pdf-merge/PDFMergeClient.tsx`, `pdf-split/PDFSplitClient.tsx`,
`pdf-rotate/PDFRotateClient.tsx`, `pdf-watermark/PDFWatermarkClient.tsx`,
`pdf-page-delete/PDFPageDeleteClient.tsx`.

Every one of these independently implements, almost line-for-line:
```
onDrop(acceptedFiles) {
  setFile(selected); setErrorMessage(null); setDownloadUrl(null);
  try {
    const buffer = await selected.arrayBuffer();
    const loadedDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    setPageCount(loadedDoc.getPageCount());
  } catch (err) { ... "encrypted or corrupted" message ... }
}
useEffect(() => { return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); } }, [downloadUrl]);
```
Confirmed identical in all 5 files (compare `PDFSplitClient.tsx` lines ~30-45
against `PDFRotateClient.tsx` lines ~25-40 against `PDFWatermarkClient.tsx` —
same variable names, same try/catch shape, same cleanup effect). Only the
actual page-mutation call differs (`copyPages`, `setRotation`, `drawText`,
page filtering).

Meanwhile `pdf-compress/Client.tsx` (the 6th PDF tool) *does* delegate to
`pdfCompressHelper.ts`. There is no reason the other 5 couldn't delegate to a
`usePdfDocument(file)` hook (load + pageCount + encrypted-error handling) and
a `useObjectUrlDownload()` hook (create/revoke lifecycle) the same way.

**B. Every image tool duplicates upload/lifecycle/format-helpers**
`image-resize/Client.tsx`, `image-compress/Client.tsx`, `image-to-webp/Client.tsx`,
`image-upscale/Client.tsx`, `image-remove-bg/Client.tsx` each independently define:

- Their own `formatBytes()` — near-identical implementation appears **4 separate
  times** (image-resize, image-upscale, image-to-webp, and video tools each
  redefine their own `formatBytes`/`formatTime` too — video-trim, video-speed,
  video-to-mp3, video-compress all have their own copy-pasted
  `formatBytes`/`formatTime` at the top of the file, byte-for-byte the same
  logic).
- Their own `useDropzone` config with slightly different `accept` maps but the
  identical drop-zone JSX skeleton (dashed border, icon circle, drag state).
- Their own object-URL create/track/revoke `useRef` + `useEffect` pattern
  (`prevResultUrlRef`, `originalUrlRef`, `resultUrlRef` — three different names
  for the same lifecycle problem in `image-resize`, `image-to-webp`, and
  `image-upscale` respectively).
- Their own `resetAll`/`handleReset`/`handleStartOver` function — same shape,
  different name, in every single tool.

**C. Consequence, stated plainly**

You do **not** currently have "50 tools, 1 shared pipeline." You have three
tiers:
1. Video suite (4 tools): shares a real engine (FFmpeg singleton) but still
   duplicates UI-layer plumbing (formatters, upload UI, result cards).
2. Advanced PDF (compress, OCR): shares processing logic, duplicates nothing
   structurally important.
3. Simple PDF (5 tools) + all image tools (5-6 tools): **zero shared
   infrastructure** — pure copy-paste-adapt per tool.

This means: a bug fix in "how we detect an encrypted PDF" today must be
hand-applied to 5 files. A bug fix in "how we revoke a stale object URL" must
be hand-applied to ~9 files (5 image tools + pdf-merge/split/rotate/watermark/
page-delete's downloadUrl effect, which happens to already be correct in all
of them today — but only because it was copy-pasted correctly, not because
it's enforced once).

### 1.3 The target layered architecture

```
Tool Page (page.tsx)                — SEO metadata, JSON-LD, dynamic import
   ↓
Tool Client Component               — layout + tool-specific controls only
   ↓
useToolFile()  [NEW shared hook]    — file select, drag/drop, accept-map validation
   ↓
useObjectUrlLifecycle() [NEW hook]  — create/track/revoke blob URLs, no leaks
   ↓
Processing Engine (per family)      — FFmpegManager | pdf-lib helper | Canvas/WASM helper
   ↓
useProcessingJob() [NEW hook]       — status: idle|processing|done|error, progress %, cancel()
   ↓
Common Result/Error UI components   — <ProcessingProgress/>, <ResultCard/>, <ToolErrorBanner/>
   ↓
downloadBlob() [NEW shared util]    — anchor creation, filename policy, revoke-after-download
```

This is not a rewrite-everything proposal. It's an extraction: pull the
already-duplicated logic (proven identical above) into `frontend/lib/tools/`
and `frontend/app/components/tool-ui/`, then have each existing Client.tsx
call the shared piece instead of its local copy — one file at a time, tool
family by tool family, starting with the highest-duplication group (simple
PDF tools) since it's the smallest, most mechanical extraction.

---

## 2. TOOL INVENTORY (from files actually inspected)

| Tool | Route | Engine | Shared infra? | Status |
|---|---|---|---|---|
| image-resize | `/tools/image-resize` | pica + Canvas | ❌ none | Functional, needs extraction |
| image-compress | `/tools/image-compress` | browser-image-compression (Web Worker) | ❌ none | Functional; hardcoded `.jpg` download extension regardless of source format — confirmed bug (see BOTOCK-101) |
| image-remove-bg | `/tools/image-remove-bg` | @imgly/background-removal (ONNX/WASM) | ❌ none | Functional; needs COOP/COEP (already set in next.config.ts for this route only — correct, narrow scope) |
| image-to-webp | `/tools/image-to-webp` | Canvas `toBlob('image/webp')` | ❌ none | Functional |
| image-upscale | `/tools/image-upscale` | Canvas multi-pass + unsharp mask | ⚠️ math extracted, UI not | Functional |
| image-crop | `/tools/image-crop` | react-cropper | ❌ none | Functional |
| pdf-merge | `/tools/pdf-merge` | pdf-lib | ❌ none | Functional |
| pdf-split | `/tools/pdf-split` | pdf-lib | ❌ none | Functional |
| pdf-rotate | `/tools/pdf-rotate` | pdf-lib | ❌ none | Functional |
| pdf-watermark | `/tools/pdf-watermark` | pdf-lib | ❌ none | Functional |
| pdf-page-delete | `/tools/pdf-page-delete` | pdf-lib | ❌ none | Functional |
| pdf-compress | `/tools/pdf-compress` | pdf-lib + Canvas JPEG downsample | ✅ `pdfCompressHelper.ts` | Good pattern to replicate |
| pdf-ocr | `/tools/pdf-ocr` | pdf.js + Tesseract.js | ⚠️ helper exists, not called | Working but the component reimplements the orchestrator instead of using it (see BOTOCK-102) |
| video-trim | `/tools/video-trim` | FFmpeg WASM | ✅ FFmpegManager/useFFmpeg | Functional |
| video-speed | `/tools/video-speed` | FFmpeg WASM | ✅ | Functional |
| video-to-mp3 | `/tools/video-to-mp3` | FFmpeg WASM | ✅ | Functional |
| video-compress | `/tools/video-compress` | FFmpeg WASM | ✅ | Functional |
| video-editor | `/tools/video-editor` | in-browser preview only | n/a | `handleExport` is a `setTimeout` stub with no real encode — **confirmed: not production functionality**, it fakes a 2.2s "export" and never produces a downloadable file. |
| pdf-to-word / pdf-to-excel / word-to-pdf | listed in ToolEngine only partially | **[unverified — files not shown]** | — | Cannot audit without file contents |

---

## 3. FFmpeg-SPECIFIC FINDINGS

`FFmpegManager` (singleton, static class) is loaded once, guarded against
concurrent double-load via `loadPromise`, and cleans up MEMFS files in
`useFFmpeg.run()`'s `finally` block (`deleteFile(inputFileName)` /
`deleteFile(outputFileName)`). This is correct and should **not** be rewritten.

Confirmed gaps:
- **No true cancellation of an in-flight `exec()`** — `cancel()` in
  `useFFmpeg.ts` is aliased directly to `terminate()`, which kills the entire
  WASM worker. That means "Cancel" in video-trim/speed/compress/to-mp3
  destroys the loaded engine, so the *next* job has to reload the ~25MB core
  from CDN again. This is a real UX/performance cost, not a hypothetical one.
- Each video tool component still defines its own `formatBytes`/`formatTime`
  instead of importing one shared version — cosmetic but multiplies future
  bugs (e.g. a locale change to file-size units means 4 edits, not 1).
- CDN loading (`unpkg.com`, fallback `cdn.jsdelivr.net`) has no cached-in-
  IndexedDB fallback — first load on a slow connection blocks every video
  tool equally; this is inherent to the "download WASM core over CDN" choice
  and is a reasonable tradeoff, not a bug, but worth documenting as a known
  cold-start cost.

---

## 4. EXAMPLE GEMINI TASK SPECS (format requested)

### TASK: BOTOCK-101
**Title:** Fix hardcoded `.jpg` download extension in Image Compressor
**Priority:** P1
**Objective:** `image-compress/Client.tsx`'s download anchor always writes
`download="Botock-Compressed-Image.jpg"` regardless of the actual output MIME
type produced by `imageCompression()`, which preserves the *input* format
(PNG stays PNG, WebP stays WebP). A user compressing a PNG gets a file
literally named `.jpg` containing PNG bytes.

**Files to inspect:** `frontend/app/tools/image-compress/Client.tsx`
**Files to modify:** same file only
**Current problem:** `compressedFile.type` already holds the correct MIME
type returned by the compression library but is never read when building the
download filename.
**Required behavior:** download filename extension must match
`compressedFile.type` (`image/jpeg`→`.jpg`, `image/png`→`.png`,
`image/webp`→`.webp`).
**Implementation approach:** derive extension from `compressedFile.type` with
a small lookup map at download-render time; do not touch the compression
options object; do not change default quality/size behavior.
**Do not break:** existing quality slider, target-size input, dimension
constraint toggle, all currently pass; only the filename derivation changes.
**Test:** upload a `.png`, confirm downloaded file is named `*.png` and opens
correctly; repeat for `.jpg` and `.webp` input.
**Acceptance criteria:**
- Downloaded filename extension matches the actual Blob MIME type in all 3
  cases (jpg/png/webp input).
- No other behavior in the tool changes.

---

### TASK: BOTOCK-102
**Title:** PDF OCR component should call the existing orchestrator instead of
reimplementing it
**Priority:** P2
**Objective:** `PDFOCRView.tsx` duplicates the entire page-loop/worker-lifecycle
logic that `frontend/lib/pdf/pdfOcrHelper.ts`'s exported `processPdfOcr()`
already implements (including cancellation support via `cancelSignal`), so the
helper's top-level orchestrator is dead code and any future bug fix to OCR
page iteration must be made in two places to stay consistent.

**Files to inspect:** `frontend/app/tools/pdf-ocr/PDFOCRView.tsx`,
`frontend/lib/pdf/pdfOcrHelper.ts`
**Files to modify:** `PDFOCRView.tsx` only
**Current problem:** component's `handleStartOcr()` reimplements
`pdfjsLib.getDocument`, its own `createWorker`, and its own for-loop instead
of calling `processPdfOcr(file, language, onProgress, cancelSignal)`.
**Required behavior:** identical UX (same progress text cadence, same page
results shape, same cancel button behavior) but sourced from the single
helper function.
**Implementation approach:** replace the body of `handleStartOcr` with a call
to `processPdfOcr()`, mapping its `OCRProgress` callback onto the existing
`setProgressPercent`/`setProgressStatus` setters, and its returned
`{ pages, fullText }` onto the existing `setResults`/`setEditableText` calls.
Respect the existing `pageMode`/`pageRange` selection by pre-filtering which
pages get processed — check whether `processPdfOcr` needs a page-subset
parameter added, or filter results client-side; do not silently drop the
custom-range feature.
**Do not break:** page-range parsing (`parsePageSelection`), per-page
accordion UI, copy-to-clipboard, .txt export, language selector.
**Test:** single-page PDF, 5-page PDF, custom range "1,3", cancel mid-run,
password-protected PDF (should show the existing error message).
**Acceptance criteria:**
- OCR page loop exists in exactly one place in the codebase.
- All existing OCR UI behavior is unchanged from a user's perspective.
- Cancelling mid-run stops processing and terminates the Tesseract worker
  (verify no worker survives after cancel — check for lingering network/CPU
  activity in devtools).

---

### TASK: BOTOCK-103
**Title:** Extract shared PDF-load + object-URL-download lifecycle out of the
5 simple PDF tools
**Priority:** P1 (do this before adding any new PDF tool)
**Objective:** Eliminate the ~40-line duplicated block (see Section 1.2-A)
across `pdf-merge`, `pdf-split`, `pdf-rotate`, `pdf-watermark`,
`pdf-page-delete` by extracting two hooks.

**Files to inspect (read only, do not modify order/behavior):**
`frontend/app/tools/pdf-merge/PDFMergeClient.tsx`,
`frontend/app/tools/pdf-split/PDFSplitClient.tsx`,
`frontend/app/tools/pdf-rotate/PDFRotateClient.tsx`,
`frontend/app/tools/pdf-watermark/PDFWatermarkClient.tsx`,
`frontend/app/tools/pdf-page-delete/PDFPageDeleteClient.tsx`

**Files to create:**
`frontend/lib/pdf/usePdfDocument.ts` — takes a `File`, returns
`{ file, pageCount, error, loadFile(file), reset() }`, encapsulating the
`PDFDocument.load(buffer, { ignoreEncryption: true })` + encrypted/corrupted
error-message logic currently duplicated in all 5 files.

`frontend/lib/download/useObjectUrlDownload.ts` — takes nothing, returns
`{ url, setBlob(blob), reset() }`, encapsulating create-on-set +
revoke-on-replace + revoke-on-unmount, currently duplicated as
`downloadUrl`/`useEffect(() => () => URL.revokeObjectURL(downloadUrl), ...)`
in all 5 files.

**Files to modify:** the 5 Client components above — replace their local
`file`/`pageCount`/`errorMessage` state and `downloadUrl` state +
cleanup-effect with calls to the two new hooks. **Do not** touch the
tool-specific mutation logic (`copyPages`, `setRotation`, `drawText`, page
filtering) — only the load/error/download plumbing moves.

**Do not break:** each tool's specific page-manipulation feature, its specific
options UI (rotation angle picker, watermark text/opacity/color, page-range
inputs, page-delete checkboxes), its specific success-message copy.

**Security requirements:** preserve the existing `ignoreEncryption: true` +
error-message-on-save-failure pattern; do not silently swallow encryption
errors.

**Test:** for each of the 5 tools — valid PDF, encrypted PDF (should show the
existing "password-protected" message), 0-byte file, non-PDF file with `.pdf`
extension, then run the specific tool action and confirm output downloads
correctly and the old object URL is revoked (check devtools memory/network,
confirm no blob: URL count growth across repeated runs in the same session).

**Acceptance criteria:**
- The load/error/download blocks exist in exactly two shared files, referenced
  by all 5 tools.
- Each tool's unique UI and mutation behavior is unchanged.
- No regression in encrypted-PDF error messaging.
- Running each tool 5x in a row in one session does not leak object URLs
  (verify via `performance.memory` trend or manual blob: URL count check).

---

## 5. GEMINI SAFETY RULES (apply to every task above and any future one)

1. Read every file listed under "Files to inspect" fully before editing anything.
2. Grep for all call sites of any function/hook you change before changing its
   signature.
3. Do not rename existing exported function/hook names unless the task
   explicitly asks for it — other files may import them.
4. Preserve all current default values (quality %, CRF, resolution presets,
   compression presets) exactly as they are today unless the task says
   otherwise.
5. Do not introduce a second implementation of something already covered by
   an existing shared helper (`FFmpegManager`, `pdfCompressHelper`,
   `pdfOcrHelper`, or any new hook created under a BOTOCK task) — import and
   reuse it.
6. Every new async operation that creates a Blob/object URL must have a
   matching revoke path (on replace and on unmount).
7. Every new processing call must handle: empty/0-byte input, non-matching
   MIME type, and a thrown error from the underlying library — surfacing a
   user-readable message via the existing error-banner pattern already used
   in that tool.
8. Run `npx tsc --noEmit` and `npm run build` after every task and report the
   exact output (not "it works").
9. List every file actually changed at the end of the task, even if a change
   turned out to be a no-op.
10. Never touch a tool that is not named in the task's "Files to modify" list,
    even if you notice an unrelated bug in it — log it as a new candidate
    task instead.

---

## 7. IMAGE TOOLS GROUP — TASK SPECS

These five tasks extract the duplication proven in Section 1.2-B. Do them
**after** BOTOCK-103 (PDF group) since BOTOCK-104 below reuses the
`useObjectUrlDownload` hook created there — same lifecycle problem, different
tool family, no reason to build it twice.

### TASK: BOTOCK-104
**Title:** Create shared `useObjectUrlLifecycle` hook and adopt it in all
image tools
**Priority:** P1
**Objective:** Every image tool (`image-resize`, `image-compress`,
`image-to-webp`, `image-upscale`, `image-remove-bg`) independently tracks a
result Blob URL via a differently-named ref (`prevResultUrlRef`,
`resultUrlRef`, `originalUrlRef`, `compressedUrl` state, etc.) and revokes it
on replace/unmount with hand-written `useEffect` cleanup. Consolidate into one
hook covering both "original preview URL" and "result URL" cases, since a
tool may need one or two live URLs at once (e.g. image-resize keeps the
source preview *and* the result preview simultaneously).

**Files to inspect:**
`frontend/app/tools/image-resize/Client.tsx`,
`frontend/app/tools/image-compress/Client.tsx`,
`frontend/app/tools/image-to-webp/Client.tsx`,
`frontend/app/tools/image-upscale/Client.tsx`,
`frontend/app/tools/image-remove-bg/Client.tsx`

**Files to create:** `frontend/lib/download/useObjectUrlLifecycle.ts` —
```
function useObjectUrlLifecycle(): {
  url: string | null;
  set(blob: Blob): void;   // revokes previous url, creates new one, returns nothing
  clear(): void;           // revokes and nulls
}
```
Internally hold the current URL in a `useRef` (not state, to avoid a stale
closure inside async processing callbacks) mirrored into a `useState` for
render triggers, with unmount cleanup registered once.

**Files to modify:** the 5 Client components — replace each tool's own
ref+state+effect combination for *every* Blob URL it tracks (original preview
included, not just the result) with one `useObjectUrlLifecycle()` instance per
URL the tool actually needs concurrently.

**Do not break:** `image-resize` needs 1 result URL (original is shown via
`imageMeta.src`, a data URL from FileReader, not an object URL — leave that
path alone, do not force it onto object URLs). `image-upscale` needs both an
original preview and a result URL simultaneously for its before/after tab
switcher — confirm both survive independently after refactor.

**Test:** for each tool — process an image, download it, process a second
image without refreshing the page, confirm the first result's object URL was
revoked (no growth in `blob:` URL count across repeated runs), confirm the
before/after tab switcher in image-upscale still shows both images correctly
after a second run.

**Acceptance criteria:**
- Zero hand-written `URL.revokeObjectURL` calls remain outside
  `useObjectUrlLifecycle.ts`.
- Repeated processing in one session shows no object URL leak.
- image-upscale's dual preview (original + upscaled) still works.

---

### TASK: BOTOCK-105
**Title:** Extract shared `formatBytes`/`formatTime` utilities
**Priority:** P2
**Objective:** `formatBytes()` is redefined nearly identically in
`image-resize/Client.tsx`, `image-upscale/Client.tsx`, `image-to-webp/Client.tsx`,
`image-compress/Client.tsx`, and `formatBytes`+`formatTime` are both
redefined in `video-trim/Client.tsx`, `video-speed/Client.tsx`,
`video-to-mp3/Client.tsx`, `video-compress/Client.tsx` — 8 duplicate
definitions of two small pure functions.

**Files to inspect:** all 8 files named above (grep each for
`function formatBytes` / `function formatTime` to confirm current signatures
match before consolidating — some use `decimals = 1` default, some `= 2`,
reconcile to one signature and note the visible rounding-behavior change, if
any, in the task report).

**Files to create:** `frontend/lib/format/units.ts` exporting `formatBytes(bytes, decimals?)`
and `formatTime(seconds)`.

**Files to modify:** the 8 files above — delete local definitions, import from
`frontend/lib/format/units.ts`.

**Do not break:** displayed rounding must not visibly change for existing
users (e.g. if one tool showed "1.2 MB" and now shows "1.24 MB" because a
different decimals default was silently adopted, that's a regression — pick
the union of existing behavior deliberately, not by accident of which file
was refactored last).

**Test:** visually diff the file-size/duration display in each of the 8 tools
before and after, using the same test file, confirm identical text output.

**Acceptance criteria:**
- One definition each of `formatBytes`/`formatTime` in the whole repo.
- No visible display change in any of the 8 tools for the same inputs.

---

### TASK: BOTOCK-106
**Title:** Shared drag-and-drop upload zone component
**Priority:** P2
**Objective:** Every tool's "no file yet" state renders the same dashed-border
drop zone JSX (icon circle, heading, subtext, drag-active border color swap)
with only the icon, heading text, subtext, and `accept` map differing.

**Files to inspect:** the upload-zone JSX block (`!file ? (...) : (...)`
first branch) in every tool listed in Section 2 that uses `useDropzone`.

**Files to create:** `frontend/app/components/tool-ui/UploadDropzone.tsx`
accepting `{ accept, icon, title, subtitle, onDrop, multiple? }` and rendering
the existing visual pattern (reuse current Tailwind classes verbatim so no
visual change occurs).

**Files to modify:** each tool's Client component — replace the inline drop
zone JSX with `<UploadDropzone .../>`, passing that tool's existing `accept`
map and copy text unchanged.

**Do not break:** tool-specific accept maps (e.g. image-remove-bg only
accepts jpeg/png/webp while image-resize also accepts gif/bmp/svg) — pass
these through as props, do not unify the accept lists themselves.

**Test:** visually compare every tool's empty-state screenshot before/after;
confirm drag-active state still highlights correctly; confirm each tool still
rejects files outside its own accept map (test with a non-matching file per
tool).

**Acceptance criteria:**
- One JSX implementation of the drop-zone visual, reused by every tool that
  had it.
- No visual regression per tool.
- Per-tool file-type acceptance unchanged.

---

### TASK: BOTOCK-107
**Title:** Standardize processing status into `useProcessingJob`
**Priority:** P2 (do after BOTOCK-104/105/106; this is the biggest one)
**Objective:** Every tool hand-rolls its own `isProcessing`/`progress`/
`errorMessage`/`resultX` state cluster with a tool-specific async handler
function (`handleUpscale`, `handleCompress`, `handleProcess`, `handleResize`,
`convertToWebP`). Introduce a status-machine hook so every tool's "processing"
UI (spinner + progress %, error banner, result card) can eventually share one
implementation, without forcing all tools onto one processing signature today.

**Files to inspect:** every image and simple-PDF tool's Client component,
specifically each one's `isProcessing`/progress/error state block.

**Files to create:** `frontend/lib/tools/useProcessingJob.ts` —
```
function useProcessingJob<TResult>(): {
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;        // 0-100, tool sets via reportProgress()
  error: string | null;
  result: TResult | null;
  run(fn: (reportProgress: (n: number) => void) => Promise<TResult>): Promise<void>;
  reset(): void;
}
```
`run()` wraps the tool's existing async processing function, sets status
transitions, and catches thrown errors into the existing error-banner message
format each tool already uses.

**Files to modify:** start with **one tool only** in this task
(`image-to-webp/Client.tsx` — it has the simplest single-step processing
function, `convertToWebP`) to prove the hook out before touching the rest.
Do not migrate every tool in one task — that violates the "small, testable
change" principle. Follow-up tasks (BOTOCK-107a, -107b, ...) migrate one tool
each after this one is verified in production.

**Do not break:** image-to-webp's re-apply-on-quality-change behavior (moving
the quality slider re-runs `convertToWebP` immediately) must still work
through the new hook.

**Test:** convert an image, change quality slider multiple times rapidly,
confirm no race condition where an older slow conversion overwrites a newer
result (check by throttling network/CPU in devtools and moving the slider
fast).

**Acceptance criteria:**
- `image-to-webp` uses `useProcessingJob` for its status handling.
- No other tool is touched in this task.
- Rapid slider changes never show a stale result.

---

## 8. SHARED HOOK CONTRACT SUMMARY

For quick reference when writing further extraction tasks, the three hooks
introduced across BOTOCK-103/104/107 and their contracts:

| Hook | File | Introduced in | Contract |
|---|---|---|---|
| `usePdfDocument` | `frontend/lib/pdf/usePdfDocument.ts` | BOTOCK-103 | `{ file, pageCount, error, loadFile(file), reset() }` |
| `useObjectUrlLifecycle` | `frontend/lib/download/useObjectUrlLifecycle.ts` | BOTOCK-104 | `{ url, set(blob), clear() }` — instantiate once per concurrent URL a tool needs |
| `useProcessingJob<T>` | `frontend/lib/tools/useProcessingJob.ts` | BOTOCK-107 | `{ status, progress, error, result, run(fn), reset() }` |

Note `useObjectUrlDownload` from BOTOCK-103 and `useObjectUrlLifecycle` from
BOTOCK-104 overlap in purpose (both are "track one Blob URL, revoke on
replace/unmount"). When implementing BOTOCK-104, **check whether BOTOCK-103's
hook already covers this** — if so, rename/relocate it to
`frontend/lib/download/useObjectUrlLifecycle.ts` and have the PDF tools import
the same one, rather than shipping two near-identical hooks. This is exactly
the kind of accidental duplication this whole audit exists to prevent — do
not let it happen again during the fix itself.

---

## 9. SUGGESTED IMPLEMENTATION ORDER (dependency graph)

```
BOTOCK-103 (PDF load + download hooks)
   │
   ├── BOTOCK-104 (image object-URL hook) — depends on 103's download hook
   │      being reconciled per Section 8 note, not duplicated
   │
   ├── BOTOCK-105 (formatBytes/formatTime) — independent, can run in parallel
   │      with 103/104
   │
   ├── BOTOCK-106 (UploadDropzone component) — independent, can run in
   │      parallel with 103/104/105
   │
   └── BOTOCK-107 (useProcessingJob, image-to-webp only) — depends on 104
          being merged first (result card relies on the same URL hook)

BOTOCK-101 (image-compress extension bug) — fully independent, no dependency,
   safe to do first as a quick win

BOTOCK-102 (pdf-ocr dedup) — fully independent, no dependency
```

Recommended order for a solo implementer using Gemini: **101 → 102 → 105 →
106 → 103 → 104 → 107**. This front-loads the two standalone bug/dedup fixes
that build confidence in the workflow before touching shared hooks, then does
the two zero-risk pure-utility extractions, then the two stateful hooks in
dependency order, ending with the highest-risk item (107) last and scoped to
one tool only.

---

## 10. WHAT WAS NOT AUDITED (be explicit about limits)

The following exist in the repo tree (per `PROJECT.md`/`.agents/` structure)
but their file contents were not provided in this pass, so no claims are made
about them: `pdf-to-word`, `pdf-to-excel`, `word-to-pdf` client
implementations; `frontend/utils/runtime-urls.ts`; the `.agents/` orchestration
history; Supabase RLS policies (no `.sql`/policy files were shown); the
backend's actual request/response behavior beyond the router/service files
shown (no live testing was performed). Treat any statement about those areas
elsewhere in this document as absent, not as "no problems found."
