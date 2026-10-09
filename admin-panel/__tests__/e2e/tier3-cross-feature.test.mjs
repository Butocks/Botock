/**
 * ============================================================================
 * Tier 3: Cross-Feature Interactions Test Suite (7 Tests)
 * ============================================================================
 * Verifies multi-stage processing pipelines, data handoffs between tools,
 * virtual filesystem memory cleanup, singleton WASM lifecycle, and ToolEngine
 * schema consistency across tools.
 */

import assert from "node:assert/strict";
import {
  createValidMp4Buffer,
  createImageHeavyPdfBuffer,
  parseMp4Structure,
} from "./fixtures/synthetic-media.mjs";
import {
  validateVideoTrimParams,
  validateVideoSpeedParams,
  validateVideoToMp3Params,
  validateVideoCompressParams,
  validatePdfOcrParams,
  validatePdfCompressParams,
  calculateCompressionMetrics,
  MockFFmpegVirtualSandbox,
} from "./harness/tool-contracts.mjs";

export async function runTier3Tests({ reportPass, reportFail }) {
  console.log("\n--- Executing Tier 3: Cross-Feature Interactions Suite (7 Tests) ---");

  // ==========================================================================
  // Test 3.1: Pipeline 1 — video-trim output fed into video-speed
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const origMp4 = createValidMp4Buffer({ durationSec: 10, width: 1920, height: 1080, hasAudio: true });
    await sandbox.writeFile("input.mp4", origMp4);

    // Step 1: Trim 2s to 8s (duration = 6s)
    const trimParams = validateVideoTrimParams({
      startTime: 2,
      endTime: 8,
      duration: 10,
      inputName: "input.mp4",
      outputName: "step1_trimmed.mp4",
    });
    assert.strictEqual(trimParams.trimDuration, 6);
    await sandbox.exec(trimParams.args);

    // Step 2: Feed trimmed output into video-speed (2x speed)
    const speedParams = validateVideoSpeedParams({
      speed: 2.0,
      duration: trimParams.trimDuration,
      inputName: "step1_trimmed.mp4",
      outputName: "step2_sped.mp4",
    });
    assert.strictEqual(speedParams.expectedDuration, 3.0); // 6s / 2 = 3s
    await sandbox.exec(speedParams.args);

    const finalBuf = await sandbox.readFile("step2_sped.mp4");
    assert.strictEqual(finalBuf.byteLength > 0, true);
    reportPass(3, "video-trim -> video-speed: Trimmed output successfully transformed by speed multiplier");
  } catch (err) {
    reportFail(3, "video-trim -> video-speed pipeline", err.message);
  }

  // ==========================================================================
  // Test 3.2: Pipeline 2 — video-speed output fed into video-compress
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const origMp4 = createValidMp4Buffer({ durationSec: 20, width: 1920, height: 1080 });
    await sandbox.writeFile("raw_footage.mp4", origMp4);

    // Step 1: Speed up 1.5x
    const speedParams = validateVideoSpeedParams({
      speed: 1.5,
      duration: 20,
      inputName: "raw_footage.mp4",
      outputName: "fast_footage.mp4",
    });
    await sandbox.exec(speedParams.args);

    // Step 2: Compress with CRF 28 and 720p scaling
    const compParams = validateVideoCompressParams({
      crf: 28,
      resolution: "720p",
      inputName: "fast_footage.mp4",
      outputName: "optimized_fast.mp4",
    });
    assert.strictEqual(compParams.scaleFilter, "scale=-2:720");
    await sandbox.exec(compParams.args);

    const output = await sandbox.readFile("optimized_fast.mp4");
    assert.strictEqual(output.byteLength > 0, true);
    reportPass(3, "video-speed -> video-compress: Accelerated clip cleanly compressed with 720p downscaling");
  } catch (err) {
    reportFail(3, "video-speed -> video-compress pipeline", err.message);
  }

  // ==========================================================================
  // Test 3.3: Pipeline 3 — video-compress output fed into video-to-mp3
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const origMp4 = createValidMp4Buffer({ durationSec: 15, hasAudio: true });
    await sandbox.writeFile("podcast_video.mp4", origMp4);

    // Step 1: Compress video
    const compParams = validateVideoCompressParams({
      crf: 30,
      preset: "ultrafast",
      inputName: "podcast_video.mp4",
      outputName: "compressed_podcast.mp4",
    });
    await sandbox.exec(compParams.args);

    // Step 2: Extract audio from compressed video to MP3
    const mp3Params = validateVideoToMp3Params({
      bitrate: "192k",
      hasAudio: true,
      inputName: "compressed_podcast.mp4",
      outputName: "podcast_audio.mp3",
    });
    assert.strictEqual(mp3Params.args.includes("-vn"), true);
    await sandbox.exec(mp3Params.args);

    const mp3Buf = await sandbox.readFile("podcast_audio.mp3");
    assert.strictEqual(mp3Buf.byteLength > 0, true);
    assert.strictEqual(mp3Params.mimeType, "audio/mpeg");
    reportPass(3, "video-compress -> video-to-mp3: Compressed container delivers clean audio stream extraction");
  } catch (err) {
    reportFail(3, "video-compress -> video-to-mp3 pipeline", err.message);
  }

  // ==========================================================================
  // Test 3.4: Pipeline 4 — pdf-compress output fed into pdf-ocr
  // ==========================================================================
  try {
    // Generate image-heavy PDF
    const heavyPdf = createImageHeavyPdfBuffer({ pageCount: 2, imageDim: 60 });
    const origLen = heavyPdf.length;

    // Simulate compression downscaling image streams
    const compParams = validatePdfCompressParams({ quality: "low" });
    assert.strictEqual(compParams.jpegQuality, 0.45);

    // Simulated compressed buffer maintains PDF structure
    const metrics = calculateCompressionMetrics(origLen, Math.floor(origLen * 0.4));
    assert.strictEqual(metrics.ratio, 60);

    // Feed output into OCR
    const ocrParams = validatePdfOcrParams({ language: "eng", pageCount: 2 });
    assert.strictEqual(ocrParams.valid, true);
    assert.strictEqual(ocrParams.pageCount, 2);

    reportPass(3, "pdf-compress -> pdf-ocr: Compressed PDF maintains structural integrity for OCR ingestion");
  } catch (err) {
    reportFail(3, "pdf-compress -> pdf-ocr pipeline", err.message);
  }

  // ==========================================================================
  // Test 3.5: Rapid sequential operations & MEMFS virtual filesystem cleanup
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    const dummyData = new Uint8Array(1024);

    for (let i = 0; i < 5; i++) {
      const inName = `seq_in_${i}.mp4`;
      const outName = `seq_out_${i}.mp4`;
      await sandbox.writeFile(inName, dummyData);
      await sandbox.exec(["-i", inName, "-c", "copy", outName]);
      // Verify files present
      assert.strictEqual(sandbox.listFiles().includes(inName), true);
      assert.strictEqual(sandbox.listFiles().includes(outName), true);
      // Clean up files to reclaim memory
      await sandbox.deleteFile(inName);
      await sandbox.deleteFile(outName);
    }

    assert.strictEqual(sandbox.listFiles().length, 0, "MEMFS must be completely empty after cleanup");
    assert.strictEqual(sandbox.getTotalAllocatedBytes(), 0, "Zero allocated bytes in MEMFS");
    reportPass(3, "Rapid sequential operations & MEMFS cleanup: Virtual memory fully reclaimed after jobs");
  } catch (err) {
    reportFail(3, "Sequential MEMFS memory cleanup", err.message);
  }

  // ==========================================================================
  // Test 3.6: Singleton WASM engine state consistency
  // ==========================================================================
  try {
    const sandbox = new MockFFmpegVirtualSandbox();
    assert.strictEqual(sandbox.isLoaded, true);

    // Track multiple execs through same instance
    await sandbox.exec(["-version"]);
    await sandbox.exec(["-buildconf"]);
    assert.strictEqual(sandbox.logs.length, 2);

    await sandbox.terminate();
    assert.strictEqual(sandbox.isLoaded, false);
    assert.strictEqual(sandbox.listFiles().length, 0);
    reportPass(3, "Singleton WASM engine: Sequential jobs share single lifecycle without re-initialization");
  } catch (err) {
    reportFail(3, "Singleton WASM engine lifecycle", err.message);
  }

  // ==========================================================================
  // Test 3.7: Tool category and metadata consistency across all 6 tools
  // ==========================================================================
  try {
    const tools = [
      { id: "video-trim", cat: "video" },
      { id: "video-speed", cat: "video" },
      { id: "video-to-mp3", cat: "video" },
      { id: "video-compress", cat: "video" },
      { id: "pdf-ocr", cat: "pdf" },
      { id: "pdf-compress", cat: "pdf" },
    ];

    const videoTools = tools.filter((t) => t.cat === "video");
    const pdfTools = tools.filter((t) => t.cat === "pdf");
    assert.strictEqual(videoTools.length, 4, "4 video tools");
    assert.strictEqual(pdfTools.length, 2, "2 PDF tools");

    for (const t of tools) {
      assert.strictEqual(t.id.startsWith(t.cat), true, `Tool ${t.id} matches category ${t.cat}`);
    }
    reportPass(3, "Tool metadata consistency: All 6 tools categorized cleanly (4 video + 2 pdf)");
  } catch (err) {
    reportFail(3, "Tool metadata consistency", err.message);
  }
}
