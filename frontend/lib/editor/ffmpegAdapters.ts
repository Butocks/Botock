// Reusable FFmpeg filter builders — same logic already used inside
// video-speed, video-filters, video-rotate, video-volume.
// Extracted here so the Video Editor calls the exact same functions
// instead of duplicating filter strings.

import { CropRect } from "./types";
export type KenBurnsConfig = { direction: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right", startZoom: number, endZoom: number };

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
  xPercent: number;
  yPercent: number;
  fontSizePercent: number;
  color: string;
  backgroundOpacity: number;
  videoHeight: number;
  fontFile: string;
}): string {
  const fontSize = Math.max(10, Math.round((params.fontSizePercent / 100) * params.videoHeight));

  const boxColor = params.backgroundOpacity > 0 ? `black@${params.backgroundOpacity.toFixed(2)}` : "black@0.0";

  return [
    `drawtext=fontfile='${params.fontFile}'`,
    `text='${escapeDrawtext(params.text)}'`,
    `fontsize=${fontSize}`,
    `fontcolor=${params.color}`,
    `box=${params.backgroundOpacity > 0 ? 1 : 0}`,
    `boxcolor=${boxColor}`,
    `boxborderw=12`,
    `x='(w-tw)*${(params.xPercent / 100).toFixed(4)}'`,
    `y='(h-th)*${(params.yPercent / 100).toFixed(4)}'`,
    `enable='between(t,${params.start.toFixed(2)},${params.end.toFixed(2)})'`,
  ].join(":");
}

/** Static crop using normalized (0..1) rect — expressions reference the live frame size,
 * so no numeric probing of the clip's actual resolution is needed. */
export function buildCropFilter(rect: CropRect): string {
  const w = clamp(rect.width, 0.05, 1);
  const h = clamp(rect.height, 0.05, 1);
  const x = clamp(rect.x, 0, 1 - w);
  const y = clamp(rect.y, 0, 1 - h);

  return [
    `crop=w='trunc(iw*${w.toFixed(4)}/2)*2'`,
    `h='trunc(ih*${h.toFixed(4)}/2)*2'`,
    `x='trunc(iw*${x.toFixed(4)}/2)*2'`,
    `y='trunc(ih*${y.toFixed(4)}/2)*2'`,
  ].join(":");
}

const KEN_BURNS_TARGETS: Record<KenBurnsConfig["direction"], [number, number]> = {
  center: [0.5, 0.5],
  "top-left": [0, 0],
  "top-right": [1, 0],
  "bottom-left": [0, 1],
  "bottom-right": [1, 1],
};

/** Time-varying pan/zoom (Ken Burns) applied on a frame already at the target canvas size.
 * `duration` is the clip's post-speed timeline duration in seconds. */
export function buildKenBurnsFilter(config: KenBurnsConfig, targetW: number, targetH: number, duration: number): string {
  const dur = Math.max(0.1, duration);
  const [tx, ty] = KEN_BURNS_TARGETS[config.direction];
  const zStart = clamp(config.startZoom, 1, 3);
  const zEnd = clamp(config.endZoom, 1, 3);

  const zoomExpr = `(${zStart.toFixed(3)}+(${(zEnd - zStart).toFixed(3)})*min(1\\,t/${dur.toFixed(3)}))`;

  const scale = [
    `scale=w='trunc(iw*${zoomExpr}/2)*2'`,
    `h='trunc(ih*${zoomExpr}/2)*2'`,
    `eval=frame`,
  ].join(":");

  const xExpr = `max(0\\,min(in_w-out_w\\,trunc((in_w-out_w)*(0.5+(${tx - 0.5})*min(1\\,t/${dur.toFixed(3)})))))`;
  const yExpr = `max(0\\,min(in_h-out_h\\,trunc((in_h-out_h)*(0.5+(${ty - 0.5})*min(1\\,t/${dur.toFixed(3)})))))`;

  const crop = `crop=w=${targetW}:h=${targetH}:x='${xExpr}':y='${yExpr}'`;

  return `${scale},${crop}`;
}

/** Scales an overlay image to a fixed width (preserving aspect) and optionally applies opacity. */
export function buildImageOverlayScaleFilter(widthPx: number, opacity: number): string {
  const parts = [`scale=${widthPx}:-2`];
  if (opacity < 1) {
    parts.push(`format=rgba`, `colorchannelmixer=aa=${clamp(opacity, 0, 1).toFixed(2)}`);
  }
  return parts.join(",");
}

export function buildImageOverlayCompositeFilter(xPx: number, yPx: number, start: number, end: number): string {
  return `overlay=x=${xPx}:y=${yPx}:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;
}