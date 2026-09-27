import {
  buildAtempoFilter,
  buildColorFilter,
  buildCropFilter,
  buildDrawtextFilter,
  buildImageOverlayCompositeFilter,
  buildImageOverlayScaleFilter,
  buildKenBurnsFilter,
  buildTransformFilters,
  buildVolumeFilter,
} from "./ffmpegAdapters";
import { getEditorFontBytes } from "./fontLoader";
import {
  AudioTrack,
  EditorClip,
  ImageOverlay,
  MediaBinItem,
  TextOverlay,
  clipTimelineDuration,
} from "./types";

interface FFmpegBridge {
  load: () => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
}

export type ExportProgressCallback = (message: string) => void;

const OUTPUT_NAME = "botock_editor_output.mp4";
const AUDIO_PROBE_PREFIX = "botock_editor_probe_";
const FONT_NAME = "botock_editor_font.ttf";

const XFADE_MAP: Record<Exclude<EditorClip["transitionOut"], "none">, string> = {
  fade: "fade",
  wipeleft: "wipeleft",
  wiperight: "wiperight",
  slideup: "slideup",
};

function buildClipVideoFilter(
  clip: EditorClip,
  inputIndex: number,
  label: string,
  targetW: number,
  targetH: number
): string {
  const speedFactor = (1 / Math.min(4, Math.max(0.25, clip.speed))).toFixed(4);
  const parts: string[] = [
    `trim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)}`,
    `setpts=(PTS-STARTPTS)*${speedFactor}`,
  ];

  if (clip.filters.brightness !== 0 || clip.filters.contrast !== 1 || clip.filters.saturation !== 1) {
    parts.push(buildColorFilter(clip.filters.brightness, clip.filters.contrast, clip.filters.saturation));
  }
  parts.push(...buildTransformFilters(clip.rotation, clip.flipH, clip.flipV));

  if (clip.crop) {
    parts.push(buildCropFilter(clip.crop));
  }

  parts.push(
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease`,
    `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black`,
    `setsar=1`
  );

  if (clip.kenBurns.enabled) {
    parts.push(buildKenBurnsFilter(clip.kenBurns, targetW, targetH, clipTimelineDuration(clip)));
  }

  parts.push(`fps=30`);

  return `[${inputIndex}:v]${parts.join(",")}[${label}]`;
}

function buildClipAudioFilter(
  clip: EditorClip,
  inputIndex: number,
  label: string,
  sourceHasAudio: boolean
): string {
  const dur = clipTimelineDuration(clip);
  if (!sourceHasAudio) {
    // Generate matched silent stereo audio for sources lacking an audio stream
    return `anullsrc=r=44100:cl=stereo,atrim=duration=${dur.toFixed(3)}[${label}]`;
  }

  const parts: string[] = [
    `atrim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)}`,
    `asetpts=PTS-STARTPTS`,
  ];
  const speed = Math.min(4, Math.max(0.25, clip.speed));
  if (speed !== 1) parts.push(buildAtempoFilter(speed));
  const effectiveVolume = clip.muted ? 0 : clip.volumePercent;
  if (effectiveVolume !== 100) parts.push(buildVolumeFilter(effectiveVolume));
  return `[${inputIndex}:a]${parts.join(",")}[${label}]`;
}

function buildExtraAudioFilter(track: AudioTrack, inputIndex: number, label: string): string {
  const parts: string[] = [
    `atrim=start=${track.trimStart.toFixed(3)}:end=${track.trimEnd.toFixed(3)}`,
    `asetpts=PTS-STARTPTS`,
  ];
  const effectiveVolume = track.muted ? 0 : track.volumePercent;
  parts.push(buildVolumeFilter(effectiveVolume));
  const trackDuration = track.trimEnd - track.trimStart;
  if (track.fadeInSeconds > 0) parts.push(`afade=t=in:st=0:d=${track.fadeInSeconds.toFixed(2)}`);
  if (track.fadeOutSeconds > 0) {
    const fadeStart = Math.max(0, trackDuration - track.fadeOutSeconds);
    parts.push(`afade=t=out:st=${fadeStart.toFixed(2)}:d=${track.fadeOutSeconds.toFixed(2)}`);
  }
  const delayMs = Math.round(track.timelineStart * 1000);
  parts.push(`adelay=${delayMs}|${delayMs}`);
  return `[${inputIndex}:a]${parts.join(",")}[${label}]`;
}

export async function exportEditorTimeline(
  clips: EditorClip[],
  mediaItems: MediaBinItem[],
  ffmpeg: FFmpegBridge,
  dimensions: { width: number; height: number },
  onProgress?: ExportProgressCallback,
  audioTracks: AudioTrack[] = [],
  textOverlays: TextOverlay[] = [],
  imageOverlays: ImageOverlay[] = []
): Promise<Blob> {
  if (clips.length === 0) throw new Error("Timeline is empty.");

  await ffmpeg.load();
  onProgress?.("Loading video sources into engine...");

  const usedSourceIds = Array.from(new Set(clips.map((c) => c.sourceId)));
  const sourceInputIndex = new Map<string, number>();
  const sourceInputNames = new Map<string, string>();
  const sourceHasAudio = new Map<string, boolean>();

  for (let i = 0; i < usedSourceIds.length; i++) {
    const sourceId = usedSourceIds[i];
    const item = mediaItems.find((m) => m.id === sourceId);
    if (!item) throw new Error(`Missing media source for a clip on the timeline.`);
    const name = `botock_editor_src_${i}.mp4`;
    await ffmpeg.writeFile(name, new Uint8Array(await item.file.arrayBuffer()));
    sourceInputIndex.set(sourceId, i);
    sourceInputNames.set(sourceId, name);
  }

  // Detect which used sources have an audio stream
  let hasAnyAudio = false;
  for (const [sourceId, name] of sourceInputNames) {
    const probeName = `${AUDIO_PROBE_PREFIX}${sourceId}.m4a`;
    try {
      const exit = await ffmpeg.exec(["-y", "-i", name, "-t", "0.1", "-map", "0:a:0", "-c", "copy", probeName]);
      if (exit === 0) {
        sourceHasAudio.set(sourceId, true);
        hasAnyAudio = true;
      } else {
        sourceHasAudio.set(sourceId, false);
      }
    } catch {
      sourceHasAudio.set(sourceId, false);
    }
    try { await ffmpeg.deleteFile(probeName); } catch {}
  }

  const activeAudioTracks = audioTracks.filter((t) => !t.muted || t.volumePercent > 0);
  const trackInputNames: string[] = [];
  for (let i = 0; i < activeAudioTracks.length; i++) {
    const name = `botock_editor_track_${i}.dat`;
    await ffmpeg.writeFile(name, new Uint8Array(await activeAudioTracks[i].file.arrayBuffer()));
    trackInputNames.push(name);
  }

  const imageInputNames: string[] = [];
  for (let i = 0; i < imageOverlays.length; i++) {
    const name = `botock_editor_img_${i}.png`;
    await ffmpeg.writeFile(name, new Uint8Array(await imageOverlays[i].file.arrayBuffer()));
    imageInputNames.push(name);
  }

  let fontLoaded = false;
  if (textOverlays.length > 0) {
    try {
      await ffmpeg.writeFile(FONT_NAME, await getEditorFontBytes());
      fontLoaded = true;
    } catch {
      fontLoaded = false;
    }
  }

  onProgress?.("Building render graph...");

  const targetW = Math.max(2, dimensions.width - (dimensions.width % 2));
  const targetH = Math.max(2, dimensions.height - (dimensions.height % 2));
  const includeAudio = hasAnyAudio || activeAudioTracks.length > 0;

  const filterParts: string[] = [];

  clips.forEach((clip, index) => {
    const inputIdx = sourceInputIndex.get(clip.sourceId)!;
    const clipHasAudio = sourceHasAudio.get(clip.sourceId) || false;
    filterParts.push(buildClipVideoFilter(clip, inputIdx, `v${index}`, targetW, targetH));
    if (includeAudio) {
      filterParts.push(buildClipAudioFilter(clip, inputIdx, `a${index}`, clipHasAudio));
    }
  });

  const usesAnyTransition = clips.some((c) => c.transitionOut !== "none");

  let finalVideoLabel: string;
  let finalAudioLabel: string | null = null;

  if (!usesAnyTransition || clips.length === 1) {
    const concatInputs = clips.map((_, i) => (includeAudio ? `[v${i}][a${i}]` : `[v${i}]`)).join("");
    filterParts.push(
      includeAudio
        ? `${concatInputs}concat=n=${clips.length}:v=1:a=1[vconcat][aconcat]`
        : `${concatInputs}concat=n=${clips.length}:v=1:a=0[vconcat]`
    );
    finalVideoLabel = "vconcat";
    if (includeAudio) finalAudioLabel = "aconcat";
  } else {
    let currentVLabel = "v0";
    let currentALabel = includeAudio ? "a0" : null;
    let currentDuration = clipTimelineDuration(clips[0]);

    for (let i = 1; i < clips.length; i++) {
      const prevClip = clips[i - 1];
      const isRealTransition = prevClip.transitionOut !== "none";
      const transDur = isRealTransition
        ? Math.min(prevClip.transitionDuration, currentDuration * 0.9, clipTimelineDuration(clips[i]) * 0.9)
        : 0.05;
      const xfadeType = isRealTransition
        ? XFADE_MAP[prevClip.transitionOut as Exclude<EditorClip["transitionOut"], "none">]
        : "fade";
      const offset = Math.max(0, currentDuration - transDur);

      const outV = `vx${i}`;
      filterParts.push(
        `[${currentVLabel}][v${i}]xfade=transition=${xfadeType}:duration=${transDur.toFixed(3)}:offset=${offset.toFixed(3)}[${outV}]`
      );
      currentVLabel = outV;

      if (includeAudio && currentALabel) {
        const outA = `ax${i}`;
        filterParts.push(`[${currentALabel}][a${i}]acrossfade=d=${transDur.toFixed(3)}[${outA}]`);
        currentALabel = outA;
      }

      currentDuration = currentDuration + clipTimelineDuration(clips[i]) - transDur;
    }

    finalVideoLabel = currentVLabel;
    finalAudioLabel = currentALabel;
  }

  // Burn in captions
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

  // Composite image overlays (stickers/logos/watermarks) on top
  const imageInputBase = usedSourceIds.length + trackInputNames.length;
  imageOverlays.forEach((overlay, i) => {
    const inputIdx = imageInputBase + i;
    const scaledLabel = `img${i}`;
    const widthPx = Math.max(2, Math.round((overlay.widthPercent / 100) * targetW));
    filterParts.push(`[${inputIdx}:v]${buildImageOverlayScaleFilter(widthPx, overlay.opacity)}[${scaledLabel}]`);

    const xPx = Math.round((overlay.xPercent / 100) * targetW);
    const yPx = Math.round((overlay.yPercent / 100) * targetH);
    const inLabel = finalVideoLabel;
    const outLabel = `vimg${i}`;
    filterParts.push(`[${inLabel}][${scaledLabel}]${buildImageOverlayCompositeFilter(xPx, yPx, overlay.start, overlay.end)}[${outLabel}]`);
    finalVideoLabel = outLabel;
  });

  // Mix in extra music/sfx tracks
  if (activeAudioTracks.length > 0) {
    const extraLabels: string[] = [];
    activeAudioTracks.forEach((track, i) => {
      const inputIndex = usedSourceIds.length + i;
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

  const inputArgs: string[] = [];
  usedSourceIds.forEach((sourceId) => inputArgs.push("-i", sourceInputNames.get(sourceId)!));
  trackInputNames.forEach((name) => inputArgs.push("-i", name));
  imageInputNames.forEach((name) => inputArgs.push("-loop", "1", "-framerate", "30", "-i", name));

  // ✅ OPTIMIZED: Use -preset ultrafast for snappy browser WASM render speeds
  const args = [
    "-y",
    ...inputArgs,
    "-filter_complex", filterComplex,
    "-map", `[${finalVideoLabel}]`,
    ...(finalAudioLabel ? ["-map", `[${finalAudioLabel}]`, "-c:a", "aac", "-b:a", "128k"] : ["-an"]),
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "22",
    "-movflags", "+faststart",
    OUTPUT_NAME,
  ];

  try {
    onProgress?.("Rendering final video...");
    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) throw new Error(`Export failed. FFmpeg exit code: ${exitCode}`);

    const outputBytes = await ffmpeg.readFile(OUTPUT_NAME);
    const blob = new Blob([outputBytes as unknown as BlobPart], { type: "video/mp4" });
    return blob;
  } finally {
    for (const name of sourceInputNames.values()) { try { await ffmpeg.deleteFile(name); } catch {} }
    for (const name of trackInputNames) { try { await ffmpeg.deleteFile(name); } catch {} }
    for (const name of imageInputNames) { try { await ffmpeg.deleteFile(name); } catch {} }
    if (fontLoaded) { try { await ffmpeg.deleteFile(FONT_NAME); } catch {} }
    try { await ffmpeg.deleteFile(OUTPUT_NAME); } catch {}
  }
}