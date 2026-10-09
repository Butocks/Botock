import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Film, Sparkles, Music, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import VideoEditorComponent from "./VideoEditorComponent";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Free Online Video Editor | In-Browser Studio",
  description:
    "Edit videos online directly in your browser with multi-track timeline, trimming, splitting, speed controls, aspect ratio presets, and zero server uploads using WebAssembly.",
  keywords: [
    "video editor online",
    "free video editor browser",
    "cut video online",
    "trim video fast",
    "split video clips",
    "wasm video editor",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/video-editor",
  },
  openGraph: {
    title: "Free Online Video Editor | In-Browser Studio",
    description:
      "Edit videos online directly in your browser with multi-track timeline, trimming, splitting, and color presets.",
    url: "https://botock.app/tools/video-editor",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Video Editor",
    description:
      "In-browser multi-track video editing with 0ms lag and complete client-side privacy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoEditorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Online Video Editor - Botock AI",
        url: "https://botock.app/tools/video-editor",
        description:
          "Edit videos online directly in your browser with multi-track timeline, trimming, and effects.",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://botock.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://botock.app/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Online Video Editor",
            item: "https://botock.app/tools/video-editor",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does Botock upload my videos to a server while editing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, Botock's Video Studio processes your media locally using WebAssembly and Web Codecs in your browser. Your files never leave your computer.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Editor Container - Takes full viewport height minus scroll */}
      <div className="w-full h-[100dvh] shrink-0 border-b border-[#2b2b36]">
        <ToolErrorBoundary toolName="Video Editor">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-500">Loading Video Editor...</div>}>
            <VideoEditorComponent />
          </Suspense>
        </ToolErrorBoundary>
      </div>
    
      {/* --- Enterprise SEO Content --- */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Best Free Video Editor Online
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to edit videos. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#141419] border border-white/[0.05]">
              <h3 className="text-lg font-bold text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Enjoy unlimited usage without ever pulling out your credit card. We believe premium tools should be accessible to everyone, completely free of charge.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#141419] border border-white/[0.05]">
              <h3 className="text-lg font-bold text-white mb-2">No Sign-Up Required</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Skip the tedious registration process. You don't need to create an account or provide your email address to access our full suite of features.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#141419] border border-white/[0.05]">
              <h3 className="text-lg font-bold text-white mb-2">Absolute Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We use cutting-edge client-side rendering technology. This means your files stay on your device and are processed locally, guaranteeing zero data retention.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border border-white/[0.05] rounded-xl bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-white font-semibold">
                  Is this Video Editor really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">
                  Yes! Our Video Editor is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-white/[0.05] rounded-xl bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">
                  No sign-up is required. You can start editing your videos immediately without logging in or providing any personal information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}