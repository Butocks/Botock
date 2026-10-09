"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UseObjectUrlDownloadReturn {
  url: string | null;
  setBlob: (blobOrBytes: Blob | Uint8Array | null, mimeType?: string) => string | null;
  reset: () => void;
}

/**
 * Shared Hook for Blob/Uint8Array Object URL management.
 * Guarantees zero memory leaks: automatically revokes stale blob URLs on replacement, reset, and component unmount.
 */
export function useObjectUrlDownload(): UseObjectUrlDownloadReturn {
  const [url, setUrl] = useState<string | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  const revokeActiveUrl = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeActiveUrl();
    };
  }, [revokeActiveUrl]);

  /**
   * Takes a Blob or raw Uint8Array (e.g. from pdfDoc.save()),
   * revokes the previous URL, and generates a fresh download URL.
   */
  const setBlob = useCallback(
    (blobOrBytes: Blob | Uint8Array | null, mimeType: string = "application/pdf"): string | null => {
      revokeActiveUrl();

      if (!blobOrBytes) {
        setUrl(null);
        return null;
      }

      let blob: Blob;
      if (blobOrBytes instanceof Blob) {
        blob = blobOrBytes;
      } else {
        blob = new Blob([blobOrBytes as unknown as BlobPart], { type: mimeType });
      }

      const newUrl = URL.createObjectURL(blob);
      activeUrlRef.current = newUrl;
      setUrl(newUrl);
      return newUrl;
    },
    [revokeActiveUrl]
  );

  const reset = useCallback(() => {
    revokeActiveUrl();
    setUrl(null);
  }, [revokeActiveUrl]);

  return {
    url,
    setBlob,
    reset,
  };
}

export default useObjectUrlDownload;