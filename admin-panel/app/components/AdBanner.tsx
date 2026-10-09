"use client";

import React, { useEffect, useState } from "react";

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
      className={`mx-auto flex flex-col items-center justify-center overflow-hidden transition-all ${formatClasses[format]}`}
      aria-label="Advertisement"
    >
      {/* 
        Google AdSense will inject the ad here once approved.
        For now, this remains an empty, invisible container to preserve layout.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXX" // Replace when AdSense is approved
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
