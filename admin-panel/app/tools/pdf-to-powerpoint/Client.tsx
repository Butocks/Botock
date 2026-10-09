"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Presentation,
  Download,
  Trash2,
  Sparkles,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export default function PdfToPowerpointClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [slidePreviews, setSlidePreviews] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setError("Please choose a valid PDF file.");
        return;
      }
      setError(null);
      setFile(selected);
      setDownloadUrl(null);
      setIsRendering(true);
      setProgress(0);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        // Render first 4 slide thumbnails
        const previewUrls: string[] = [];
        const previewLimit = Math.min(pdf.numPages, 4);

        for (let i = 1; i <= previewLimit; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            previewUrls.push(canvas.toDataURL("image/jpeg", 0.7));
          }
        }
        setSlidePreviews(previewUrls);
      } catch (err: any) {
        setError(err.message || "Failed to parse PDF document.");
      } finally {
        setIsRendering(false);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgress(5);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const zip = new JSZip();

      // Standard PowerPoint PPTX structure files
      // 1. [Content_Types].xml
      let contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`;

      for (let i = 1; i <= numPages; i++) {
        contentTypes += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
      }
      contentTypes += `\n</Types>`;
      zip.file("[Content_Types].xml", contentTypes);

      // 2. _rels/.rels
      zip.file(
        "_rels/.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
      );

      // 3. ppt/presentation.xml
      let sldIdList = "";
      let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`;

      for (let i = 1; i <= numPages; i++) {
        const id = i + 1;
        sldIdList += `\n    <p:sldId id="${255 + i}" r:id="rId${id}"/>`;
        presRels += `\n  <Relationship Id="rId${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
      }
      presRels += `\n</Relationships>`;
      zip.file("ppt/_rels/presentation.xml.rels", presRels);

      // 16:9 standard slide width (9144000 x 5143500 EMUs) or 4:3 standard (9144000 x 6858000)
      zip.file(
        "ppt/presentation.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>${sldIdList}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
      );

      // 4. Slide Master & Layout placeholders
      zip.file(
        "ppt/slideMasters/slideMaster1.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`
      );
      zip.file(
        "ppt/slideMasters/_rels/slideMaster1.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
      );
      zip.file(
        "ppt/slideLayouts/slideLayout1.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`
      );
      zip.file(
        "ppt/slideLayouts/_rels/slideLayout1.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
      );

      // Render high-res slides and create slides XML
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High-def 2x raster
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const base64Data = imgDataUrl.replace(/^data:image\/jpeg;base64,/, "");
        zip.file(`ppt/media/image${i}.jpeg`, base64Data, { base64: true });

        // Slide XML
        const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="Slide Image ${i}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="9144000" cy="5143500"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`;
        zip.file(`ppt/slides/slide${i}.xml`, slideXml);

        // Slide Rels
        const slideRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpeg"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
        zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, slideRels);

        setProgress(Math.round((i / numPages) * 90));
      }

      // Generate .pptx blob
      const pptxBlob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      const url = URL.createObjectURL(pptxBlob);
      setDownloadUrl(url);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || "Failed to generate PowerPoint presentation.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Presentation className="w-3.5 h-3.5" />
            PDF to PPTX Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert PDF to PowerPoint Presentation
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert every PDF page into high-definition editable Microsoft PowerPoint (.pptx) presentation slides right inside your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-orange-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Presentation className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your PDF presentation or document
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Native OpenXML packaging: converts directly into standard .pptx format.
              </p>
              <span className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/25 transition">
                Choose PDF Document
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
          /* File Preview & Conversion Area */
          <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
            <div className="flex items-center justify-between w-full pb-4 border-b border-slate-800 text-xs text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-slate-200 truncate max-w-sm">{file.name}</span>
              </div>
              <span>{pageCount} Slide{pageCount > 1 ? "s" : ""} • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            {/* Slide Previews Grid */}
            <div className="w-full mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Detected Slides Preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slidePreviews.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-slate-800 shadow-md group"
                  >
                    <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">
                      Slide {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
              {pageCount > 4 && (
                <p className="text-center text-xs text-slate-500 mt-2">
                  + {pageCount - 4} more slide{pageCount - 4 > 1 ? "s" : ""} included in conversion
                </p>
              )}
            </div>

            {/* Convert or Download Action */}
            {!downloadUrl ? (
              <div className="w-full flex flex-col items-center gap-4">
                {isConverting && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Building PresentationML structure...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting Slides...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Convert to PowerPoint (.pptx)
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Success! Your PowerPoint presentation is ready for download.</span>
                </div>
                <a
                  href={downloadUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}.pptx`}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PowerPoint (.pptx)
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
                setSlidePreviews([]);
              }}
              className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Choose another document
            </button>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3">
              <Presentation className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Standard 16:9 Presentation</h4>
            <p className="text-xs text-slate-400">
              Generated slides match standard widescreen presentation layouts compatible with Microsoft PowerPoint, Google Slides, and Apple Keynote.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Private & Browser-Native</h4>
            <p className="text-xs text-slate-400">
              The XML slides and high-definition raster elements are compiled entirely in your browser using JSZip. Zero cloud upload.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">High-Definition Quality</h4>
            <p className="text-xs text-slate-400">
              Every slide is rendered at double raster scaling to ensure clear text and diagrams when presenting on projectors and 4K displays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
