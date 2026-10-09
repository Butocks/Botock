import { Metadata } from "next";
import Link from "next/link";
import { FileText, Lock, FileOutput, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Suite & Document Tools | Botock",
  description: "Secure, split, merge, and manage your PDF documents easily.",
};

export default function PDFSuiteFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          The Complete <span className="text-red-600 dark:text-red-500">PDF Suite</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Manage your digital documents effortlessly. Secure sensitive files, split large documents, and convert formats with a single click.
        </p>
        <Link href="/tools?cat=pdf" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-600/20 transition-all active:scale-95">
          <FileText className="w-5 h-5" /> Explore PDF Tools
        </Link>
      </div>

      {/* How to Use */}
      <div className="bg-white dark:bg-[#111114] border-y border-slate-200 dark:border-white/[0.05] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How to Use the PDF Tools</h2>
            <p className="text-slate-500 mt-4">Simple, fast, and secure document management.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Select a Tool", desc: "Choose whether you want to protect, unlock, split, or convert a PDF from the tools dashboard." },
              { step: "02", title: "Upload Document", desc: "Upload your PDF file. Our tools process documents locally where possible for maximum security." },
              { step: "03", title: "Download Result", desc: "Apply your settings (like a secure password) and instantly download the modified document." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1a1a1f] border border-slate-100 dark:border-white/[0.05]">
                <div className="text-4xl font-black text-red-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square md:aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent"></div>
               <Lock className="w-24 h-24 text-red-500/50" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Benefits of Botock PDF Suite</h2>
            
            {[
              "Military-grade encryption for sensitive files",
              "No file size limits or paywalls",
              "Remove annoying passwords from owned documents",
              "Extract specific pages easily",
              "Works perfectly on mobile and desktop"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</p>
              </div>
            ))}
            
            <div className="pt-6">
              <Link href="/tools?cat=pdf" className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:gap-4 transition-all">
                Try PDF Tools <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
