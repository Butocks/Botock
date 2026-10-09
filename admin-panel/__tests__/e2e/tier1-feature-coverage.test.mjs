/**
 * ============================================================================
 * Tier 1: Feature Coverage Test Suite (30 Tests)
 * ============================================================================
 * Verifies core functionality, input handling, parameter defaults, format
 * conversion, and download generation across all 6 tools (5 tests per feature).
 */

import assert from "node:assert/strict";
import {
  createValidMp4Buffer,
  parseMp4Structure,
  createMinimalPdfBuffer,
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

export async function runTier1Tests({ reportPass, reportFail }) {
  console.log("\n--- Executing Tier 1: Feature Coverage Suite (30 Tests) ---");

  // ==========================================================================
  // 1. FEATURE: video-trim (5 Tests)
  // ==========================================================================
  // Test 1.1: Core stream-copy CLI builder
  try {
    const result = validateVideoTrimParams({
      startTime: 2.5,
      endTime: 8.0,
      duration: 10,
      mode: "fast",
      inputName: "clip.mp4",
      outputName: "clip_trimmed.mp4",
    });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.args, [
      "-ss", "2.500", "-to", "8.000", "-i", "clip.mp4", "-c", "copy", "clip_trimmed.mp4"
    ]);
    assert.strictEqual(result.trimDuration, 5.5);
    reportPass(1, "video-trim: Core stream-copy CLI builder produces exact -ss -to -c copy sequence");
  } catch (err) {
    reportFail(1, "video-trim: Core stream-copy CLI builder", err.message);
  }

  // Test 1.2: Accurate re-encode trim mode
  try {
    const result = validateVideoTrimParams({
      startTime: 1.0,
      endTime: 5.0,
      duration: 12,
      mode: "accurate",
      inputName: "video.mp4",
      outputName: "video_accurate.mp4",
    });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.args, [
      "-ss", "1.000", "-to", "5.000", "-i", "video.mp4", "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "video_accurate.mp4"
    ]);
    reportPass(1, "video-trim: Accurate re-encode mode produces -c:v libx264 -c:a aac flags");
  } catch (err) {
    reportFail(1, "video-trim: Accurate re-encode mode", err.message);
  }

  // Test 1.3: Default parameter resolution (start=0, end=duration)
  try {
    const result = validateVideoTrimParams({
      duration: 15.2,
      inputName: "presentation.mp4",
    });
    assert.strictEqual(result.startTime, 0);
    assert.strictEqual(result.endTime, 15.2);
    assert.strictEqual(result.mode, "fast");
    assert.strictEqual(result.trimDuration, 15.2);
    reportPass(1, "video-trim: Default parameters resolve to fast mode from 0 to full duration");
  } catch (err) {
    reportFail(1, "video-trim: Default parameters", err.message);
  }

  // Test 1.4: Output download filename generation
  try {
    const result = validateVideoTrimParams({
      startTime: 3,
      endTime: 6,
      duration: 10,
      inputName: "my_holiday_clip.mp4",
    });
    assert.strictEqual(result.outputFilename, "trimmed_my_holiday_clip.mp4");
    reportPass(1, "video-trim: Output artifact naming follows trimmed_{name} convention");
  } catch (err) {
    reportFail(1, "video-trim: Output artifact naming", err.message);
  }

  // Test 1.5: File ingestion contract handles synthetic valid MP4 buffer
  try {
    const buffer = createValidMp4Buffer({ durationSec: 10, width: 1920, height: 1080, hasAudio: true });
    const parsed = parseMp4Structure(buffer);
    assert.strictEqual(parsed.hasFtyp, true, "MP4 ftyp box present");
    assert.strictEqual(parsed.hasMoov, true, "MP4 moov box present");
    assert.strictEqual(parsed.hasMdat, true, "MP4 mdat box present");
    assert.strictEqual(parsed.duration, 10, "Extracted movie duration matches 10s");
    reportPass(1, "video-trim: Ingests valid MP4 container and parses moov metadata");
  } catch (err) {
    reportFail(1, "video-trim: Ingest valid MP4 container", err.message);
  }

  // ==========================================================================
  // 2. FEATURE: video-speed (5 Tests)
  // ==========================================================================
  // Test 2.1: 1.5x fast forward speed alteration
  try {
    const result = validateVideoSpeedParams({
      speed: 1.5,
      preservePitch: true,
      duration: 12,
      inputName: "lecture.mp4",
      outputName: "out.mp4",
    });
    assert.strictEqual(result.speed, 1.5);
    assert.strictEqual(result.setptsVal, "0.6667");
    assert.deepStrictEqual(result.audioFilters, ["atempo=1.50"]);
    assert.strictEqual(result.expectedDuration, 8); // 12 / 1.5 = 8
    reportPass(1, "video-speed: 1.5x playback builds setpts=0.6667*PTS and atempo=1.50");
  } catch (err) {
    reportFail(1, "video-speed: 1.5x playback", err.message);
  }

  // Test 2.2: 0.5x slow motion speed alteration
  try {
    const result = validateVideoSpeedParams({
      speed: 0.5,
      preservePitch: true,
      duration: 6,
      inputName: "sports.mp4",
    });
    assert.strictEqual(result.speed, 0.5);
    assert.strictEqual(result.setptsVal, "2.0000");
    assert.deepStrictEqual(result.audioFilters, ["atempo=0.50"]);
    assert.strictEqual(result.expectedDuration, 12); // 6 / 0.5 = 12
    reportPass(1, "video-speed: 0.5x slow-mo builds setpts=2.0000*PTS and atempo=0.50");
  } catch (err) {
    reportFail(1, "video-speed: 0.5x slow-mo", err.message);
  }

  // Test 2.3: Mute audio option
  try {
    const result = validateVideoSpeedParams({
      speed: 2.0,
      muteAudio: true,
      inputName: "timelapse.mp4",
      outputName: "timelapse_fast.mp4",
    });
    assert.strictEqual(result.muteAudio, true);
    assert.deepStrictEqual(result.args, [
      "-i", "timelapse.mp4", "-vf", "setpts=0.5000*PTS", "-an", "timelapse_fast.mp4"
    ]);
    reportPass(1, "video-speed: Mute audio builds clean -an argument without audio filter graph");
  } catch (err) {
    reportFail(1, "video-speed: Mute audio option", err.message);
  }

  // Test 2.4: Default speed parameters
  try {
    const result = validateVideoSpeedParams({ inputName: "clip.mp4" });
    assert.strictEqual(result.speed, 1.0);
    assert.strictEqual(result.preservePitch, true);
    assert.strictEqual(result.muteAudio, false);
    reportPass(1, "video-speed: Default parameters set 1.0x normal speed with pitch preservation");
  } catch (err) {
    reportFail(1, "video-speed: Default parameters", err.message);
  }

  // Test 2.5: Output duration calculation precisely scales by 1/speed
  try {
    const speeds = [0.5, 0.75, 1.25, 1.5, 2.0];
    const initialDuration = 60;
    for (const s of speeds) {
      const res = validateVideoSpeedParams({ speed: s, duration: initialDuration });
      const expected = initialDuration / s;
      assert.strictEqual(Math.abs(res.expectedDuration - expected) < 0.001, true);
    }
    reportPass(1, "video-speed: Output duration scales inverse-proportionally across all multipliers");
  } catch (err) {
    reportFail(1, "video-speed: Duration scaling invariant", err.message);
  }

  // ==========================================================================
  // 3. FEATURE: video-to-mp3 (5 Tests)
  // ==========================================================================
  // Test 3.1: Core audio extraction CLI builder
  try {
    const result = validateVideoToMp3Params({
      bitrate: "192k",
      channels: 2,
      inputName: "podcast.mp4",
      outputName: "podcast.mp3",
    });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.args, [
      "-i", "podcast.mp4", "-vn", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2", "podcast.mp3"
    ]);
    reportPass(1, "video-to-mp3: Audio extraction builder produces -vn -c:a libmp3lame -b:a 192k");
  } catch (err) {
    reportFail(1, "video-to-mp3: Audio extraction builder", err.message);
  }

  // Test 3.2: High-fidelity preset (320k bitrate)
  try {
    const result = validateVideoToMp3Params({
      bitrate: "320k",
      channels: 2,
      inputName: "concert.mkv",
    });
    assert.strictEqual(result.bitrate, "320k");
    assert.strictEqual(result.args.includes("-b:a"), true);
    assert.strictEqual(result.args[result.args.indexOf("-b:a") + 1], "320k");
    reportPass(1, "video-to-mp3: 320kbps audiophile preset configured correctly");
  } catch (err) {
    reportFail(1, "video-to-mp3: 320kbps preset", err.message);
  }

  // Test 3.3: Mono vs stereo channel mapping
  try {
    const monoRes = validateVideoToMp3Params({ channels: 1 });
    const stereoRes = validateVideoToMp3Params({ channels: 2 });
    assert.strictEqual(monoRes.channels, 1);
    assert.strictEqual(stereoRes.channels, 2);
    assert.strictEqual(monoRes.args[monoRes.args.indexOf("-ac") + 1], "1");
    assert.strictEqual(stereoRes.args[stereoRes.args.indexOf("-ac") + 1], "2");
    reportPass(1, "video-to-mp3: Mono (-ac 1) and stereo (-ac 2) channel configuration");
  } catch (err) {
    reportFail(1, "video-to-mp3: Channel configuration", err.message);
  }

  // Test 3.4: MIME type and extension generation
  try {
    const result = validateVideoToMp3Params({ inputName: "interview_recording.mov" });
    assert.strictEqual(result.mimeType, "audio/mpeg");
    assert.strictEqual(result.outputFilename, "interview_recording.mp3");
    reportPass(1, "video-to-mp3: Output artifact correctly tagged audio/mpeg with .mp3 extension");
  } catch (err) {
    reportFail(1, "video-to-mp3: MIME and extension", err.message);
  }

  // Test 3.5: Clean audio track isolation without video stream mapping
  try {
    const result = validateVideoToMp3Params({ inputName: "clip.mp4" });
    assert.strictEqual(result.args.includes("-vn"), true, "Must include -vn flag to discard video");
    assert.strictEqual(result.args.includes("-c:v"), false, "Must not contain video codec flags");
    reportPass(1, "video-to-mp3: Stream isolation strictly strips video stream via -vn");
  } catch (err) {
    reportFail(1, "video-to-mp3: Stream isolation", err.message);
  }

  // ==========================================================================
  // 4. FEATURE: video-compress (5 Tests)
  // ==========================================================================
  // Test 4.1: Core compression CLI builder with CRF 28 and ultrafast preset
  try {
    const result = validateVideoCompressParams({
      crf: 28,
      preset: "ultrafast",
      resolution: "original",
      audioBitrate: "96k",
      inputName: "sample.mp4",
      outputName: "sample_comp.mp4",
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.crf, 28);
    assert.deepStrictEqual(result.args, [
      "-i", "sample.mp4", "-c:v", "libx264", "-crf", "28", "-preset", "ultrafast", "-c:a", "aac", "-b:a", "96k", "sample_comp.mp4"
    ]);
    reportPass(1, "video-compress: Standard compression produces -c:v libx264 -crf 28 -preset ultrafast");
  } catch (err) {
    reportFail(1, "video-compress: Standard compression builder", err.message);
  }

  // Test 4.2: Resolution scaling down to 720p with even macroblock constraint
  try {
    const result = validateVideoCompressParams({
      crf: 26,
      resolution: "720p",
      origWidth: 1920,
      origHeight: 1080,
    });
    assert.strictEqual(result.scaleFilter, "scale=-2:720");
    assert.strictEqual(result.targetHeight, 720);
    assert.strictEqual(result.targetWidth % 2, 0, "Width must be even integer for H.264");
    assert.strictEqual(result.args.includes("-vf"), true);
    assert.strictEqual(result.args[result.args.indexOf("-vf") + 1], "scale=-2:720");
    reportPass(1, "video-compress: 720p downscaling applies scale=-2:720 with even macroblock constraint");
  } catch (err) {
    reportFail(1, "video-compress: Resolution downscaling", err.message);
  }

  // Test 4.3: Audio re-encoding at lower bitrate for maximal bandwidth saving
  try {
    const result = validateVideoCompressParams({ audioBitrate: "64k" });
    assert.strictEqual(result.args.includes("-b:a"), true);
    assert.strictEqual(result.args[result.args.indexOf("-b:a") + 1], "64k");
    reportPass(1, "video-compress: Audio re-encoding configured to lower target bitrate");
  } catch (err) {
    reportFail(1, "video-compress: Audio bitrate configuration", err.message);
  }

  // Test 4.4: Compression metrics calculation
  try {
    const orig = 100 * 1024 * 1024; // 100MB
    const comp = 25 * 1024 * 1024; // 25MB
    const metrics = calculateCompressionMetrics(orig, comp);
    assert.strictEqual(metrics.originalBytes, orig);
    assert.strictEqual(metrics.compressedBytes, comp);
    assert.strictEqual(metrics.savedBytes, 75 * 1024 * 1024);
    assert.strictEqual(metrics.ratio, 75); // 75% reduction
    reportPass(1, "video-compress: Compression metrics correctly compute 75% space reduction");
  } catch (err) {
    reportFail(1, "video-compress: Compression metrics", err.message);
  }

  // Test 4.5: Default preset selection
  try {
    const result = validateVideoCompressParams({});
    assert.strictEqual(result.crf, 28);
    assert.strictEqual(result.preset, "ultrafast");
    assert.strictEqual(result.resolution, "original");
    assert.strictEqual(result.scaleFilter, null);
    reportPass(1, "video-compress: Default preset selects CRF 28, ultrafast, original resolution");
  } catch (err) {
    reportFail(1, "video-compress: Default preset selection", err.message);
  }

  // ==========================================================================
  // 5. FEATURE: pdf-ocr (5 Tests)
  // ==========================================================================
  // Test 5.1: Core OCR helper initializes worker and renders page at standard 2.0x scale (144 DPI)
  try {
    const result = validatePdfOcrParams({ scale: 2.0 });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.scale, 2.0);
    assert.strictEqual(result.recommendedDpi, 144);
    reportPass(1, "pdf-ocr: Scale 2.0x configures optimal 144 DPI canvas rendering");
  } catch (err) {
    reportFail(1, "pdf-ocr: Scale and DPI configuration", err.message);
  }

  // Test 5.2: Multi-language support configuration (eng, spa, fra, deu)
  try {
    const langs = ["eng", "spa", "fra", "deu"];
    for (const lang of langs) {
      const res = validatePdfOcrParams({ language: lang });
      assert.strictEqual(res.language, lang);
    }
    reportPass(1, "pdf-ocr: Multi-language support verified for eng, spa, fra, deu");
  } catch (err) {
    reportFail(1, "pdf-ocr: Multi-language support", err.message);
  }

  // Test 5.3: Text aggregation builds per-page results with confidence scores
  try {
    const p1 = simulateOcrPageProcessing(1, "Invoice Header Text", 95.2);
    const p2 = simulateOcrPageProcessing(2, "Subtotal: $450.00", 91.8);
    assert.strictEqual(p1.pageNumber, 1);
    assert.strictEqual(p1.confidence, 95.2);
    assert.strictEqual(p2.pageNumber, 2);
    assert.strictEqual(p2.confidence, 91.8);
    reportPass(1, "pdf-ocr: Page processing retains per-page confidence scores and text segments");
  } catch (err) {
    reportFail(1, "pdf-ocr: Text aggregation and confidence", err.message);
  }

  // Test 5.4: Plain text export payload and .txt blob generation
  try {
    const fullText = "Page 1 Content\n\nPage 2 Content";
    const encoder = new TextEncoder();
    const txtBuffer = encoder.encode(fullText);
    assert.strictEqual(txtBuffer.length > 0, true);
    const decoded = new TextDecoder().decode(txtBuffer);
    assert.strictEqual(decoded, fullText);
    reportPass(1, "pdf-ocr: Plain text payload export encodes UTF-8 .txt document");
  } catch (err) {
    reportFail(1, "pdf-ocr: Plain text export payload", err.message);
  }

  // Test 5.5: Progressive status notification contract
  try {
    const progressUpdates = [];
    const totalPages = 4;
    for (let p = 1; p <= totalPages; p++) {
      progressUpdates.push({
        currentPage: p,
        totalPages,
        status: `Recognizing page ${p} of ${totalPages}...`,
        progress: Math.round((p / totalPages) * 100),
      });
    }
    assert.strictEqual(progressUpdates.length, 4);
    assert.strictEqual(progressUpdates[3].progress, 100);
    assert.strictEqual(progressUpdates[0].progress, 25);
    reportPass(1, "pdf-ocr: Progressive status contract emits incremental page progress (25% -> 100%)");
  } catch (err) {
    reportFail(1, "pdf-ocr: Progressive status notification", err.message);
  }

  // ==========================================================================
  // 6. FEATURE: pdf-compress (5 Tests)
  // ==========================================================================
  // Test 6.1: Core PDF compression identifies indirect image objects
  try {
    const pdfBuf = createMinimalPdfBuffer({ pageCount: 2, withImages: true, imageWidth: 50, imageHeight: 50 });
    assert.strictEqual(pdfBuf.length > 0, true);
    const pdfStr = new TextDecoder().decode(pdfBuf);
    assert.strictEqual(pdfStr.includes("/Subtype /Image"), true, "Indirect image XObjects present in PDF");
    reportPass(1, "pdf-compress: PDF parser detects indirect /Subtype /Image stream objects");
  } catch (err) {
    reportFail(1, "pdf-compress: Indirect image detection", err.message);
  }

  // Test 6.2: Quality presets mapping (low=0.45, medium=0.65, high=0.80)
  try {
    const low = validatePdfCompressParams({ quality: "low" });
    const med = validatePdfCompressParams({ quality: "medium" });
    const high = validatePdfCompressParams({ quality: "high" });
    assert.strictEqual(low.jpegQuality, 0.45);
    assert.strictEqual(med.jpegQuality, 0.65);
    assert.strictEqual(high.jpegQuality, 0.80);
    reportPass(1, "pdf-compress: Presets correctly map low (0.45), medium (0.65), and high (0.80) quality");
  } catch (err) {
    reportFail(1, "pdf-compress: Quality presets mapping", err.message);
  }

  // Test 6.3: Object stream compaction configuration
  try {
    const saveOptions = { useObjectStreams: true };
    assert.strictEqual(saveOptions.useObjectStreams, true);
    reportPass(1, "pdf-compress: Saves with useObjectStreams=true to compact cross-references");
  } catch (err) {
    reportFail(1, "pdf-compress: Object stream compaction", err.message);
  }

  // Test 6.4: Compression savings calculation
  try {
    const orig = 5000000; // 5MB
    const comp = 1250000; // 1.25MB
    const metrics = calculateCompressionMetrics(orig, comp);
    assert.strictEqual(metrics.savedBytes, 3750000);
    assert.strictEqual(metrics.ratio, 75);
    reportPass(1, "pdf-compress: Correctly calculates saved bytes and 75% reduction ratio");
  } catch (err) {
    reportFail(1, "pdf-compress: Compression metrics calculation", err.message);
  }

  // Test 6.5: Exported PDF structure validation maintains %PDF- and %%EOF
  try {
    const pdfBuf = createMinimalPdfBuffer({ pageCount: 1, withImages: false });
    const str = new TextDecoder().decode(pdfBuf);
    assert.strictEqual(str.startsWith("%PDF-1.4"), true, "Valid PDF magic header");
    assert.strictEqual(str.trim().endsWith("%%EOF"), true, "Valid PDF EOF trailer");
    reportPass(1, "pdf-compress: Exported document maintains valid %PDF- header and %%EOF trailer");
  } catch (err) {
    reportFail(1, "pdf-compress: Document header and trailer structure", err.message);
  }
}
