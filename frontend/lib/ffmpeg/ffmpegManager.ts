import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export type FFmpegProgressCallback = (event: { progress: number; time: number }) => void;
export type FFmpegLogCallback = (event: { type: string; message: string }) => void;

/**
 * High-performance WebAssembly FFmpeg Manager
 * Features:
 * - Persistent browser Cache Storage ('botock-wasm-cache-v1') caching
 * - Idle-time pre-warming (0ms delay upon tool interaction)
 * - Multi-thread Web Worker auto-detection (@ffmpeg/core-mt) when crossOriginIsolated
 * - Stream-copy fast path (-c copy) for instantaneous video trimming
 * - Complete backward compatibility with all Botock video and audio tools
 */
export class FastFFmpegManager {
  private static instance: FastFFmpegManager;
  private ffmpeg: FFmpeg | null = null;
  private loadPromise: Promise<FFmpeg> | null = null;
  private _isLoaded = false;

  private static progressCallbacks: Set<FFmpegProgressCallback> = new Set();
  private static logCallbacks: Set<FFmpegLogCallback> = new Set();

  private readonly CORE_VERSION = "0.12.6";
  private readonly CACHE_NAME = "botock-wasm-cache-v1";

  private constructor() {
    if (typeof window !== "undefined") {
      // Pre-warm WASM during browser idle time so tools launch with 0ms delay
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback(() => {
          this.prewarm().catch(() => {});
        });
      } else {
        setTimeout(() => {
          this.prewarm().catch(() => {});
        }, 2000);
      }
    }
  }

  public static getInstance(): FastFFmpegManager {
    if (!FastFFmpegManager.instance) {
      FastFFmpegManager.instance = new FastFFmpegManager();
    }
    return FastFFmpegManager.instance;
  }

  private static handleProgress = (event: { progress: number; time: number }) => {
    FastFFmpegManager.progressCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Error in FFmpeg progress callback:", err);
      }
    });
  };

  private static handleLog = (event: { type: string; message: string }) => {
    FastFFmpegManager.logCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Error in FFmpeg log callback:", err);
      }
    });
  };

  /**
   * Caches WASM and JS binaries in Cache Storage to eliminate 30MB downloads on subsequent loads.
   */
  private async getCachedBlobUrl(url: string, mimeType: string): Promise<string> {
    if (typeof window === "undefined" || !("caches" in window)) {
      return await toBlobURL(url, mimeType);
    }
    try {
      const cache = await caches.open(this.CACHE_NAME);
      let response = await cache.match(url);
      if (!response) {
        response = await fetch(url, { mode: "cors" });
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      }
      if (response && response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(new Blob([blob], { type: mimeType }));
      }
    } catch {
      // Fallback to standard toBlobURL if Cache API fails
    }
    return await toBlobURL(url, mimeType);
  }

  /**
   * Pre-warms the FFmpeg engine in the background
   */
  public async prewarm(): Promise<void> {
    if (this._isLoaded || this.loadPromise) return;
    await this.getFFmpeg();
  }

  /**
   * Retrieves or initializes the singleton FFmpeg WASM instance
   */
  public async getFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
    if (this._isLoaded && this.ffmpeg) {
      return this.ffmpeg;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const ffmpegInstance = new FFmpeg();

      ffmpegInstance.on("progress", ({ progress, time }) => {
        const ratio = Math.min(1, Math.max(0, progress));
        if (onProgress) onProgress(ratio);
        FastFFmpegManager.handleProgress({ progress: ratio, time: time ?? 0 });
      });

      ffmpegInstance.on("log", ({ type, message }) => {
        FastFFmpegManager.handleLog({ type, message });
      });

      const supportsMultiThread =
        typeof window !== "undefined" && window.crossOriginIsolated;

      const baseURL = supportsMultiThread
        ? `https://unpkg.com/@ffmpeg/core-mt@${this.CORE_VERSION}/dist/umd`
        : `https://unpkg.com/@ffmpeg/core@${this.CORE_VERSION}/dist/umd`;

      try {
        const coreURL = await this.getCachedBlobUrl(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        );
        const wasmURL = await this.getCachedBlobUrl(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        );

        const loadConfig: Record<string, string> = { coreURL, wasmURL };

        if (supportsMultiThread) {
          loadConfig.workerURL = await this.getCachedBlobUrl(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          );
        }

        await ffmpegInstance.load(loadConfig);
        this.ffmpeg = ffmpegInstance;
        this._isLoaded = true;
        return ffmpegInstance;
      } catch (err) {
        console.warn(`Primary WASM load failed for ${baseURL}, attempting fallback:`, err);
        // Fallback to single-threaded if multi-threaded fails
        const fallbackBaseURL = `https://unpkg.com/@ffmpeg/core@${this.CORE_VERSION}/dist/umd`;
        const coreURL = await this.getCachedBlobUrl(`${fallbackBaseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await this.getCachedBlobUrl(`${fallbackBaseURL}/ffmpeg-core.wasm`, "application/wasm");
        await ffmpegInstance.load({ coreURL, wasmURL });
        this.ffmpeg = ffmpegInstance;
        this._isLoaded = true;
        return ffmpegInstance;
      }
    })();

    try {
      return await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * Ultra-fast Video Trim using stream copy (-c copy) when possible
   */
  public async fastTrimVideo(
    inputFile: File,
    startTime: number,
    endTime: number,
    accurateReencode = false,
    onProgress?: (pct: number) => void
  ): Promise<Blob> {
    const ffmpeg = await this.getFFmpeg(onProgress);
    const inputName = `in_${Date.now()}.mp4`;
    const outputName = `out_${Date.now()}.mp4`;

    const arrayBuffer = await inputFile.arrayBuffer();
    await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuffer));

    const duration = Math.max(0.1, endTime - startTime).toFixed(2);
    const startStr = startTime.toFixed(2);

    const args = accurateReencode
      ? [
          "-ss", startStr,
          "-i", inputName,
          "-t", duration,
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "23",
          "-c:a", "aac",
          "-movflags", "+faststart",
          outputName,
        ]
      : [
          "-ss", startStr,
          "-i", inputName,
          "-t", duration,
          "-c", "copy",
          "-avoid_negative_ts", "make_zero",
          outputName,
        ];

    await ffmpeg.exec(args);
    const data = await ffmpeg.readFile(outputName);

    // Virtual FS cleanup
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});

    return new Blob([data as unknown as BlobPart], { type: "video/mp4" });
  }

  // --- Static Compatibility API for existing hooks (useFFmpeg, error boundaries, etc.) ---
  public static async load(): Promise<FFmpeg> {
    return await FastFFmpegManager.getInstance().getFFmpeg();
  }

  public static async getFFmpegInstance(): Promise<FFmpeg> {
    return await FastFFmpegManager.getInstance().getFFmpeg();
  }

  public static isLoaded(): boolean {
    const mgr = FastFFmpegManager.getInstance();
    return mgr._isLoaded && !!mgr.ffmpeg?.loaded;
  }

  public static onProgress(callback: FFmpegProgressCallback): () => void {
    FastFFmpegManager.progressCallbacks.add(callback);
    return () => {
      FastFFmpegManager.progressCallbacks.delete(callback);
    };
  }

  public static offProgress(callback: FFmpegProgressCallback): void {
    FastFFmpegManager.progressCallbacks.delete(callback);
  }

  public static onLog(callback: FFmpegLogCallback): () => void {
    FastFFmpegManager.logCallbacks.add(callback);
    return () => {
      FastFFmpegManager.logCallbacks.delete(callback);
    };
  }

  public static offLog(callback: FFmpegLogCallback): void {
    FastFFmpegManager.logCallbacks.delete(callback);
  }

  public static async writeFile(name: string, data: Uint8Array | string): Promise<void> {
    const ffmpeg = await FastFFmpegManager.getFFmpegInstance();
    await ffmpeg.writeFile(name, data);
  }

  public static async readFile(name: string): Promise<Uint8Array> {
    const ffmpeg = await FastFFmpegManager.getFFmpegInstance();
    const data = await ffmpeg.readFile(name);
    if (typeof data === "string") {
      return new TextEncoder().encode(data);
    }
    return data;
  }

  public static async deleteFile(name: string): Promise<void> {
    const mgr = FastFFmpegManager.getInstance();
    if (!mgr.ffmpeg) return;
    try {
      await mgr.ffmpeg.deleteFile(name);
    } catch {
      // Ignore cleanup error if file does not exist
    }
  }

  public static async exec(args: string[]): Promise<number> {
    const ffmpeg = await FastFFmpegManager.getFFmpegInstance();
    return await ffmpeg.exec(args);
  }

  public static async terminate(): Promise<void> {
    const mgr = FastFFmpegManager.getInstance();
    if (mgr.ffmpeg) {
      try {
        mgr.ffmpeg.terminate();
      } catch (err) {
        console.warn("Error terminating FFmpeg instance:", err);
      }
      mgr.ffmpeg = null;
      mgr._isLoaded = false;
    }
    mgr.loadPromise = null;
  }

  public static async fastTrimVideo(
    inputFile: File,
    startTime: number,
    endTime: number,
    accurateReencode = false,
    onProgress?: (pct: number) => void
  ): Promise<Blob> {
    return await FastFFmpegManager.getInstance().fastTrimVideo(
      inputFile,
      startTime,
      endTime,
      accurateReencode,
      onProgress
    );
  }
}

// Named singleton exports for convenience and multiple usage styles
export const ffmpegManager = FastFFmpegManager.getInstance();
export const FFmpegManager = FastFFmpegManager;
export const getFFmpegInstance = FastFFmpegManager.getFFmpegInstance.bind(FastFFmpegManager);
export const load = FastFFmpegManager.load.bind(FastFFmpegManager);
export const isLoaded = FastFFmpegManager.isLoaded.bind(FastFFmpegManager);
export const terminate = FastFFmpegManager.terminate.bind(FastFFmpegManager);
export const writeFile = FastFFmpegManager.writeFile.bind(FastFFmpegManager);
export const readFile = FastFFmpegManager.readFile.bind(FastFFmpegManager);
export const deleteFile = FastFFmpegManager.deleteFile.bind(FastFFmpegManager);
export const exec = FastFFmpegManager.exec.bind(FastFFmpegManager);
export const fastTrimVideo = FastFFmpegManager.fastTrimVideo.bind(FastFFmpegManager);

export default FastFFmpegManager;
