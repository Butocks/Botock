"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

export interface UsePdfDocumentReturn {
  file: File | null;
  pageCount: number;
  pdfDoc: PDFDocument | null;
  error: string | null;
  isLoading: boolean;
  loadFile: (selectedFile: File) => Promise<PDFDocument | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

/**
 * Shared Hook for PDF loading, page inspection, and encryption error handling.
 * Eliminates duplicate ~40-line boilerplate across all simple PDF tools.
 */
export function usePdfDocument(): UsePdfDocumentReturn {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadFile = useCallback(async (selectedFile: File): Promise<PDFDocument | null> => {
    setFile(selectedFile);
    setError(null);
    setIsLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      // ignoreEncryption: true allows inspecting page count even on protected files
      const loaded = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = loaded.getPageCount();

      setPdfDoc(loaded);
      setPageCount(count);
      return loaded;
    } catch (err: unknown) {
      console.error("usePdfDocument: Failed to parse PDF document:", err);
      const msg = err instanceof Error ? err.message : String(err);
      let userFriendlyMsg = "Could not load PDF document. It may be password-protected or corrupted.";

      if (
        msg.toLowerCase().includes("encrypted") ||
        msg.toLowerCase().includes("password") ||
        msg.includes("EncryptedPDFError")
      ) {
        userFriendlyMsg = "This PDF is password-protected or encrypted. Please remove encryption before editing.";
      }

      setError(userFriendlyMsg);
      setPdfDoc(null);
      setPageCount(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setPdfDoc(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    file,
    pageCount,
    pdfDoc,
    error,
    isLoading,
    loadFile,
    reset,
    setError,
  };
}

export default usePdfDocument;