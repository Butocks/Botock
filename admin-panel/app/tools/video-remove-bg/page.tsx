import { Video, ShieldCheck, Zap, Layers } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Background Remover & Smart Cutout | Botock AI",
  description:
    "Instantly remove video backgrounds with AI. Use Smart Cutout, Background Matting, and AI Green Screen without manual masking. 100% Free and Automatic.",
  openGraph: {
    title: "AI Video Background Remover | Botock AI",
    description:
      "Instantly remove video backgrounds with AI. Use Smart Cutout, Background Matting, and AI Green Screen without manual masking. 100% Free and Automatic.",
    url: "https://botock.app/tools/video-remove-bg",
    siteName: "Botock AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Background Remover | Botock AI",
    description: "Remove video backgrounds instantly using AI. Free Smart Cutout.",
  },
};

export default function VideoRemoveBgPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "AI Video Background Remover",
        "url": "https://botock.app/tools/video-remove-bg",
        "description": "Remove video backgrounds instantly using AI. Smart Cutout and Background Matting.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
          { "@type": "ListItem", "position": 3, "name": "Video Remove BG", "item": "https://botock.app/tools/video-remove-bg" }
        ]
      }
    ]
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">AI Video BG Remover</span>
          </nav>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="AI Video BG Remover">
          <Client />
        </ToolErrorBoundary>
      </div>
      
      {/* SEO Content */}
      <section className="border-t border-border/40 bg-card/30 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Advanced AI Video Background Tools</h2>
            <p className="text-muted-foreground">Say goodbye to manual masking. Our AI engine automatically isolates subjects with pixel-perfect accuracy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Zap className="w-8 h-8 text-violet-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Smart Cutout</h3>
              <p className="text-sm text-muted-foreground">Upload any video and let AI instantly detect the person, removing the background without a green screen.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Layers className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Background Matting</h3>
              <p className="text-sm text-muted-foreground">Advanced neural networks carefully clean up edges and hair for a studio-quality professional look.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <ShieldCheck className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">AI Green Screen</h3>
              <p className="text-sm text-muted-foreground">Automatically replace detected backgrounds with virtual footage or solid colors in one click.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
