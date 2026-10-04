import { Metadata } from "next";
import Client from "./Client";
import ToolEngine from "../ToolEngine";

const tool = ToolEngine.getTool("pdf-forms");

export const metadata: Metadata = {
  title: tool?.seoTitle || "Create Fillable PDF Forms",
  description: tool?.seoDescription || "Add interactive AcroForm text fields and checkboxes to static PDFs.",
};

export default function PDFFormsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
          {tool?.name || "Create Fillable PDF"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {tool?.description}
        </p>
      </div>

      <Client />
    </div>
  );
}
