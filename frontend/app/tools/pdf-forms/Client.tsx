"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";

interface FormFieldItem {
  id: string;
  name: string;
  type: "text" | "checkbox";
  x: number;
  y: number;
  width: number;
  height: number;
  pageNum: number;
}

export default function PdfFormsClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [fields, setFields] = useState<FormFieldItem[]>([]);
  const [newFieldName, setNewFieldName] = useState<string>("Full Name");
  const [newFieldType, setNewFieldType] = useState<"text" | "checkbox">("text");
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFields([]);
      setDownloadUrl(null);
      setError(null);

      try {
        const buffer = await selected.arrayBuffer();
        const doc = await PDFDocument.load(buffer);
        setPageCount(doc.getPageCount());

        // Check if existing form fields already exist
        const form = doc.getForm();
        const existingFields = form.getFields();
        const detected: FormFieldItem[] = [];

        existingFields.forEach((f, idx) => {
          detected.push({
            id: `detected-${idx}`,
            name: f.getName(),
            type: f instanceof PDFCheckBox ? "checkbox" : "text",
            x: 50,
            y: 50 + idx * 40,
            width: 200,
            height: 25,
            pageNum: 1,
          });
        });

        if (detected.length > 0) {
          setFields(detected);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load PDF.");
      }
    }
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const newField: FormFieldItem = {
      id: Math.random().toString(),
      name: newFieldName.trim(),
      type: newFieldType,
      x: 50,
      y: 100 + fields.length * 35,
      width: newFieldType === "text" ? 220 : 20,
      height: newFieldType === "text" ? 26 : 20,
      pageNum: selectedPage,
    };
    setFields((prev) => [...prev, newField]);
    setNewFieldName("");
  };

  const handleBuildForm = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const form = doc.getForm();
      const pages = doc.getPages();

      for (const field of fields) {
        if (field.pageNum <= pages.length) {
          const page = pages[field.pageNum - 1];
          const { height } = page.getSize();
          const targetY = height - field.y - field.height;

          if (field.type === "text") {
            const tf = form.createTextField(field.name);
            tf.addToPage(page, {
              x: field.x,
              y: Math.max(10, targetY),
              width: field.width,
              height: field.height,
            });
          } else {
            const cb = form.createCheckBox(field.name);
            cb.addToPage(page, {
              x: field.x,
              y: Math.max(10, targetY),
              width: field.width,
              height: field.height,
            });
          }
        }
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to compile fillable PDF form.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileCode className="w-3.5 h-3.5" />
            Interactive PDF Form Creator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create Fillable PDF Forms Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg">
            Add fillable text fields, checkboxes, and interactive AcroForm elements to static PDF documents directly in your browser.
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
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-emerald-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <FileCode className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select PDF to create fillable form
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Embeds interactive AcroForm text fields and checkboxes.
              </p>
              <span className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition">
                Choose PDF File
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="flex items-center gap-3 w-full pb-4 border-b border-slate-800 text-xs text-slate-400 mb-6">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div className="truncate flex-1">
                <span className="font-medium text-slate-200 block truncate">{file.name}</span>
                <span>{pageCount} Pages • {(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setFields([]);
                }}
                className="text-slate-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Field Creator Toolbar */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Add Form Field Element
              </span>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Field label (e.g. Email Address)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="text">Text Box (Single line)</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <button
                  onClick={handleAddField}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>
            </div>

            {/* Configured Fields List */}
            <div className="w-full mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                AcroForm Field Elements ({fields.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fields.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No form fields added yet. Add text boxes or checkboxes above.
                  </p>
                ) : (
                  fields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{f.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({f.type})</span>
                      </div>
                      <button
                        onClick={() => setFields((prev) => prev.filter((item) => item.id !== f.id))}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!downloadUrl ? (
              <button
                onClick={handleBuildForm}
                disabled={isProcessing || fields.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Embedding AcroForm Schema...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Compile Fillable PDF Form
                  </>
                )}
              </button>
            ) : (
              <div className="w-full space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Fillable PDF Form Created!</p>
                    <p>Compatible with Adobe Acrobat, Chrome PDF Viewer, and Apple Preview.</p>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  download={`form-${file.name}`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Fillable PDF Form
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Standard AcroForm Spec</h4>
            <p className="text-xs text-slate-400">
              Generates native ISO compliant AcroForm interactive fields readable by Adobe Reader, web browsers, and macOS Preview.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero Server Processing</h4>
            <p className="text-xs text-slate-400">
              Interactive forms are injected entirely inside your browser memory using WebAssembly. No files leave your device.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Multiple Control Types</h4>
            <p className="text-xs text-slate-400">
              Easily generate customer intake questionnaires, waivers, NDA sign-offs, and compliance surveys with text inputs and checkboxes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
