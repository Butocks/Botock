"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function Base64FileConverterClient() {
  const [mode, setMode] = useState<"file-to-base64" | "base64-to-file">("file-to-base64");
  const [base64Output, setBase64Output] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileMime, setFileMime] = useState<string>("");
  const [includePrefix, setIncludePrefix] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Decoding mode states
  const [decodeInput, setDecodeInput] = useState<string>("");
  const [decodedFileName, setDecodedFileName] = useState<string>("decoded_file.bin");
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

  const formattedBase64 = (() => {
    if (!base64Output) return "";
    if (includePrefix) return base64Output;
    // Strip data:mime/type;base64, prefix
    const commaIdx = base64Output.indexOf(",");
    return commaIdx !== -1 ? base64Output.substring(commaIdx + 1) : base64Output;
  })();

  const handleCopy = () => {
    if (!formattedBase64) return;
    navigator.clipboard.writeText(formattedBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBase64Text = () => {
    const blob = new Blob([formattedBase64], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDecodeAndDownload = () => {
    if (!decodeInput.trim()) return;
    setError(null);

    try {
      let rawBase64 = decodeInput.trim();
      let mimeType = "application/octet-stream";

      // Check if data URI
      if (rawBase64.startsWith("data:")) {
        const matches = rawBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          rawBase64 = matches[2];
        } else {
          const commaIdx = rawBase64.indexOf(",");
          if (commaIdx !== -1) {
            rawBase64 = rawBase64.substring(commaIdx + 1);
          }
        }
      }

      // Convert base64 to binary array
      const binaryString = atob(rawBase64.replace(/\s+/g, ""));
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = decodedFileName || "file.bin";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("Invalid Base64 string. Please verify the characters.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Binary className="w-3.5 h-3.5" />
            Universal Binary Data Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Base64 File Encoder & Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert any file (PDF, image, audio, zip) to Base64 data URI or reconstruct files from Base64 strings.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => {
                setMode("file-to-base64");
                setError(null);
              }}
              className={`px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "file-to-base64"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              File to Base64 (Encode)
            </button>
            <button
              onClick={() => {
                setMode("base64-to-file");
                setError(null);
              }}
              className={`px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "base64-to-file"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Base64 to File (Decode)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "file-to-base64" ? (
          <div className="space-y-6">
            {!base64Output ? (
              <div className="max-w-xl mx-auto">
                <label
                  htmlFor="file-upload"
                  className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-purple-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Select any file to encode
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-4">
                    Supports images, documents, audio, videos, and zip files.
                  </p>
                  <span className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition">
                    Browse File
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-slate-800/60 gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{fileName}</h4>
                      <p className="text-xs text-slate-500">
                        {fileMime} • {fileSize ? (fileSize / 1024).toFixed(1) : 0} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={includePrefix}
                        onChange={(e) => setIncludePrefix(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      Data URI prefix (data:mime...)
                    </label>

                    <label
                      htmlFor="file-replace"
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Change File
                      <input
                        id="file-replace"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Base64 String Result
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy Base64"}
                    </button>
                    <button
                      onClick={handleDownloadBase64Text}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download TXT
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={formattedBase64}
                  className="w-full h-64 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-purple-300 resize-none focus:outline-none select-all break-all leading-relaxed"
                />
              </div>
            )}
          </div>
        ) : (
          /* Base64 to file decoder */
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-slate-800/60 gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paste Base64 String
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Save as:</label>
                <input
                  type="text"
                  value={decodedFileName}
                  onChange={(e) => setDecodedFileName(e.target.value)}
                  placeholder="document.pdf"
                  className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Paste Base64 encoded string or Data URI here..."
              className="w-full h-64 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none break-all leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={handleDecodeAndDownload}
                disabled={!decodeInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Decode & Download Binary File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
