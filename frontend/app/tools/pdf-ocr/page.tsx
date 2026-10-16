import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const PdfOcrClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Neural OCR Engine...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "PDF OCR Online Free (No Signup) – Extract Text from Scanned PDF | Botock",
  description:
    "Extract editable text from scanned PDFs and book pages online for free. In-browser neural OCR recognizes text with high accuracy and zero server uploads.",
  keywords: [
    "pdf ocr online free",
    "pdf ocr",
    "extract text from scanned pdf",
    "ocr pdf to text free",
    "scanned pdf text extractor",
    "free pdf ocr converter",
    "tesseract pdf ocr online",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/pdf-ocr",
  },
  openGraph: {
    title: "PDF OCR Online Free (No Signup) – Extract Text from Scanned PDF",
    description:
      "Convert scanned PDF pages into editable text directly in your browser with zero server uploads.",
    url: "https://botock.app/tools/pdf-ocr",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF OCR Online Free | Botock",
    description: "Extract text from scanned PDFs with in-browser optical character recognition.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PdfOcrPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Free Online PDF OCR",
        url: "https://botock.app/tools/pdf-ocr",
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        description: "Extract text from non-selectable scanned PDFs directly in browser with neural OCR.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botock.app" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://botock.app/tools" },
          { "@type": "ListItem", position: 3, name: "PDF OCR", item: "https://botock.app/tools/pdf-ocr" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does Botock OCR extract text from non-selectable PDFs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock renders each page of your PDF into high-contrast 144 DPI canvas frames and executes Tesseract.js neural optical character recognition in a dedicated browser worker to accurately recognize text characters.",
            },
          },
          {
            "@type": "Question",
            name: "Which languages are supported for OCR recognition?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock supports English, Spanish, French, German, Italian, and Portuguese with automatic character vocabulary loading.",
            },
          },
          {
            "@type": "Question",
            name: "Is my confidential document uploaded to any external server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Never. All OCR computing happens locally in your device CPU and browser memory. Your contracts, invoices, and bank statements remain strictly private.",
            },
          },
          {
            "@type": "Question",
            name: "Can I copy the extracted text or download it?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can copy the full recognized text with a single click or download it as an organized .TXT file.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic Top Navigation Breadcrumb */}
      <section className="bg-slate-900/50 border-b border-border/40 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">PDF OCR Online</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In-Browser Neural OCR</span>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-4">
          <FileText className="w-4 h-4" />
          <span>Neural Character Recognition • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          PDF OCR Online Free
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Extract text from scanned PDFs, receipts, and book pages with high accuracy. Convert non-selectable scans into editable text directly in your browser with zero server uploads.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="PDF OCR Extractor">
            <PdfOcrClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="PDF OCR Online"
          category="PDF Utility"
          description="Botock Free Online PDF OCR tool turns scanned documents, contracts, and image-only PDFs into editable text. Unlike traditional online converters that store your sensitive PDFs on third-party cloud servers, our neural OCR worker executes client-side inside your browser sandbox."
          steps={[
            {
              title: "Upload Scanned PDF",
              description: "Drag and drop any scanned PDF document or image-based PDF report into the box.",
            },
            {
              title: "Choose Document Language",
              description: "Select the primary language of your document (English, Spanish, French, German, etc.).",
            },
            {
              title: "Extract & Copy Text",
              description: "Click Extract Text with OCR to generate selectable text, copy it to clipboard, or download as TXT.",
            },
          ]}
          features={[
            {
              title: "Neural Character Accuracy",
              description: "Extracts letters, numbers, and punctuation with advanced multi-lingual optical pattern recognition.",
            },
            {
              title: "Complete In-Browser Privacy",
              description: "Your confidential financial, legal, and academic documents never leave your local device.",
            },
            {
              title: "Multi-Page Batch Processing",
              description: "Automatically analyzes multi-page documents page-by-page with real-time progress tracking.",
            },
          ]}
          faqs={[
            {
              question: "Can I extract text from low-quality scans?",
              answer: "Yes, our pre-processing engine enhances image contrast and renders pages at 144 DPI to maximize recognition of faded or low-resolution scans.",
            },
            {
              question: "Is there any daily quota or paywall?",
              answer: "No, Botock PDF OCR is 100% free with unlimited conversions and no registration required.",
            },
            {
              question: "How long does OCR take per page?",
              answer: "Most document pages process in approximately 2 to 4 seconds depending on your device processor speed.",
            },
          ]}
          relatedTools={[
            { name: "PDF to Word", href: "/tools/pdf-to-word" },
            { name: "PDF to Text / Summarizer", href: "/tools/pdf-ai-summarizer" },
            { name: "Compress PDF", href: "/tools/pdf-compress" },
            { name: "Crop PDF", href: "/tools/crop-pdf" },
          ]}
        />
      </main>
    </div>
  );
}
