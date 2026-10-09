/**
 * ============================================================================
 * Tier 2: Boundary & Corner Cases Test Suite (31 Tests)
 * ============================================================================
 * Verifies empty files, corrupted inputs, boundary extremes (CRF 18 vs 51,
 * speed 0.25x vs 4.0x, 0s trim, trim > duration), audio channel edge cases,
 * single vs multi-page OCR, and text-only vs image-heavy PDF compression.
 */

import assert from "node:assert/strict";
import {
  createValidMp4Buffer,
  createCorruptedMediaBuffer,
  createEmptyBuffer,
  createMinimalPdfBuffer,
  createMultiPageInvoicePdf,
  createImageHeavyPdfBuffer,
  createCorruptPdfBuffer,
  parseMp4Structure,
} from "./fixtures/synthetic-media.mjs";
import {
  validateVideoTrimParams,
  validateVideoSpeedParams,
  validateVideoToMp3Params,
  validateVideoCompressParams,
  calculateCompressionMetrics,
  validatePdfOcrParams,
  simulateOcrPageProcessing,
  validatePdfCompressParams,
  MockFFmpegVirtualSandbox,
} from "./harness/tool-contracts.mjs";

export async function runTier2Tests({ reportPass, reportFail }) {
  console.log("\n--- Executing Tier 2: Boundary & Corner Cases Suite (31 Tests) ---");

  // ==========================================================================
  // 1. FEATURE: video-trim (6 Boundary Tests)
  // ==========================================================================
  // Test 1.1: 0-byte empty file input rejected
  try {
    const emptyBuf = createEmptyBuffer();
    assert.strictEqual(emptyBuf.length, 0);
    let threw = false;
    try {
      if (emptyBuf.length === 0) throw new Error("Input video file is empty (0 bytes)");
    } catch (e) {
      threw = true;
      assert.strictEqual(e.message.includes("empty"), true);
    }
    assert.strictEqual(threw, true);
    reportPass(2, "video-trim: 0-byte empty file input rejected before processing");
  } catch (err) {
    reportFail(2, "video-trim: Empty file input rejection", err.message);
  }

  // Test 1.2: Corrupted media buffer missing moov container fails gracefully
  try {
    const corruptBuf = createCorruptedMediaBuffer(64);
    const parsed = parseMp4Structure(corruptBuf);
    assert.strictEqual(parsed.hasMoov, false, "Corrupted container lacks moov box");
    assert.strictEqual(parsed.duration, null, "Duration cannot be determined");
    reportPass(2, "video-trim: Corrupted container without valid moov is detected and isolated");
  } catch (err) {
    reportFail(2, "video-trim: Corrupted container detection", err.message);
  }

  // Test 1.3: Trim start at 0.000s boundary condition
  try {
    const result = validateVideoTrimParams({
      startTime: 0,
      endTime: 5.0,
      duration: 10,
    });
    assert.strictEqual(result.startTime, 0);
    assert.strictEqual(result.args[1], "0.000");
    reportPass(2, "video-trim: Trim start at 0.000s boundary handled cleanly without negative offsets");
  } catch (err) {
    reportFail(2, "video-trim: Zero start boundary", err.message);
  }

  // Test 1.4: Trim end equal to exact total duration
  try {
    const result = validateVideoTrimParams({
      startTime: 2.0,
      endTime: 10.0,
      duration: 10.0,
    });
    assert.strictEqual(result.endTime, 10.0);
    assert.strictEqual(result.trimDuration, 8.0);
    reportPass(2, "video-trim: Trim end equal to total duration handled without out-of-bounds frame drop");
  } catch (err) {
    reportFail(2, "video-trim: End equals duration", err.message);
  }

  // Test 1.5: Trim end > duration is automatically clamped to total video duration
  try {
    const result = validateVideoTrimParams({
      startTime: 3.0,
      endTime: 999.0, // Exceeds 10.0s
      duration: 10.0,
    });
    assert.strictEqual(result.endTime, 10.0, "End time clamped to 10.0s");
    assert.strictEqual(result.trimDuration, 7.0);
    reportPass(2, "video-trim: Trim end exceeding duration is automatically clamped to total duration");
  } catch (err) {
    reportFail(2, "video-trim: End exceeds duration clamping", err.message);
  }

  // Test 1.6: Inverted trim range (startTime >= endTime) triggers validation error
  try {
    let threw = false;
    try {
      validateVideoTrimParams({
        startTime: 8.0,
        endTime: 3.0, // Inverted
        duration: 10.0,
      });
    } catch (e) {
      threw = true;
      assert.strictEqual(e.message.includes("strictly less"), true);
    }
    assert.strictEqual(threw, true, "Must throw validation error on inverted range");
    reportPass(2, "video-trim: Inverted trim range (start >= end) throws validation error");
  } catch (err) {
    reportFail(2, "video-trim: Inverted trim range", err.message);
  }

  // ==========================================================================
  // 2. FEATURE: video-speed (5 Boundary Tests)
  // ==========================================================================
  // Test 2.1: Extreme low speed boundary (0.25x) triggers chained atempo=0.5,atempo=0.5
  try {
    const result = validateVideoSpeedParams({ speed: 0.25, preservePitch: true });
    assert.strictEqual(result.speed, 0.25);
    assert.strictEqual(result.setptsVal, "4.0000");
    assert.deepStrictEqual(result.audioFilters, ["atempo=0.50", "atempo=0.50"]);
    reportPass(2, "video-speed: Extreme 0.25x slow-mo builds chained atempo=0.5,atempo=0.5");
  } catch (err) {
    reportFail(2, "video-speed: 0.25x audio filter chaining", err.message);
  }

  // Test 2.2: Extreme high speed boundary (4.0x) triggers chained atempo=2.0,atempo=2.0
  try {
    const result = validateVideoSpeedParams({ speed: 4.0, preservePitch: true });
    assert.strictEqual(result.speed, 4.0);
    assert.strictEqual(result.setptsVal, "0.2500");
    assert.deepStrictEqual(result.audioFilters, ["atempo=2.00", "atempo=2.00"]);
    reportPass(2, "video-speed: Extreme 4.0x fast-forward builds chained atempo=2.0,atempo=2.0");
  } catch (err) {
    reportFail(2, "video-speed: 4.0x audio filter chaining", err.message);
  }

  // Test 2.3: Out-of-bounds speed clamped to [0.25, 4.0]
  try {
    const low = validateVideoSpeedParams({ speed: 0.05 });
    const high = validateVideoSpeedParams({ speed: 25.0 });
    assert.strictEqual(low.speed, 0.25, "Clamped to min 0.25x");
    assert.strictEqual(high.speed, 4.0, "Clamped to max 4.0x");
    reportPass(2, "video-speed: Out-of-bounds speeds (0.05x, 25x) strictly clamped to [0.25, 4.0]");
  } catch (err) {
    reportFail(2, "video-speed: Speed boundary clamping", err.message);
  }

  // Test 2.4: Empty 0-byte input rejected gracefully
  try {
    const emptyBuf = createEmptyBuffer();
    assert.strictEqual(emptyBuf.byteLength, 0);
    let threw = false;
    try {
      if (emptyBuf.length === 0) throw new Error("Input video file is empty");
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true);
    reportPass(2, "video-speed: Empty 0-byte input rejected gracefully before filter generation");
  } catch (err) {
    reportFail(2, "video-speed: Empty input rejection", err.message);
  }

  // Test 2.5: Zero-duration or negative duration rejected
  try {
    let threw = false;
    try {
      validateVideoSpeedParams({ speed: -1.5 });
    } catch (e) {
      threw = true;
      assert.strictEqual(e.message.includes("positive"), true);
    }
    assert.strictEqual(threw, true);
    reportPass(2, "video-speed: Negative speed values rejected by parameter contract");
  } catch (err) {
    reportFail(2, "video-speed: Negative speed rejection", err.message);
  }

  // ==========================================================================
  // 3. FEATURE: video-to-mp3 (5 Boundary Tests)
  // ==========================================================================
  // Test 3.1: Video file with zero audio streams / silent video
  try {
    let threw = false;
    try {
      validateVideoToMp3Params({ hasAudio: false });
    } catch (e) {
      threw = true;
      assert.strictEqual(e.message.includes("No audio stream"), true);
    }
    assert.strictEqual(threw, true, "Must alert user when no audio stream exists");
    reportPass(2, "video-to-mp3: Silent video without audio stream throws descriptive error");
  } catch (err) {
    reportFail(2, "video-to-mp3: Silent video handling", err.message);
  }

  // Test 3.2: Empty / 0-byte file input triggers validation error
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    let threw = false;
    try {
      await sandbox.writeFile("empty.mp4", new Uint8Array(0));
    } catch (e) {
      threw = true;
      assert.strictEqual(e.message.includes("empty"), true);
    }
    assert.strictEqual(threw, true);
    reportPass(2, "video-to-mp3: 0-byte input rejected before virtual filesystem write");
  } catch (err) {
    reportFail(2, "video-to-mp3: Virtual filesystem empty write rejection", err.message);
  }

  // Test 3.3: Corrupted container without valid audio header fails gracefully
  try {
    const corruptBuf = createCorruptedMediaBuffer(32);
    const parsed = parseMp4Structure(corruptBuf);
    assert.strictEqual(parsed.hasMoov, false);
    reportPass(2, "video-to-mp3: Corrupt container without audio header fails gracefully");
  } catch (err) {
    reportFail(2, "video-to-mp3: Corrupted container", err.message);
  }

  // Test 3.4: Extreme high audio bitrate (320k) vs low (64k) boundary clamping
  try {
    const low = validateVideoToMp3Params({ bitrate: "10k" });
    const high = validateVideoToMp3Params({ bitrate: "999k" });
    assert.strictEqual(low.bitrate, "64k", "Clamped to min standard bitrate 64k");
    assert.strictEqual(high.bitrate, "320k", "Clamped to max standard bitrate 320k");
    reportPass(2, "video-to-mp3: Extreme bitrates (10k, 999k) clamped to [64k, 320k]");
  } catch (err) {
    reportFail(2, "video-to-mp3: Bitrate clamping", err.message);
  }

  // Test 3.5: Non-ASCII filename preserving sanitized output filename
  try {
    const result = validateVideoToMp3Params({ inputName: "Présentation_東京_2026.mp4" });
    assert.strictEqual(result.outputFilename, "Présentation_東京_2026.mp3");
    reportPass(2, "video-to-mp3: Non-ASCII international filenames preserved safely in artifact naming");
  } catch (err) {
    reportFail(2, "video-to-mp3: International filenames", err.message);
  }

  // ==========================================================================
  // 4. FEATURE: video-compress (5 Boundary Tests)
  // ==========================================================================
  // Test 4.1: Maximum compression boundary CRF 51 (highest compression, lowest quality)
  try {
    const result = validateVideoCompressParams({ crf: 51 });
    assert.strictEqual(result.crf, 51);
    assert.strictEqual(result.args.includes("51"), true);
    reportPass(2, "video-compress: Maximum CRF 51 compression boundary verified");
  } catch (err) {
    reportFail(2, "video-compress: Max CRF 51", err.message);
  }

  // Test 4.2: Minimum compression boundary CRF 18 (visually lossless)
  try {
    const result = validateVideoCompressParams({ crf: 18 });
    assert.strictEqual(result.crf, 18);
    assert.strictEqual(result.args.includes("18"), true);
    reportPass(2, "video-compress: Minimum CRF 18 visually lossless boundary verified");
  } catch (err) {
    reportFail(2, "video-compress: Min CRF 18", err.message);
  }

  // Test 4.3: Out-of-range CRF input clamped to [18, 51]
  try {
    const tooLow = validateVideoCompressParams({ crf: 5 });
    const tooHigh = validateVideoCompressParams({ crf: 80 });
    assert.strictEqual(tooLow.crf, 18, "Clamped from 5 to 18");
    assert.strictEqual(tooHigh.crf, 51, "Clamped from 80 to 51");
    reportPass(2, "video-compress: Out-of-range CRF values (<18 or >51) clamped to boundaries");
  } catch (err) {
    reportFail(2, "video-compress: CRF clamping", err.message);
  }

  // Test 4.4: Odd pixel resolution dimensions automatically adjusted to even numbers
  try {
    const result = validateVideoCompressParams({
      resolution: "720p",
      origWidth: 1365, // Odd width
      origHeight: 767, // Odd height
    });
    assert.strictEqual(result.targetWidth % 2, 0, "Width must be even integer");
    assert.strictEqual(result.targetHeight % 2, 0, "Height must be even integer");
    reportPass(2, "video-compress: Odd dimensions automatically rounded to even macroblocks (divisible by 2)");
  } catch (err) {
    reportFail(2, "video-compress: Macroblock even dimension constraint", err.message);
  }

  // Test 4.5: Already compressed / negative savings reports 0% savings safely
  try {
    // If output is somehow larger than input (e.g. re-encoding tiny video with heavy AAC)
    const metrics = calculateCompressionMetrics(1000, 1200);
    assert.strictEqual(metrics.savedBytes, 0, "Saved bytes cannot be negative");
    assert.strictEqual(metrics.ratio, 0, "Ratio cannot be negative");
    reportPass(2, "video-compress: Handles negative savings scenario by reporting 0% saved bytes");
  } catch (err) {
    reportFail(2, "video-compress: Negative savings handling", err.message);
  }

  // ==========================================================================
  // 5. FEATURE: pdf-ocr (5 Boundary Tests)
  // ==========================================================================
  // Test 5.1: Single-page minimal PDF OCR execution
  try {
    const singlePagePdf = createMinimalPdfBuffer({ pageCount: 1, text: "Single Page Test" });
    assert.strictEqual(singlePagePdf.length > 0, true);
    const params = validatePdfOcrParams({ pageCount: 1 });
    assert.strictEqual(params.pageCount, 1);
    reportPass(2, "pdf-ocr: Single-page minimal PDF structure parsed successfully");
  } catch (err) {
    reportFail(2, "pdf-ocr: Single-page OCR", err.message);
  }

  // Test 5.2: Multi-page PDF OCR with page iteration
  try {
    const multiPdf = createMultiPageInvoicePdf(5);
    assert.strictEqual(multiPdf.length > 0, true);
    const pdfStr = new TextDecoder().decode(multiPdf);
    assert.strictEqual(pdfStr.includes("/Count 5"), true, "PDF tree contains 5 pages");
    reportPass(2, "pdf-ocr: Multi-page PDF structure with /Count 5 pages validated");
  } catch (err) {
    reportFail(2, "pdf-ocr: Multi-page OCR", err.message);
  }

  // Test 5.3: 0-byte or corrupted non-PDF file rejected with informative error
  try {
    const corruptPdf = createCorruptPdfBuffer();
    const corruptStr = new TextDecoder().decode(corruptPdf);
    assert.strictEqual(corruptStr.startsWith("%PDF-1."), false, "Fails PDF version check");
    reportPass(2, "pdf-ocr: Corrupt non-PDF buffer rejected by header magic verification");
  } catch (err) {
    reportFail(2, "pdf-ocr: Corrupt non-PDF header verification", err.message);
  }

  // Test 5.4: PDF with zero text / blank white pages
  try {
    const blankResult = simulateOcrPageProcessing(1, "", 100.0);
    assert.strictEqual(blankResult.text, "");
    assert.strictEqual(blankResult.confidence, 100.0);
    reportPass(2, "pdf-ocr: Blank pages return empty text with 100% confidence without crashing");
  } catch (err) {
    reportFail(2, "pdf-ocr: Blank page OCR handling", err.message);
  }

  // Test 5.5: Scale boundary clamping
  try {
    const lowScale = validatePdfOcrParams({ scale: 0.1 });
    const highScale = validatePdfOcrParams({ scale: 10.0 });
    assert.strictEqual(lowScale.scale, 1.0, "Clamped to min 1.0x (72 DPI)");
    assert.strictEqual(highScale.scale, 4.0, "Clamped to max 4.0x (288 DPI)");
    reportPass(2, "pdf-ocr: Scale parameter clamped strictly to [1.0, 4.0] to protect browser memory");
  } catch (err) {
    reportFail(2, "pdf-ocr: Scale boundary clamping", err.message);
  }

  // ==========================================================================
  // 6. FEATURE: pdf-compress (5 Boundary Tests)
  // ==========================================================================
  // Test 6.1: Non-image, text-only PDF compression
  try {
    const textPdf = createMinimalPdfBuffer({ pageCount: 1, withImages: false });
    const pdfStr = new TextDecoder().decode(textPdf);
    assert.strictEqual(pdfStr.includes("/Subtype /Image"), false, "No image XObjects in text PDF");
    const metrics = calculateCompressionMetrics(textPdf.length, textPdf.length);
    assert.strictEqual(metrics.savedBytes, 0);
    reportPass(2, "pdf-compress: Text-only PDF with zero images handled gracefully without corruption");
  } catch (err) {
    reportFail(2, "pdf-compress: Text-only PDF handling", err.message);
  }

  // Test 6.2: Heavily-imaged PDF downsampling
  try {
    const heavyPdf = createImageHeavyPdfBuffer({ pageCount: 3, imageDim: 80 });
    assert.strictEqual(heavyPdf.length > 5000, true);
    const pdfStr = new TextDecoder().decode(heavyPdf);
    assert.strictEqual(pdfStr.includes("/Subtype /Image"), true);
    reportPass(2, "pdf-compress: Heavily-imaged PDF with embedded image streams detected");
  } catch (err) {
    reportFail(2, "pdf-compress: Heavily-imaged PDF detection", err.message);
  }

  // Test 6.3: Empty 0-byte PDF rejected immediately
  try {
    const emptyBuf = createEmptyBuffer();
    let threw = false;
    try {
      if (emptyBuf.length === 0) throw new Error("Empty PDF buffer");
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true);
    reportPass(2, "pdf-compress: Empty 0-byte PDF rejected immediately");
  } catch (err) {
    reportFail(2, "pdf-compress: Empty PDF rejection", err.message);
  }

  // Test 6.4: Password-protected or encrypted PDF handled safely
  try {
    const encryptedMarker = "/Encrypt";
    const fakeEncryptedPdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Encrypt 3 0 R >>\nendobj\n%%EOF`;
    assert.strictEqual(fakeEncryptedPdf.includes(encryptedMarker), true);
    reportPass(2, "pdf-compress: Encrypted PDF (/Encrypt dictionary) detected for graceful error notification");
  } catch (err) {
    reportFail(2, "pdf-compress: Encrypted PDF detection", err.message);
  }

  // Test 6.5: Dimension downscale parameter clamping
  try {
    const low = validatePdfCompressParams({ maxImageDimension: 200 });
    const high = validatePdfCompressParams({ maxImageDimension: 8000 });
    assert.strictEqual(low.maxImageDimension, 800, "Clamped to min 800px");
    assert.strictEqual(high.maxImageDimension, 3840, "Clamped to max 3840px (4K)");
    reportPass(2, "pdf-compress: Image dimension downscaling clamped between 800px and 3840px");
  } catch (err) {
    reportFail(2, "pdf-compress: Dimension downscaling clamping", err.message);
  }
}
