"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Binary,
  Upload,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileText,
  Eye,
  Image as ImageIcon,
  Music,
  FileCode,
} from "lucide-react";

function detectMimeAndExt(bytes: Uint8Array): { mime: string; ext: string } {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { mime: "image/gif", ext: "gif" };
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { mime: "application/pdf", ext: "pdf" };
  }
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { mime: "application/zip", ext: "zip" };
  }
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return { mime: "audio/mp3", ext: "mp3" };
  }

  // Check if UTF-8 text / JSON
  let isText = true;
  for (let i = 0; i < Math.min(bytes.length, 512); i++) {
    const b = bytes[i];
    if (b === 0 || (b < 7 && b !== 9 && b !== 10 && b !== 13)) {
      isText = false;
      break;
    }
  }
  if (isText) {
    const previewStr = new TextDecoder().decode(bytes.slice(0, 100)).trim();
    if (previewStr.startsWith("{") || previewStr.startsWith("[")) {
      return { mime: "application/json", ext: "json" };
    }
    return { mime: "text/plain", ext: "txt" };
  }

  return { mime: "application/octet-stream", ext: "bin" };
}

export default function Base64FileConverterClient() {
  const [mode, setMode] = useState<"file-to-base64" | "base64-to-file">("file-to-base64");
  
  // Encode state
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileMime, setFileMime] = useState<string>("");
  const [base64Output, setBase64Output] = useState<string>("");
  const [includePrefix, setIncludePrefix] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Decode state
  const [decodeInput, setDecodeInput] = useState<string>("");
  const [decodedInfo, setDecodedInfo] = useState<{
    blobUrl: string;
    mime: string;
    ext: string;
    size: number;
    textPreview?: string;
  } | null>(null);
  const [customDownloadName, setCustomDownloadName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setFileMime(file.type || "application/octet-stream");
      setError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setBase64Output(dataUrl);
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsDataURL(file);
    }
  };

  const formattedBase64 = useMemo(() => {
    if (!base64Output) return "";
    if (includePrefix) return base64Output;
    const commaIdx = base64Output.indexOf(",");
    return commaIdx !== -1 ? base64Output.substring(commaIdx + 1) : base64Output;
  }, [base64Output, includePrefix]);

  const handleCopy = () => {
    if (!formattedBase64) return;
    copyToClipboard(formattedBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBase64Text = () => {
    const blob = new Blob([formattedBase64], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "file"}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Decode Base64 to binary and generate live preview
  const handleDecode = () => {
    if (!decodeInput.trim()) return;
    setError(null);

    try {
      let rawBase64 = decodeInput.trim();
      let detectedMime = "";

      if (rawBase64.startsWith("data:")) {
        const matches = rawBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          rawBase64 = matches[2];
        } else {
          const commaIdx = rawBase64.indexOf(",");
          if (commaIdx !== -1) {
            rawBase64 = rawBase64.substring(commaIdx + 1);
          }
        }
      }

      const cleanB64 = rawBase64.replace(/\s+/g, "");
      const binaryString = atob(cleanB64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const magic = detectMimeAndExt(bytes);
      const finalMime = detectedMime || magic.mime;
      const finalExt = magic.ext;

      const blob = new Blob([bytes], { type: finalMime });
      const blobUrl = URL.createObjectURL(blob);

      let textPreview: string | undefined;
      if (finalMime.startsWith("text/") || finalMime === "application/json") {
        textPreview = new TextDecoder().decode(bytes.slice(0, 1000));
      }

      setDecodedInfo({
        blobUrl,
        mime: finalMime,
        ext: finalExt,
        size: len,
        textPreview,
      });
      setCustomDownloadName(`decoded-file.${finalExt}`);
    } catch {
      setError("Invalid Base64 sequence. Please ensure the string is valid Base64 without corruption.");
      setDecodedInfo(null);
    }
  };

  const handleDownloadDecoded = () => {
    if (!decodedInfo) return;
    const a = document.createElement("a");
    a.href = decodedInfo.blobUrl;
    a.download = customDownloadName || `decoded-file.${decodedInfo.ext}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Binary className="w-3.5 h-3.5" />
            Binary & Data URI Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Base64 File Encoder & Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert any file into Base64 / Data URI strings, or decode Base64 back into files with automatic type detection and live preview.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => {
                setMode("file-to-base64");
                setError(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "file-to-base64"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Encode: File → Base64
            </button>
            <button
              onClick={() => {
                setMode("base64-to-file");
                setError(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "base64-to-file"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Decode: Base64 → File & Preview
            </button>
          </div>
        </div>

        {/* Mode 1: File to Base64 */}
        {mode === "file-to-base64" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-base font-bold text-white mb-1">
                  Click to select any file to encode
                </span>
                <span className="text-xs text-slate-500 max-w-sm">
                  Supports Images, PDFs, Audio, Video, Zip archives, and Documents
                </span>
              </label>

              {fileName && (
                <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block truncate max-w-xs sm:max-w-md">
                        {fileName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {fileMime} • {fileSize ? (fileSize / 1024).toFixed(1) : 0} KB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {base64Output && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Generated Base64
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePrefix}
                        onChange={(e) => setIncludePrefix(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-0"
                      />
                      <span>Include Data URI Prefix (data:{fileMime};base64,)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy Base64"}
                    </button>
                    <button
                      onClick={handleDownloadBase64Text}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save as .txt
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={formattedBase64}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300 focus:outline-none select-all break-all resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-1 rounded">
                    Length: {formattedBase64.length.toLocaleString()} chars
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Base64 to File with Preview */}
        {mode === "base64-to-file" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paste Base64 String or Data URI
                </label>
                {decodeInput && (
                  <button
                    onClick={() => {
                      setDecodeInput("");
                      setDecodedInfo(null);
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-rose-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                rows={5}
                value={decodeInput}
                onChange={(e) => setDecodeInput(e.target.value)}
                placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... or raw Base64 string..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleDecode}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-purple-600/25"
                >
                  <Eye className="w-4 h-4" />
                  Decode & Preview File
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Decoded File Preview & Download Box */}
            {decodedInfo && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      {decodedInfo.mime.startsWith("image/") ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : decodedInfo.mime.startsWith("audio/") ? (
                        <Music className="w-5 h-5" />
                      ) : (
                        <FileCode className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Detected: {decodedInfo.mime} (.{decodedInfo.ext})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {(decodedInfo.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customDownloadName}
                      onChange={(e) => setCustomDownloadName(e.target.value)}
                      placeholder="filename.ext"
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      onClick={handleDownloadDecoded}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/25 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download File
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Interactive Decoded Preview
                  </span>

                  {decodedInfo.mime.startsWith("image/") && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                      <img
                        src={decodedInfo.blobUrl}
                        alt="Decoded preview"
                        className="max-h-72 max-w-full rounded-lg object-contain shadow-md"
                      />
                    </div>
                  )}

                  {decodedInfo.mime.startsWith("audio/") && (
                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                      <audio controls src={decodedInfo.blobUrl} className="w-full max-w-md" />
                    </div>
                  )}

                  {decodedInfo.mime === "application/pdf" && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-3">
                      <span className="text-xs text-slate-400 font-semibold">
                        PDF Document Successfully Decoded
                      </span>
                      <a
                        href={decodedInfo.blobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
                      >
                        Open PDF in New Tab
                      </a>
                    </div>
                  )}

                  {decodedInfo.textPreview && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {decodedInfo.textPreview}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
