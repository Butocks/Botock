"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Binary,
  Upload,
  Search,
  Key,
  HelpCircle,
  FileCheck,
} from "lucide-react";

// Standard RFC 1321 compliant MD5
function computeRFC1321MD5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string) {
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords).fill(0);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let WordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const utf8 = unescape(encodeURIComponent(string));
  const x = convertToWordArray(utf8);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beeea4);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// Built-in Rainbow dictionary for Common Hash Lookup
const COMMON_HASH_DICT: Record<string, string> = {
  "098f6bcd4621d373cade4e832627b4f6": "test",
  "5ebe2294ecd0e0f08eab7690d2a6ee69": "secret",
  "5f4dcc3b5aa765d61d8327deb882cf99": "password",
  "e10adc3949ba59abbe56e057f20f883e": "123456",
  "21232f297a57a5a743894a0e4a801fc3": "admin",
  "9e107d9d372bb6826bd81d3542a419d6": "12345678",
  "827ccb0eea8a706c4c34a16891f84e7b": "12345",
  "9996535e07258a7bbfd8b132435c5962": "botock",
  "25d55ad283aa400af464c76d713c07ad": "123456789",
  "a8f5f167f44f4964e6c998dee827110c": "password123",
  // SHA-256
  "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08": "test",
  "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "password",
  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918": "admin",
  "ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548": "123456",
};

export default function HashGeneratorClient() {
  const [activeTab, setActiveTab] = useState<"text" | "file" | "reverse">("text");

  // Text Mode State
  const [inputText, setInputText] = useState<string>("test");
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  } | null>(null);

  // File Mode State
  const [file, setFile] = useState<File | null>(null);
  const [fileHashes, setFileHashes] = useState<{
    md5: string;
    sha256: string;
    sha512: string;
  } | null>(null);
  const [isFileHashing, setIsFileHashing] = useState(false);

  // Reverse Lookup State
  const [lookupInput, setLookupInput] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    plaintext?: string;
    algorithm?: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute text hashes
  const computeSha = async (algorithm: "SHA-1" | "SHA-256" | "SHA-512", message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleComputeTextHashes = async () => {
    if (!inputText) return;
    const [sha1, sha256, sha512] = await Promise.all([
      computeSha("SHA-1", inputText),
      computeSha("SHA-256", inputText),
      computeSha("SHA-512", inputText),
    ]);
    const md5 = computeRFC1321MD5(inputText);
    setHashes({ md5, sha1, sha256, sha512 });
  };

  React.useEffect(() => {
    handleComputeTextHashes();
  }, [inputText]);

  // Compute file hashes
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setIsFileHashing(true);
      setFileHashes(null);

      try {
        const buffer = await f.arrayBuffer();
        const [sha256Buf, sha512Buf] = await Promise.all([
          crypto.subtle.digest("SHA-256", buffer),
          crypto.subtle.digest("SHA-512", buffer),
        ]);

        const sha256 = Array.from(new Uint8Array(sha256Buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const sha512 = Array.from(new Uint8Array(sha512Buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Chunked text for MD5
        const binaryStr = new TextDecoder("latin1").decode(buffer);
        const md5 = computeRFC1321MD5(binaryStr);

        setFileHashes({ md5, sha256, sha512 });
      } catch {
        // error
      } finally {
        setIsFileHashing(false);
      }
    }
  };

  // Reverse Hash Lookup
  const handleLookup = () => {
    const clean = lookupInput.trim().toLowerCase();
    if (!clean) return;

    let algo = "Unknown";
    if (clean.length === 32) algo = "MD5";
    else if (clean.length === 40) algo = "SHA-1";
    else if (clean.length === 64) algo = "SHA-256";
    else if (clean.length === 128) algo = "SHA-512";

    if (COMMON_HASH_DICT[clean]) {
      setLookupResult({
        found: true,
        plaintext: COMMON_HASH_DICT[clean],
        algorithm: algo,
      });
    } else {
      setLookupResult({
        found: false,
        algorithm: algo,
      });
    }
  };

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cryptographic Checksum Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cryptographic Hash Generator & File Checksum
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate mathematically verified SHA-256, SHA-512, and RFC 1321 MD5 hashes for strings and files, plus reverse hash lookup.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveTab("text")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "text"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Text Hash Generator
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "file"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              File Checksum Hashing
            </button>
            <button
              onClick={() => setActiveTab("reverse")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "reverse"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Reverse Hash Lookup
            </button>
          </div>
        </div>

        {/* Tab 1: Text Hashing */}
        {activeTab === "text" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Input Text or Secret String
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste text to compute cryptographic hashes..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {hashes && (
              <div className="space-y-4">
                {[
                  {
                    id: "sha256",
                    name: "SHA-256 (NIST Secure Hash Standard)",
                    val: hashes.sha256,
                    bits: "256 bits",
                  },
                  {
                    id: "md5",
                    name: "MD5 (RFC 1321 Standard)",
                    val: hashes.md5,
                    bits: "128 bits",
                  },
                  {
                    id: "sha512",
                    name: "SHA-512 (High Entropy)",
                    val: hashes.sha512,
                    bits: "512 bits",
                  },
                  {
                    id: "sha1",
                    name: "SHA-1 (Legacy Digest)",
                    val: hashes.sha1,
                    bits: "160 bits",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.bits})</span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.val, item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedKey === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 break-all select-all">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: File Checksum */}
        {activeTab === "file" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center shadow-xl">
              <input type="file" id="file-hash" onChange={handleFileUpload} className="hidden" />
              <label
                htmlFor="file-hash"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-base font-bold text-white mb-1">
                  Click to select or drop any file for verification
                </span>
                <span className="text-xs text-slate-500">
                  Computes SHA-256, SHA-512, and MD5 file checksums locally
                </span>
              </label>

              {file && (
                <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl inline-flex items-center gap-2 text-xs font-mono text-slate-300">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {isFileHashing && (
              <div className="p-6 text-center text-xs font-mono text-purple-400">
                Computing cryptographic checksums across file bytes...
              </div>
            )}

            {fileHashes && (
              <div className="space-y-4">
                {[
                  { id: "file_sha256", name: "SHA-256 Checksum", val: fileHashes.sha256 },
                  { id: "file_md5", name: "MD5 Checksum", val: fileHashes.md5 },
                  { id: "file_sha512", name: "SHA-512 Checksum", val: fileHashes.sha512 },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <button
                        onClick={() => handleCopy(item.val, item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300 break-all select-all">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reverse Hash Lookup & Science Explanation */}
        {activeTab === "reverse" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Reverse Hash Lookup (Rainbow Dictionary)
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Paste MD5, SHA-1, or SHA-256 hash (e.g. 098f6bcd4621d373cade4e832627b4f6)..."
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleLookup}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-purple-600/25"
                >
                  Reverse Lookup
                </button>
              </div>

              {lookupResult && (
                <div
                  className={`p-5 rounded-xl border ${
                    lookupResult.found
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                    {lookupResult.found ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    )}
                    <span>
                      {lookupResult.found
                        ? `Match Found in Rainbow Table (${lookupResult.algorithm})!`
                        : `No direct dictionary match found (${lookupResult.algorithm})`}
                    </span>
                  </div>

                  {lookupResult.found ? (
                    <div className="font-mono text-sm pt-2">
                      Plaintext: <strong className="text-white text-base">&quot;{lookupResult.plaintext}&quot;</strong>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Cryptographic hashes are mathematically one-way (irreversible trapdoors). If a hash is generated from a high-entropy secret, it cannot be reversed except by guessing (brute-force or rainbow dictionary).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cryptographic Education Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Can cryptographic hashes be reversed?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By mathematical design, a hash function (like SHA-256 or MD5) is a <strong>one-way function</strong>: it maps input data of any size into a fixed-length output digest. Because millions of different inputs could theoretically produce the same hash (pigeonhole principle), there is no algebraic &quot;decrypt&quot; formula.
                Reversal is only possible by comparing against pre-computed dictionaries (rainbow tables) or brute-forcing potential passwords.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
