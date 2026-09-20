## 2026-09-20T18:46:14Z

You are explorer_survey_3, an exploration subagent.
Your working directory is: /home/mir/Documents/botock/.agents/explorer_survey_3/
The project root is: /home/mir/Documents/botock
The frontend directory is: /home/mir/Documents/botock/frontend
The user request document is: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Tool architecture rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

MANDATORY FIRST STEP: Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md and /home/mir/Documents/botock/.agents/rules/tool_architecture.md before doing anything else.

YOUR MISSION:
Perform a deep technical investigation into the 2 client-side PDF Tools:
1. `pdf-ocr`: Extract text from scanned/image PDFs using `tesseract.js` + `pdfjs-dist`
2. `pdf-compress`: Downsample embedded images in PDF using `pdf-lib` + HTML5 Canvas

INVESTIGATE & DOCUMENT:
1. `pdf-ocr` architecture:
   - How `pdfjs-dist` loads in Next.js App Router (worker configuration, `GlobalWorkerOptions.workerSrc`, loading standard font data or canvas rendering in browser).
   - Rendering each page of a PDF onto an offscreen or in-memory HTML5 Canvas at appropriate DPI/scale (e.g. 1.5x - 2.0x for good OCR accuracy).
   - How `tesseract.js` works in browser: worker creation, language loading (default English, option for others), running OCR page by page, tracking per-page and overall progress.
   - Text output format: plain text view with copy to clipboard, download `.txt`, per-page breakdown.
2. `pdf-compress` architecture:
   - How `pdf-lib` parses a PDF document, iterates through pages and resources (`PDFDict`, `PDFStream`, `PDFName.of('XObject')`, `Subtype: Image`).
   - Extracting image streams (JPEG, PNG/raw), drawing to HTML5 Canvas, re-encoding as compressed JPEG (e.g. quality 0.5 - 0.7, optional max dimension downscaling).
   - Replacing original image bytes in `pdf-lib` (`pdfDoc.embedJpg(compressedBytes)` and updating reference or stream).
   - Handling PDFs without images or with already-compressed images gracefully.
   - Size reduction metrics (original size vs compressed size, percentage saved).
3. Dependencies and Next.js compatibility:
   - Required packages: `pdfjs-dist`, `tesseract.js`, `pdf-lib`. Check versions and any bundler issues (e.g., node canvas polyfill issues in `pdfjs-dist`, worker loader issues).
4. Edge cases & error handling:
   - Multi-page PDFs (1 to 50+ pages), memory management across many pages, progress indicator, cancellation, password-protected PDFs (detect and display clear error message).

CONSTRAINTS:
- You are strictly READ-ONLY. Do NOT write or modify any source code files.
- Write your findings to `/home/mir/Documents/botock/.agents/explorer_survey_3/survey_report.md`.
- Include a progress.md heartbeat in your working directory.
- When finished, send a message to parent summarizing your findings and pointing to your report.
