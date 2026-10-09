"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, MousePointerClick, Square, Type, X, Plus } from "lucide-react";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";
import * as pdfjsLib from "pdfjs-dist";

// Set worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FormField {
  id: string;
  type: "text" | "checkbox";
  page: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  name: string;
}

export default function PDFFormsClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fields, setFields] = useState<FormField[]>([]);
  const [activeTool, setActiveTool] = useState<"text" | "checkbox" | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setFields([]);
      resetDownload();
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading PDF with pdfjs:", err);
      }
    }
  }, [resetDownload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    let isActive = true;

    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (isActive) console.error("Error rendering page:", err);
      }
    };
    
    renderPage();
    return () => {
      isActive = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, currentPage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setFields([...fields, {
      id: Math.random().toString(36).substring(7),
      type: activeTool,
      page: currentPage,
      x: x * 100,
      y: y * 100,
      name: `Field_${fields.length + 1}`
    }]);
    
    setActiveTool(null);
  };

  const handleGenerate = async () => {
    if (!file || fields.length === 0) return;
    setIsProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      
      for (const field of fields) {
        const page = pdfDoc.getPage(field.page - 1);
        const { width, height } = page.getSize();
        
        // Convert percentages to PDF coordinates (bottom-left origin)
        const xCoord = (field.x / 100) * width;
        const yCoord = height - ((field.y / 100) * height);
        
        if (field.type === "text") {
          const textField = form.createTextField(field.name);
          textField.addToPage(page, { 
            x: xCoord, 
            y: yCoord - 20, 
            width: 150, 
            height: 25,
            borderWidth: 1,
            borderColor: rgb(0,0,0)
          });
        } else if (field.type === "checkbox") {
          const checkbox = form.createCheckBox(field.name);
          checkbox.addToPage(page, { 
            x: xCoord, 
            y: yCoord - 15, 
            width: 15, 
            height: 15,
            borderWidth: 1,
            borderColor: rgb(0,0,0)
          });
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      setBlob(pdfBytes);
    } catch (err) {
      console.error("Error generating form:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdf(null);
    setFields([]);
    resetDownload();
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div {...getRootProps()} className="border-2 border-dashed border-slate-300 dark:border-white/[0.1] rounded-2xl p-16 text-center cursor-pointer hover:border-violet-500 transition-colors">
          <input {...getInputProps()} />
          <FileUp className="w-10 h-10 mx-auto text-slate-400 mb-4" />
          <p className="font-bold text-slate-900 dark:text-white">Upload PDF to add fields</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <button onClick={() => setActiveTool("text")} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTool === "text" ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                 <Type className="w-4 h-4" /> Add Text
               </button>
               <button onClick={() => setActiveTool("checkbox")} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTool === "checkbox" ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                 <Square className="w-4 h-4" /> Add Checkbox
               </button>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded disabled:opacity-50">Prev</button>
                <span>Page {currentPage} of {numPages}</span>
                <button onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))} disabled={currentPage === numPages} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded disabled:opacity-50">Next</button>
             </div>
          </div>
          
          <div className="flex gap-6">
             <div className="flex-1 relative border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 rounded-xl overflow-hidden shadow-inner flex justify-center p-4">
                <div 
                  className={`relative cursor-${activeTool ? "crosshair" : "default"} inline-block shadow-lg`} 
                  onClick={handleCanvasClick}
                >
                  <canvas ref={canvasRef} className="max-w-full h-auto bg-white" />
                  
                  {fields.filter(f => f.page === currentPage).map(f => (
                    <div 
                      key={f.id}
                      className="absolute border-2 border-violet-500 bg-violet-500/20 text-violet-800 text-[10px] font-bold px-1"
                      style={{ 
                        left: `${f.x}%`, 
                        top: `${f.y}%`, 
                        width: f.type === "text" ? "100px" : "15px", 
                        height: f.type === "text" ? "20px" : "15px",
                        transform: "translate(0, -100%)"
                      }}
                    >
                      {f.type === "text" ? "Text" : "✓"}
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="w-64 space-y-4">
                <h3 className="font-bold">Added Fields</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                   {fields.map(f => (
                     <div key={f.id} className="p-2 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-between text-sm">
                        <span>{f.type} (Pg {f.page})</span>
                        <button onClick={() => setFields(fields.filter(x => x.id !== f.id))} className="text-red-500"><X className="w-4 h-4" /></button>
                     </div>
                   ))}
                   {fields.length === 0 && <p className="text-xs text-slate-500">No fields added yet. Select a tool and click on the page.</p>}
                </div>
                
                <button 
                  onClick={handleGenerate}
                  disabled={isProcessing || fields.length === 0}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Generate Form
                </button>
                
                <button onClick={resetAll} className="w-full py-2 text-slate-500 text-sm font-bold">Start Over</button>
             </div>
          </div>
          
          {downloadUrl && (
             <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-emerald-700 font-bold">Form created successfully!</span>
                <a href={downloadUrl} download="form.pdf" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Download PDF</a>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
