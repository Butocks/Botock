import {
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFRef,
  JpegEmbedder,
} from "pdf-lib";

export type CompressionPreset = "balanced" | "maximum" | "high_quality";

export interface CompressionOptions {
  preset?: CompressionPreset;
  quality?: number; // 0.1 to 1.0 (overrides preset if provided)
  maxDimension?: number; // max width/height in pixels
  onProgress?: (progress: number, status: string) => void;
  cancelSignal?: { cancelled: boolean };
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  ratio: number; // percentage (0 - 100)
  blob: Blob;
  imagesCompressed: number;
}

const PRESET_CONFIGS: Record<CompressionPreset, { quality: number; maxDimension: number }> = {
  balanced: { quality: 0.65, maxDimension: 1920 },
  maximum: { quality: 0.45, maxDimension: 1280 },
  high_quality: { quality: 0.8, maxDimension: 2560 },
};

interface ImageCandidate {
  ref: PDFRef;
  stream: PDFRawStream;
  originalBytes: Uint8Array;
}

/**
 * Traverses the PDF indirect object map to locate all embedded raster image streams.
 */
function findImageCandidates(pdfDoc: PDFDocument): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  const entries = pdfDoc.context.enumerateIndirectObjects();

  for (const [ref, obj] of entries) {
    if (obj instanceof PDFRawStream) {
      const dict = obj.dict;
      const subtype = dict.get(PDFName.of("Subtype"));
      if (subtype === PDFName.of("Image")) {
        candidates.push({
          ref,
          stream: obj,
          originalBytes: obj.getContents(),
        });
      }
    }
  }

  return candidates;
}

/**
 * Downsamples and recompresses raw image bytes via HTML5 Canvas.
 * Returns compressed JPEG bytes if successful and smaller than original, otherwise null.
 */
async function downsampleImage(
  imageBytes: Uint8Array,
  quality: number,
  maxDimension: number
): Promise<Uint8Array | null> {
  if (typeof window === "undefined") {
    throw new Error("downsampleImage requires a browser environment with Canvas/ImageBitmap APIs.");
  }

  const blob = new Blob([imageBytes as unknown as BlobPart]);
  let imageBitmap: ImageBitmap;

  try {
    imageBitmap = await createImageBitmap(blob);
  } catch {
    // If not a decodable image format in browser (e.g. JBIG2 or raw stream without headers), skip safely
    return null;
  }

  let { width, height } = imageBitmap;
  if (width > maxDimension || height > maxDimension) {
    const scale = Math.min(maxDimension / width, maxDimension / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    return null;
  }

  // Draw white background to avoid transparent regions turning black in JPEG
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  imageBitmap.close();

  const compressedBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  );

  // Clean up canvas backing store immediately
  canvas.width = 0;
  canvas.height = 0;

  if (!compressedBlob) return null;

  const newBytes = new Uint8Array(await compressedBlob.arrayBuffer());

  // Only retain if it achieves a genuine size reduction
  if (newBytes.length < imageBytes.length) {
    return newBytes;
  }

  return null;
}

/**
 * Compresses a PDF document by inspecting indirect objects, downsampling image streams,
 * replacing stream references in-place, and compacting object streams.
 */
export async function compressPdf(
  fileOrBuffer: File | Blob | ArrayBuffer | Uint8Array,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
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

  const originalSize = arrayBuffer.byteLength;
  const preset = options.preset || "balanced";
  const quality = options.quality ?? PRESET_CONFIGS[preset].quality;
  const maxDimension = options.maxDimension ?? PRESET_CONFIGS[preset].maxDimension;
  const { onProgress, cancelSignal } = options;

  onProgress?.(5, "Parsing PDF structure...");

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("encrypted") || msg.includes("password") || msg.includes("EncryptedPDFError")) {
      throw new Error(
        "This PDF is password-protected or encrypted. Please remove encryption before compressing."
      );
    }
    throw err;
  }

  onProgress?.(15, "Scanning embedded images...");
  const candidates = findImageCandidates(pdfDoc);
  let imagesCompressed = 0;
  const totalCandidates = candidates.length;

  for (let i = 0; i < totalCandidates; i++) {
    if (cancelSignal?.cancelled) {
      break;
    }

    const candidate = candidates[i];
    const stepProgress = 15 + Math.round(((i + 1) / totalCandidates) * 65);
    onProgress?.(
      stepProgress,
      `Optimizing image ${i + 1} of ${totalCandidates}...`
    );

    const recompressedBytes = await downsampleImage(
      candidate.originalBytes,
      quality,
      maxDimension
    );

    if (recompressedBytes) {
      try {
        const embedder = await JpegEmbedder.for(recompressedBytes);
        await embedder.embedIntoContext(pdfDoc.context, candidate.ref);
        imagesCompressed++;
      } catch (embedErr) {
        console.warn("Failed to replace image stream with recompressed JPEG:", embedErr);
      }
    }

    // Yield to event loop to allow UI responsiveness
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  onProgress?.(85, "Rebuilding and compacting PDF object streams...");

  // Save with object streams enabled for maximum structural compaction
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
  const compressedSize = compressedBytes.length;

  let finalBytes: Uint8Array = compressedBytes;
  let finalSize = compressedSize;

  // If compression resulted in larger file (e.g. no compressible images and added overhead), fall back to original
  if (compressedSize > originalSize && imagesCompressed === 0) {
    finalBytes = new Uint8Array(arrayBuffer);
    finalSize = originalSize;
  }

  const savedBytes = Math.max(0, originalSize - finalSize);
  const ratio = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;
  const blob = new Blob([finalBytes as unknown as BlobPart], { type: "application/pdf" });

  onProgress?.(100, "PDF compression completed.");

  return {
    originalSize,
    compressedSize: finalSize,
    savedBytes,
    ratio,
    blob,
    imagesCompressed,
  };
}

export default {
  compressPdf,
};
