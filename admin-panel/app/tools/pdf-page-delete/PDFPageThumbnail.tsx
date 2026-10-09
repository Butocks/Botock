import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface Props {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  width?: number;
}

export default function PDFPageThumbnail({ pdf, pageNum, width = 100 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    let isActive = true;

    const render = async () => {
      if (!canvasRef.current || rendered) return;
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const scale = width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;
        if (isActive) setRendered(true);
      } catch (err) {
        // ignore cancelled renders
      }
    };

    render();

    return () => {
      isActive = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, pageNum, width, rendered]);

  return (
    <div className="flex items-center justify-center bg-white w-full h-full">
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
    </div>
  );
}
