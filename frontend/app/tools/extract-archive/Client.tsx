"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileArchive,
  Download,
  Trash2,
  File,
  Folder,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ExtractedFile {
  name: string;
  relativePath: string;
  size: number;
  isDir: boolean;
  date: Date;
  asyncData: () => Promise<Blob>;
}

export default function ExtractArchiveClient() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setZipFile(file);
      setIsLoading(true);
      setErrorMsg(null);
      setPreviewContent(null);

      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);

        const list: ExtractedFile[] = [];

        loadedZip.forEach((relativePath, zipEntry) => {
          list.push({
            name: zipEntry.name.split("/").filter(Boolean).pop() || zipEntry.name,
            relativePath,
            size: (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize || 0 : 0,
            isDir: zipEntry.dir,
            date: zipEntry.date,
            asyncData: () => zipEntry.async("blob"),
          });
        });

        setExtractedFiles(list);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg("Failed to open ZIP archive. Please ensure it is a valid, uncorrupted ZIP file.");
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    setZipFile(null);
    setExtractedFiles([]);
    setSearchQuery("");
    setPreviewContent(null);
    setErrorMsg(null);
  };

  const handleDownloadSingle = async (item: ExtractedFile) => {
    try {
      const blob = await item.asyncData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg(`Failed to extract ${item.name}`);
    }
  };

  const handlePreview = async (item: ExtractedFile) => {
    try {
      const blob = await item.asyncData();
      if (item.name.match(/\.(txt|md|json|js|ts|html|css|csv|xml|log)$/i)) {
        const text = await blob.text();
        setPreviewContent(text);
        setPreviewName(item.name);
      } else if (item.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
        const url = URL.createObjectURL(blob);
        setPreviewContent(url);
        setPreviewName(item.name);
      } else {
        handleDownloadSingle(item);
      }
    } catch {
      setErrorMsg(`Cannot preview ${item.name}`);
    }
  };

  const filtered = extractedFiles.filter((f) =>
    f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!zipFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sky-500 bg-sky-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileArchive className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop ZIP Archive here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Extract files, view archive structure, and download individual files directly in your browser.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {zipFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(zipFile.size)} • {extractedFiles.length} Total Entries
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Open Another Archive
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files inside archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
            />
          </div>

          {/* File Entries List */}
          <div className="border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.04] max-h-[460px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-semibold">Reading ZIP catalog...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No matching files found.
              </div>
            ) : (
              filtered.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.isDir ? (
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-sky-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.relativePath}
                      </p>
                      {!item.isDir && item.size > 0 && (
                        <p className="text-[10px] text-slate-400">
                          {formatBytes(item.size)}
                        </p>
                      )}
                    </div>
                  </div>

                  {!item.isDir && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePreview(item)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-400 cursor-pointer"
                        title="Preview File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Extract
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Preview Modal / Drawer */}
          {previewContent && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold truncate">{previewName}</span>
                <button
                  onClick={() => setPreviewContent(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Preview
                </button>
              </div>

              {previewName?.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                <div className="flex justify-center p-2 bg-black/40 rounded-xl">
                  <img src={previewContent} alt="Preview" className="max-h-60 object-contain rounded" />
                </div>
              ) : (
                <pre className="p-3 bg-black/50 rounded-xl text-[11px] font-mono overflow-auto max-h-60 text-slate-300">
                  {previewContent}
                </pre>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
