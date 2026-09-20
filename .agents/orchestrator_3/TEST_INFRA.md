# Test Infrastructure: Botock Video & Advanced PDF Tools Suite

## 1. Test Philosophy & Architecture

The Botock Video & Advanced PDF test infrastructure provides opaque-box, contract-driven, deterministic verification for all 6 client-side media tools:
1. `video-trim` (WASM stream-copy and re-encode trimming)
2. `video-speed` (WASM PTS retiming and atempo audio chaining)
3. `video-to-mp3` (WASM audio extraction and MP3 transcoding)
4. `video-compress` (WASM CRF optimization and resolution downscaling)
5. `pdf-ocr` (Client-side PDF page rasterization and Tesseract OCR)
6. `pdf-compress` (pdf-lib indirect object traversal and Canvas JPEG downsampling)

### Core Architectural Guarantees:
- **Zero Network Egress (100% Privacy)**: Verifies that no media bytes or processing jobs are transmitted to external servers. All processing runs entirely inside client-side WebAssembly, Web Workers, or HTML5 Canvas.
- **Progressive Testability & Decoupling**: Uses spec-compliant synthetic binary generators for ISO Base Media (MP4) and PDF-1.4 documents. Tests execute deterministically in automated CI/CD and terminal environments without requiring external physical media assets or GUI rendering.
- **Mathematical Invariants & Parameter Clamping**: Enforces strict boundary clamping (CRF 18-51, speed 0.25x-4.0x, macroblock divisibility by 2, audio filter chaining across atempo boundaries).
- **Virtual MEMFS Sandbox**: Simulates Emscripten/WASM virtual filesystem operations (`writeFile`, `readFile`, `deleteFile`, `exec`) to verify memory allocation, intermediate artifact cleanup, and zero memory leaks.

---

## 2. Feature Inventory & Coverage Matrix

| # | Feature ID | Category | Core Technology | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Total Tests |
|---|------------|----------|-----------------|:------:|:------:|:------:|:------:|:-----------:|
| 1 | `video-trim` | Video | `@ffmpeg/ffmpeg` (WASM) | 5 | 6 | 2 | 2 | **15** |
| 2 | `video-speed` | Video | `@ffmpeg/ffmpeg` (setpts + atempo) | 5 | 5 | 2 | 2 | **14** |
| 3 | `video-to-mp3` | Video | `@ffmpeg/ffmpeg` (`libmp3lame`) | 5 | 5 | 1 | 1 | **12** |
| 4 | `video-compress` | Video | `@ffmpeg/ffmpeg` (CRF + scale) | 5 | 5 | 2 | 2 | **14** |
| 5 | `pdf-ocr` | PDF | `pdfjs-dist` + `tesseract.js` | 5 | 5 | 1 | 1 | **12** |
| 6 | `pdf-compress` | PDF | `pdf-lib` + Canvas JPEG | 5 | 5 | 1 | 1 | **12** |
| **All** | **Full Suite** | **Video + PDF** | **WASM / Canvas / Client** | **30** | **31** | **7** | **5** | **73 Tests** |

---

## 3. Four-Tier Test Methodology

### Tier 1: Feature Coverage (30 Tests)
- **Goal**: Verify every tool's primary behavior, parameter defaults, CLI argument generation, format conversion, and download artifact metadata.
- **Key Checks**:
  - `video-trim`: Fast stream-copy arguments (`-ss -to -c copy`), accurate re-encode flags (`-c:v libx264 -c:a aac`), default range handling (0 to duration), artifact naming (`trimmed_${name}`).
  - `video-speed`: Speed alteration at 1.5x (`setpts=0.6667*PTS`, `atempo=1.50`), 0.5x slow-mo, mute audio option (`-an`), duration inverse scaling.
  - `video-to-mp3`: Audio extraction CLI builder (`-vn -c:a libmp3lame -b:a 192k`), audiophile 320k preset, mono vs stereo channels, MIME typing (`audio/mpeg`).
  - `video-compress`: CRF 28 ultrafast compression, 720p downscaling (`scale=-2:720`), even macroblock calculation, space reduction metric computation.
  - `pdf-ocr`: 2.0x scale (144 DPI) optimal rasterization, multi-language configuration (`eng`, `spa`, `fra`, `deu`), per-page confidence extraction, `.txt` download payload.
  - `pdf-compress`: Indirect image XObject identification, quality presets (`low` 0.45, `medium` 0.65, `high` 0.80), object stream compaction (`useObjectStreams: true`), `%PDF-` header and `%%EOF` trailer verification.

### Tier 2: Boundary & Corner Cases (31 Tests)
- **Goal**: Verify robustness against empty files, corrupt data buffers, inverted parameters, extreme boundary values, and resource limitations.
- **Key Checks**:
  - 0-byte input rejection across all video and PDF tools.
  - Corrupted container detection without valid `moov` or `%PDF-` headers.
  - Trim start at exact 0.000s boundary; trim end equal to duration; trim end exceeding duration (clamping).
  - Inverted trim range (`startTime >= endTime`) validation failure.
  - Extreme speed boundaries: 0.25x (chained `atempo=0.5,atempo=0.5`) and 4.0x (chained `atempo=2.0,atempo=2.0`).
  - Out-of-bounds speed clamping (`[0.25, 4.0]`).
  - Silent video without audio tracks handled with clear user feedback.
  - Bitrate clamping (`[64k, 320k]`) and international filename preservation.
  - CRF extremes: boundary 51 (max compression) vs boundary 18 (lossless), out-of-range clamping (`[18, 51]`).
  - Odd pixel resolutions clamped to even numbers for H.264 compliance.
  - Non-image text-only PDF compression safety (zero corruption, 0% savings reported).
  - Heavily-imaged PDF downsampling and encrypted PDF detection.

### Tier 3: Cross-Feature Interactions (7 Tests)
- **Goal**: Verify multi-tool pipelines, data handoffs, and resource reclamation in the shared client environment.
- **Pipelines**:
  1. `video-trim` output buffer fed into `video-speed`.
  2. `video-speed` output buffer fed into `video-compress`.
  3. `video-compress` output buffer fed into `video-to-mp3`.
  4. `pdf-compress` output buffer fed into `pdf-ocr`.
  5. Rapid sequential operations with MEMFS virtual filesystem cleanup (verifying 0 remaining bytes).
  6. Singleton WASM engine lifecycle sharing.
  7. ToolEngine cross-registration & tool category discovery.

### Tier 4: Real-World Application Scenarios (5 Tests)
- **Goal**: Validate authentic user journeys with realistic inputs and complex constraints:
  1. *Presentation Workflow*: User trims a 1080p slide deck (60s -> 30s), accelerates 1.5x (-> 20s), and downscales to 720p for sharing.
  2. *Podcast Audio Extraction*: User extracts a 60-minute MP4 podcast recording to high-quality 320kbps stereo MP3 with progress tracking.
  3. *Scanned Invoice OCR*: User processes a 5-page scanned invoice PDF at 144 DPI, extracting table metadata with >94% confidence.
  4. *Image-Heavy Report Optimization*: User downsamples a 20MB photo-heavy quarterly PDF to 4.8MB (76% reduction) using the medium preset.
  5. *Social Media Highlight Reel*: User trims a 4K raw recording to a 15s clip, speeds it up 1.25x to 12s, and compresses to 1080p for social media.

---

## 4. Test Harness & File Structure

```
frontend/
├── __tests__/
│   └── e2e/
│       ├── fixtures/
│       │   └── synthetic-media.mjs       # MP4 & PDF binary generators
│       ├── harness/
│       │   └── tool-contracts.mjs        # Authoritative validators, CLI builders & MEMFS sandbox
│       ├── tier1-feature-coverage.test.mjs
│       ├── tier2-boundary-corner.test.mjs
│       ├── tier3-cross-feature.test.mjs
│       ├── tier4-real-world.test.mjs
│       └── index.test.mjs                # Test entrypoint proxy
└── scripts/
    └── run-e2e-tests.mjs                 # Master test runner with CLI flags & ANSI reporting
```

---

## 5. Invocation Command

To execute the full E2E test suite from the frontend directory:
```bash
node scripts/run-e2e-tests.mjs
```

Or targeting specific tiers:
```bash
node scripts/run-e2e-tests.mjs --tier=1,2
node scripts/run-e2e-tests.mjs --tier=3,4
```

Or from the project root:
```bash
node frontend/scripts/run-e2e-tests.mjs
```
