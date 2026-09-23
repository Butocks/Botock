export interface ThumbnailGeneratorOptions {
  videoUrl: string;
  duration: number;
  thumbnailCount?: number;
  width?: number;
  height?: number;
  quality?: number;
}

export async function generateTimelineThumbnails({
  videoUrl,
  duration,
  thumbnailCount = 48,
  width = 160,
  height = 90,
  quality = 0.65,
}: ThumbnailGeneratorOptions): Promise<string[]> {
  // Aapki existing validation
  if (!videoUrl || !Number.isFinite(duration) || duration <= 0) {
    return [];
  }

  const sourceVideo = document.createElement("video");
  sourceVideo.preload = "metadata";
  sourceVideo.muted = true;
  sourceVideo.playsInline = true;
  sourceVideo.src = videoUrl;

  const canvas = document.createElement("canvas");
  // willReadFrequently optimization for better Canvas performance
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [];
  }

  canvas.width = width;
  canvas.height = height;

  try {
    // Wait for video metadata to load
    await new Promise<void>((resolve, reject) => {
      sourceVideo.onloadedmetadata = () => resolve();
      sourceVideo.onerror = () =>
        reject(new Error("Could not load video for thumbnails."));
    });

    // Aapki exact logic: Math.max(8, Math.ceil(videoDuration / 2))
    const count = Math.min(
      thumbnailCount,
      Math.max(8, Math.ceil(duration / 2))
    );

    const generated: string[] = [];

    for (let index = 0; index < count; index++) {
      // Aapki exact time calculation
      const time =
        count === 1
          ? 0
          : (index / (count - 1)) * Math.max(0, duration - 0.01);

      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          sourceVideo.removeEventListener("seeked", onSeeked);
          resolve();
        };

        sourceVideo.addEventListener("seeked", onSeeked);
        sourceVideo.currentTime = time;
      });

      context.fillStyle = "#000";
      context.fillRect(0, 0, canvas.width, canvas.height);

      try {
        context.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
        generated.push(canvas.toDataURL("image/jpeg", quality));
      } catch {
        generated.push("");
      }

      // ⚡ YEH WOH TRICK HAI JO BROWSER KO HANG HONE SE BACHAYEGI
      // Ye UI thread ko thori saans lene deta hai
      await new Promise<void>((resolve) => setTimeout(resolve, 15));
    }

    return generated;
  } finally {
    // Aapki exact cleanup logic
    sourceVideo.pause();
    sourceVideo.removeAttribute("src");
    sourceVideo.load();

    // Memory deallocation
    canvas.width = 0;
    canvas.height = 0;
  }
}