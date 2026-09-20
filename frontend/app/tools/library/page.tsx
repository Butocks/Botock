"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaStore } from "../../store/useMediaStore";
import { Download, Play, Scissors, CloudUpload, Clock, Sparkles, Trash2, ArrowLeft } from "lucide-react";
import AdBanner from "../../components/AdBanner";

export default function LibraryPage() {
  const router = useRouter();
  const { library, setActiveMedia, removeFromLibrary } = useMediaStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Lazy import supabase client so we don't break SSR
      const { createClient } = await import("../../../utils/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        setMounted(true);
      }
    };
    checkAuth();
  }, [router]);

  const handleOpenInStudio = (item: any) => {
    setActiveMedia(item);
    router.push("/tools/video-editor");
  };

  const handleGoogleDriveExport = (item: any) => {
    alert(`Exporting "${item.title}" to Google Drive... (File will be saved with prompt name)`);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/tools/video-generator"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            My Media Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Access your AI generated videos and images. Free generations are stored for 24 hours.
          </p>
        </div>

        <Link
          href="/tools/video-generator"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all self-start"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate New Video
        </Link>
      </div>

      {library.length === 0 ? (
        <div className="glass-card rounded-2xl border border-border/50 p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 ml-0.5" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Your Library is Empty</h3>
          <p className="text-xs text-muted-foreground mb-6">
            You haven't generated any videos yet. Generate your first video and it will appear here automatically!
          </p>
          <Link
            href="/tools/video-generator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl border border-border/50 overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all shadow-sm"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video bg-black/50 overflow-hidden">
                {item.type === "video" ? (
                  <video
                    src={item.blobUrl || item.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={item.blobUrl || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Expiry Badge */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-[10px] font-medium text-amber-400 flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3" />
                  Expires in 24h
                </div>
              </div>

              {/* Media Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
                    {item.title || "AI Generated Scene"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {item.prompt}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenInStudio(item)}
                      className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Edit in Studio
                    </button>
                    <a
                      href={item.blobUrl || item.url}
                      download={`${item.title || "video"}.mp4`}
                      className="py-1.5 px-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleGoogleDriveExport(item)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <CloudUpload className="w-3.5 h-3.5 text-primary" />
                      Export to Drive
                    </button>
                    <button
                      onClick={() => removeFromLibrary(item.id)}
                      className="text-[11px] text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors"
                      title="Delete from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <AdBanner slotId="library-bottom-ad" format="horizontal" />
      </div>
    </div>
  );
}
