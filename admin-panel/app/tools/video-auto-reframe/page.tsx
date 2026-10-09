import { Smartphone, Maximize, Target } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Auto-Reframe (Vertical Crop) | Botock AI",
  description:
    "Automatically convert horizontal (16:9) videos into vertical (9:16) Reels, Shorts, or TikToks. AI detects the main subject and keeps them in frame.",
};

export default function VideoAutoReframePage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Auto-Reframe</span>
          </nav>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Auto-Reframe">
          <Client />
        </ToolErrorBoundary>
      </div>
      
      <section className="border-t border-border/40 bg-card/30 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl font-black text-foreground">Turn Horizontal Videos into Viral Shorts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Smartphone className="w-8 h-8 text-violet-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">9:16 Ready</h3>
              <p className="text-sm text-muted-foreground">Perfect for TikTok, Instagram Reels, and YouTube Shorts.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Target className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Subject Tracking</h3>
              <p className="text-sm text-muted-foreground">Our AI detects the main person and keeps them perfectly centered.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Maximize className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">No Quality Loss</h3>
              <p className="text-sm text-muted-foreground">Maintains crystal clear resolution even after vertical cropping.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
