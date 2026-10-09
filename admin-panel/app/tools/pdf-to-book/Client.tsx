"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFToBookClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading PDF:", err);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const renderPage = async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdf || !canvas || pageNum < 1 || pageNum > numPages) {
      if (canvas) {
         const ctx = canvas.getContext('2d');
         if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext("2d");
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  };

  useEffect(() => {
    // If page is 1, show it on the right (like a cover)
    // For other pages, show even on left, odd on right
    let leftPageNum = 0;
    let rightPageNum = 0;
    
    if (currentPage === 1) {
      leftPageNum = 0; // Empty left
      rightPageNum = 1;
    } else {
      // If we are at page 2, left is 2, right is 3
      leftPageNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      rightPageNum = leftPageNum + 1;
    }
    
    renderPage(leftPageNum, leftCanvasRef.current);
    renderPage(rightPageNum, rightCanvasRef.current);
  }, [pdf, currentPage, numPages]);

  const nextPage = () => {
    if (currentPage === 1) {
      setCurrentPage(2);
    } else {
      setCurrentPage(Math.min(numPages, currentPage + 2));
    }
  };

  const prevPage = () => {
    if (currentPage <= 2) {
      setCurrentPage(1);
    } else {
      setCurrentPage(Math.max(1, currentPage - 2));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm min-h-[600px] flex flex-col">
      {!file ? (
        <div {...getRootProps()} className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/[0.1] rounded-2xl p-16 text-center cursor-pointer hover:border-violet-500 transition-colors">
          <input {...getInputProps()} />
          <BookOpen className="w-16 h-16 text-violet-500 mb-6" />
          <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Upload PDF to read</h3>
          <p className="text-slate-500 max-w-md">Enjoy an immersive, side-by-side book reading experience right in your browser.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-4xl">
            <button onClick={() => setFile(null)} className="text-sm font-bold text-slate-500 hover:text-rose-500">Close Book</button>
            <div className="font-bold text-slate-400">
              {currentPage === 1 ? "Cover" : `Pages ${currentPage % 2 === 0 ? currentPage : currentPage - 1} - ${Math.min(numPages, currentPage % 2 === 0 ? currentPage + 1 : currentPage)}`} of {numPages}
            </div>
            <div className="w-20"></div>
          </div>
          
          <div className="relative flex items-center justify-center w-full max-w-5xl bg-slate-100 dark:bg-black/20 p-8 rounded-2xl">
            <button 
              onClick={prevPage} 
              disabled={currentPage <= 1}
              className="absolute left-4 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg disabled:opacity-30 z-10 hover:scale-110 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex bg-white dark:bg-slate-900 shadow-2xl rounded overflow-hidden">
               {/* Left Page */}
               <div className="w-[300px] md:w-[400px] lg:w-[450px] min-h-[400px] border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                 <canvas ref={leftCanvasRef} className="max-w-full max-h-[80vh] object-contain shadow-[-5px_0_15px_rgba(0,0,0,0.1)] origin-right" />
                 {currentPage === 1 && <div className="absolute inset-0 bg-slate-100/50 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center"><p className="text-slate-400 font-bold uppercase tracking-widest">Back Cover</p></div>}
               </div>
               
               {/* Right Page */}
               <div className="w-[300px] md:w-[400px] lg:w-[450px] min-h-[400px] bg-white dark:bg-[#121215] flex items-center justify-center relative overflow-hidden">
                 <canvas ref={rightCanvasRef} className="max-w-full max-h-[80vh] object-contain shadow-[5px_0_15px_rgba(0,0,0,0.1)] origin-left" />
                 {(currentPage === 1 ? 1 : (currentPage % 2 === 0 ? currentPage + 1 : currentPage)) > numPages && (
                   <div className="absolute inset-0 bg-slate-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                     <p className="text-slate-400 font-bold uppercase tracking-widest">End of Book</p>
                   </div>
                 )}
               </div>
            </div>
            
            <button 
              onClick={nextPage} 
              disabled={(currentPage === 1 ? 2 : (currentPage % 2 === 0 ? currentPage + 2 : currentPage + 1)) > numPages && currentPage > 1}
              className="absolute right-4 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg disabled:opacity-30 z-10 hover:scale-110 transition-transform"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
