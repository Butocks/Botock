import {
  buildAtempoFilter,
  buildColorFilter,
  buildCropFilter,
  buildTransformFilters,
  buildVolumeFilter,
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
): string {
  const speedFactor = (1 / Math.min(4, Math.max(0.25, clip.speed))).toFixed(4);
  const trim = `trim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)},setpts=${speedFactor}*PTS-STARTPTS`;

  let filter = `[${inputIndex}:v]${trim}`;
  if (clip.crop) filter += `,${buildCropFilter(clip.crop)}`;
  if (clip.filters) filter += `,${buildColorFilter(clip.filters.brightness, clip.filters.contrast, clip.filters.saturation)}`;
  filter += `,scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2,setsar=1`;

  return `${filter}[${label}]`;
}

function buildClipAudioFilter(clip: TimelineClip, inputIndex: number, label: string, hasAudio: boolean): string {
  const speed = Math.min(4, Math.max(0.25, clip.speed));
  const atempo = buildAtempoFilter(speed);
  const muted = clip.audio?.muted ?? false;
  const volPct = clip.audio?.volumePercent ?? 100;

  if (!hasAudio || muted || volPct === 0) {
    const dur = (clip.sourceEnd - clip.sourceStart) / speed;
    return `anullsrc=r=44100:cl=stereo,atrim=end=${dur.toFixed(3)}[${label}]`;
  }

  const trim = `atrim=start=${clip.sourceStart.toFixed(3)}:end=${clip.sourceEnd.toFixed(3)},asetpts=PTS-STARTPTS`;
  return `[${inputIndex}:a]${trim},${atempo},${buildVolumeFilter(volPct)}[${label}]`;
}

export async function exportEditorProject(
  project: EditorProject,
  mediaBin: { getItem: (id: string) => MediaBinItem | undefined },
  ffmpeg: FFmpegBridge,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  onProgress?.("Loading FFmpeg engine...");
  await ffmpeg.load();

  // For Phase 1, we just concat all video track clips in order (flattening tracks basically)
  // Proper multitrack compositing is for Phase 2/3.
  const allVideoClips: TimelineClip[] = [];
  project.tracks.filter(t => t.type === "video").forEach(t => allVideoClips.push(...t.clips));
  allVideoClips.sort((a, b) => a.timelineStart - b.timelineStart);

  if (allVideoClips.length === 0) throw new Error("No video clips to export.");

  onProgress?.("Writing source files to FFmpeg VFS...");
  const usedSourceIds = Array.from(new Set(allVideoClips.map(c => c.sourceId)));
  const sourceInputIndex = new Map<string, number>();
  const sourceInputNames = new Map<string, string>();
  const sourceHasAudio = new Map<string, boolean>();

  for (let i = 0; i < usedSourceIds.length; i++) {
    const sourceId = usedSourceIds[i];
    const item = mediaBin.getItem(sourceId);
    if (!item) throw new Error(`Missing media for clip`);

    const name = `botock_editor_src_${i}.mp4`;
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

  allVideoClips.forEach((clip, index) => {
    const inputIdx = sourceInputIndex.get(clip.sourceId)!;
    const hasAudio = sourceHasAudio.get(clip.sourceId) || false;
    filterParts.push(buildClipVideoFilter(clip, inputIdx, `v${index}`, targetW, targetH));
    filterParts.push(buildClipAudioFilter(clip, inputIdx, `a${index}`, hasAudio));
  });

  const concatInputs = allVideoClips.map((_, i) => `[v${i}][a${i}]`).join("");
  filterParts.push(`${concatInputs}concat=n=${allVideoClips.length}:v=1:a=1[vconcat][aconcat]`);

  const filterComplex = filterParts.join(";");

  const inputArgs: string[] = [];
  usedSourceIds.forEach(id => inputArgs.push("-i", sourceInputNames.get(id)!));

  const args = [
    "-y",
    ...inputArgs,
    "-filter_complex", filterComplex,
    "-map", "[vconcat]",
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
  }
}
