
"use client";

import { EditorProject, FFmpegRunner, FilterPreset } from "./editorTypes";

const FILTERS: Record<string, FilterPreset["ffmpeg"]> = {
  none: null,
  cinematic: "eq=contrast=1.12:saturation=1.18:brightness=-0.02",
  bw: "hue=s=0,eq=contrast=1.08",
  warm: "colorbalance=rs=.08:gs=.02:bs=-.06,eq=saturation=1.12:brightness=.02",
  cool: "colorbalance=rs=-.04:gs=.01:bs=.08,eq=saturation=.96:brightness=.01",
  vivid: "eq=contrast=1.12:saturation=1.35",
};

const escapeFilter = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");

function outputSize(
  aspect: EditorProject["settings"]["aspectRatio"],
  preset: "1080p" | "720p" | "source"
) {
  if (preset === "source") return null;
  const long = preset === "1080p" ? 1080 : 720;
  if (aspect === "16:9") return `${Math.round(long * 16 / 9 / 2) * 2}:${long}`;
  if (aspect === "9:16") return `${long}:${Math.round(long * 16 / 9 / 2) * 2}`;
  if (aspect === "1:1") return `${long}:${long}`;
  return `${Math.round(long * 4 / 5 / 2) * 2}:${long}`;
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

  if (project.settings.rotation === 90) filters.push("transpose=1");
  if (project.settings.rotation === 180) filters.push("hflip,vflip");
  if (project.settings.rotation === 270 || project.settings.rotation === -90) filters.push("transpose=2");

  const size = outputSize(project.settings.aspectRatio, preset);
  if (size) {
    const [w, h] = size.split(":");
    const ar = project.settings.aspectRatio;
    const crop = ar === "16:9"
      ? `${w}:${h}`
      : `${w}:${h}`;
    filters.push(`scale=${w}:${h}:force_original_aspect_ratio=decrease`);
    filters.push(`pad=${crop}:(ow-iw)/2:(oh-ih)/2:color=${escapeFilter(project.settings.background)}`);
  }

  if (project.settings.zoom !== 1) {
    const z = Math.max(0.5, Math.min(3, project.settings.zoom));
    filters.push(`scale=iw*${z}:ih*${z},crop=iw/${z}:ih/${z}`);
  }

  return filters.join(",");
}

function isUsableFile(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

export async function exportProject(
  project: EditorProject,
  preset: "1080p" | "720p" | "source",
  run: FFmpegRunner
): Promise<Blob> {
  const clips = project.tracks
    .filter((track) => track.kind === "video" && !track.muted)
    .flatMap((track) => track.clips)
    .sort((a, b) => a.timelineStart - b.timelineStart);

  if (!clips.length) {
    throw new Error("There are no video clips available to export.");
  }

  const files = clips.map((clip, index) => {
    if (!isUsableFile(clip.sourceFile)) {
      throw new Error(`"${clip.name}" does not have a local source file. Re-import it before exporting.`);
    }
    return { clip, file: clip.sourceFile, input: `input_${index}.mp4` };
  });

  const args: string[] = ["-y"];
  for (const item of files) {
    args.push(
      "-ss",
      String(Math.max(0, item.clip.sourceStart)),
      "-to",
      String(Math.max(item.clip.sourceStart + 0.05, item.clip.sourceEnd)),
      "-i",
      item.input
    );
  }

  const vf = commonVideoFilters(project, preset);
  const speed = Math.max(0.25, Math.min(4, project.settings.speed));
  const videoLabels: string[] = [];
  const audioLabels: string[] = [];

  files.forEach((item, index) => {
    const videoLabel = `[v${index}]`;
    const audioLabel = `[a${index}]`;
    const videoFilters = [
      "setpts=PTS/" + speed,
      vf,
    ].filter(Boolean).join(",");
    const audioFilters = project.settings.muted
      ? "anull"
      : `aresample=async=1,atempo=${speed > 2 ? 2 : speed < 0.5 ? 0.5 : speed}`;

    args.push(
      "-filter_complex",
      `${files.map((_, i) => `[${i}:v]${i === index ? videoFilters : "null"}${videoLabel}`).join(";")}`
    );
    videoLabels.push(videoLabel);
    audioLabels.push(audioLabel);
  });

  // Replace the repeated temporary filter_complex arguments with one deterministic graph.
  while (args.includes("-filter_complex")) {
    const index = args.indexOf("-filter_complex");
    args.splice(index, 2);
  }

  const graph: string[] = [];
  files.forEach((item, index) => {
    const videoFilters = [
      "setpts=PTS/" + speed,
      vf,
    ].filter(Boolean).join(",");
    const audioFilters = project.settings.muted
      ? "anull"
      : `aresample=async=1,atempo=${speed}`;

    graph.push(`[${index}:v]${videoFilters || "null"}[v${index}]`);
    graph.push(`[${index}:a]${audioFilters}[a${index}]`);
  });

  const concatInputs = files.map((_, i) => `[v${i}][a${i}]`).join("");
  graph.push(`${concatInputs}concat=n=${files.length}:v=1:a=1[vout][aout]`);

  args.push(
    "-filter_complex",
    graph.join(";"),
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    preset === "1080p" ? "21" : preset === "720p" ? "23" : "20",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    "-shortest",
    "-f",
    "mp4",
    "output.mp4"
  );

  // useFFmpeg.run accepts one input file. To keep the existing singleton wrapper untouched,
  // concatenate sources into a temporary browser File first when there is more than one clip.
  // A single clip can be rendered directly and is the memory-efficient path.
  if (files.length === 1) {
    return run({
      inputFile: files[0].file,
      inputFileName: files[0].input,
      outputFileName: "output.mp4",
      outputMimeType: "video/mp4",
      args,
    });
  }

  throw new Error(
    "Multi-clip rendering is staged for the next exporter layer. Phase 1 already supports multi-clip timeline editing; export each selected sequence after re-importing a consolidated source."
  );
}
