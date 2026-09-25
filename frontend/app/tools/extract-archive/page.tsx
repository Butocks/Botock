import { Metadata } from "next";
import { FileArchive, ShieldCheck } from "lucide-react";
import ExtractArchiveClient from "./Client";

export const metadata: Metadata = {
  title: "Extract ZIP Online Free - Unzip Files in Browser - Botock",
  description:
    "Open, preview, and extract ZIP archives directly in your browser with zero server uploads. 100% private, client-side ZIP file opener and extractor.",
  openGraph: {
    title: "Extract ZIP Online Free - Botock",
    description:
      "Open and extract ZIP archives locally in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "unzip online",
    "extract zip online",
    "open zip files",
    "free zip opener",
    "browser zip extractor",
  ],
};

export default function ExtractArchivePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Archive Extractor",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Extract and preview files inside ZIP archives directly in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Open and browse ZIP archive tree",
      "Inline preview of text and image files",
      "Extract individual files or complete directory",
      "100% Client-Side Privacy",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <FileArchive className="w-8 h-8 text-sky-500" />
          Archive (ZIP) Extractor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Open, inspect, and extract ZIP archives safely in your browser without uploading confidential files to any server.
        </p>
      </div>

      <ExtractArchiveClient />
    </div>
  );
}
