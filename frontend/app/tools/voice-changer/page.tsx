import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mic } from "lucide-react";
import VoiceChangerClient from "./VoiceChangerClient";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "AI Voice Changer | Modify Audio Pitch & Tone Free",
  description:
    "Transform audio files with Botock's AI Voice Changer. Instantly convert voices to kids, old men, deep villains, and more for free.",
  alternates: {
    canonical: "/tools/voice-changer",
  },
};

export default function VoiceChangerPage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Voice Changer</span>
          </nav>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Free Forever</span>
            </span>
          </div>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Voice Changer">
          <VoiceChangerClient />
        </ToolErrorBoundary>
      </div>

      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            AI Voice Changer & Pitch Shifter
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Easily modify your audio recordings using our high-performance cloud audio processing engine. Change the pitch and speed of voices to sound like a child, an older person, or a movie villain. Supports MP3 and WAV files up to 20MB.
          </p>
        </div>
      </section>
    </div>
  );
}
