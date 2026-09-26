// Reusable FFmpeg filter builders — same logic already used inside
// video-speed, video-filters, video-rotate, video-volume.
// Extracted here so the Video Editor calls the exact same functions
// instead of duplicating filter strings.

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Same chained-atempo logic as video-speed/Client.tsx */
export function buildAtempoFilter(speed: number): string {
  const filters: string[] = [];
  if (speed > 2.0) {
    filters.push(`atempo=2.00`);
    filters.push(`atempo=${(speed / 2.0).toFixed(2)}`);
  } else if (speed < 0.5) {
    filters.push(`atempo=0.50`);
    filters.push(`atempo=${(speed * 2.0).toFixed(2)}`);
  } else {
    filters.push(`atempo=${speed.toFixed(2)}`);
  }
  return filters.join(",");
}

export function buildSpeedFilters(speed: number) {
  const clamped = clamp(speed, 0.25, 4.0);
  return {
    videoFilter: `setpts=${(1 / clamped).toFixed(4)}*PTS`,
    audioFilter: buildAtempoFilter(clamped),
    speed: clamped,
  };
}

/** Same eq filter as video-filters/Client.tsx */
export function buildColorFilter(brightness: number, contrast: number, saturation: number) {
  return `eq=brightness=${brightness.toFixed(2)}:contrast=${contrast.toFixed(2)}:saturation=${saturation.toFixed(2)}`;
}

/** Same transpose/flip logic as video-rotate/Client.tsx */
export function buildTransformFilters(rotation: 0 | 90 | 180 | 270, flipH: boolean, flipV: boolean): string[] {
  const filters: string[] = [];
  if (rotation === 90) filters.push("transpose=1");
  else if (rotation === 180) filters.push("transpose=1,transpose=1");
  else if (rotation === 270) filters.push("transpose=2");
  if (flipH) filters.push("hflip");
  if (flipV) filters.push("vflip");
  return filters;
}

/** Same volume filter as video-volume/Client.tsx */
export function buildVolumeFilter(volumePercent: number) {
  const factor = clamp(volumePercent, 0, 500) / 100;
  return `volume=${factor.toFixed(2)}`;
}



// ── append to existing ffmpegAdapters.ts ──

/** Escapes text for safe use inside an FFmpeg drawtext filter argument. */
export function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\u2019")
    .replace(/\n/g, " ");
}

export function buildDrawtextFilter(params: {
  text: string;
  start: number;
  end: number;
  anchor: "top" | "center" | "bottom";
  fontSizePercent: number;
  color: string;
  backgroundOpacity: number;
  videoHeight: number;
  fontFile: string;
}): string {
  const fontSize = Math.max(10, Math.round((params.fontSizePercent / 100) * params.videoHeight));

  const yExpr =
    params.anchor === "top"
      ? `h*0.08`
      : params.anchor === "bottom"
      ? `h-th-h*0.08`
      : `(h-th)/2`;

  const boxColor = params.backgroundOpacity > 0 ? `black@${params.backgroundOpacity.toFixed(2)}` : "black@0.0";

  return [
    `drawtext=fontfile='${params.fontFile}'`,
    `text='${escapeDrawtext(params.text)}'`,
    `fontsize=${fontSize}`,
    `fontcolor=${params.color}`,
    `box=${params.backgroundOpacity > 0 ? 1 : 0}`,
    `boxcolor=${boxColor}`,
    `boxborderw=12`,
    `x=(w-tw)/2`,
    `y=${yExpr}`,
    `enable='between(t,${params.start.toFixed(2)},${params.end.toFixed(2)})'`,
  ].join(":");
} 