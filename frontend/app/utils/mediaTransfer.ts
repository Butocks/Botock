"use client";

import { useMediaStore } from "@/app/store/useMediaStore";

const DB_NAME = "botock_media_transfer_db";
const STORE_NAME = "transfer_store";
const KEY = "latest_media";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores media (images, videos, or audio) in both Zustand useMediaStore and IndexedDB for cross-tool workflows.
 */
export async function saveTransferMedia(
  mediaBlob: Blob,
  fileName?: string
): Promise<string> {
  const isImage =
    (mediaBlob.type && mediaBlob.type.startsWith("image/")) ||
    (fileName ? /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(fileName) : false);

  const isAudio =
    (mediaBlob.type && mediaBlob.type.startsWith("audio/")) ||
    (fileName ? /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName) : false);

  const defaultExt = isImage ? "png" : isAudio ? "mp3" : "mp4";
  const defaultMime = isImage ? "image/png" : isAudio ? "audio/mpeg" : "video/mp4";

  const resolvedName =
    fileName ||
    (isImage
      ? `image_${Date.now()}.${defaultExt}`
      : isAudio
      ? `audio_${Date.now()}.${defaultExt}`
      : `video_${Date.now()}.${defaultExt}`);

  const resolvedType = mediaBlob.type || defaultMime;
  const url = URL.createObjectURL(mediaBlob);

  // 1. Save in Zustand store for instant in-memory access
  try {
    useMediaStore.getState().setActiveMedia({
      id: `transfer-${Date.now()}`,
      title: resolvedName,
      type: isImage ? "image" : "video",
      url,
      blob: mediaBlob,
      blobUrl: url,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      prompt: "Botock Transferred Media",
    });
  } catch (e) {
    console.warn("Failed to set Zustand active media", e);
  }

  // 2. Save in IndexedDB so page reloads/hard navigations also have it
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const arrayBuffer = await mediaBlob.arrayBuffer();
    store.put(
      {
        buffer: arrayBuffer,
        type: resolvedType,
        name: resolvedName,
        savedAt: Date.now(),
      },
      KEY
    );
  } catch (e) {
    console.warn("Failed to store media in IndexedDB", e);
  }

  return url;
}

/**
 * Retrieves transfer media when landing on any tool (e.g. Image Crop, BG Remover, Video Studio, Subtitles, etc.).
 */
export async function getTransferMedia(): Promise<{
  file: File;
  url: string;
  name: string;
  type: string;
} | null> {
  if (typeof window === "undefined") return null;

  // 1. Try from Zustand active media first
  try {
    const active = useMediaStore.getState().activeMedia;
    if (active) {
      const isImg = active.type === "image";
      const fallbackName = isImg ? "image.png" : "video.mp4";
      const fallbackMime = isImg ? "image/png" : "video/mp4";
      const resolvedName = active.title || fallbackName;

      if (active.blob) {
        const file = new File([active.blob], resolvedName, {
          type: active.blob.type || fallbackMime,
        });
        const url = active.blobUrl || active.url || URL.createObjectURL(active.blob);
        return { file, url, name: resolvedName, type: file.type };
      }
      if (active.blobUrl || active.url) {
        const res = await fetch(active.blobUrl || active.url);
        const blob = await res.blob();
        const file = new File([blob], resolvedName, {
          type: blob.type || fallbackMime,
        });
        return { file, url: active.blobUrl || active.url, name: resolvedName, type: file.type };
      }
    }
  } catch (e) {
    console.warn("Could not read activeMedia from Zustand", e);
  }

  // 2. Try IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const result = await new Promise<any>((resolve, reject) => {
      const req = store.get(KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (result && result.buffer) {
      // Ignore if older than 2 hours
      if (Date.now() - result.savedAt > 2 * 60 * 60 * 1000) {
        return null;
      }
      const blob = new Blob([result.buffer], { type: result.type });
      const file = new File([blob], result.name, { type: result.type });
      const url = URL.createObjectURL(blob);
      return { file, url, name: result.name, type: result.type };
    }
  } catch (e) {
    console.warn("Could not read from IndexedDB", e);
  }

  return null;
}

/**
 * Clears transfer media after user finishes or cancels.
 */
export async function clearTransferMedia(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    useMediaStore.getState().clearActiveMedia();
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(KEY);
  } catch (e) {
    // Ignore
  }
}
