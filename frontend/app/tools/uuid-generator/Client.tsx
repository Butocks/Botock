"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Sliders,
  Code2,
  Table,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Generate UUID v7 (time-ordered)
function generateUuidV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const now = Date.now();

  // 48 bits timestamp
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  // Variant RFC 4122
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Generate UUID v4
function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const EXCEL_UUID_FORMULA =
  '=LOWER(CONCATENATE(DEC2HEX(RANDBETWEEN(0, 4294967295), 8), "-", DEC2HEX(RANDBETWEEN(0, 65535), 4), "-", DEC2HEX(BITOR(16384, BITAND(RANDBETWEEN(0, 65535), 4095)), 4), "-", DEC2HEX(BITOR(32768, BITAND(RANDBETWEEN(0, 65535), 16383)), 4), "-", DEC2HEX(RANDBETWEEN(0, 4294967295), 8), DEC2HEX(RANDBETWEEN(0, 65535), 4)))';

export default function UuidGeneratorClient() {
  const [activeTab, setActiveTab] = useState<"generator" | "formula" | "validator">("generator");

  // Generator Options
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [quantity, setQuantity] = useState<number>(5);
  const [format, setFormat] = useState<"standard" | "sql" | "json" | "js" | "python">("standard");
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>("");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector / Validator
  const [validateInput, setValidateInput] = useState<string>("");

  const generateRawUuid = (): string => {
    let id = version === "v7" ? generateUuidV7() : generateUuidV4();
    if (!hyphens) id = id.replace(/-/g, "");
    if (uppercase) id = id.toUpperCase();
    if (prefix.trim()) id = `${prefix.trim()}${id}`;
    return id;
  };

  const [uuids, setUuids] = useState<string[]>(() => {
    const list: string[] = [];
    for (let i = 0; i < 5; i++) list.push(generateUuidV4());
    return list;
  });

  const handleRegenerate = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      list.push(generateRawUuid());
    }
    setUuids(list);
  };

  // Formatted Output String based on selected format
  const formattedOutput = useMemo(() => {
    switch (format) {
      case "sql":
        return `INSERT INTO records (id) VALUES\n  ${uuids.map((u) => `('${u}')`).join(",\n  ")};`;
      case "json":
        return JSON.stringify(uuids, null, 2);
      case "js":
        return `const uuidList = [\n  ${uuids.map((u) => `"${u}"`).join(",\n  ")}\n];`;
      case "python":
        return `uuid_list = [\n    ${uuids.map((u) => `"${u}"`).join(",\n    ")}\n]`;
      default:
        return uuids.join("\n");
    }
  }, [uuids, format]);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    const ext = format === "json" ? "json" : format === "sql" ? "sql" : "txt";
    const blob = new Blob([formattedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${uuids.length}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validator Details
  const validationDetails = useMemo(() => {
    const clean = validateInput.trim().toLowerCase();
    if (!clean) return null;

    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/i;
    const match = clean.match(regex);

    if (!match) {
      return {
        isValid: false,
        message: "Invalid UUID format. Must follow 8-4-4-4-12 hex structure.",
      };
    }

    const versionNum = match[1];
    const variantChar = match[2];

    return {
      isValid: true,
      version: `v${versionNum}`,
      variant: "RFC 4122 / IETF standard",
      cleanString: clean,
    };
  }, [validateInput]);

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Fingerprint className="w-3.5 h-3.5" />
            Cryptographic Identifier Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bulk UUID & Formula Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate high-entropy UUID v4 & v7 identifiers with SQL queries, Excel formulas, JSON arrays, and validation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "generator"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bulk Generator & Formats
            </button>
            <button
              onClick={() => setActiveTab("formula")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "formula"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Excel / Google Sheets Formula
            </button>
            <button
              onClick={() => setActiveTab("validator")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "validator"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              UUID Validator & Inspector
            </button>
          </div>
        </div>

        {/* Tab 1: Generator */}
        {activeTab === "generator" && (
          <div className="space-y-6">
            {/* Options Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Version */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    UUID Version
                  </label>
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                  >
                    <option value="v4">UUID v4 (Random Crypto)</option>
                    <option value="v7">UUID v7 (Time-Ordered)</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Quantity: {quantity}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer mt-2"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Export Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                  >
                    <option value="standard">Plain Text (Lines)</option>
                    <option value="sql">SQL INSERT Statements</option>
                    <option value="json">JSON Array</option>
                    <option value="js">JavaScript Array</option>
                    <option value="python">Python List</option>
                  </select>
                </div>

                {/* Prefix */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Custom Prefix (e.g. usr_)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. ord_"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600"
                  />
                  <span>UPPERCASE</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hyphens}
                    onChange={(e) => setHyphens(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600"
                  />
                  <span>Include Hyphens (-)</span>
                </label>

                <div className="ml-auto">
                  <button
                    onClick={handleRegenerate}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-purple-600/25"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Regenerate Batch
                  </button>
                </div>
              </div>
            </div>

            {/* Output Display */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Generated Output ({uuids.length} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(formattedOutput, "bulk")}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === "bulk" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "bulk" ? "Copied All" : "Copy Output"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                rows={10}
                value={formattedOutput}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-purple-300 focus:outline-none select-all resize-y"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Excel / Google Sheets Formula */}
        {activeTab === "formula" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <Table className="w-3.5 h-3.5" />
                Spreadsheet Automation Formula
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Generate Standard UUID v4 in Excel & Google Sheets
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Paste this formula into any cell in Microsoft Excel (2013+) or Google Sheets to automatically generate cryptographically valid RFC 4122 UUID v4 IDs directly inside your spreadsheets.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Spreadsheet Formula
                </span>
                <button
                  onClick={() => handleCopy(EXCEL_UUID_FORMULA, "formula")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === "formula" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "formula" ? "Copied Formula" : "Copy Formula"}
                </button>
              </div>

              <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 font-mono text-xs break-all select-all whitespace-pre-wrap">
                {EXCEL_UUID_FORMULA}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Validator */}
        {activeTab === "validator" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">UUID Inspector & Validator</h3>
              <p className="text-xs text-slate-400">
                Paste any UUID string to verify compliance, extract its version (v1-v7), and inspect its variant structure.
              </p>
            </div>

            <input
              type="text"
              value={validateInput}
              onChange={(e) => setValidateInput(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-purple-500"
            />

            {validationDetails && (
              <div
                className={`p-5 rounded-2xl border ${
                  validationDetails.isValid
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-3 font-bold text-sm">
                  {validationDetails.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span>
                    {validationDetails.isValid ? "Valid RFC 4122 UUID" : "Invalid UUID Format"}
                  </span>
                </div>

                {validationDetails.isValid && (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300 pt-2 border-t border-emerald-500/20">
                    <div>
                      <span className="text-slate-500 block">Version:</span>
                      <strong className="text-white">{validationDetails.version}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Variant:</span>
                      <strong className="text-white">{validationDetails.variant}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
