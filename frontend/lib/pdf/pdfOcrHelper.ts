import * as pdfjsLib from "pdfjs-dist";
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";

// Ensure PDF.js worker is configured on client side
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export interface OCRPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
}

export interface OCRProgress {
  currentPage: number;
  totalPages: number;
  status: string;
  progress: number; // 0 to 100
}

/**
 * Renders a specific PDF page to an off-screen HTML5 Canvas at the requested scale (default 2.0x / 144 DPI).
 * Fills white background to ensure transparent pages render with high contrast for OCR.
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number = 2.0
): Promise<HTMLCanvasElement> {
  if (typeof window === "undefined") {
    throw new Error("renderPdfPageToCanvas can only be executed in a browser environment.");
  }

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Failed to obtain 2D rendering context for PDF page canvas.");
  }

  // Draw solid white background before rendering PDF vectors and text
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

/**
 * Extracts OCR text and confidence score from a rendered canvas using Tesseract.js.
 * Can reuse an existing Tesseract worker or instantiate a one-off worker.
 */
export async function extractTextFromPage(
  canvas: HTMLCanvasElement,
  language: string = "eng",
  progressCallback?: (progress: number, status: string) => void,
  existingWorker?: TesseractWorker
): Promise<{ text: string; confidence: number }> {
  let worker = existingWorker;
  const isTemporaryWorker = !worker;

  if (!worker) {
    worker = await createWorker(language, 1, {
      logger: (m) => {
        if (progressCallback && m.progress !== undefined) {
          progressCallback(Math.round(m.progress * 100), m.status || "processing");
        }
      },
    });
  }

  try {
    const result = await worker.recognize(canvas);
    return {
      text: (result.data.text || "").trim(),
      confidence: Math.round(result.data.confidence || 0),
    };
  } finally {
    if (isTemporaryWorker && worker) {
      await worker.terminate();
    }
  }
}

/**
 * High-level orchestration function for processing an entire PDF file with OCR.
 * Sequentially renders each page to canvas, runs OCR with a shared Tesseract worker,
 * reclaims canvas memory immediately after each page, and aggregates results.
 */
export async function processPdfOcr(
  fileOrBuffer: File | Blob | ArrayBuffer | Uint8Array,
  language: string = "eng",
  onProgress?: (progress: OCRProgress) => void,
  cancelSignal?: { cancelled: boolean }
): Promise<{ pages: OCRPageResult[]; fullText: string }> {
  if (typeof window === "undefined") {
    throw new Error("processPdfOcr can only be executed in a browser environment.");
  }

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer instanceof Uint8Array) {
    arrayBuffer = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength
    ) as ArrayBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }

  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    status: "Loading PDF document...",
    progress: 0,
  });

  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
    });
    pdfDoc = await loadingTask.promise;
  } catch (loadErr: unknown) {
    if (
      loadErr &&
      typeof loadErr === "object" &&
      "name" in loadErr &&
      loadErr.name === "PasswordException"
    ) {
      throw new Error(
        "This PDF is password-protected. Please unlock or remove the password before extracting text."
      );
    }
    throw loadErr;
  }

  const totalPages = pdfDoc.numPages;
  if (totalPages === 0) {
    return { pages: [], fullText: "" };
  }

  onProgress?.({
    currentPage: 0,
    totalPages,
    status: `Initializing OCR engine for language '${language}'...`,
    progress: 5,
  });

  // Single worker instance reused for all pages to avoid re-downloading traineddata
  const worker = await createWorker(language, 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && m.progress !== undefined) {
        // Granular sub-step progress update
      }
    },
  });

  const pages: OCRPageResult[] = [];

  try {
    for (let p = 1; p <= totalPages; p++) {
      if (cancelSignal?.cancelled) {
        break;
      }

      const pageBaseProgress = Math.round(((p - 1) / totalPages) * 90) + 5;
      onProgress?.({
        currentPage: p,
        totalPages,
        status: `Rendering page ${p} of ${totalPages}...`,
        progress: pageBaseProgress,
      });

      const canvas = await renderPdfPageToCanvas(pdfDoc, p, 2.0);

      onProgress?.({
        currentPage: p,
        totalPages,
        status: `Extracting text from page ${p} of ${totalPages}...`,
        progress: Math.min(95, pageBaseProgress + Math.round((0.5 / totalPages) * 90)),
      });

      const pageResult = await extractTextFromPage(canvas, language, undefined, worker);

      pages.push({
        pageNumber: p,
        text: pageResult.text,
        confidence: pageResult.confidence,
      });

      // Crucial: Deallocate canvas backing store immediately to avoid GPU/RAM exhaustion
      canvas.width = 0;
      canvas.height = 0;

      // Yield event loop to allow UI updates and garbage collection
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    onProgress?.({
      currentPage: totalPages,
      totalPages,
      status: "OCR text extraction completed.",
      progress: 100,
    });

    const fullText = pages.map((p) => p.text).join("\n\n");
    return { pages, fullText };
  } finally {
    await worker.terminate();
  }
}

export default {
  renderPdfPageToCanvas,
  extractTextFromPage,
  processPdfOcr,
};
