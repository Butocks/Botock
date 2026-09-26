import {
  buildAtempoFilter,
  buildColorFilter,
  buildDrawtextFilter,
  buildTransformFilters,
  buildVolumeFilter,
} from "./ffmpegAdapters";
import { getEditorFontBytes } from "./fontLoader";
import { AudioTrack, EditorClip, TextOverlay } from "./types";

interface FFmpegBridge {
  load: () => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
}

export type ExportProgressCallback = (message: string) => void;

const INPUT_NAME = "botock_editor_input.mp4";
const OUTPUT_NAME = "botock_editor_output.mp4";
const AUDIO_PROBE_NAME = "botock_editor_probe.m4a";
const FONT_NAME = "botock_editor_font.ttf";

function buildClipVideoFilter(
  clip: EditorClip,
  index: number,
  targetW: number,
  targetH: number
): { filter: string; label: string } {
  const speedFactor = (1 / Math.min(4, Math.max(0.25, clip.speed))).toFixed(4);

  const parts: string[] = [
    `trim=start=${clip.start.toFixed(3)}:end=${clip.end.toFixed(3)}`,
    `setpts=(PTS-STARTPTS)*${speedFactor}`,
  ];

  if (clip.filters.brightness !== 0 || clip.filters.contrast !== 1 || clip.filters.saturation !== 1) {
    parts.push(buildColorFilter(clip.filters.brightness, clip.filters.contrast, clip.filters.saturation));
  }

  parts.push(...buildTransformFilters(clip.rotation, clip.flipH, clip.flipV));

  parts.push(
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease`,
    `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black`,
    `setsar=1`,
    `fps=30`
  );

  const label = `v${index}`;
  return { filter: `[0:v]${parts.join(",")}[${label}]`, label };
}

function buildClipAudioFilter(clip: EditorClip, index: number): { filter: string; label: string } {
  const parts: string[] = [
    `atrim=start=${clip.start.toFixed(3)}:end=${clip.end.toFixed(3)}`,
    `asetpts=PTS-STARTPTS`,
  ];

  const speed = Math.min(4, Math.max(0.25, clip.speed));
  if (speed !== 1) parts.push(buildAtempoFilter(speed));

  const effectiveVolume = clip.muted ? 0 : clip.volumePercent;
  if (effectiveVolume !== 100) parts.push(buildVolumeFilter(effectiveVolume));

  const label = `a${index}`;
  return { filter: `[0:a]${parts.join(",")}[${label}]`, label };
}

/** Builds a filter chain for one extra audio track (music/sfx), from its own input index. */
function buildExtraAudioFilter(track: AudioTrack, inputIndex: number, label: string): string {
  const parts: string[] = [
    `atrim=start=${track.trimStart.toFixed(3)}:end=${track.trimEnd.toFixed(3)}`,
    `asetpts=PTS-STARTPTS`,
  ];

  const effectiveVolume = track.muted ? 0 : track.volumePercent;
  parts.push(buildVolumeFilter(effectiveVolume));

  const trackDuration = track.trimEnd - track.trimStart;
  if (track.fadeInSeconds > 0) {
    parts.push(`afade=t=in:st=0:d=${track.fadeInSeconds.toFixed(2)}`);
  }
  if (track.fadeOutSeconds > 0) {
    const fadeStart = Math.max(0, trackDuration - track.fadeOutSeconds);
    parts.push(`afade=t=out:st=${fadeStart.toFixed(2)}:d=${track.fadeOutSeconds.toFixed(2)}`);
  }

  // Delay this track so it starts at the right point on the main timeline.
  const delayMs = Math.round(track.timelineStart * 1000);
  parts.push(`adelay=${delayMs}|${delayMs}`);

  return `[${inputIndex}:a]${parts.join(",")}[${label}]`;
}

export async function exportEditorTimeline(
  originalFile: File,
  clips: EditorClip[],
  ffmpeg: FFmpegBridge,
  dimensions: { width: number; height: number },
  onProgress?: ExportProgressCallback,
  audioTracks: AudioTrack[] = [],
  textOverlays: TextOverlay[] = []
): Promise<Blob> {
  if (clips.length === 0) throw new Error("Timeline is empty.");

  await ffmpeg.load();
  onProgress?.("Loading video into engine...");

  const inputBytes = new Uint8Array(await originalFile.arrayBuffer());
  await ffmpeg.writeFile(INPUT_NAME, inputBytes);

  let hasAudio = false;
  try {
    const probeExit = await ffmpeg.exec([
      "-y", "-i", INPUT_NAME, "-t", "0.1", "-map", "0:a:0", "-c", "copy", AUDIO_PROBE_NAME,
    ]);
    hasAudio = probeExit === 0;
  } catch {
    hasAudio = false;
  }
  try {
    await ffmpeg.deleteFile(AUDIO_PROBE_NAME);
  } catch {}

  // Write extra audio tracks (music/sfx) into the FFmpeg filesystem.
  const activeAudioTracks = audioTracks.filter((t) => !t.muted || t.volumePercent > 0);
  const trackInputNames: string[] = [];
  for (let i = 0; i < activeAudioTracks.length; i++) {
    const name = `botock_editor_track_${i}.dat`;
    const bytes = new Uint8Array(await activeAudioTracks[i].file.arrayBuffer());
    await ffmpeg.writeFile(name, bytes);
    trackInputNames.push(name);
  }

  // Write caption font if there are text overlays to burn in.
  let fontLoaded = false;
  if (textOverlays.length > 0) {
    onProgress?.("Loading caption font...");
    try {
      const fontBytes = await getEditorFontBytes();
      await ffmpeg.writeFile(FONT_NAME, fontBytes);
      fontLoaded = true;
    } catch {
      fontLoaded = false; // fall back silently to no captions if font fetch fails
    }
  }

  onProgress?.("Building render graph from clips...");

  const targetW = Math.max(2, dimensions.width - (dimensions.width % 2));
  const targetH = Math.max(2, dimensions.height - (dimensions.height % 2));

  const filterParts: string[] = [];
  const concatInputs: string[] = [];

  clips.forEach((clip, index) => {
    const { filter: vFilter, label: vLabel } = buildClipVideoFilter(clip, index, targetW, targetH);
    filterParts.push(vFilter);

    if (hasAudio) {
      const { filter: aFilter, label: aLabel } = buildClipAudioFilter(clip, index);
      filterParts.push(aFilter);
      concatInputs.push(`[${vLabel}][${aLabel}]`);
    } else {
      concatInputs.push(`[${vLabel}]`);
    }
  });

  filterParts.push(
    hasAudio
      ? `${concatInputs.join("")}concat=n=${clips.length}:v=1:a=1[vconcat][aconcat]`
      : `${concatInputs.join("")}concat=n=${clips.length}:v=1:a=0[vconcat]`
  );

  // Burn in text overlays sequentially onto [vconcat].
  let finalVideoLabel = "vconcat";
  if (fontLoaded && textOverlays.length > 0) {
    textOverlays.forEach((overlay, i) => {
      const inLabel = finalVideoLabel;
      const outLabel = `vtxt${i}`;
      const drawtext = buildDrawtextFilter({
        text: overlay.text,
        start: overlay.start,
        end: overlay.end,
        anchor: overlay.anchor,
        fontSizePercent: overlay.fontSizePercent,
        color: overlay.color,
        backgroundOpacity: overlay.backgroundOpacity,
        videoHeight: targetH,
        fontFile: FONT_NAME,
      });
      filterParts.push(`[${inLabel}]${drawtext}[${outLabel}]`);
      finalVideoLabel = outLabel;
    });
  }

  // Mix extra audio tracks with the main concatenated audio.
  let finalAudioLabel: string | null = hasAudio ? "aconcat" : null;
  if (activeAudioTracks.length > 0) {
    const extraLabels: string[] = [];
    activeAudioTracks.forEach((track, i) => {
      const inputIndex = i + 1; // input 0 is the main video
      const label = `atrack${i}`;
      filterParts.push(buildExtraAudioFilter(track, inputIndex, label));
      extraLabels.push(`[${label}]`);
    });

    const mixInputs = finalAudioLabel ? [`[${finalAudioLabel}]`, ...extraLabels] : extraLabels;
    if (mixInputs.length > 1) {
      filterParts.push(`${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=0[amixed]`);
      finalAudioLabel = "amixed";
    } else if (mixInputs.length === 1 && !finalAudioLabel) {
      finalAudioLabel = extraLabels[0].replace(/[\[\]]/g, "");
    }
  }

  const filterComplex = filterParts.join(";");

  const inputArgs: string[] = ["-i", INPUT_NAME];
  trackInputNames.forEach((name) => inputArgs.push("-i", name));

  const args = [
    "-y",
    ...inputArgs,
    "-filter_complex", filterComplex,
    "-map", `[${finalVideoLabel}]`,
    ...(finalAudioLabel ? ["-map", `[${finalAudioLabel}]`, "-c:a", "aac", "-b:a", "128k"] : ["-an"]),
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-movflags", "+faststart",
    OUTPUT_NAME,
  ];

  onProgress?.("Rendering final video...");
  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) {
    throw new Error(`Export failed. FFmpeg exit code: ${exitCode}`);
  }

  const outputBytes = await ffmpeg.readFile(OUTPUT_NAME);
  const blob = new Blob([outputBytes as unknown as BlobPart], { type: "video/mp4" });

  try { await ffmpeg.deleteFile(INPUT_NAME); } catch {}
  try { await ffmpeg.deleteFile(OUTPUT_NAME); } catch {}
  for (const name of trackInputNames) {
    try { await ffmpeg.deleteFile(name); } catch {}
  }
  if (fontLoaded) {
    try { await ffmpeg.deleteFile(FONT_NAME); } catch {}
  }

  return blob;
}