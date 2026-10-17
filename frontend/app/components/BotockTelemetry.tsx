"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getBackendUrl } from "@/utils/runtime-urls";

function TelemetryTracker({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;

    // 1. Generate or retrieve persistent Session ID for this visitor
    let sessionId = sessionStorage.getItem("botock_sid");
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      sessionStorage.setItem("botock_sid", sessionId);
    }

    // 2. Capture & Persist Campaign UTM Parameters (Facebook, Ads, Referrers)
    const urlUtmSource =
      searchParams?.get("utm_source") ||
      (searchParams?.get("fbclid") ? "facebook" : null) ||
      (searchParams?.get("gclid") ? "google_ads" : null) ||
      (searchParams?.get("ttclid") ? "tiktok" : null);

    const urlUtmMedium = searchParams?.get("utm_medium");
    const urlUtmCampaign = searchParams?.get("utm_campaign");

    if (urlUtmSource) sessionStorage.setItem("botock_utm_source", urlUtmSource);
    if (urlUtmMedium) sessionStorage.setItem("botock_utm_medium", urlUtmMedium);
    if (urlUtmCampaign) sessionStorage.setItem("botock_utm_campaign", urlUtmCampaign);

    // Auto-detect social source from document.referrer if no UTM tag was used
    let detectedSource = sessionStorage.getItem("botock_utm_source") || "direct";
    const rawReferrer = typeof document !== "undefined" ? document.referrer || "Direct" : "Direct";
    if (detectedSource === "direct" && rawReferrer !== "Direct") {
      const ref = rawReferrer.toLowerCase();
      if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("m.facebook.com")) detectedSource = "facebook";
      else if (ref.includes("instagram.com")) detectedSource = "instagram";
      else if (ref.includes("google.")) detectedSource = "google_search";
      else if (ref.includes("t.co") || ref.includes("twitter.com") || ref.includes("x.com")) detectedSource = "twitter_x";
      else if (ref.includes("youtube.com") || ref.includes("youtu.be")) detectedSource = "youtube";
      else if (ref.includes("tiktok.com")) detectedSource = "tiktok";
      else if (ref.includes("linkedin.com")) detectedSource = "linkedin";
      else detectedSource = "referral";
      sessionStorage.setItem("botock_utm_source", detectedSource);
    }

    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const payload = {
      session_id: sessionId,
      user_email: userEmail || (typeof localStorage !== "undefined" ? localStorage.getItem("botock_user_email") : null) || "Guest",
      event_type: "page_view",
      current_path: pathname,
      previous_path: prevPathRef.current || "Entry",
      referrer: rawReferrer,
      utm_source: detectedSource,
      utm_medium: sessionStorage.getItem("botock_utm_medium") || "organic",
      utm_campaign: sessionStorage.getItem("botock_utm_campaign") || "none",
      device_type: isMobile ? "Mobile" : "Desktop",
    };

    prevPathRef.current = pathname;

    // 3. Fire-and-forget to Azure FastAPI Backend
    getBackendUrl().then((backendUrl) => {
      const endpoint =
        backendUrl && backendUrl !== "/api/proxy"
          ? `${backendUrl.replace(/\/$/, "")}/api/admin/telemetry/track`
          : "/api/admin/telemetry/track";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently catch to avoid disrupting user experience
      });
    }).catch(() => {});
  }, [pathname, searchParams, userEmail]);

  return null;
}

export function BotockTelemetry({ userEmail }: { userEmail?: string }) {
  return (
    <Suspense fallback={null}>
      <TelemetryTracker userEmail={userEmail} />
    </Suspense>
  );
}

export default BotockTelemetry;
