/**
 * Client-Side Image Upscaler Engine
 * Performs multi-pass step scaling and unsharp mask convolution filtering on HTML5 Canvas 2D.
 * 100% in-browser, zero external server calls.
 */

export interface UpscaleOptions {
  scale: 2 | 4;
  sharpness: boolean;
  sharpnessAmount?: number; // 0.1 to 1.5, default 0.65
}

export interface UpscaleResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  size: number;
}

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

/**
 * Applies an unsharp mask convolution filter pass on Canvas 2D image data.
 * Enhances edge contrast and fine contours lost during interpolation.
 */
export function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 0.65
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const dst = new Uint8ClampedArray(src.length);

  // 3x3 Gaussian smoothing kernel for unsharp masking
  // [1, 2, 1]
  // [2, 4, 2] / 16
  // [1, 2, 1]
  for (let y = 0; y < height; y++) {
    const y0 = clamp(y - 1, 0, height - 1) * width;
    const y1 = y * width;
    const y2 = clamp(y + 1, 0, height - 1) * width;

    for (let x = 0; x < width; x++) {
      const x0 = clamp(x - 1, 0, width - 1);
      const x1 = x;
      const x2 = clamp(x + 1, 0, width - 1);

      const centerIdx = (y1 + x1) * 4;

      // Color channels: R (0), G (1), B (2)
      for (let c = 0; c < 3; c++) {
        const p00 = src[(y0 + x0) * 4 + c];
        const p01 = src[(y0 + x1) * 4 + c];
        const p02 = src[(y0 + x2) * 4 + c];

        const p10 = src[(y1 + x0) * 4 + c];
        const p11 = src[(y1 + x1) * 4 + c];
        const p12 = src[(y1 + x2) * 4 + c];

        const p20 = src[(y2 + x0) * 4 + c];
        const p21 = src[(y2 + x1) * 4 + c];
        const p22 = src[(y2 + x2) * 4 + c];

        const blurred = (
          p00 * 1 + p01 * 2 + p02 * 1 +
          p10 * 2 + p11 * 4 + p12 * 2 +
          p20 * 1 + p21 * 2 + p22 * 1
        ) / 16;

        const orig = p11;
        const diff = orig - blurred;
        const sharpened = orig + amount * diff;

        dst[centerIdx + c] = sharpened < 0 ? 0 : sharpened > 255 ? 255 : sharpened;
      }

      // Preserve alpha channel unmodified
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }

  const outputImageData = new ImageData(dst, width, height);
  ctx.putImageData(outputImageData, 0, 0);
}

/**
 * Upscales an HTMLImageElement using Canvas 2D multi-pass step scaling and optional unsharp mask.
 */
export async function upscaleImage(
  image: HTMLImageElement,
  options: UpscaleOptions
): Promise<UpscaleResult> {
  const { scale, sharpness, sharpnessAmount = 0.65 } = options;

  const srcWidth = image.naturalWidth || image.width;
  const srcHeight = image.naturalHeight || image.height;

  if (!srcWidth || !srcHeight) {
    throw new Error("Invalid source image dimensions.");
  }

  const targetWidth = srcWidth * scale;
  const targetHeight = srcHeight * scale;

  // Safeguard against browser canvas memory limits (e.g. max 16,384 px)
  const MAX_DIMENSION = 16384;
  if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
    throw new Error(
      `Target resolution (${targetWidth}x${targetHeight}) exceeds browser maximum canvas limit of ${MAX_DIMENSION}px.`
    );
  }

  let finalCanvas: HTMLCanvasElement;

  if (scale === 2) {
    // Single 2x step with high-quality bicubic/bilinear smoothing
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const ctx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Failed to obtain 2D canvas rendering context.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    if (sharpness) {
      applyUnsharpMask(ctx, targetWidth, targetHeight, sharpnessAmount);
    }
  } else {
    // Multi-pass step scaling for 4x: 1x -> 2x -> 4x
    // Pass 1: Scale 1x to 2x onto intermediate canvas
    const intermediateCanvas = document.createElement("canvas");
    const midWidth = srcWidth * 2;
    const midHeight = srcHeight * 2;
    intermediateCanvas.width = midWidth;
    intermediateCanvas.height = midHeight;

    const midCtx = intermediateCanvas.getContext("2d");
    if (!midCtx) {
      throw new Error("Failed to obtain intermediate canvas context.");
    }

    midCtx.imageSmoothingEnabled = true;
    midCtx.imageSmoothingQuality = "high";
    midCtx.drawImage(image, 0, 0, midWidth, midHeight);

    // Pass 2: Scale 2x to 4x onto final canvas
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!finalCtx) {
      throw new Error("Failed to obtain final canvas context.");
    }

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);

    // Clean up intermediate canvas memory
    intermediateCanvas.width = 0;
    intermediateCanvas.height = 0;

    if (sharpness) {
      applyUnsharpMask(finalCtx, targetWidth, targetHeight, sharpnessAmount);
    }
  }

  // Convert canvas to PNG Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob((b) => {
      if (b) {
        resolve(b);
      } else {
        reject(new Error("Failed to generate image blob from canvas."));
      }
    }, "image/png");
  });

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    width: targetWidth,
    height: targetHeight,
    size: blob.size,
  };
}
