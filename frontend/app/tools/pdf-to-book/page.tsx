import { Metadata } from "next";
import Client from "./Client";
import ToolEngine from "../ToolEngine";

const tool = ToolEngine.getTool("pdf-to-book");

export const metadata: Metadata = {
  title: tool?.seoTitle || "PDF to Book Viewer",
  description: tool?.seoDescription || "Read your PDF files like a real book with side-by-side pages.",
};

export default function PDFToBookPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
          {tool?.name || "PDF to Book"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {tool?.description || "Read your PDFs like a real book with an immersive side-by-side view."}
        </p>
      </div>

      <Client />
    </div>
  );
}
