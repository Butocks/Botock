/**
 * Shared Formatting Utilities for Botock Platform
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTime(seconds: number, includeMs: boolean = false): string {
  if (isNaN(seconds) || seconds < 0) {
    return includeMs ? "00:00.000" : "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  if (includeMs) {
    const ms = Math.floor((seconds % 1) * 1000);
    return `${formattedMins}:${formattedSecs}.${ms.toString().padStart(3, "0")}`;
  }

  return `${formattedMins}:${formattedSecs}`;
}

export default {
  formatBytes,
  formatTime,
};