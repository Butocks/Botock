let cachedFontBytes: Uint8Array | null = null;

/** Fetch a permissively-licensed font once and cache it for FFmpeg drawtext. */
export async function getEditorFontBytes(): Promise<Uint8Array> {
  if (cachedFontBytes) return cachedFontBytes;

  const res = await fetch(
    "https://cdn.jsdelivr.net/gh/google/fonts/apache/roboto/Roboto-Bold.ttf"
  );
  if (!res.ok) throw new Error("Failed to load caption font.");
  const buf = await res.arrayBuffer();
  cachedFontBytes = new Uint8Array(buf);
  return cachedFontBytes;
}