"use client";

import { EditorClip, EditorProject } from "./editorTypes";
import { EditorInputFile, EditorFFmpegRunOptions } from "./editorFFmpeg";

const FILTERS: Record<string, string | null> = {
  none: null,
  cinematic: "eq=contrast=1.12:saturation=1.18:brightness=-0.02",
  bw: "hue=s=0,eq=contrast=1.08",
  warm: "colorbalance=rs=.08:gs=.02:bs=-.06,eq=saturation=1.12:brightness=.02",
  cool: "colorbalance=rs=-.04:gs=.01:bs=.08,eq=saturation=.96:brightness=.01",
  vivid: "eq=contrast=1.12:saturation=1.35",
};

const escapeFilter = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");

function outputSize(aspect: EditorProject["settings"]["aspectRatio"], preset: "1080p" | "720p" | "source") {
  if (preset === "source") return null;
  const long = preset === "1080p" ? 1080 : 720;
  if (aspect === "16:9") return `${Math.round((long * 16 / 9) / 2) * 2}:${long}`;
  if (aspect === "9:16") return `${long}:${Math.round((long * 16 / 9) / 2) * 2}`;
  if (aspect === "1:1") return `${long}:${long}`;
  return `${Math.round((long * 4 / 5) / 2) * 2}:${long}`;
}

function atempoChain(speed: number) {
  const filters: string[] = [];
  let remaining = Math.max(0.25, Math.min(4, speed));
  while (remaining > 2.000001) {
    filters.push("atempo=2");
    remaining /= 2;
  }
  while (remaining < 0.499999) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining.toFixed(4)}`);
  return filters.join(",");
}

function commonVideoFilters(project: EditorProject, preset: "1080p" | "720p" | "source") {
  const filters: string[] = [];
  const grade = FILTERS[project.settings.filter];
  if (grade) filters.push(grade);

  if (project.settings.brightness || project.settings.contrast || project.settings.saturation) {
    filters.push(
      `eq=brightness=${project.settings.brightness.toFixed(3)}:contrast=${(1 + project.settings.contrast).toFixed(3)}:saturation=${(1 + project.settings.saturation).toFixed(3)}`
    );
  }

  const rotation = ((project.settings.rotation % 360) + 360) % 360;
  if (rotation === 90) filters.push("transpose=1");
  if (rotation === 180) filters.push("hflip,vflip");
  if (rotation === 270) filters.push("transpose=2");

  const size = outputSize(project.settings.aspectRatio, preset);
  if (size) {
    const [w, h] = size.split(":");
    filters.push(`scale=${w}:${h}:force_original_aspect_ratio=decrease`);
    filters.push(`pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=${escapeFilter(project.settings.background)}`);
  }

  if (project.settings.zoom !== 1) {
    const z = Math.max(0.5, Math.min(3, project.settings.zoom));
    filters.push(`scale=iw*${z}:ih*${z},crop=iw/${z}:ih/${z}`);
  }

  return filters;
}

function clipInputName(clip: EditorClip, index: number) {
  const ext = clip.name.match(/\.[a-z0-9]+$/i)?.[0] || ".bin";
  return `editor_input_${index}${ext}`;
}

function assertRenderableClip(clip: EditorClip) {
  if (clip.type !== "video") throw new Error(`"${clip.name}" is not a video clip yet. Image/audio timeline rendering is Phase 2B.`);
  if (!clip.sourceFile || !(clip.sourceFile instanceof Blob)) {
    throw new Error(`"${clip.name}" has no local source file. Re-import that clip before exporting.`);
  }
  if (clip.sourceEnd <= clip.sourceStart) throw new Error(`"${clip.name}" has an invalid trim range.`);
}

export async function exportProject(
  project: EditorProject,
  preset: "1080p" | "720p" | "source",
  runMulti: (options: EditorFFmpegRunOptions) => Promise<Blob>
): Promise<Blob> {
  const clips = project.tracks
    .filter((track) => track.kind === "video" && !track.muted)
    .flatMap((track) => track.clips)
    .sort((a, b) => a.timelineStart - b.timelineStart);

  if (!clips.length) throw new Error("There are no video clips available to export.");
  clips.forEach(assertRenderableClip);

  const audioMode = clips.every((clip) => clip.hasAudio === true)
    ? "audio"
    : clips.every((clip) => clip.hasAudio === false)
      ? "silent"
      : "unknown";

  if (audioMode === "unknown") {
    throw new Error("Some clips contain audio and others are silent. Re-import the clips so Botock can detect their audio tracks before exporting this mixed sequence.");
  }

  const inputs: EditorInputFile[] = clips.map((clip, index) => ({
    name: clipInputName(clip, index),
    data: clip.sourceFile!,
  }));

  const args: string[] = ["-y"];
  clips.forEach((clip, index) => {
    args.push(
      "-ss", Math.max(0, clip.sourceStart).toFixed(3),
      "-t", Math.max(0.05, clip.sourceEnd - clip.sourceStart).toFixed(3),
      "-i", inputs[index].name,
    );
  });

  const speed = Math.max(0.25, Math.min(4, project.settings.speed));
  const videoFilters = commonVideoFilters(project, preset);
  const graph: string[] = [];

  clips.forEach((clip, index) => {
    const vf = ["setpts=PTS/" + speed.toFixed(4), ...videoFilters].join(",");
    graph.push(`[${index}:v]${vf}[v${index}]`);

    if (audioMode === "audio") {
      const af = [
        "aresample=async=1",
        atempoChain(speed),
        `volume=${project.settings.muted ? 0 : project.settings.volume.toFixed(3)}`,
      ].join(",");
      graph.push(`[${index}:a]${af}[a${index}]`);
    }
  });

  const concatInputs = clips.map((_, i) => audioMode === "audio" ? `[v${i}][a${i}]` : `[v${i}]`).join("");
  graph.push(`${concatInputs}concat=n=${clips.length}:v=1:a=${audioMode === "audio" ? 1 : 0}[vout]${audioMode === "audio" ? "[aout]" : ""}`);

  args.push("-filter_complex", graph.join(";"), "-map", "[vout]");

  if (audioMode === "audio" && !project.settings.muted) {
    args.push("-map", "[aout]");
  }

  args.push(
    "-r", "30",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", preset === "1080p" ? "21" : preset === "720p" ? "23" : "20",
    "-pix_fmt", "yuv420p",
  );

  if (audioMode === "audio" && !project.settings.muted) {
    args.push("-c:a", "aac", "-b:a", "160k");
  }

  args.push("-movflags", "+faststart", "-f", "mp4", "output.mp4");

  return runMulti({
    inputFiles: inputs,
    outputFileName: "output.mp4",
    outputMimeType: "video/mp4",
    args,
  });
}
