import {
  buildAtempoFilter,
  buildColorFilter,
  buildCropFilter,
  buildTransformFilters,
  buildVolumeFilter,
  buildDrawtextFilter
} from "./ffmpegAdapters";
import { EditorProject, TimelineClip, MediaBinItem } from "./types";

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

function buildClipVideoFilter(
  clip: TimelineClip,
  inputIndex: number,
  label: string,
  targetW: number,
  targetH: number
): { filterStr: string, overlayX: string, overlayY: string } {
  const speedFactor = (1 / Math.min(4, Math.max(0.25, clip.speed))).toFixed(4);
  let trim = `trim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)},setpts=(${speedFactor}*(PTS-STARTPTS))+${clip.timelineStart.toFixed(3)}/TB`;
  
  if (clip.type === "image") {
     trim = `loop=loop=-1:size=1,${trim}`;
  }
  
  const filterParts = [`[${inputIndex}:v]${trim}`];

  // Convert to RGBA early for transparent processing
  filterParts.push(`format=rgba`);

  if (clip.chromaKey && clip.chromaKey.enabled) {
    const c = clip.chromaKey;
    filterParts.push(`colorkey=${c.color}:${c.similarity}:${c.blend}`);
  }

  if (clip.crop) {
    filterParts.push(buildCropFilter(clip.crop));
  }

  if (clip.filters) {
    filterParts.push(buildColorFilter(clip.filters.brightness, clip.filters.contrast, clip.filters.saturation));
  }

  const t_rel = `(t-${clip.timelineStart.toFixed(3)})`;
  const prog = `min(1,max(0,${t_rel}/${clip.duration.toFixed(3)}))`;

  let animScale = `1`;
  let animPanX = `0`;
  let animOpacity = `1`;

  if (clip.effects && clip.effects.length > 0) {
    const effect = clip.effects[0];
    const eff = effect.type;
    const dur = effect.duration || 1.0;
    // Scale progress by dur (if dur is 2, effect finishes when t_rel reaches 2)
    const e_prog = `min(1,max(0,${t_rel}/${dur.toFixed(3)}))`;
    
    if (eff === "zoom-in") animScale = `(1+0.5*${e_prog})`;
    else if (eff === "zoom-out") animScale = `(1.5-0.5*${e_prog})`;
    else if (eff === "pan-left") animPanX = `(${targetW}*0.1*${e_prog})`;
    else if (eff === "pan-right") animPanX = `(-${targetW}*0.1*${e_prog})`;
    else if (eff === "fade-in") animOpacity = `min(1,max(0,${t_rel}/${dur.toFixed(3)}))`;
    else if (eff === "fade-out") {
        const out_start = Math.max(0, clip.duration - dur);
        const out_rel = `(t-${(clip.timelineStart + out_start).toFixed(3)})`;
        animOpacity = `max(0,min(1,1-${out_rel}/${dur.toFixed(3)}))`;
    }
  }

  const tForm = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
  
  filterParts.push(`scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease`);

  const finalScaleX = (tForm.width / 100) * tForm.scaleX;
  const finalScaleY = (tForm.height / 100) * tForm.scaleY;
  
  if (finalScaleX !== 1 || finalScaleY !== 1 || animScale !== `1`) {
     filterParts.push(`scale=w='iw*${finalScaleX.toFixed(4)}*${animScale}':h='ih*${finalScaleY.toFixed(4)}*${animScale}':eval=frame`);
  }

  if (tForm.rotation !== 0) {
     filterParts.push(`rotate=a=${tForm.rotation}*PI/180:c=none:ow='hypot(iw,ih)':oh='hypot(iw,ih)'`);
  }

  const baseOpacity = tForm.opacity / 100;
  if (baseOpacity < 1 || animOpacity !== `1`) {
     filterParts.push(`colorchannelmixer=aa='${baseOpacity}*${animOpacity}'`);
  }

  filterParts.push(`setsar=1`);
  
  const filterStr = `${filterParts.join(",")}[${label}]`;

  const overlayX = `(${targetW}*${(tForm.x / 100).toFixed(4)} - w/2 + ${animPanX})`;
  const overlayY = `(${targetH}*${(tForm.y / 100).toFixed(4)} - h/2)`;

  return { filterStr, overlayX, overlayY };
}

function buildClipAudioFilter(clip: TimelineClip, inputIndex: number, label: string, hasAudio: boolean): string {
  const speed = Math.min(4, Math.max(0.25, clip.speed));
  const atempo = buildAtempoFilter(speed);
  const muted = clip.audio?.muted ?? false;
  const volPct = clip.audio?.volumePercent ?? 100;
  const fadeIn = clip.audio?.fadeInSeconds ?? 0;
  const fadeOut = clip.audio?.fadeOutSeconds ?? 0;
  
  if (!hasAudio || muted || volPct === 0) {
    const dur = (clip.sourceEnd - clip.sourceStart) / speed;
    return `anullsrc=r=44100:cl=stereo,atrim=end=${dur.toFixed(3)},adelay=${Math.round(clip.timelineStart * 1000)}|${Math.round(clip.timelineStart * 1000)}[${label}]`;
  }
  
  let fadeStr = "";
  if (fadeIn > 0) fadeStr += `,afade=t=in:st=0:d=${fadeIn.toFixed(3)}`;
  if (fadeOut > 0) {
    const dur = (clip.sourceEnd - clip.sourceStart) / speed;
    const outStart = Math.max(0, dur - fadeOut);
    fadeStr += `,afade=t=out:st=${outStart.toFixed(3)}:d=${fadeOut.toFixed(3)}`;
  }
  
  const trim = `atrim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)},asetpts=PTS-STARTPTS`;
  return `[${inputIndex}:a]${trim},${atempo},${buildVolumeFilter(volPct)}${fadeStr},adelay=${Math.round(clip.timelineStart * 1000)}|${Math.round(clip.timelineStart * 1000)}[${label}]`;
}

export async function exportEditorProject(
  project: EditorProject,
  mediaBin: { getItem: (id: string) => MediaBinItem | undefined },
  ffmpeg: FFmpegBridge,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  onProgress?.("Loading FFmpeg engine...");
  await ffmpeg.load();

  const allVideoClips: (TimelineClip & { trackMuted: boolean, trackHidden: boolean })[] = [];
  const allAudioClips: (TimelineClip & { trackMuted: boolean, trackHidden: boolean })[] = [];
  
  project.tracks.forEach(t => {
      const isHidden = t.hidden ?? false;
      const isMuted = t.muted ?? false;
      t.clips.forEach(c => {
         const exportClip = { ...c, trackMuted: isMuted, trackHidden: isHidden };
         if (c.type === "video" || c.type === "image") allVideoClips.push(exportClip);
         if (c.type === "audio") allAudioClips.push(exportClip);
      });
  });
  
  // Filter out hidden video clips
  const visibleVideoClips = allVideoClips.filter(c => !c.trackHidden);
  visibleVideoClips.sort((a, b) => a.timelineStart - b.timelineStart);
  
  const allAudioSources = [...allVideoClips, ...allAudioClips].filter(c => !c.trackMuted);
  allAudioSources.sort((a, b) => a.timelineStart - b.timelineStart);

  const textClips: (TimelineClip & { trackHidden: boolean })[] = [];
  project.tracks.forEach(t => {
      t.clips.forEach(c => {
         if (c.type === "text") textClips.push({ ...c, trackHidden: t.hidden ?? false });
      });
  });
  const visibleTextClips = textClips.filter(c => !c.trackHidden);

  if (visibleVideoClips.length === 0 && allAudioSources.length === 0 && visibleTextClips.length === 0) throw new Error("No media clips to export.");

  if (visibleTextClips.length > 0) {
    onProgress?.("Downloading fonts for text layers...");
    try {
       const res = await fetch("https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf");
       const fontBuffer = await res.arrayBuffer();
       await ffmpeg.writeFile("font.ttf", new Uint8Array(fontBuffer));
    } catch(err) {
       console.warn("Failed to load font", err);
    }
  }

  onProgress?.("Writing source files to FFmpeg VFS...");
  const usedSourceIds = Array.from(new Set([...visibleVideoClips, ...allAudioSources].map(c => c.sourceId)));
  const sourceInputIndex = new Map<string, number>();
  const sourceInputNames = new Map<string, string>();
  const sourceHasAudio = new Map<string, boolean>();

  for (let i = 0; i < usedSourceIds.length; i++) {
    const sourceId = usedSourceIds[i];
    const item = mediaBin.getItem(sourceId);
    if (!item) throw new Error(`Missing media for clip`);
    
        const ext = item.file.name.split('.').pop() || 'mp4';
    const name = `botock_editor_src_${i}.${ext}`;
    await ffmpeg.writeFile(name, new Uint8Array(await item.file.arrayBuffer()));
    sourceInputIndex.set(sourceId, i);
    sourceInputNames.set(sourceId, name);

    const probeName = `${AUDIO_PROBE_PREFIX}${sourceId}.m4a`;
    try {
      const exit = await ffmpeg.exec(["-y", "-i", name, "-t", "0.1", "-map", "0:a:0", "-c", "copy", probeName]);
      sourceHasAudio.set(sourceId, exit === 0);
    } catch {
      sourceHasAudio.set(sourceId, false);
    }
    try { await ffmpeg.deleteFile(probeName); } catch {}
  }

  const targetW = project.width;
  const targetH = project.height;
  const filterParts: string[] = [];

  let maxDuration = 0;
  project.tracks.forEach(t => t.clips.forEach(c => {
    if (c.timelineStart + c.duration > maxDuration) maxDuration = c.timelineStart + c.duration;
  }));
  if (maxDuration === 0) maxDuration = 5;

  filterParts.push(`color=c=black:s=${targetW}x${targetH}:d=${maxDuration}:r=${project.fps}[bg0]`);
  filterParts.push(`anullsrc=r=44100:cl=stereo:d=${maxDuration}[abg0]`);

  let currentV = "[bg0]";

  visibleVideoClips.forEach((clip, index) => {
    const inputIdx = sourceInputIndex.get(clip.sourceId)!;
    const res = buildClipVideoFilter(clip, inputIdx, `v${index}`, targetW, targetH);
    filterParts.push(res.filterStr);
    filterParts.push(`${currentV}[v${index}]overlay=x='${res.overlayX}':y='${res.overlayY}':eof_action=pass:enable='between(t,${clip.timelineStart.toFixed(3)},${(clip.timelineStart + clip.duration).toFixed(3)})'[bg${index + 1}]`);
    currentV = `[bg${index + 1}]`;
  });

  allAudioSources.forEach((clip, index) => {
    const inputIdx = sourceInputIndex.get(clip.sourceId)!;
    const hasAudio = sourceHasAudio.get(clip.sourceId) || false;
    filterParts.push(buildClipAudioFilter(clip, inputIdx, `a${index}`, hasAudio));
  });

  if (allAudioSources.length > 0) {
    const audioInputs = allAudioSources.map((_, i) => `[a${i}]`).join("");
    // Use normalize=0 so volume isn't reduced, dropout_transition=0 to keep it from fading
    filterParts.push(`[abg0]${audioInputs}amix=inputs=${allAudioSources.length + 1}:duration=first:dropout_transition=0:normalize=0[aconcat]`);
  } else {
    filterParts.push(`[abg0]acopy[aconcat]`);
  }
  
  let finalVideoOutput = currentV;
  
  visibleTextClips.forEach((tClip, index) => {
     const nextOutput = `[vtext${index}]`;
     const drawtext = buildDrawtextFilter({
        text: tClip.text || "Text",
        start: tClip.timelineStart,
        end: tClip.timelineStart + tClip.duration,
        xPercent: tClip.transform?.x ?? 50,
        yPercent: tClip.transform?.y ?? 50,
        fontSizePercent: tClip.fontSizePercent || 50,
        color: (tClip.color || "#ffffff").replace("#", "0x"),
        backgroundOpacity: 0,
        videoHeight: targetH,
        fontFile: "font.ttf"
     });
     filterParts.push(`${finalVideoOutput}${drawtext}${nextOutput}`);
     finalVideoOutput = nextOutput;
  });

  const filterComplex = filterParts.join(";");

  const inputArgs: string[] = [];
  usedSourceIds.forEach(id => inputArgs.push("-i", sourceInputNames.get(id)!));

  const args = [
    "-y",
    ...inputArgs,
    "-filter_complex", filterComplex,
    "-map", finalVideoOutput,
    "-map", "[aconcat]",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "22",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    OUTPUT_NAME,
  ];

  try {
    onProgress?.("Rendering final video...");
    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) throw new Error(`Export failed. FFmpeg exit code: ${exitCode}`);
    const outputBytes = await ffmpeg.readFile(OUTPUT_NAME);
    return new Blob([outputBytes as unknown as BlobPart], { type: "video/mp4" });
  } finally {
    for (const name of sourceInputNames.values()) { try { await ffmpeg.deleteFile(name); } catch {} }
    try { await ffmpeg.deleteFile(OUTPUT_NAME); } catch {}
    try { await ffmpeg.deleteFile("font.ttf"); } catch {}
  }
}
