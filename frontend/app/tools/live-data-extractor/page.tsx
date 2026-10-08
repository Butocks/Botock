import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Live Data Extractor Tool | Hidden URL Generator",
  description: "Generate hidden URLs to extract real-time data from YouTube, Facebook, Google, and Twitter. Bypass algorithms and get the latest chronological content instantly.",
  alternates: {
    canonical: "/tools/live-data-extractor",
  },
  openGraph: {
    title: "Live Data Extractor Tool | Hidden URL Generator",
    description: "Generate hidden URLs to extract real-time data from YouTube, Facebook, Google, and Twitter. Bypass algorithms and get the latest chronological content instantly.",
    url: "https://botock.app/tools/live-data-extractor",
    siteName: "Botock AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Data Extractor Tool | Hidden URL Generator",
    description: "Generate hidden URLs to extract real-time data from YouTube, Facebook, Google, and Twitter.",
  },
};

export default function LiveDataExtractorPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Live Data Extractor & URL Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Social media platforms hide chronological sorting to push algorithmic feeds. Use this free tool to generate hidden URL parameters that force YouTube, Facebook, Google, and Twitter to show you real-time, unfiltered data.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "name": "Live Data Extractor Tool - Botock AI",
                "url": "https://botock.app/tools/live-data-extractor",
                "description": "Generate hidden URLs to extract real-time data from YouTube, Facebook, Google, and Twitter.",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "All",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                },
              },
            ],
          }),
        }}
      />

      {/* Interactive Tool Client */}
      <Client />
          
      {/* --- SEO Content / Guide --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              How to Extract Real-Time Data from Social Media
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              In recent years, platforms like Google, YouTube, and Facebook have removed simple chronological sorting features. They want you to consume algorithmic feeds. However, by appending specific <strong>"Hidden URL Parameters"</strong> to your search queries, you can bypass these algorithms and access real-time data. This is extremely useful for journalists, researchers, and data scrapers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111116] border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">YouTube "Last Hour" Trick</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                YouTube recently hid the "Last Hour" upload filter. To force YouTube to show only videos uploaded in the past 60 minutes for any topic, we append the Base64 parameter:
              </p>
              <code className="block p-3 rounded-lg bg-slate-200 dark:bg-black font-mono text-xs text-violet-600 dark:text-violet-400 break-all">
                &amp;sp=EgQIARAB
              </code>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111116] border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Facebook Chronological Feed</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Sick of Facebook showing you 3-day-old posts from pages you never interact with? Force the chronological feed showing the newest posts first:
              </p>
              <code className="block p-3 rounded-lg bg-slate-200 dark:bg-black font-mono text-xs text-violet-600 dark:text-violet-400 break-all">
                https://facebook.com/?sk=h_chr
              </code>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111116] border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Google Search Clean Web</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                To remove AI Overviews, Reddit carousels, and sponsored junk from Google search results, you can force the "Clean Web" mode using:
              </p>
              <code className="block p-3 rounded-lg bg-slate-200 dark:bg-black font-mono text-xs text-violet-600 dark:text-violet-400 break-all">
                &amp;udm=14
              </code>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111116] border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Twitter (X) Live Tweets</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                To bypass the "Top" search algorithm and get immediate real-time live tweets as they are posted for a given topic:
              </p>
              <code className="block p-3 rounded-lg bg-slate-200 dark:bg-black font-mono text-xs text-violet-600 dark:text-violet-400 break-all">
                &amp;f=live
              </code>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Bypassing Bot Detection with User-Agents
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              If you are using tools like Python (Requests) or Node.js (Playwright/Puppeteer) to scrape the URLs generated above, you will quickly be blocked. Platforms detect missing headers. Always ensure you pass a realistic <strong>User-Agent</strong> header to disguise your script as a real browser.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <pre>{`// Latest Google Chrome (Windows) User-Agent
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

// Official Googlebot (Crawler)
"Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com)"`}</pre>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
