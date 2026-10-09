/**
 * ============================================================================
 * Tool Interface Contracts, Validators, and CLI Builders
 * ============================================================================
 * 
 * Provides authoritative logic and specification contracts for all 6 tools:
 * 1. video-trim
 * 2. video-speed
 * 3. video-to-mp3
 * 4. video-compress
 * 5. pdf-ocr
 * 6. pdf-compress
 */

// ============================================================================
// 1. VIDEO-TRIM CONTRACT
// ============================================================================

export function validateVideoTrimParams({
  startTime = 0,
  endTime,
  duration,
  mode = "fast",
  inputName = "input.mp4",
  outputName = "output.mp4",
}) {
  if (duration === undefined || duration === null || duration <= 0) {
    throw new Error("Invalid video duration: duration must be positive");
  }

  // Bounds checking & clamping
  const clampedStart = Math.max(0, Number(startTime) || 0);
  if (clampedStart >= duration) {
    throw new Error(`Start time (${clampedStart}s) exceeds or equals total duration (${duration}s)`);
  }

  let effectiveEnd = endTime !== undefined && endTime !== null ? Number(endTime) : duration;
  if (isNaN(effectiveEnd)) effectiveEnd = duration;

  // Clamping end to duration
  effectiveEnd = Math.min(duration, effectiveEnd);

  if (effectiveEnd <= clampedStart) {
    throw new Error(
      `Invalid trim range: start time (${clampedStart}s) must be strictly less than end time (${effectiveEnd}s)`
    );
  }

  const trimDuration = effectiveEnd - clampedStart;

  // Build FFmpeg CLI arguments
  let args = [];
  if (mode === "fast") {
    // Stream copy trimming: fast seek before input or accurate copy
    args = [
      "-ss",
      clampedStart.toFixed(3),
      "-to",
      effectiveEnd.toFixed(3),
      "-i",
      inputName,
      "-c",
      "copy",
      outputName,
    ];
  } else {
    // Accurate cut: re-encode to guarantee exact keyframe at start point
    args = [
      "-ss",
      clampedStart.toFixed(3),
      "-to",
      effectiveEnd.toFixed(3),
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-c:a",
      "aac",
      outputName,
    ];
  }

  return {
    valid: true,
    startTime: clampedStart,
    endTime: effectiveEnd,
    trimDuration,
    mode,
    args,
    outputFilename: `trimmed_${inputName}`,
  };
}

// ============================================================================
// 2. VIDEO-SPEED CONTRACT
// ============================================================================

export function validateVideoSpeedParams({
  speed = 1.0,
  preservePitch = true,
  muteAudio = false,
  duration = 10,
  inputName = "input.mp4",
  outputName = "output.mp4",
}) {
  const numSpeed = Number(speed);
  if (isNaN(numSpeed) || numSpeed <= 0) {
    throw new Error("Speed multiplier must be a positive number");
  }

  // Clamped strictly to supported range [0.25, 4.0]
  const clampedSpeed = Math.min(4.0, Math.max(0.25, numSpeed));

  // Video filter: setpts = (1 / speed) * PTS
  const setptsVal = (1 / clampedSpeed).toFixed(4);
  const videoFilter = `setpts=${setptsVal}*PTS`;

  // Audio filter: FFmpeg's atempo filter allows values in [0.5, 2.0].
  // Values outside this range require chaining filters.
  let audioFilters = [];
  if (!muteAudio && preservePitch) {
    if (clampedSpeed > 2.0) {
      // Example 4.0x -> atempo=2.0,atempo=2.0
      const first = 2.0;
      const second = clampedSpeed / 2.0;
      audioFilters.push(`atempo=${first.toFixed(2)}`);
      audioFilters.push(`atempo=${second.toFixed(2)}`);
    } else if (clampedSpeed < 0.5) {
      // Example 0.25x -> atempo=0.5,atempo=0.5
      const first = 0.5;
      const second = clampedSpeed * 2.0;
      audioFilters.push(`atempo=${first.toFixed(2)}`);
      audioFilters.push(`atempo=${second.toFixed(2)}`);
    } else {
      audioFilters.push(`atempo=${clampedSpeed.toFixed(2)}`);
    }
  }

  let args = [];
  if (muteAudio) {
    args = ["-i", inputName, "-vf", videoFilter, "-an", outputName];
  } else {
    const afString = audioFilters.join(",");
    const filterComplex = `[0:v]${videoFilter}[v];[0:a]${afString}[a]`;
    args = [
      "-i",
      inputName,
      "-filter_complex",
      filterComplex,
      "-map",
      "[v]",
      "-map",
      "[a]",
      outputName,
    ];
  }

  const expectedDuration = duration / clampedSpeed;

  return {
    valid: true,
    speed: clampedSpeed,
    preservePitch,
    muteAudio,
    args,
    setptsVal,
    audioFilters,
    expectedDuration,
    outputFilename: `speed_${clampedSpeed}x_${inputName}`,
  };
}

// ============================================================================
// 3. VIDEO-TO-MP3 CONTRACT
// ============================================================================

export function validateVideoToMp3Params({
  bitrate = "192k",
  channels = 2,
  sampleRate = 44100,
  hasAudio = true,
  inputName = "input.mp4",
  outputName = "output.mp3",
}) {
  if (!hasAudio) {
    throw new Error("No audio stream detected in source video file");
  }

  // Normalize bitrate (e.g. 192 -> 192k)
  let cleanBitrate = String(bitrate).toLowerCase();
  if (/^\d+$/.test(cleanBitrate)) {
    cleanBitrate += "k";
  }

  const validBitrates = ["64k", "96k", "128k", "192k", "256k", "320k"];
  if (!validBitrates.includes(cleanBitrate)) {
    // Clamp to nearest standard bitrate
    const num = parseInt(cleanBitrate, 10) || 192;
    if (num <= 64) cleanBitrate = "64k";
    else if (num <= 96) cleanBitrate = "96k";
    else if (num <= 128) cleanBitrate = "128k";
    else if (num <= 192) cleanBitrate = "192k";
    else if (num <= 256) cleanBitrate = "256k";
    else cleanBitrate = "320k";
  }

  const cleanChannels = channels === 1 ? 1 : 2;

  const args = [
    "-i",
    inputName,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-b:a",
    cleanBitrate,
    "-ar",
    String(sampleRate),
    "-ac",
    String(cleanChannels),
    outputName,
  ];

  const base = inputName.replace(/\.[^/.]+$/, "");
  return {
    valid: true,
    bitrate: cleanBitrate,
    channels: cleanChannels,
    sampleRate,
    args,
    mimeType: "audio/mpeg",
    outputFilename: `${base}.mp3`,
  };
}

// ============================================================================
// 4. VIDEO-COMPRESS CONTRACT
// ============================================================================

export function validateVideoCompressParams({
  crf = 28,
  preset = "ultrafast",
  resolution = "original",
  audioBitrate = "96k",
  origWidth = 1920,
  origHeight = 1080,
  inputName = "input.mp4",
  outputName = "output.mp4",
}) {
  const numCrf = Number(crf);
  // CRF clamped strictly to [18, 51]
  const clampedCrf = isNaN(numCrf) ? 28 : Math.min(51, Math.max(18, Math.round(numCrf)));

  const validPresets = ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium"];
  const cleanPreset = validPresets.includes(preset) ? preset : "ultrafast";

  // Resolution downscaling with even dimensions (divisible by 2 for H.264 macroblocks)
  let scaleFilter = null;
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (resolution === "720p" && origHeight > 720) {
    scaleFilter = "scale=-2:720";
    targetHeight = 720;
    targetWidth = Math.round((origWidth * (720 / origHeight)) / 2) * 2;
  } else if (resolution === "480p" && origHeight > 480) {
    scaleFilter = "scale=-2:480";
    targetHeight = 480;
    targetWidth = Math.round((origWidth * (480 / origHeight)) / 2) * 2;
  } else if (resolution === "1080p" && origHeight > 1080) {
    scaleFilter = "scale=-2:1080";
    targetHeight = 1080;
    targetWidth = Math.round((origWidth * (1080 / origHeight)) / 2) * 2;
  }

  const args = [
    "-i",
    inputName,
    "-c:v",
    "libx264",
    "-crf",
    String(clampedCrf),
    "-preset",
    cleanPreset,
  ];

  if (scaleFilter) {
    args.push("-vf", scaleFilter);
  }

  args.push("-c:a", "aac", "-b:a", audioBitrate, outputName);

  return {
    valid: true,
    crf: clampedCrf,
    preset: cleanPreset,
    resolution,
    scaleFilter,
    targetWidth,
    targetHeight,
    args,
    outputFilename: `compressed_${inputName}`,
  };
}

export function calculateCompressionMetrics(originalBytes, compressedBytes) {
  const orig = Math.max(1, originalBytes);
  const comp = Math.max(0, compressedBytes);
  const savedBytes = Math.max(0, orig - comp);
  const ratio = Math.round((savedBytes / orig) * 100);
  return {
    originalBytes: orig,
    compressedBytes: comp,
    savedBytes,
    ratio, // percentage reduction
  };
}

// ============================================================================
// 5. PDF-OCR CONTRACT
// ============================================================================

export function validatePdfOcrParams({
  language = "eng",
  scale = 2.0,
  pageCount = 1,
}) {
  const supportedLanguages = ["eng", "spa", "fra", "deu"];
  if (!supportedLanguages.includes(language)) {
    throw new Error(`Unsupported OCR language: "${language}". Must be one of: ${supportedLanguages.join(", ")}`);
  }

  const clampedScale = Math.min(4.0, Math.max(1.0, Number(scale) || 2.0));

  return {
    valid: true,
    language,
    scale: clampedScale,
    pageCount,
    recommendedDpi: Math.round(72 * clampedScale),
  };
}

/**
 * Simulates OCR text extraction with deterministic accuracy calculation
 */
export function simulateOcrPageProcessing(pageNumber, textContent, confidence = 92.5) {
  return {
    pageNumber,
    text: textContent,
    confidence,
    length: textContent.length,
  };
}

// ============================================================================
// 6. PDF-COMPRESS CONTRACT
// ============================================================================

export function validatePdfCompressParams({
  quality = "medium",
  maxImageDimension = 1600,
}) {
  const qualityMap = {
    low: 0.45,
    medium: 0.65,
    high: 0.80,
  };

  const selectedQuality = quality in qualityMap ? quality : "medium";
  const jpegQuality = qualityMap[selectedQuality];

  const clampedDimension = Math.min(3840, Math.max(800, Number(maxImageDimension) || 1600));

  return {
    valid: true,
    preset: selectedQuality,
    jpegQuality,
    maxImageDimension: clampedDimension,
  };
}

// ============================================================================
// SIMULATED WASM FILESYSTEM & EXECUTION HARNESS
// ============================================================================

export class MockFFmpegVirtualSandbox {
  constructor() {
    this.memfs = new Map();
    this.logs = [];
    this.isLoaded = true;
    this.progressHistory = [];
  }

  async writeFile(name, data) {
    if (!data || data.length === 0) {
      throw new Error(`Cannot write empty file to MEMFS: ${name}`);
    }
    this.memfs.set(name, new Uint8Array(data));
  }

  async readFile(name) {
    const data = this.memfs.get(name);
    if (!data) {
      throw new Error(`File not found in MEMFS: ${name}`);
    }
    return data;
  }

  async deleteFile(name) {
    if (!this.memfs.has(name)) {
      throw new Error(`Cannot delete non-existent file in MEMFS: ${name}`);
    }
    this.memfs.delete(name);
  }

  listFiles() {
    return Array.from(this.memfs.keys());
  }

  getTotalAllocatedBytes() {
    let sum = 0;
    for (const buf of this.memfs.values()) {
      sum += buf.byteLength;
    }
    return sum;
  }

  async exec(args, onProgress) {
    this.logs.push(args.join(" "));

    // Emit progress increments
    if (onProgress) {
      for (const p of [0.25, 0.5, 0.75, 1.0]) {
        this.progressHistory.push(p);
        onProgress({ ratio: p, percent: Math.round(p * 100) });
      }
    }

    const outputName = args[args.length - 1];
    // Create transformed output buffer
    const outBytes = new Uint8Array(512);
    outBytes.fill(0x55);
    this.memfs.set(outputName, outBytes);

    return 0; // Exit code 0 (success)
  }

  async terminate() {
    this.memfs.clear();
    this.isLoaded = false;
  }
}
