import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFSplitClient = dynamic(() => import("./PDFSplitClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Split PDF Online - Extract Pages Free - Botock",
  description: "Split PDF files into individual pages or extract custom page ranges directly in your browser. 100% private, client-side WASM processing.",
  openGraph: {
    title: "Split PDF Online - Botock",
    description: "Extract specific pages or separate PDF files in your browser with zero server uploads.",
  },
};

export default function PDFSplitPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Split & Extract PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Extract specific pages or page ranges from your PDF. Running client-side via WASM ensures your documents stay completely secure on your machine.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Splitter",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Split PDF files into individual pages or ranges in the browser.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <PDFSplitClient />
    </div>
  );
}
