"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb, StandardFonts, PDFName, PDFDict, PDFBool } from "pdf-lib";
import {
  FileUp,
  FileText,
  Download,
  Loader2,
  Square,
  Type,
  X,
  Plus,
  PenTool,
  Calendar,
  List,
  CheckSquare,
  Heading,
  Trash2,
  Sparkles,
  Sliders,
  Check,
  Eye,
  RefreshCw,
  RotateCcw,
  FolderOpen,
  Info,
} from "lucide-react";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface FormFieldItem {
  id: string;
  type: "text" | "textarea" | "checkbox" | "signature" | "date" | "dropdown" | "heading";
  page: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // in pixels
  height: number;
  label: string;
  placeholder?: string;
  options?: string[]; // for dropdown
  required?: boolean;
}

const DEFAULT_SAMPLE_FIELDS: FormFieldItem[] = [
  {
    id: "f_title",
    type: "heading",
    page: 1,
    x: 10,
    y: 8,
    width: 480,
    height: 36,
    label: "Official Registration Form",
  },
  {
    id: "f_name",
    type: "text",
    page: 1,
    x: 10,
    y: 18,
    width: 260,
    height: 40,
    label: "Full Legal Name",
    placeholder: "e.g. John Doe",
    required: true,
  },
  {
    id: "f_email",
    type: "text",
    page: 1,
    x: 52,
    y: 18,
    width: 260,
    height: 40,
    label: "Email Address",
    placeholder: "john@example.com",
    required: true,
  },
  {
    id: "f_date",
    type: "date",
    page: 1,
    x: 10,
    y: 30,
    width: 220,
    height: 40,
    label: "Date of Submission",
    placeholder: "YYYY-MM-DD",
  },
  {
    id: "f_notes",
    type: "textarea",
    page: 1,
    x: 10,
    y: 43,
    width: 500,
    height: 80,
    label: "Remarks & Description",
    placeholder: "Enter details here...",
  },
  {
    id: "f_agree",
    type: "checkbox",
    page: 1,
    x: 10,
    y: 60,
    width: 24,
    height: 24,
    label: "I agree to the terms and privacy conditions",
    required: true,
  },
  {
    id: "f_sig",
    type: "signature",
    page: 1,
    x: 10,
    y: 72,
    width: 280,
    height: 60,
    label: "Authorized Signature",
  },
];

export default function PDFFormsClient() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePdf, setTemplatePdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);

  const [formTitle, setFormTitle] = useState<string>("Application & Registration Form");
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form Fields
  const [fields, setFields] = useState<FormFieldItem[]>(DEFAULT_SAMPLE_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activePlacementTool, setActivePlacementTool] = useState<FormFieldItem["type"] | null>(null);

  // Interactive Test / Fill mode
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [testFormData, setTestFormData] = useState<Record<string, any>>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Load existing PDF template if user imports one
  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setTemplateFile(f);
      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTemplatePdf(pdfDoc);
        setPageCount(pdfDoc.numPages);
        setCurrentPage(1);

        // Render thumbs
        const thumbs: string[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const vp = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            thumbs.push(canvas.toDataURL("image/jpeg", 0.85));
          }
        }
        setPageThumbnails(thumbs);
      } catch (err) {
        console.error("Template parse error:", err);
      }
    }
  };

  const handleClearAllFields = () => {
    setFields([]);
    setSelectedFieldId(null);
    resetDownload();
  };

  const handleRestoreDefaultForm = () => {
    setFields(DEFAULT_SAMPLE_FIELDS);
    setSelectedFieldId(null);
    resetDownload();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPreviewMode) return;
    if (!activePlacementTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(2, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    const defaultLabels: Record<FormFieldItem["type"], string> = {
      text: "Text Field",
      textarea: "Multiline Text Box",
      checkbox: "Check to confirm",
      signature: "Signature Line",
      date: "Date Field",
      dropdown: "Select Option",
      heading: "Section Title",
    };

    const newField: FormFieldItem = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(6)}`,
      type: activePlacementTool,
      page: currentPage,
      x,
      y,
      width: activePlacementTool === "checkbox" ? 24 : activePlacementTool === "heading" ? 380 : 240,
      height: activePlacementTool === "textarea" ? 80 : activePlacementTool === "signature" ? 60 : 36,
      label: defaultLabels[activePlacementTool],
      placeholder: activePlacementTool === "text" ? "Enter value..." : undefined,
      required: false,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setActivePlacementTool(null);
    resetDownload();
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
    resetDownload();
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Generate Computerized Interactive AcroForm PDF with pdf-lib
  const handleExportFormPdf = async () => {
    setIsProcessing(true);
    resetDownload();

    try {
      const sanitizeWinAnsi = (str: string) => {
        if (!str) return "";
        return str
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, "-")
          .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
      };

      let pdfDoc: PDFDocument;
      if (templateFile) {
        const buffer = await templateFile.arrayBuffer();
        pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      } else {
        pdfDoc = await PDFDocument.create();
        for (let p = 0; p < pageCount; p++) {
          pdfDoc.addPage([612, 792]); // Standard US Letter (8.5 x 11 inches at 72dpi)
        }
      }

      const form = pdfDoc.getForm();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageFields = fields;

      for (const item of pageFields) {
        const pageIdx = Math.min(item.page - 1, pdfDoc.getPageCount() - 1);
        const page = pdfDoc.getPage(pageIdx);
        const { width: pW, height: pH } = page.getSize();

        // Convert percentage coords (top-left) to PDF points (bottom-left)
        const pdfX = (item.x / 100) * pW;
        const pdfY = pH - (item.y / 100) * pH - item.height;

        if (item.type === "heading") {
          page.drawText(sanitizeWinAnsi(item.label), {
            x: pdfX,
            y: pdfY + 10,
            size: 16,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.15),
          });
          continue;
        }

        // Draw label above the field
        page.drawText(sanitizeWinAnsi(item.label) + (item.required ? " *" : ""), {
          x: pdfX,
          y: pdfY + item.height + 4,
          size: 9,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.25),
        });

        const val = testFormData[item.id];

        if (item.type === "text" || item.type === "date") {
          const tf = form.createTextField(item.id);
          if (val !== undefined && val !== null && String(val) !== "") {
            tf.setText(sanitizeWinAnsi(String(val)));
          } else if (item.placeholder) {
            tf.setText("");
          }
          tf.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height,
            borderWidth: 1,
            borderColor: rgb(0.65, 0.7, 0.75),
            backgroundColor: rgb(0.98, 0.98, 1),
          });
        } else if (item.type === "textarea") {
          const tf = form.createTextField(item.id);
          tf.enableMultiline();
          if (val !== undefined && val !== null && String(val) !== "") {
            tf.setText(sanitizeWinAnsi(String(val)));
          }
          tf.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height,
            borderWidth: 1,
            borderColor: rgb(0.65, 0.7, 0.75),
            backgroundColor: rgb(0.98, 0.98, 1),
          });
        } else if (item.type === "checkbox") {
          const cb = form.createCheckBox(item.id);
          if (val) {
            cb.check();
          }
          cb.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: 18,
            height: 18,
            borderWidth: 1,
            borderColor: rgb(0.4, 0.4, 0.5),
            backgroundColor: rgb(1, 1, 1),
          });
        } else if (item.type === "signature") {
          // Draw signature guide box
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height,
            borderWidth: 1,
            borderColor: rgb(0.65, 0.7, 0.75),
            color: rgb(0.97, 0.98, 1),
          });
          page.drawText("Click to Sign / Type Signature", {
            x: pdfX + 8,
            y: pdfY + 12,
            size: 8,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.6),
          });
          const tf = form.createTextField(item.id);
          if (val !== undefined && val !== null && String(val) !== "") {
            tf.setText(sanitizeWinAnsi(String(val)));
          }
          tf.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height,
            borderWidth: 0,
          });
        } else if (item.type === "dropdown") {
          const dd = form.createDropdown(item.id);
          const opts = item.options && item.options.length > 0 ? item.options : ["Select...", "Option 1", "Option 2", "Option 3"];
          dd.setOptions(opts.map(sanitizeWinAnsi));
          if (val && opts.includes(String(val))) {
            dd.select(sanitizeWinAnsi(String(val)));
          }
          dd.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height,
            borderWidth: 1,
            borderColor: rgb(0.65, 0.7, 0.75),
            backgroundColor: rgb(0.98, 0.98, 1),
          });
        }
      }

      // Ensure NeedAppearances is set so Adobe Acrobat and all browsers display interactive typed values cleanly
      try {
        const acroForm = pdfDoc.catalog.lookup(PDFName.of("AcroForm"));
        if (acroForm instanceof PDFDict) {
          acroForm.set(PDFName.of("NeedAppearances"), PDFBool.True);
        }
      } catch (e) {
        console.warn("Could not set NeedAppearances:", e);
      }

      form.updateFieldAppearances(helvetica);

      const pdfBytes = await pdfDoc.save();
      setBlob(pdfBytes);
    } catch (err: any) {
      console.error("Failed to export fillable PDF form:", err);
      alert("Error generating PDF form: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageFields = fields.filter((f) => f.page === currentPage);

  return (
    <div className="w-full text-slate-900 dark:text-white flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-500 dark:selection:text-indigo-400">
      <div className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <PenTool className="w-3.5 h-3.5" />
              Interactive Form Creator Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              PDF Form Builder &amp; Creator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Design computerized fillable PDF forms directly in your browser. Add text inputs, multiline notes, checkboxes, dates, and signature areas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => templateInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
            >
              <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {templateFile ? "Replace PDF Template" : "Import PDF Template"}
            </button>
            <input
              ref={templateInputRef}
              type="file"
              accept=".pdf"
              onChange={handleTemplateUpload}
              className="hidden"
            />

            {!downloadUrl ? (
              <button
                type="button"
                onClick={handleExportFormPdf}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Exporting Form...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export Fillable PDF
                  </>
                )}
              </button>
            ) : (
              <a
                href={downloadUrl}
                download="fillable_form.pdf"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Fillable PDF
              </a>
            )}
          </div>
        </div>

        {/* Informative Banner: Computerized Fillability Explained */}
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                100% Computerized &amp; Fillable AcroForm PDF
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                When you download or send this PDF to someone, they can open it in <strong>Adobe Acrobat, Google Chrome, Microsoft Edge, Apple Preview</strong>, or smartphone PDF apps and <strong>type electronically directly on their computer or mobile</strong>—no paper or printer required!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                isPreviewMode
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {isPreviewMode ? "Back to Edit Layout" : "Test Typing Form (Preview Mode)"}
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Tool Palette Sidebar (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Add Form Elements
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click a tool below, then click anywhere on the page canvas to place it.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { type: "text", label: "Text Field", icon: Type, desc: "Single line input" },
                  { type: "textarea", label: "Multiline Text", icon: FileText, desc: "Large paragraph area" },
                  { type: "checkbox", label: "Checkbox", icon: CheckSquare, desc: "Yes / No selection" },
                  { type: "signature", label: "Signature Box", icon: PenTool, desc: "Sign here container" },
                  { type: "date", label: "Date Picker", icon: Calendar, desc: "Calendar date line" },
                  { type: "dropdown", label: "Dropdown Select", icon: List, desc: "Option dropdown menu" },
                  { type: "heading", label: "Section Title", icon: Heading, desc: "Heading & divider text" },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = activePlacementTool === tool.type;
                  return (
                    <button
                      key={tool.type}
                      type="button"
                      disabled={isPreviewMode}
                      onClick={() =>
                        setActivePlacementTool(isSelected ? null : (tool.type as any))
                      }
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center gap-3 ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] text-slate-750 dark:text-slate-300 disabled:opacity-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold leading-tight">{tool.label}</p>
                        <p className={`text-[10px] ${isSelected ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                          {tool.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePlacementTool && (
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-[11px] animate-pulse text-center font-medium">
                  Click on the document page to place this element.
                </div>
              )}
            </div>

            {/* Field Properties Inspector */}
            {selectedField && !isPreviewMode && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Field Settings
                  </h4>
                  <button
                    type="button"
                    onClick={() => deleteField(selectedField.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Field Label</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFields((prev) =>
                          prev.map((f) => (f.id === selectedField.id ? { ...f, label: val } : f))
                        );
                        resetDownload();
                      }}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {selectedField.type === "text" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Placeholder</label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFields((prev) =>
                            prev.map((f) => (f.id === selectedField.id ? { ...f, placeholder: val } : f))
                          );
                          resetDownload();
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {selectedField.type === "dropdown" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Dropdown Options (one per line or comma-separated)</label>
                      <textarea
                        rows={3}
                        value={(selectedField.options || []).join("\n")}
                        onChange={(e) => {
                          const val = e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
                          setFields((prev) =>
                            prev.map((f) => (f.id === selectedField.id ? { ...f, options: val } : f))
                          );
                          resetDownload();
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedField.required)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFields((prev) =>
                          prev.map((f) => (f.id === selectedField.id ? { ...f, required: checked } : f))
                        );
                        resetDownload();
                      }}
                      className="rounded accent-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300 text-xs">Required input</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Center Main Document Canvas (9 Columns) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Page Header Bar & Controls */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Page {currentPage} of {pageCount}
                </span>
                {templateFile && (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium">
                    Template: {templateFile.name}
                  </span>
                )}
                {fields.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 text-[10px]">
                    {fields.length} {fields.length === 1 ? "field" : "fields"}
                  </span>
                )}
              </div>

              {/* Action Buttons: Remove All, Restore Sample, Pages */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Clear All / Remove All Button */}
                <button
                  type="button"
                  onClick={handleClearAllFields}
                  title="Remove all fields from canvas"
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  Remove All
                </button>

                {/* Restore Sample Template */}
                <button
                  type="button"
                  onClick={handleRestoreDefaultForm}
                  title="Restore default sample registration form"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Sample Form
                </button>

                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-750 mx-1 hidden sm:block" />

                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 disabled:opacity-30"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPageCount((c) => c + 1);
                    setCurrentPage((c) => c + 1);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/30 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-200 text-xs font-semibold flex items-center gap-1 transition border border-indigo-200 dark:border-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Blank Page
                </button>
              </div>
            </div>

            {/* Test Fill Indicator if Preview Mode */}
            {isPreviewMode && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Interactive Preview Mode:</strong> Click any field below and type computerized text to experience how recipients fill out your form.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                >
                  Return to Edit
                </button>
              </div>
            )}

            {/* Canvas Viewport (US Letter / A4 Proportions: 612x792) */}
            <div className="flex justify-center p-4 bg-slate-100/70 dark:bg-black/40 rounded-3xl border border-slate-200 dark:border-white/[0.08] overflow-auto shadow-inner">
              <div
                ref={canvasContainerRef}
                onClick={handleCanvasClick}
                className={`relative w-full max-w-[620px] aspect-[1/1.294] bg-white rounded-xl shadow-2xl overflow-hidden select-none border border-black/10 transition-all ${
                  activePlacementTool && !isPreviewMode
                    ? "cursor-crosshair ring-2 ring-indigo-500/50"
                    : "cursor-default"
                }`}
              >
                {/* Background template thumbnail if uploaded */}
                {pageThumbnails[currentPage - 1] ? (
                  <img
                    src={pageThumbnails[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  /* Blank paper styling */
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                )}

                {/* Empty State when fields are 0 */}
                {currentPageFields.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-auto">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 text-indigo-500">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Page is Empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                      Select an element from the left toolbar and click anywhere on the page to place it, or click below to restore the sample form.
                    </p>
                    <button
                      type="button"
                      onClick={handleRestoreDefaultForm}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Sample Form
                    </button>
                  </div>
                )}

                {/* Form Fields Placed on this page */}
                {currentPageFields.map((f) => {
                  const isSelected = selectedFieldId === f.id && !isPreviewMode;

                  // RENDER IN TEST / PREVIEW FILL MODE
                  if (isPreviewMode) {
                    return (
                      <div
                        key={f.id}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          width: `${Math.min(f.width, 520)}px`,
                        }}
                        className="absolute z-20 pointer-events-auto"
                      >
                        {f.type !== "heading" && (
                          <label className="block text-[10px] font-bold text-slate-800 mb-1">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </label>
                        )}

                        {f.type === "text" && (
                          <input
                            type="text"
                            value={testFormData[f.id] || ""}
                            onChange={(e) =>
                              setTestFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                            }
                            placeholder={f.placeholder || "Type here..."}
                            className="w-full h-8 px-2.5 rounded bg-blue-50/50 border border-blue-400/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-xs transition"
                          />
                        )}

                        {f.type === "textarea" && (
                          <textarea
                            rows={3}
                            value={testFormData[f.id] || ""}
                            onChange={(e) =>
                              setTestFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                            }
                            placeholder={f.placeholder || "Enter notes..."}
                            className="w-full p-2 rounded bg-blue-50/50 border border-blue-400/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-xs resize-none transition"
                          />
                        )}

                        {f.type === "checkbox" && (
                          <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={Boolean(testFormData[f.id])}
                              onChange={(e) =>
                                setTestFormData((prev) => ({ ...prev, [f.id]: e.target.checked }))
                              }
                              className="w-4 h-4 rounded text-indigo-600 border-slate-400 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-700">{f.label}</span>
                          </label>
                        )}

                        {f.type === "date" && (
                          <input
                            type="date"
                            value={testFormData[f.id] || ""}
                            onChange={(e) =>
                              setTestFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 rounded bg-blue-50/50 border border-blue-400/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-xs transition"
                          />
                        )}

                        {f.type === "dropdown" && (
                          <select
                            value={testFormData[f.id] || ""}
                            onChange={(e) =>
                              setTestFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 rounded bg-blue-50/50 border border-blue-400/80 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-xs transition"
                          >
                            <option value="">Select an option...</option>
                            <option value="Option 1">Option 1 - Verified</option>
                            <option value="Option 2">Option 2 - Standard</option>
                            <option value="Option 3">Option 3 - Custom</option>
                          </select>
                        )}

                        {f.type === "signature" && (
                          <div className="h-12 rounded border border-dashed border-indigo-400 bg-indigo-50/60 flex items-center justify-center text-xs text-indigo-700 font-serif italic cursor-pointer">
                            ✍ Click or draw digital signature
                          </div>
                        )}

                        {f.type === "heading" && (
                          <div className="text-base font-extrabold text-slate-900 border-b border-slate-300 pb-1">
                            {f.label}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // RENDER IN EDIT & PLACEMENT MODE
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldId(f.id);
                      }}
                      style={{
                        left: `${f.x}%`,
                        top: `${f.y}%`,
                        width: `${Math.min(f.width, 520)}px`,
                      }}
                      className={`absolute rounded-lg transition-all ${
                        isSelected
                          ? "ring-2 ring-indigo-600 bg-indigo-50/70 shadow-lg z-20"
                          : "hover:ring-1 hover:ring-indigo-400 bg-white/90 z-10"
                      }`}
                    >
                      {/* Field Label Header */}
                      <div className="flex items-center justify-between px-1.5 pt-1 text-[10px] font-bold text-slate-800">
                        <span className="truncate">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </span>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(f.id);
                            }}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Mock Input Preview Component */}
                      <div className="p-1">
                        {f.type === "text" && (
                          <div className="h-7 rounded border border-slate-300 bg-slate-50 px-2 flex items-center text-[10px] text-slate-400">
                            {f.placeholder || "Text input"}
                          </div>
                        )}
                        {f.type === "textarea" && (
                          <div className="h-14 rounded border border-slate-300 bg-slate-50 p-1.5 text-[10px] text-slate-400">
                            {f.placeholder || "Multiline input"}
                          </div>
                        )}
                        {f.type === "checkbox" && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="w-4 h-4 rounded border border-slate-400 bg-white" />
                            <span className="text-[10px] text-slate-600">{f.label}</span>
                          </div>
                        )}
                        {f.type === "signature" && (
                          <div className="h-12 rounded border border-dashed border-indigo-400 bg-indigo-50/50 flex items-center justify-center text-[10px] text-indigo-600 font-serif italic">
                            ✍ Click to Sign Here
                          </div>
                        )}
                        {f.type === "date" && (
                          <div className="h-7 rounded border border-slate-300 bg-slate-50 px-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>YYYY-MM-DD</span>
                            <Calendar className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        {f.type === "dropdown" && (
                          <div className="h-7 rounded border border-slate-300 bg-slate-50 px-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Select option...</span>
                            <List className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        {f.type === "heading" && (
                          <div className="text-sm font-extrabold text-slate-900 border-b border-slate-300 pb-0.5">
                            {f.label}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
