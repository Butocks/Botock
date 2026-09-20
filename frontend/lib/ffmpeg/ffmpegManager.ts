import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export type FFmpegProgressCallback = (event: { progress: number; time: number }) => void;
export type FFmpegLogCallback = (event: { type: string; message: string }) => void;

/**
 * Primary CDN URLs for single-threaded @ffmpeg/core v0.12.10
 */
const PRIMARY_CDN_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const FALLBACK_CDN_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

/**
 * Singleton WebAssembly manager for FFmpeg.
 * Provides thread-safe loading, execution, file system operations, and listener management.
 */
export class FFmpegManager {
  private static instance: FFmpeg | null = null;
  private static loadPromise: Promise<FFmpeg> | null = null;
  private static progressCallbacks: Set<FFmpegProgressCallback> = new Set();
  private static logCallbacks: Set<FFmpegLogCallback> = new Set();

  /**
   * Internal dispatcher for progress events to all registered listeners.
   */
  private static handleProgress = (event: { progress: number; time: number }) => {
    FFmpegManager.progressCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Error in FFmpeg progress callback:", err);
      }
    });
  };

  /**
   * Internal dispatcher for log events to all registered listeners.
   */
  private static handleLog = (event: { type: string; message: string }) => {
    FFmpegManager.logCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Error in FFmpeg log callback:", err);
      }
    });
  };

  /**
   * Loads the single-threaded @ffmpeg/core WebAssembly binary.
   * Concurrency-guarded: concurrent callers receive the same loading promise.
   */
  public static async load(): Promise<FFmpeg> {
    if (typeof window === "undefined") {
      throw new Error("FFmpegManager can only be executed in a browser environment.");
    }

    if (this.instance && this.instance.loaded) {
      return this.instance;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const ffmpeg = new FFmpeg();

      ffmpeg.on("progress", this.handleProgress);
      ffmpeg.on("log", this.handleLog);

      // Attempt to load from primary CDN, fallback to secondary CDN on failure
      let loaded = false;
      const cdnBases = [PRIMARY_CDN_BASE, FALLBACK_CDN_BASE];

      for (const baseURL of cdnBases) {
        try {
          const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
          const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");

          await ffmpeg.load({
            coreURL,
            wasmURL,
          });

          loaded = true;
          break;
        } catch (loadErr) {
          console.warn(`Failed to load FFmpeg core from ${baseURL}:`, loadErr);
        }
      }

      if (!loaded) {
        throw new Error(
          "Failed to load WebAssembly FFmpeg core from both primary and fallback CDNs. Please check your internet connection."
        );
      }

      this.instance = ffmpeg;
      return ffmpeg;
    })();

    try {
      return await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * Returns the loaded FFmpeg instance, initializing it if not already loaded.
   */
  public static async getFFmpegInstance(): Promise<FFmpeg> {
    if (this.instance && this.instance.loaded) {
      return this.instance;
    }
    return await this.load();
  }

  /**
   * Checks whether the FFmpeg WASM engine is currently loaded and ready.
   */
  public static isLoaded(): boolean {
    return !!(this.instance && this.instance.loaded);
  }

  /**
   * Adds a global progress listener.
   * Returns an unregister function.
   */
  public static onProgress(callback: FFmpegProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Removes a global progress listener.
   */
  public static offProgress(callback: FFmpegProgressCallback): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * Adds a global log listener.
   * Returns an unregister function.
   */
  public static onLog(callback: FFmpegLogCallback): () => void {
    this.logCallbacks.add(callback);
    return () => {
      this.logCallbacks.delete(callback);
    };
  }

  /**
   * Removes a global log listener.
   */
  public static offLog(callback: FFmpegLogCallback): void {
    this.logCallbacks.delete(callback);
  }

  /**
   * Writes a file into FFmpeg's in-memory virtual filesystem.
   */
  public static async writeFile(name: string, data: Uint8Array | string): Promise<void> {
    const ffmpeg = await this.getFFmpegInstance();
    await ffmpeg.writeFile(name, data);
  }

  /**
   * Reads a file from FFmpeg's virtual filesystem and returns its raw bytes.
   */
  public static async readFile(name: string): Promise<Uint8Array> {
    const ffmpeg = await this.getFFmpegInstance();
    const data = await ffmpeg.readFile(name);
    if (typeof data === "string") {
      return new TextEncoder().encode(data);
    }
    return data;
  }

  /**
   * Deletes a file from FFmpeg's virtual filesystem to reclaim WASM heap memory.
   */
  public static async deleteFile(name: string): Promise<void> {
    if (!this.instance || !this.instance.loaded) return;
    try {
      await this.instance.deleteFile(name);
    } catch {
      // Ignore cleanup error if file does not exist
    }
  }

  /**
   * Executes an FFmpeg command with the provided argument array.
   * Returns the process exit code (0 for success).
   */
  public static async exec(args: string[]): Promise<number> {
    const ffmpeg = await this.getFFmpegInstance();
    return await ffmpeg.exec(args);
  }

  /**
   * Terminates the active Web Worker and reclaims memory.
   */
  public static async terminate(): Promise<void> {
    if (this.instance) {
      try {
        this.instance.off("progress", this.handleProgress);
        this.instance.off("log", this.handleLog);
        this.instance.terminate();
      } catch (err) {
        console.warn("Error terminating FFmpeg instance:", err);
      }
      this.instance = null;
    }
    this.loadPromise = null;
  }
}

// Named singleton exports for convenience and multiple usage styles
export const getFFmpegInstance = FFmpegManager.getFFmpegInstance.bind(FFmpegManager);
export const load = FFmpegManager.load.bind(FFmpegManager);
export const isLoaded = FFmpegManager.isLoaded.bind(FFmpegManager);
export const terminate = FFmpegManager.terminate.bind(FFmpegManager);
export const writeFile = FFmpegManager.writeFile.bind(FFmpegManager);
export const readFile = FFmpegManager.readFile.bind(FFmpegManager);
export const deleteFile = FFmpegManager.deleteFile.bind(FFmpegManager);
export const exec = FFmpegManager.exec.bind(FFmpegManager);

export default FFmpegManager;
