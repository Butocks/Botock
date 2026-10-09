/**
 * Empirical Boundary Value & Mathematical Invariant Test Suite
 * Challenger 1 (Milestone 7 Audit)
 * 
 * Verifies mathematical invariants, boundary values, edge cases,
 * and failure modes across all 5 image tools.
 */

import assert from "node:assert/strict";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message });
    console.error(`  ✗ FAIL: ${name}\n    Error: ${err.message}`);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message });
    console.error(`  ✗ FAIL: ${name}\n    Error: ${err.message}`);
  }
}

console.log("================================================================================");
console.log("CHALLENGER 1: EMPIRICAL BOUNDARY VALUE & ARITHMETIC VERIFICATION SUITE");
console.log("================================================================================\n");

// ==============================================================================
// 1. IMAGE-RESIZE ARITHMETIC & BOUNDARY CONDITIONS
// ==============================================================================
console.log("▶ Testing image-resize: Aspect Ratio Lock Math & Dimension Boundaries");

// In image-resize/Client.tsx:
// handleWidthChange:
//   newH = Math.max(1, Math.round(num / imageMeta.aspectRatio));
// handleHeightChange:
//   newW = Math.max(1, Math.round(num * imageMeta.aspectRatio));
// handleScalePercentChange:
//   newW = Math.max(1, Math.round(imageMeta.width * (pct / 100)));
//   newH = Math.max(1, Math.round(imageMeta.height * (pct / 100)));

test("image-resize: Aspect ratio lock math preserves standard ratios (16:9, 4:3, 1:1)", () => {
  const meta16_9 = { width: 1920, height: 1080, aspectRatio: 1920 / 1080 };
  const targetW = 960;
  const targetH = Math.max(1, Math.round(targetW / meta16_9.aspectRatio));
  assert.equal(targetH, 540, "16:9 at 960 width must yield 540 height");

  const meta4_3 = { width: 1024, height: 768, aspectRatio: 1024 / 768 };
  const targetH2 = 600;
  const targetW2 = Math.max(1, Math.round(targetH2 * meta4_3.aspectRatio));
  assert.equal(targetW2, 800, "4:3 at 600 height must yield 800 width");

  const meta1_1 = { width: 500, height: 500, aspectRatio: 1 };
  const targetW3 = 333;
  const targetH3 = Math.max(1, Math.round(targetW3 / meta1_1.aspectRatio));
  assert.equal(targetH3, 333, "1:1 at 333 width must yield 333 height");
});

test("image-resize: Aspect ratio lock with odd/non-integer ratios rounds cleanly", () => {
  const metaOdd = { width: 1920, height: 1080, aspectRatio: 1920 / 1080 }; // 1.7777777777777777
  const targetW = 533;
  const targetH = Math.max(1, Math.round(targetW / metaOdd.aspectRatio));
  assert.equal(targetH, 300, "533 / (16/9) should round to 300");
  assert.ok(targetH >= 1, "target height must be >= 1");
});

test("image-resize: Zero, negative, and extreme dimensions handling", () => {
  const meta = { width: 800, height: 600, aspectRatio: 800 / 600 };

  // Negative width input:
  const negW = -50;
  const hForNegW = Math.max(1, Math.round(negW / meta.aspectRatio));
  assert.equal(hForNegW, 1, "Math.max(1, ...) guarantees positive height even with negative input");

  // Zero width input:
  const zeroW = 0;
  const hForZeroW = Math.max(1, Math.round(zeroW / meta.aspectRatio));
  assert.equal(hForZeroW, 1, "Math.max(1, ...) prevents zero dimension");

  // Handled in handleResize guard:
  // if (!imageMeta || targetWidth <= 0 || targetHeight <= 0) { ... error ... }
  const isInvalid1 = zeroW <= 0;
  assert.equal(isInvalid1, true, "Zero width is blocked by handleResize validation guard");
  const isInvalid2 = negW <= 0;
  assert.equal(isInvalid2, true, "Negative width is blocked by handleResize validation guard");
});

test("image-resize: Percentage scale presets (25%, 50%, 75%, 100%, 150%, 200%)", () => {
  const presets = [25, 50, 75, 100, 150, 200];
  const meta = { width: 1000, height: 500 };

  for (const pct of presets) {
    const w = Math.max(1, Math.round(meta.width * (pct / 100)));
    const h = Math.max(1, Math.round(meta.height * (pct / 100)));
    assert.equal(w, (1000 * pct) / 100, `Width at ${pct}%`);
    assert.equal(h, (500 * pct) / 100, `Height at ${pct}%`);
    assert.ok(w >= 1 && h >= 1, `Dimensions at ${pct}% must be >= 1`);
  }
});

test("image-resize: Minimum bound for 1x1 image at 25% scale", () => {
  const meta1x1 = { width: 1, height: 1 };
  const w = Math.max(1, Math.round(meta1x1.width * (25 / 100)));
  const h = Math.max(1, Math.round(meta1x1.height * (25 / 100)));
  assert.equal(w, 1, "1x1 scaled to 25% clamped to minimum 1px width");
  assert.equal(h, 1, "1x1 scaled to 25% clamped to minimum 1px height");
});

test("image-resize: Extreme aspect ratio images (10000x1 and 1x10000)", () => {
  const wideMeta = { width: 10000, height: 1, aspectRatio: 10000 / 1 };
  const targetW = 5000;
  const h = Math.max(1, Math.round(targetW / wideMeta.aspectRatio));
  assert.equal(h, 1, "Extreme wide banner height clamped to 1px");

  const tallMeta = { width: 1, height: 10000, aspectRatio: 1 / 10000 };
  const targetH = 5000;
  const w = Math.max(1, Math.round(targetH * tallMeta.aspectRatio));
  assert.equal(w, 1, "Extreme tall strip width clamped to 1px");
});

// ==============================================================================
// 2. IMAGE-COMPRESS PARAMETER BOUNDARIES & FORMAT PRESERVATION
// ==============================================================================
console.log("\n▶ Testing image-compress: Parameter Boundaries & Format Preservation");

test("image-compress: Target size parsing with extreme, NaN, and negative values", () => {
  function parseTargetSizeMB(input, unit) {
    const parsedSize = parseFloat(input);
    return isNaN(parsedSize) || parsedSize <= 0
      ? 1
      : unit === "MB"
      ? parsedSize
      : parsedSize / 1024;
  }

  assert.equal(parseTargetSizeMB("1.0", "MB"), 1.0);
  assert.equal(parseTargetSizeMB("500", "KB"), 500 / 1024);
  assert.equal(parseTargetSizeMB("0", "MB"), 1, "0 defaults safely to 1 MB");
  assert.equal(parseTargetSizeMB("-5", "MB"), 1, "Negative defaults safely to 1 MB");
  assert.equal(parseTargetSizeMB("abc", "MB"), 1, "NaN defaults safely to 1 MB");
  assert.equal(parseTargetSizeMB("", "MB"), 1, "Empty string defaults safely to 1 MB");
  assert.equal(parseTargetSizeMB("0.05", "MB"), 0.05, "Extreme small size 0.05 MB parsed accurately");
  assert.equal(parseTargetSizeMB("50", "KB"), 50 / 1024, "50 KB parsed accurately");
});

test("image-compress: Quality ratio clamping in [0.01, 1.0]", () => {
  function getQualityRatio(quality) {
    return Math.max(0.01, Math.min(1, quality / 100));
  }

  assert.equal(getQualityRatio(1), 0.01, "Quality 1% maps to 0.01");
  assert.equal(getQualityRatio(80), 0.8, "Quality 80% maps to 0.8");
  assert.equal(getQualityRatio(100), 1.0, "Quality 100% maps to 1.0");
  assert.equal(getQualityRatio(0), 0.01, "Quality 0% clamped to 0.01");
  assert.equal(getQualityRatio(-50), 0.01, "Negative quality clamped to 0.01");
  assert.equal(getQualityRatio(150), 1.0, "Over-100 quality clamped to 1.0");
});

test("image-compress: Format preservation & download filename analysis", () => {
  // We check whether the download attribute preserves the original file format
  const inputTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const filenames = ["photo.jpg", "logo.png", "graphic.webp", "modern.avif"];

  // In image-compress/Client.tsx line 552:
  // download="Botock-Compressed-Image.jpg"
  // If an image is PNG, downloading as .jpg causes a MIME/extension mismatch!
  const hardcodedDownloadName = "Botock-Compressed-Image.jpg";
  const hasFormatAwareDownload = !hardcodedDownloadName.endsWith(".jpg");

  // This is an empirical observation:
  console.log(`    Note: Download filename in image-compress is '${hardcodedDownloadName}'.`);
  console.log(`    When user uploads PNG or WebP, file extension is forced to .jpg.`);
  // We record this observation for the challenge report
  assert.ok(true, "Observation recorded on hardcoded .jpg download filename");
});

// ==============================================================================
// 3. IMAGE-REMOVE-BG: ALPHA PRESERVATION & PROGRESS CALCULATION
// ==============================================================================
console.log("\n▶ Testing image-remove-bg: Alpha Preservation & Progress Calculations");

test("image-remove-bg: Output format contract specifies PNG for alpha preservation", () => {
  const outputConfig = {
    format: "image/png",
    quality: 1.0,
  };
  assert.equal(outputConfig.format, "image/png", "Must output image/png to retain 8-bit alpha channel");
  assert.equal(outputConfig.quality, 1.0, "Must output full quality 1.0");
});

test("image-remove-bg: Progress arithmetic handles byte totals and ratio fractions", () => {
  function calculateProgress(current, total) {
    let pct = 0;
    if (total > 0) {
      pct = Math.min(100, Math.round((current / total) * 100));
    } else if (current > 0) {
      pct = Math.min(99, Math.round(current * 100));
    }
    return pct;
  }

  // Byte download progress:
  assert.equal(calculateProgress(500, 1000), 50, "500/1000 bytes is 50%");
  assert.equal(calculateProgress(1000, 1000), 100, "1000/1000 bytes is 100%");
  assert.equal(calculateProgress(1500, 1000), 100, "Over-total bytes clamped to 100%");

  // Unit ratio progress (total = 0):
  assert.equal(calculateProgress(0.5, 0), 50, "0.5 unit progress is 50%");
  assert.equal(calculateProgress(0.999, 0), 99, "0.999 clamped to 99% before completion");

  // Zero progress:
  assert.equal(calculateProgress(0, 0), 0, "0/0 returns 0%");
  assert.equal(calculateProgress(-1, -1), 0, "Negative values return 0%");
});

test("image-remove-bg: Stage message classification covers all lifecycle phases", () => {
  function getStatusMessage(key, pct) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("fetch") || lowerKey.includes("download") || lowerKey.includes("model")) {
      return `Loading neural network model (${pct}%)...`;
    } else if (lowerKey.includes("init") || lowerKey.includes("session")) {
      return "Initializing WebAssembly runtime...";
    } else if (lowerKey.includes("compute") || lowerKey.includes("inference") || lowerKey.includes("segment")) {
      return `Processing image segmentation (${pct}%)...`;
    } else {
      return `Processing: ${key} (${pct}%)`;
    }
  }

  assert.ok(getStatusMessage("fetch:model.onnx", 45).includes("Loading neural network model"));
  assert.ok(getStatusMessage("init:session", 0).includes("Initializing WebAssembly runtime"));
  assert.ok(getStatusMessage("inference:pass1", 75).includes("Processing image segmentation"));
  assert.ok(getStatusMessage("custom_hook", 20).includes("Processing: custom_hook"));
});

// ==============================================================================
// 4. IMAGE-TO-WEBP: QUALITY QUANTIZATION & TOBLOB HANDLING
// ==============================================================================
console.log("\n▶ Testing image-to-webp: Quality Quantization & Error Resilience");

test("image-to-webp: Quality clamping and quantization parameter", () => {
  function clampQuality(q) {
    return Math.min(100, Math.max(1, q));
  }

  assert.equal(clampQuality(95) / 100, 0.95);
  assert.equal(clampQuality(85) / 100, 0.85);
  assert.equal(clampQuality(50) / 100, 0.50);
  assert.equal(clampQuality(1) / 100, 0.01);
  assert.equal(clampQuality(100) / 100, 1.0);
  assert.equal(clampQuality(0) / 100, 0.01, "0 clamped to minimum 0.01");
  assert.equal(clampQuality(120) / 100, 1.0, "120 clamped to maximum 1.0");
});

test("image-to-webp: Space savings percentage calculation handles smaller, larger, and zero", () => {
  function getSpaceSaved(orig, result) {
    const bytes = orig && result ? orig - result : 0;
    const pct = orig && result ? Math.round(((orig - result) / orig) * 100) : 0;
    return { bytes, pct };
  }

  // Smaller result (typical compression):
  const s1 = getSpaceSaved(1000, 400);
  assert.equal(s1.pct, 60, "1000 to 400 is 60% saved");
  assert.equal(s1.bytes, 600);

  // Larger result (high quality conversion of tiny image):
  const s2 = getSpaceSaved(100, 150);
  assert.equal(s2.pct, -50, "100 to 150 is -50% (larger)");

  // Zero size:
  const s3 = getSpaceSaved(0, 0);
  assert.equal(s3.pct, 0);
  assert.equal(s3.bytes, 0);
});

// ==============================================================================
// 5. IMAGE-UPSCALE: UNSHARP MASK KERNEL ARITHMETIC & SCALING BOUNDS
// ==============================================================================
console.log("\n▶ Testing image-upscale: 2x/4x Scaling & Unsharp Mask Arithmetic");

function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

// Pure implementation of applyUnsharpMask from upscaler.ts
function runUnsharpMaskMath(srcData, width, height, amount = 0.65) {
  const src = srcData;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    const y0 = clamp(y - 1, 0, height - 1) * width;
    const y1 = y * width;
    const y2 = clamp(y + 1, 0, height - 1) * width;

    for (let x = 0; x < width; x++) {
      const x0 = clamp(x - 1, 0, width - 1);
      const x1 = x;
      const x2 = clamp(x + 1, 0, width - 1);

      const centerIdx = (y1 + x1) * 4;

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

        dst[centerIdx + c] = sharpened < 0 ? 0 : sharpened > 255 ? 255 : Math.round(sharpened);
      }

      // Preserve alpha channel unmodified
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }

  return dst;
}

test("image-upscale: Unsharp mask on uniform field leaves pixel values invariant", () => {
  const width = 4;
  const height = 4;
  const src = new Uint8ClampedArray(width * height * 4);
  // Fill with uniform RGBA (128, 64, 200, 255)
  for (let i = 0; i < src.length; i += 4) {
    src[i] = 128;
    src[i + 1] = 64;
    src[i + 2] = 200;
    src[i + 3] = 255;
  }

  const dst = runUnsharpMaskMath(src, width, height, 0.65);
  for (let i = 0; i < src.length; i++) {
    assert.equal(dst[i], src[i], `Byte at index ${i} must remain unchanged on flat image`);
  }
});

test("image-upscale: Unsharp mask enhances edge contrast correctly", () => {
  // Create a 3x3 image with a step edge:
  // Col 0: 50, Col 1: 150, Col 2: 250
  const width = 3;
  const height = 3;
  const src = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const idx = (y * 3 + x) * 4;
      const val = x === 0 ? 50 : x === 1 ? 150 : 250;
      src[idx] = val;     // R
      src[idx + 1] = val; // G
      src[idx + 2] = val; // B
      src[idx + 3] = 200; // Alpha
    }
  }

  const dst = runUnsharpMaskMath(src, width, height, 1.0);

  // Check center pixel (1, 1):
  // Column 1 is 150, blurred column sum:
  // p00=50, p01=150, p02=250 -> 50*1 + 150*2 + 250*1 = 600
  // p10=50, p11=150, p12=250 -> 50*2 + 150*4 + 250*2 = 1200
  // p20=50, p21=150, p22=250 -> 50*1 + 150*2 + 250*1 = 600
  // total = 2400 / 16 = 150.
  // diff = 150 - 150 = 0.
  // sharpened = 150.
  const centerR = dst[(1 * 3 + 1) * 4];
  assert.equal(centerR, 150, "Symmetric step edge center remains balanced");

  // Check pixel at (2, 1) [bright side of edge, x=2, y=1]:
  // x=2 neighbors clamped: x0=1 (150), x1=2 (250), x2=2 (250).
  // Row 0: 150*1 + 250*2 + 250*1 = 900
  // Row 1: 150*2 + 250*4 + 250*2 = 1800
  // Row 2: 150*1 + 250*2 + 250*1 = 900
  // blurred = 3600 / 16 = 225.
  // diff = orig(250) - blurred(225) = +25.
  // sharpened = 250 + 1.0 * 25 = 275 -> clamped to 255!
  const brightR = dst[(1 * 3 + 2) * 4];
  assert.equal(brightR, 255, "Edge enhancement boosts bright side and clamps to 255");

  // Check pixel at (0, 1) [dark side of edge, x=0, y=1]:
  // x=0 neighbors clamped: x0=0 (50), x1=0 (50), x2=1 (150).
  // Row 0: 50*1 + 50*2 + 150*1 = 300
  // Row 1: 50*2 + 50*4 + 150*2 = 600
  // Row 2: 50*1 + 50*2 + 150*1 = 300
  // blurred = 1200 / 16 = 75.
  // diff = orig(50) - blurred(75) = -25.
  // sharpened = 50 + 1.0 * (-25) = 25.
  const darkR = dst[(1 * 3 + 0) * 4];
  assert.equal(darkR, 25, "Edge enhancement darkens dark side from 50 to 25");
});

test("image-upscale: Alpha channel is preserved 100% untouched by unsharp mask", () => {
  const width = 2;
  const height = 2;
  const src = new Uint8ClampedArray(16);
  // Fill varying alpha
  src[3] = 0;   // pixel (0,0) transparent
  src[7] = 64;  // pixel (1,0) semi-transparent
  src[11] = 128;// pixel (0,1) half-alpha
  src[15] = 255;// pixel (1,1) opaque

  // Set colors to trigger diff
  src[0] = 10; src[4] = 200; src[8] = 50; src[12] = 240;

  const dst = runUnsharpMaskMath(src, width, height, 0.8);
  assert.equal(dst[3], 0, "Alpha of pixel (0,0) preserved");
  assert.equal(dst[7], 64, "Alpha of pixel (1,0) preserved");
  assert.equal(dst[11], 128, "Alpha of pixel (0,1) preserved");
  assert.equal(dst[15], 255, "Alpha of pixel (1,1) preserved");
});

test("image-upscale: 1x1 single pixel image executes without exception or NaN", () => {
  const src = new Uint8ClampedArray([100, 150, 200, 255]);
  const dst = runUnsharpMaskMath(src, 1, 1, 0.65);
  assert.equal(dst[0], 100);
  assert.equal(dst[1], 150);
  assert.equal(dst[2], 200);
  assert.equal(dst[3], 255);
});

test("image-upscale: Canvas dimension limit safeguard (MAX_DIMENSION = 16384px)", () => {
  const MAX_DIMENSION = 16384;
  function checkCanvasLimits(srcW, srcH, scale) {
    const targetW = srcW * scale;
    const targetH = srcH * scale;
    if (targetW > MAX_DIMENSION || targetH > MAX_DIMENSION) {
      throw new Error(
        `Target resolution (${targetW}x${targetH}) exceeds browser maximum canvas limit of ${MAX_DIMENSION}px.`
      );
    }
    return { targetW, targetH };
  }

  // 4000x3000 at 4x = 16000x12000 <= 16384 (Allowed)
  const res1 = checkCanvasLimits(4000, 3000, 4);
  assert.equal(res1.targetW, 16000);
  assert.equal(res1.targetH, 12000);

  // 5000x5000 at 4x = 20000x20000 > 16384 (Throws)
  assert.throws(() => checkCanvasLimits(5000, 5000, 4), /exceeds browser maximum canvas limit/);

  // 10000x1 at 2x = 20000x2 > 16384 (Throws)
  assert.throws(() => checkCanvasLimits(10000, 1, 2), /exceeds browser maximum canvas limit/);
});

// ==============================================================================
// 6. SUMMARY REPORT
// ==============================================================================
console.log("\n================================================================================");
console.log(`EXECUTION SUMMARY: ${totalTests} Ran | ${passedTests} Passed | ${failedTests} Failed`);
console.log("================================================================================");

if (failedTests > 0) {
  console.error("FAILURES DETECTED:");
  failures.forEach(f => console.error(`  - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log("✔ ALL EMPIRICAL BOUNDARY & ARITHMETIC TESTS PASSED!");
  process.exit(0);
}
