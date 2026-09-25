"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Code,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings2,
} from "lucide-react";
import { jsPDF } from "jspdf";

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 40px;
      color: #1e293b;
    }
    .header {
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 15px;
      margin-bottom: 30px;
    }
    h1 {
      color: #0f172a;
      margin: 0 0 10px 0;
      font-size: 26px;
    }
    p {
      line-height: 1.6;
      color: #475569;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 25px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      text-align: left;
      font-size: 13px;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0284c7;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">PRO FORMA INVOICE</span>
    <h1>Monthly Executive Summary</h1>
    <p>Botock High-Performance Cloud Architecture</p>
  </div>
  
  <p>Thank you for partnering with Botock. Below is your itemized overview of client-side web utility modules rendered with zero-latency browser pipelines.</p>

  <table>
    <thead>
      <tr>
        <th>Service Description</th>
        <th>Environment</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Client-Side WASM PDF Compilation</td>
        <td>Browser WebWorker</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Zero-Cloud Document Encryption</td>
        <td>Local Memory Sandbox</td>
        <td>Verified</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

export default function HtmlToPdfClient() {
  const [htmlCode, setHtmlCode] = useState<string>(DEFAULT_HTML);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"p" | "l">("p");
  const [margin, setMargin] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a hidden container with the HTML to render via jsPDF html method
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = orientation === "p" ? "794px" : "1123px"; // standard A4 pixel width at 96 DPI
      container.style.background = "#ffffff";
      container.innerHTML = htmlCode;
      document.body.appendChild(container);

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize,
      });

      await doc.html(container, {
        callback: (pdf) => {
          document.body.removeChild(container);
          const blob = pdf.output("blob");
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setIsGenerating(false);
        },
        margin: [margin, margin, margin, margin],
        autoPaging: "text",
        x: margin,
        y: margin,
        width: orientation === "p" ? 210 - margin * 2 : 297 - margin * 2,
        windowWidth: orientation === "p" ? 794 : 1123,
      });
    } catch (err: any) {
      setError(err.message || "Failed to render HTML to PDF document.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" />
            HTML to PDF Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert HTML Code to PDF Document
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Render raw HTML code, CSS stylesheets, tables, and web templates into pixel-perfect PDF documents in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Code Editor Pane */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                HTML & CSS Template
              </span>
              <button
                onClick={() => setHtmlCode(DEFAULT_HTML)}
                className="text-xs text-sky-400 hover:underline"
              >
                Reset Default Template
              </button>
            </div>
            <textarea
              value={htmlCode}
              onChange={(e) => {
                setHtmlCode(e.target.value);
                setDownloadUrl(null);
              }}
              className="w-full h-130 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-sky-200 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
            />
          </div>

          {/* Right Live Preview & Export Settings */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Live Document Preview
              </span>
              <div className="w-full h-80 bg-white rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                <iframe
                  ref={previewFrameRef}
                  srcDoc={htmlCode}
                  title="HTML Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Layout Options */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-sky-400" />
                Document Setup
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Page Format</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">US Letter (8.5 x 11 in)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="p">Portrait (Vertical)</option>
                    <option value="l">Landscape (Horizontal)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Page Margin ({margin}mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>

              {!downloadUrl ? (
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGenerating || !htmlCode.trim()}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Rendering PDF Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate PDF from HTML
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <a
                    href={downloadUrl}
                    download="document.pdf"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Generated PDF
                  </a>
                  <button
                    onClick={() => setDownloadUrl(null)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white text-center"
                  >
                    Re-render with new changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Full CSS3 & Styling Support</h4>
            <p className="text-xs text-slate-400">
              Style your documents with modern CSS, flexbox, custom fonts, borders, colored tables, and pro-forma invoice layouts.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Completely Private</h4>
            <p className="text-xs text-slate-400">
              Your HTML code and generated PDF are created natively in your browser using DOM rasterization. No remote server rendering.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Standard Paper Formats</h4>
            <p className="text-xs text-slate-400">
              Export in standard International A4 or US Letter formats in both portrait and landscape orientations with custom margins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
