import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Paintbrush, Undo, Redo, Save, X } from 'lucide-react';

interface ManualEditorProps {
  originalFile: File;
  processedUrl: string;
  onSave: (newUrl: string) => void;
  onCancel: () => void;
}

export default function ManualEditor({ originalFile, processedUrl, onSave, onCancel }: ManualEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);
  
  const [tool, setTool] = useState<"erase" | "restore">("erase");
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas with images
  useEffect(() => {
    const origImg = new Image();
    const procImg = new Image();
    
    let loaded = 0;
    const init = () => {
      loaded++;
      if (loaded === 2) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        canvas.width = procImg.width;
        canvas.height = procImg.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(procImg, 0, 0);
        
        saveState();
        
        // Auto-scale to fit container
        if (containerRef.current) {
          const container = containerRef.current;
          const padding = 60;
          const scaleX = (container.clientWidth - padding) / canvas.width;
          const scaleY = (container.clientHeight - padding) / canvas.height;
          setScale(Math.min(scaleX, scaleY, 1));
        }
      }
    };
    
    origImg.onload = init;
    procImg.onload = init;
    
    origImg.src = URL.createObjectURL(originalFile);
    procImg.src = processedUrl;
    
    originalImgRef.current = origImg;
    processedImgRef.current = procImg;
  }, [originalFile, processedUrl]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history to 20 steps to save memory
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      putState(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      putState(history[newIndex]);
    }
  };

  const putState = (imageData: ImageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    ctx.putImageData(imageData, 0, 0);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.closePath();

    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
    } else if (tool === 'restore') {
      // Need to draw from original image
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.clip();
      if (originalImgRef.current) {
        ctx.drawImage(originalImgRef.current, 0, 0);
      }
      ctx.restore();
    }
    
    ctx.globalCompositeOperation = 'source-over'; // reset
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      draw(e);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const newUrl = URL.createObjectURL(blob);
      onSave(newUrl);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col text-white">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-slate-900">
        <h2 className="font-bold text-lg">Manual Adjustment</h2>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-4 py-2 hover:bg-white/10 rounded-lg transition font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition font-bold flex items-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-center gap-4 px-4 shrink-0 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg">
          <button
            onClick={() => setTool('erase')}
            className={`p-2 rounded-md transition ${tool === 'erase' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            title="Erase Background"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('restore')}
            className={`p-2 rounded-md transition ${tool === 'restore' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            title="Restore Original"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-white/20 mx-2" />
        
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-300">Brush: {brushSize}px</span>
          <input 
            type="range" 
            min="1" 
            max="200" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32 accent-violet-500"
          />
        </div>

        <div className="w-px h-6 bg-white/20 mx-2" />
        
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-md transition text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-md transition text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto flex items-center justify-center bg-[url(/checkered.png)] relative p-4 touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="shadow-2xl cursor-crosshair border border-white/20 touch-none"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center',
            touchAction: 'none' 
          }}
        />
      </div>
    </div>
  );
}
