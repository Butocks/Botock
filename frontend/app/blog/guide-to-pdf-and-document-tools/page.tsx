"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Lock, Unlock, FileCheck2, SplitSquareHorizontal } from "lucide-react";

export default function GuideToPDFTools() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c081a]">
      {/* Header */}
      <div className="w-full bg-white dark:bg-[#110d22] border-b border-slate-200 dark:border-white/10 px-6 py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-red-500 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            Streamlining Your Workflow with Botock's PDF Tools
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>By Boto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Productivity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>October 4, 2026</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert prose-slate prose-headings:font-black prose-a:text-red-500 hover:prose-a:text-red-400">
        
        <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-10">
          While generating cinematic videos and stunning AI photos captures the imagination, the backbone of any real business or creative agency is document management. Botock isn't just about flashy visuals; it is about providing a complete ecosystem for digital professionals. That is why we built a powerful suite of PDF tools.
        </p>

        <h2 className="flex items-center gap-2"><Lock className="w-6 h-6 text-red-500"/> PDF Protection & Security</h2>
        
        <p>
          In a digital world, information is your most valuable asset. Whether you are sending a confidential script to a client, sharing financial reports, or distributing a private eBook, ensuring that only the intended recipient can view your document is paramount.
        </p>
        
        <p>
          Botock's <strong>Protect PDF</strong> tool allows you to instantly encrypt any PDF document with a secure password. Once applied, the document cannot be opened, viewed, or printed without the correct password. 
        </p>

        <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-r-2xl my-8">
          <p className="m-0 text-sm font-bold text-slate-800 dark:text-slate-200">Security Best Practices:</p>
          <ul className="m-0 mt-2 text-slate-600 dark:text-slate-400 text-sm">
            <li>Never send the password in the same email as the protected PDF. Send the password via a different channel (e.g., SMS or an encrypted messaging app).</li>
            <li>Use a strong password combining letters, numbers, and symbols.</li>
            <li>If you are a business, establish a standard naming convention for your protected files so your team knows they are encrypted before attempting to open them.</li>
          </ul>
        </div>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <h2 className="flex items-center gap-2"><Unlock className="w-6 h-6 text-red-500"/> Unlocking PDFs</h2>
        
        <p>
          On the flip side, dealing with passwords on internal documents can slow down your workflow. If you have a document that no longer needs to be secure (or if you are tired of typing a password every time you open your own file), you can use the <strong>Unlock PDF</strong> tool.
        </p>
        
        <p>
          Simply upload the encrypted PDF, provide the password one last time, and Botock will strip the encryption, returning a clean, instantly-accessible version of your file. 
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <h2 className="flex items-center gap-2"><SplitSquareHorizontal className="w-6 h-6 text-red-500"/> PDF Splitting & Organization</h2>

        <p>
          Have you ever received a massive 200-page corporate report, but you only need to send pages 45 to 50 to your team? Instead of sending the entire massive file and confusing everyone, you can use the <strong>Split PDF</strong> tool.
        </p>

        <p>
          This tool allows you to extract specific page ranges from a large document and save them as a brand new, lightweight PDF. It is incredibly useful for:
        </p>
        <ul>
          <li>Extracting a single chapter from a digital book.</li>
          <li>Isolating a specific invoice from a monthly billing statement.</li>
          <li>Breaking down a long script into daily shooting schedules for a video production.</li>
        </ul>

        <p>
          By maintaining all your creative and productivity tools in one place, Botock ensures you never have to leave the platform to get your work done.
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl text-center">
          <h3 className="mt-0 font-black text-slate-900 dark:text-white">Secure Your Documents</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Take control of your digital paperwork with our fast and secure PDF tools.
          </p>
          <Link href="/tools?cat=pdf" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-500/25 active:scale-95">
            Explore PDF Tools
          </Link>
        </div>

      </div>
    </div>
  );
}
