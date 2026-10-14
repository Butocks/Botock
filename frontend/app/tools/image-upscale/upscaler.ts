/**
 * Client-Side Image & Video-Frame Upscaler Engine
 * Performs multi-pass progressive step scaling (2x, 4x, 8x), optional noise reduction,
 * and high-frequency Gaussian unsharp mask convolution filtering on HTML5 Canvas 2D.
 * 100% in-browser, zero external server calls, strictly private.
 */

export interface UpscaleOptions {
  scale: 2 | 4 | 8;
  sharpness: boolean;
  sharpnessAmount?: number; // 0.1 to 1.5, default 0.65
  noiseReduction?: boolean;
  format?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number; // 0.1 to 1.0 (for jpeg/webp)
}

export interface UpscaleResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

/**
 * Applies a gentle 3x3 noise reduction filter to suppress compression artifacts
 * prior to unsharp mask edge enhancement. Yields every 100 rows to prevent UI freeze.
 */
export async function applyNoiseReduction(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<void> {
  if (width <= 1 || height <= 1) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const dst = new Uint8ClampedArray(src.length);

  const CHUNK_ROWS = 100;
  for (let y = 0; y < height; y++) {
    if (y > 0 && y % CHUNK_ROWS === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
    const y0 = clamp(y - 1, 0, height - 1) * width;
    const y1 = y * width;
    const y2 = clamp(y + 1, 0, height - 1) * width;

    for (let x = 0; x < width; x++) {
      const x0 = clamp(x - 1, 0, width - 1);
      const x1 = x;
      const x2 = clamp(x + 1, 0, width - 1);

      const centerIdx = (y1 + x1) * 4;

      // Weighted box filter
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

        const avg = (
          p00 + p01 * 2 + p02 +
          p10 * 2 + p11 * 4 + p12 * 2 +
          p20 + p21 * 2 + p22
        ) / 16;

        dst[centerIdx + c] = Math.round(avg);
      }
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }

  ctx.putImageData(new ImageData(dst, width, height), 0, 0);
}

/**
 * Applies an unsharp mask convolution filter pass on Canvas 2D image data.
 * Enhances edge contrast and fine contours lost during interpolation.
 * Yields every 100 rows to prevent UI tab freeze on 4K/8K.
 */
export async function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 1.1
): Promise<void> {
  if (width <= 0 || height <= 0) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const dst = new Uint8ClampedArray(src.length);

  // Special single-pixel bypass
  if (width === 1 && height === 1) {
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
    ctx.putImageData(new ImageData(dst, width, height), 0, 0);
    return;
  }

  const CHUNK_ROWS = 100;
  // 3x3 Gaussian smoothing kernel for unsharp masking
  for (let y = 0; y < height; y++) {
    if (y > 0 && y % CHUNK_ROWS === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
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
        // Enhanced high-boost sharpening
        const sharpened = orig + amount * diff * 1.5;

        dst[centerIdx + c] = sharpened < 0 ? 0 : sharpened > 255 ? 255 : Math.round(sharpened);
      }

      // Preserve alpha channel unmodified
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }

  const outputImageData = new ImageData(dst, width, height);
  ctx.putImageData(outputImageData, 0, 0);
}

/**
 * Upscales an HTMLImageElement using Canvas 2D multi-pass step scaling,
 * optional noise reduction, and edge sharpness enhancement.
 */
export async function upscaleImage(
  image: HTMLImageElement,
  options: UpscaleOptions
): Promise<UpscaleResult> {
  const {
    scale,
    sharpness,
    sharpnessAmount = 0.65,
    noiseReduction = false,
    format = "image/png",
    quality = 0.95,
  } = options;

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
    // Single 2x step with high-quality bicubic smoothing
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

    if (noiseReduction) {
      await applyNoiseReduction(ctx, targetWidth, targetHeight);
    }
    if (sharpness) {
      await applyUnsharpMask(ctx, targetWidth, targetHeight, sharpnessAmount);
    }
  } else if (scale === 4) {
    // Multi-pass step scaling for 4x: 1x -> 2x -> 4x
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

    // Clean up intermediate memory
    intermediateCanvas.width = 0;
    intermediateCanvas.height = 0;

    if (noiseReduction) {
      await applyNoiseReduction(finalCtx, targetWidth, targetHeight);
    }
    if (sharpness) {
      await applyUnsharpMask(finalCtx, targetWidth, targetHeight, sharpnessAmount);
    }
  } else {
    // Multi-pass step scaling for 8x: 1x -> 2x -> 4x -> 8x
    const currentCanvas = document.createElement("canvas");
    currentCanvas.width = srcWidth * 2;
    currentCanvas.height = srcHeight * 2;
    const currentCtx = currentCanvas.getContext("2d");
    if (!currentCtx) throw new Error("Canvas context initialization failed.");
    currentCtx.imageSmoothingEnabled = true;
    currentCtx.imageSmoothingQuality = "high";
    currentCtx.drawImage(image, 0, 0, currentCanvas.width, currentCanvas.height);

    // Pass 2: 2x -> 4x
    const pass2Canvas = document.createElement("canvas");
    pass2Canvas.width = srcWidth * 4;
    pass2Canvas.height = srcHeight * 4;
    const pass2Ctx = pass2Canvas.getContext("2d");
    if (!pass2Ctx) throw new Error("Canvas pass 2 initialization failed.");
    pass2Ctx.imageSmoothingEnabled = true;
    pass2Ctx.imageSmoothingQuality = "high";
    pass2Ctx.drawImage(currentCanvas, 0, 0, pass2Canvas.width, pass2Canvas.height);
    currentCanvas.width = 0;
    currentCanvas.height = 0;

    // Pass 3: 4x -> 8x
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!finalCtx) throw new Error("Final canvas initialization failed.");
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(pass2Canvas, 0, 0, targetWidth, targetHeight);
    pass2Canvas.width = 0;
    pass2Canvas.height = 0;

    if (noiseReduction) {
      await applyNoiseReduction(finalCtx, targetWidth, targetHeight);
    }
    if (sharpness) {
      await applyUnsharpMask(finalCtx, targetWidth, targetHeight, sharpnessAmount);
    }
  }

  // Convert canvas to Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob((b) => {
      if (b) {
        resolve(b);
      } else {
        reject(new Error("Failed to generate image blob from canvas."));
      }
    }, format || "image/png", quality);
  });

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    width: targetWidth,
    height: targetHeight,
    size: blob.size,
    mimeType: format,
  };
}

/**
 * Extracts a high-resolution frame from a video file so the user can upscale
 * video frames / thumbnails directly to 4K/8K.
 */
export async function extractVideoFrame(
  videoFile: File,
  timestampSec: number = 0.5
): Promise<{
  image: HTMLImageElement;
  objectUrl: string;
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      const seekTime = Math.min(
        Math.max(timestampSec, 0),
        Math.max(video.duration - 0.1, 0)
      );
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(videoUrl);
          return reject(new Error("Failed to create video frame canvas context."));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(videoUrl);
          if (!blob) {
            return reject(new Error("Failed to extract frame blob."));
          }
          const frameUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            resolve({
              image: img,
              objectUrl: frameUrl,
              width: canvas.width,
              height: canvas.height,
              duration: video.duration || 0,
            });
          };
          img.onerror = () => reject(new Error("Failed to load extracted frame."));
          img.src = frameUrl;
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Failed to parse video file for frame extraction."));
    };
  });
}
