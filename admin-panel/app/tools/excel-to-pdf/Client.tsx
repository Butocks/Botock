"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Table,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExcelToPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const [orientation, setOrientation] = useState<"p" | "l">("l");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadUrl(null);
      setError(null);

      try {
        const buffer = await selected.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        if (wb.SheetNames.length > 0) {
          const firstSheet = wb.SheetNames[0];
          setSelectedSheet(firstSheet);
          loadSheetData(wb, firstSheet);
        }
      } catch (err: any) {
        setError(err.message || "Failed to parse Excel workbook.");
      }
    }
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheet: string) => {
    const ws = wb.Sheets[sheet];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    setSheetData(data);
  };

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
    if (workbook) {
      loadSheetData(workbook, sheet);
    }
  };

  const handleConvert = () => {
    if (!sheetData || sheetData.length === 0) {
      setError("The selected sheet contains no data.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const doc = new jsPDF({
        orientation,
        unit: "pt",
        format: "a4",
      });

      // Format header and body
      const headers = (sheetData[0] || []).map((h: any) => String(h || ""));
      const body = sheetData.slice(1).map((row) =>
        headers.map((_, colIdx) => String(row[colIdx] !== undefined ? row[colIdx] : ""))
      );

      autoTable(doc, {
        head: [headers],
        body: body,
        theme: "striped",
        headStyles: {
          fillColor: [16, 185, 129], // emerald-500
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 30, left: 20, right: 20, bottom: 30 },
      });

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to convert Excel spreadsheet to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel to PDF Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert Excel to PDF Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg">
            Convert XLSX, XLS, and CSV spreadsheets into beautifully styled, printable PDF documents directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="excel-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-emerald-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your Excel spreadsheet (.xlsx, .xls, .csv)
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Auto-fit tables and clean striped data grids. Zero cloud uploads.
              </p>
              <span className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition">
                Choose Excel File
              </span>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="flex items-center gap-3 w-full pb-4 border-b border-slate-800 text-xs text-slate-400 mb-6">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div className="truncate flex-1">
                <span className="font-medium text-slate-200 block truncate">{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setSheetData([]);
                }}
                className="text-slate-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Workbook Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Select Sheet</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">PDF Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="l">Landscape (Recommended for tables)</option>
                  <option value="p">Portrait (Vertical)</option>
                </select>
              </div>
            </div>

            {/* Sheet Preview Table (first 5 rows) */}
            <div className="w-full mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Data Preview ({sheetData.length} total rows)
              </span>
              <div className="w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      {(sheetData[0] || []).slice(0, 6).map((h: any, idx: number) => (
                        <th key={idx} className="p-2.5">
                          {String(h || `Col ${idx + 1}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sheetData.slice(1, 5).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.slice(0, 6).map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="p-2.5 truncate max-w-xs">
                            {String(cell !== undefined ? cell : "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!downloadUrl ? (
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Table Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Convert to PDF
                  </>
                )}
              </button>
            ) : (
              <div className="w-full space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Conversion Successful!</p>
                    <p>Clean auto-fit PDF document created from sheet "{selectedSheet}".</p>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}.pdf`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Converted PDF
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Table className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Automatic Grid Formatting</h4>
            <p className="text-xs text-slate-400">
              Columns are auto-calculated and wrapped to fit standard A4 paper width cleanly without clipping wide cells.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              Your financial records, salaries, and company sheets are parsed in your browser memory via SheetJS. Zero data is sent to a server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Multi-Sheet Support</h4>
            <p className="text-xs text-slate-400">
              Select specific tabs within multi-sheet Excel workbooks to generate individual dedicated PDF reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
