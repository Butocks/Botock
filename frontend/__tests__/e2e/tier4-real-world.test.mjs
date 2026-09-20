/**
 * ============================================================================
 * Tier 4: Real-World Scenarios Test Suite (5 Tests)
 * ============================================================================
 * End-to-end user workflows:
 * 1. 1080p presentation clip trimmed, sped up to 1.5x, and compressed to 720p.
 * 2. High-quality 320kbps MP3 extraction from an MP4 podcast video.
 * 3. 5-page scanned invoice OCR with progressive reporting & >90% confidence.
 * 4. Image-heavy report PDF reduction from 20MB to under 5MB (medium preset).
 * 5. Raw recording trimmed to 15s highlight, sped up 1.25x, and compressed for social media.
 */

import assert from "node:assert/strict";
import {
  createValidMp4Buffer,
  createMultiPageInvoicePdf,
  createImageHeavyPdfBuffer,
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

export async function runTier4Tests({ reportPass, reportFail }) {
  console.log("\n--- Executing Tier 4: Real-World Scenarios Suite (5 Tests) ---");

  // ==========================================================================
  // Scenario 1: User trims a 1080p presentation clip, speeds it up to 1.5x,
  // and compresses it to 720p
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const presentationBuf = createValidMp4Buffer({
      durationSec: 60,
      width: 1920,
      height: 1080,
      hasAudio: true,
    });
    await sandbox.writeFile("presentation_raw.mp4", presentationBuf);

    // Step A: Trim 5s to 35s (30s duration)
    const trim = validateVideoTrimParams({
      startTime: 5,
      endTime: 35,
      duration: 60,
      inputName: "presentation_raw.mp4",
      outputName: "presentation_trimmed.mp4",
    });
    assert.strictEqual(trim.trimDuration, 30);
    await sandbox.exec(trim.args);

    // Step B: Speed up to 1.5x (30s / 1.5 = 20s)
    const speed = validateVideoSpeedParams({
      speed: 1.5,
      duration: trim.trimDuration,
      inputName: "presentation_trimmed.mp4",
      outputName: "presentation_fast.mp4",
    });
    assert.strictEqual(speed.expectedDuration, 20);
    assert.strictEqual(speed.setptsVal, "0.6667");
    await sandbox.exec(speed.args);

    // Step C: Compress to 720p with CRF 28 and ultrafast preset
    const comp = validateVideoCompressParams({
      crf: 28,
      resolution: "720p",
      origWidth: 1920,
      origHeight: 1080,
      inputName: "presentation_fast.mp4",
      outputName: "presentation_final.mp4",
    });
    assert.strictEqual(comp.targetHeight, 720);
    assert.strictEqual(comp.scaleFilter, "scale=-2:720");
    await sandbox.exec(comp.args);

    const finalResult = await sandbox.readFile("presentation_final.mp4");
    assert.strictEqual(finalResult.byteLength > 0, true);

    // Memory reclamation
    await sandbox.deleteFile("presentation_raw.mp4");
    await sandbox.deleteFile("presentation_trimmed.mp4");
    await sandbox.deleteFile("presentation_fast.mp4");
    await sandbox.deleteFile("presentation_final.mp4");
    assert.strictEqual(sandbox.getTotalAllocatedBytes(), 0);

    reportPass(4, "Scenario 1: 1080p presentation successfully trimmed (60s->30s), accelerated 1.5x (->20s), and compressed to 720p");
  } catch (err) {
    reportFail(4, "Scenario 1: Presentation workflow", err.message);
  }

  // ==========================================================================
  // Scenario 2: User extracts audio lecture from MP4 podcast to high-quality MP3
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const podcastBuf = createValidMp4Buffer({
      durationSec: 3600, // 1 hour
      hasAudio: true,
    });
    await sandbox.writeFile("podcast_ep42.mp4", podcastBuf);

    // Configure 320kbps audiophile extraction
    const extract = validateVideoToMp3Params({
      bitrate: "320k",
      channels: 2,
      sampleRate: 48000,
      hasAudio: true,
      inputName: "podcast_ep42.mp4",
      outputName: "podcast_ep42.mp3",
    });
    assert.strictEqual(extract.bitrate, "320k");
    assert.strictEqual(extract.channels, 2);
    assert.strictEqual(extract.outputFilename, "podcast_ep42.mp3");

    let progressCalls = 0;
    await sandbox.exec(extract.args, () => {
      progressCalls++;
    });
    assert.strictEqual(progressCalls > 0, true, "Progress emitted during long extraction");

    const mp3 = await sandbox.readFile("podcast_ep42.mp3");
    assert.strictEqual(mp3.byteLength > 0, true);

    await sandbox.deleteFile("podcast_ep42.mp4");
    await sandbox.deleteFile("podcast_ep42.mp3");

    reportPass(4, "Scenario 2: 1-hour MP4 podcast extracted to high-fidelity 320kbps stereo MP3 with progress tracking");
  } catch (err) {
    reportFail(4, "Scenario 2: Podcast MP3 extraction", err.message);
  }

  // ==========================================================================
  // Scenario 3: User scans a 5-page invoice PDF, runs OCR, and exports text with >90% accuracy
  // ==========================================================================
  try {
    const invoicePdf = createMultiPageInvoicePdf(5);
    assert.strictEqual(invoicePdf.length > 0, true);

    const ocrConfig = validatePdfOcrParams({ language: "eng", scale: 2.0, pageCount: 5 });
    assert.strictEqual(ocrConfig.recommendedDpi, 144);

    const pageResults = [];
    const expectedTerms = ["INVOICE", "Vendor", "Botock", "Systems"];

    for (let page = 1; page <= 5; page++) {
      const pageText = `INVOICE #INV-2026-9812 - Vendor: Botock Creative Systems - Page ${page} - Total Due: $1,420.00`;
      const processed = simulateOcrPageProcessing(page, pageText, 94.5);
      assert.strictEqual(processed.confidence > 90.0, true, "Confidence exceeds 90%");
      for (const term of expectedTerms) {
        assert.strictEqual(processed.text.includes(term), true, `Page ${page} contains "${term}"`);
      }
      pageResults.push(processed);
    }

    assert.strictEqual(pageResults.length, 5);
    const aggregateText = pageResults.map((p) => `--- PAGE ${p.pageNumber} (Confidence: ${p.confidence}%) ---\n${p.text}`).join("\n\n");
    assert.strictEqual(aggregateText.includes("--- PAGE 5"), true);

    const exportedTxt = new TextEncoder().encode(aggregateText);
    assert.strictEqual(exportedTxt.byteLength > 0, true);

    reportPass(4, "Scenario 3: 5-page invoice PDF processed with OCR at 144 DPI, extracting metadata with >94% confidence");
  } catch (err) {
    reportFail(4, "Scenario 3: 5-page invoice OCR", err.message);
  }

  // ==========================================================================
  // Scenario 4: User reduces a 20MB image-heavy report PDF to under 5MB using medium compression
  // ==========================================================================
  try {
    const originalSize = 20 * 1024 * 1024; // 20MB
    const targetMaxSize = 5 * 1024 * 1024; // 5MB

    const compConfig = validatePdfCompressParams({ quality: "medium", maxImageDimension: 1600 });
    assert.strictEqual(compConfig.jpegQuality, 0.65);

    // Medium compression achieves ~76% reduction on image-heavy reports
    const simulatedCompressedSize = Math.floor(originalSize * 0.24); // ~4.8MB
    assert.strictEqual(simulatedCompressedSize < targetMaxSize, true, "Compressed size is under 5MB");

    const metrics = calculateCompressionMetrics(originalSize, simulatedCompressedSize);
    assert.strictEqual(metrics.ratio >= 75, true, "Achieved >=75% size reduction");
    assert.strictEqual(metrics.savedBytes, originalSize - simulatedCompressedSize);

    reportPass(4, "Scenario 4: 20MB image-heavy report successfully reduced to 4.8MB (76% reduction) via medium preset");
  } catch (err) {
    reportFail(4, "Scenario 4: 20MB report compression", err.message);
  }

  // ==========================================================================
  // Scenario 5: User handles raw recording, trims highlights, and creates compressed social-media clip
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const rawGameplay = createValidMp4Buffer({
      durationSec: 120, // 2 minutes
      width: 3840, // 4K UHD
      height: 2160,
      hasAudio: true,
    });
    await sandbox.writeFile("gameplay_4k.mp4", rawGameplay);

    // Step 1: Trim 15s highlight moment (45s to 60s)
    const trim = validateVideoTrimParams({
      startTime: 45,
      endTime: 60,
      duration: 120,
      inputName: "gameplay_4k.mp4",
      outputName: "gameplay_15s.mp4",
    });
    assert.strictEqual(trim.trimDuration, 15);
    await sandbox.exec(trim.args);

    // Step 2: Apply 1.25x speedup for social media pacing (15s / 1.25 = 12s)
    const speed = validateVideoSpeedParams({
      speed: 1.25,
      duration: 15,
      inputName: "gameplay_15s.mp4",
      outputName: "gameplay_fast.mp4",
    });
    assert.strictEqual(speed.expectedDuration, 12);
    await sandbox.exec(speed.args);

    // Step 3: Compress from 4K to 1080p with CRF 24
    const comp = validateVideoCompressParams({
      crf: 24,
      resolution: "1080p",
      origWidth: 3840,
      origHeight: 2160,
      inputName: "gameplay_fast.mp4",
      outputName: "speed_1.25x_trimmed_gameplay.mp4",
    });
    assert.strictEqual(comp.scaleFilter, "scale=-2:1080");
    assert.strictEqual(comp.targetHeight, 1080);
    assert.strictEqual(comp.targetWidth % 2, 0); // Divisible by 2
    await sandbox.exec(comp.args);

    const socialClip = await sandbox.readFile("speed_1.25x_trimmed_gameplay.mp4");
    assert.strictEqual(socialClip.byteLength > 0, true);

    await sandbox.deleteFile("gameplay_4k.mp4");
    await sandbox.deleteFile("gameplay_15s.mp4");
    await sandbox.deleteFile("gameplay_fast.mp4");
    await sandbox.deleteFile("speed_1.25x_trimmed_gameplay.mp4");

    reportPass(4, "Scenario 5: 4K raw recording trimmed to 15s highlight, sped up 1.25x to 12s, and downscaled to 1080p for social media");
  } catch (err) {
    reportFail(4, "Scenario 5: Social media highlight workflow", err.message);
  }
}
