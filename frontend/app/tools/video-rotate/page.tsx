import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { RotateCw, Video, CheckCircle2 } from "lucide-react";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";

const Client = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading Video Rotation Engine..." />,
});

export const metadata: Metadata = {
  title: "Rotate Video Online Free | 90°, 180°, 270° & Auto-Straighten",
  description:
    "Rotate sideways videos 90, 180, or 270 degrees or flip video horizontally online for free. Auto-straighten crooked smartphone clips with instant preview and download.",
  keywords: [
    "rotate video online",
    "rotate mp4 90 degrees",
    "flip video horizontal",
    "straighten video online",
    "video orientation fixer",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/video-rotate",
  },
  openGraph: {
    title: "Rotate Video Online Free",
    description: "Rotate and straighten videos directly in your browser or with fast cloud encoding.",
    url: "https://botock.app/tools/video-rotate",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate Video Online Free",
    description: "Rotate and straighten videos directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoRotatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Rotate Video Online - Botock AI",
        url: "https://botock.app/tools/video-rotate",
        description: "Rotate videos 90, 180, 270 degrees and auto-straighten sideways clips.",
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
            name: "Rotate Video",
            item: "https://botock.app/tools/video-rotate",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is Rotate Video really free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Our Rotate Video tool is 100% free of charge with zero watermarks.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to create an account?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No sign-up is required. You can rotate and straighten videos directly in your browser.",
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

      {/* Breadcrumb Navigation */}
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Rotate Video</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Loss-Free Orientation Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Isolated within Error Boundary */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Rotate Video">
          <Client />
        </ToolErrorBoundary>
      </div>

      {/* SEO & Internal Links Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Rotate Video Online — Fix Sideways &amp; Upside-Down Footage
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Rotate MP4, MOV, and WebM videos by 90 degrees clockwise, 180 degrees, or 270 degrees. Straighten phone clips recorded in the wrong orientation and download your adjusted video in full resolution.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Video Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/video-auto-reframe"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-primary" />
                <span>Auto-Reframe 9:16</span>
              </Link>
              <Link
                href="/tools/video-editor"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                <span>Video Studio</span>
              </Link>
              <Link
                href="/tools/image-rotate"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                <span>Batch Image Rotate</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
