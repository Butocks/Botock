"use client";

import Script from 'next/script';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Wait a brief moment to allow GA4 to fire its initial page_view event with the full URL.
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;
      
      const url = new URL(window.location.href);
      const params = url.searchParams;
      
      let changed = false;
      // List of tracking parameters to strip from the visible URL
      const paramsToStrip = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 
        'fbclid', 'gclid', 'ref', '_ga', '_gl'
      ];
      
      paramsToStrip.forEach(param => {
        if (params.has(param)) {
          params.delete(param);
          changed = true;
        }
      });

      if (changed) {
        // Construct the clean URL without the tracking parameters
        const cleanUrl = url.pathname + (params.toString() ? `?${params.toString()}` : '') + url.hash;
        // Replace the state without triggering a re-render or Next.js navigation
        window.history.replaceState(null, '', cleanUrl);
      }
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* GA4 Tracking Script loaded non-blocking */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-BOTOCK-TRACKING`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BOTOCK-TRACKING', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
