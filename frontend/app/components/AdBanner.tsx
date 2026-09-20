"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface AdBannerProps {
  slotId?: string;
  slot?: string;
  format?: "horizontal" | "sidebar" | "inline";
  isPremium?: boolean;
}

export default function AdBanner({
  slotId = "default-slot",
  format = "horizontal",
  isPremium = false,
}: AdBannerProps) {
  const [adBlocked, setAdBlocked] = useState(false);

  // If user is a paid subscriber, hide all ads
  if (isPremium) {
    return null;
  }

  const formatClasses = {
    horizontal: "w-full max-w-4xl h-24 my-6",
    sidebar: "w-full max-w-xs h-64 my-4",
    inline: "w-full max-w-xl h-32 my-4",
  };

  return (
    <div
      className={`mx-auto flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card/30 p-2 text-center overflow-hidden transition-all ${formatClasses[format]}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase mb-1">
        Sponsored
      </span>

      {/* AdSense slot placeholder (ready for client ad snippet) */}
      <div className="w-full flex-1 flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-background/50 p-2">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Ad Space</span>
          <span className="text-primary/70">·</span>
          <Link
            href="/pricing"
            className="text-primary hover:underline font-medium text-[11px]"
          >
            Go Ad-Free with Botock Pro ($5/mo)
          </Link>
        </div>
      </div>
    </div>
  );
}
