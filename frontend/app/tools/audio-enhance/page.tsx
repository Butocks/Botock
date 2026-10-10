import { Mic, Headphones, Volume2 } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Audio Enhancer & Background Noise Remover | Botock AI",
  description:
    "Enhance audio quality with AI. Remove background noise, wind, and echo instantly to make your voice sound professional, like it was recorded in a studio.",
};

export default function AudioEnhancePage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Audio Enhancer</span>
          </nav>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Audio Enhancer">
          <Client />
        </ToolErrorBoundary>
      </div>
      
      <section className="border-t border-border/40 bg-card/30 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl font-black text-foreground">Studio Quality Sound with AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Headphones className="w-8 h-8 text-violet-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Noise Removal</h3>
              <p className="text-sm text-muted-foreground">AI intelligently isolates your voice and deletes background traffic, wind, and static.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Mic className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Studio Reverb</h3>
              <p className="text-sm text-muted-foreground">Enhances vocal presence and resonance to sound like a professional mic.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/20 border border-border">
              <Volume2 className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Auto-Leveling</h3>
              <p className="text-sm text-muted-foreground">Balances quiet and loud parts automatically for smooth, clear listening.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
