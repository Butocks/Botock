"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function JwtDecoderClient() {
  const [token, setToken] = useState(
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNtaXRoIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDgwMDAwMDAwfQ.4S_X0-k6b4X_s3k8_Zg0n8yX0s1_q7w`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!token.trim()) {
      return {
        header: null,
        payload: null,
        signature: "",
        error: null,
        isExpired: false,
        expDate: null,
        iatDate: null,
      };
    }

    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT: A valid token must have exactly 3 parts separated by dots.");
      }

      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      };

      const headerJson = JSON.parse(decodeBase64Url(parts[0]));
      const payloadJson = JSON.parse(decodeBase64Url(parts[1]));

      let isExpired = false;
      let expDate: Date | null = null;
      let iatDate: Date | null = null;

      if (payloadJson.exp) {
        expDate = new Date(payloadJson.exp * 1000);
        isExpired = Date.now() > expDate.getTime();
      }

      if (payloadJson.iat) {
        iatDate = new Date(payloadJson.iat * 1000);
      }

      return {
        header: headerJson,
        payload: payloadJson,
        signature: parts[2],
        error: null,
        isExpired,
        expDate,
        iatDate,
      };
    } catch (err: any) {
      return {
        header: null,
        payload: null,
        signature: "",
        error: err.message || "Failed to decode JWT token.",
        isExpired: false,
        expDate: null,
        iatDate: null,
      };
    }
  }, [token]);

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            100% Client-Side Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            JSON Web Token (JWT) Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Inspect JWT header, payload claims, and token validity safely. Tokens are never transmitted to any server.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Encoded JWT Token
            </span>
            <button
              onClick={() => setToken("")}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste raw JWT token string (e.g. eyJhbGci...)..."
            className="w-full h-28 bg-transparent text-purple-300 placeholder-slate-600 resize-y focus:outline-none font-mono text-xs sm:text-sm leading-relaxed break-all"
          />

          {decoded.error && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{decoded.error}</span>
            </div>
          )}
        </div>

        {/* Token Expiration Status Pill */}
        {decoded.payload && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                decoded.isExpired
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {decoded.isExpired ? (
                <ShieldAlert className="w-6 h-6 shrink-0 text-rose-400" />
              ) : (
                <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {decoded.isExpired ? "Token Expired" : "Token Valid (Active)"}
                </span>
                <span className="text-xs opacity-80">
                  {decoded.expDate
                    ? `Expires: ${decoded.expDate.toLocaleString()}`
                    : "No expiration claim (exp) defined"}
                </span>
              </div>
            </div>

            {decoded.iatDate && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <Clock className="w-6 h-6 shrink-0 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Issued At (iat)
                  </span>
                  <span className="text-xs text-slate-400">
                    {decoded.iatDate.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decoded Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                Header: Algorithm & Token Type
              </span>
              {decoded.header && (
                <button
                  onClick={() =>
                    handleCopy("header", JSON.stringify(decoded.header, null, 2))
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === "header" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedKey === "header" ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <pre className="flex-1 bg-slate-950/70 p-4 rounded-xl border border-slate-800/60 font-mono text-xs text-rose-300 overflow-x-auto min-h-[140px]">
              {decoded.header
                ? JSON.stringify(decoded.header, null, 2)
                : "// Header JSON will appear here"}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                Payload: Data Claims
              </span>
              {decoded.payload && (
                <button
                  onClick={() =>
                    handleCopy("payload", JSON.stringify(decoded.payload, null, 2))
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === "payload" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedKey === "payload" ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <pre className="flex-1 bg-slate-950/70 p-4 rounded-xl border border-slate-800/60 font-mono text-xs text-purple-300 overflow-x-auto min-h-[140px]">
              {decoded.payload
                ? JSON.stringify(decoded.payload, null, 2)
                : "// Payload JSON will appear here"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
