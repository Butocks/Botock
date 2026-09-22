"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface UseImageDocumentReturn {
  file: File | null;
  previewUrl: string | null;
  dimensions: ImageDimensions | null;
  error: string | null;
  isLoading: boolean;
  loadImage: (selectedFile: File) => Promise<ImageDimensions | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

/**
 * Shared Hook for Image Loading & Dimension Metadata.
 */
export function useImageDocument(): UseImageDocumentReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeUrlRef = useRef<string | null>(null);

  const cleanupUrl = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupUrl();
    };
  }, [cleanupUrl]);

  const loadImage = useCallback(
    async (selectedFile: File): Promise<ImageDimensions | null> => {
      cleanupUrl();
      setError(null);
      setIsLoading(true);

      const objectUrl = URL.createObjectURL(selectedFile);
      activeUrlRef.current = objectUrl;

      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const aspectRatio = height > 0 ? width / height : 1;

          const dims: ImageDimensions = { width, height, aspectRatio };

          setFile(selectedFile);
          setPreviewUrl(objectUrl);
          setDimensions(dims);
          setIsLoading(false);
          resolve(dims);
        };

        img.onerror = () => {
          cleanupUrl();
          setError("Failed to load image. The file may be corrupt or in an unsupported format.");
          setFile(null);
          setPreviewUrl(null);
          setDimensions(null);
          setIsLoading(false);
          resolve(null);
        };

        img.src = objectUrl;
      });
    },
    [cleanupUrl]
  );

  const reset = useCallback(() => {
    cleanupUrl();
    setFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setError(null);
    setIsLoading(false);
  }, [cleanupUrl]);

  return {
    file,
    previewUrl,
    dimensions,
    error,
    isLoading,
    loadImage,
    reset,
    setError,
  };
}

export default useImageDocument;