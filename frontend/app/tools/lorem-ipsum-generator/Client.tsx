"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Code,
  Download,
  Users,
  Briefcase,
  ShoppingBag,
} from "lucide-react";

type ContentTheme = "latin" | "tech" | "business" | "users" | "reviews";

const TECH_SENTENCES = [
  "Our distributed microservices architecture scales horizontally across multiple availability zones.",
  "Real-time event streaming pipelines ingest millions of telemetry payloads with sub-millisecond p99 latency.",
  "Zero-trust authentication policies enforce cryptographically signed JWT tokens for every RPC invocation.",
  "Continuous integration pipelines execute containerized integration test suites prior to canary deployments.",
  "Deterministic state management ensures idempotent database mutations across high-concurrency workloads.",
  "Automated edge caching reduces origin database load by 85% across global point-of-presence nodes.",
  "WebAssembly execution sandbox executes untrusted user scripts with native hardware memory isolation.",
  "Serverless background workers process asynchronous video encoding queues with dynamic autoscaling.",
];

const BUSINESS_SENTENCES = [
  "Our enterprise solutions accelerate digital transformation by modernizing legacy core workflows.",
  "We empower organizations to optimize operational efficiency while maintaining strict regulatory compliance.",
  "Strategic cross-functional initiatives align stakeholder objectives with long-term revenue targets.",
  "Data-driven business intelligence unlocks actionable customer insights across enterprise portfolios.",
  "Seamless enterprise integration delivers immediate time-to-value for multinational operations.",
  "Our customer success framework guarantees 99.99% service uptime backed by comprehensive SLAs.",
];

const MOCK_NAMES = [
  "Sarah Jenkins", "Alex Rivera", "David Chen", "Elena Rostova", "Marcus Vance",
  "Priya Sharma", "Liam O'Connor", "Zoe Takahashi", "Carlos Mendoza", "Amira Al-Fassi"
];

const MOCK_ROLES = [
  "Principal Cloud Architect", "VP of Engineering", "Head of Product", "Senior DevOps Lead",
  "AI Research Scientist", "Chief Security Officer", "Data Platform Lead", "Senior Full-Stack Engineer"
];

const MOCK_COMPANIES = [
  "Vortex Cloud", "Apex Dynamics", "Synthetix Labs", "OmniScale Technologies", "NovaCore AI"
];

export default function LoremIpsumGeneratorClient() {
  const [theme, setTheme] = useState<ContentTheme>("tech");
  const [count, setCount] = useState<number>(3);
  const [outputFormat, setOutputFormat] = useState<"plain" | "markdown" | "html" | "json">("plain");
  const [seed, setSeed] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const generatedOutput = useMemo(() => {
    // 1. User Profiles Generator (JSON or List)
    if (theme === "users") {
      const usersList = [];
      for (let i = 0; i < count; i++) {
        const name = MOCK_NAMES[i % MOCK_NAMES.length];
        const email = `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${MOCK_COMPANIES[i % MOCK_COMPANIES.length].toLowerCase().replace(/\s+/g, "")}.io`;
        usersList.push({
          id: `usr_${1000 + i}`,
          name,
          email,
          role: MOCK_ROLES[i % MOCK_ROLES.length],
          company: MOCK_COMPANIES[i % MOCK_COMPANIES.length],
          isActive: true,
          createdAt: "2026-09-27T10:00:00Z",
        });
      }

      if (outputFormat === "json") return JSON.stringify(usersList, null, 2);
      if (outputFormat === "markdown") {
        return (
          `| ID | Name | Role | Email |\n| --- | --- | --- | --- |\n` +
          usersList.map((u) => `| ${u.id} | ${u.name} | ${u.role} | ${u.email} |`).join("\n")
        );
      }
      return usersList.map((u) => `${u.name} - ${u.role} (${u.email})`).join("\n");
    }

    // 2. Text Content (Latin, Tech, Business, Reviews)
    const sentences =
      theme === "tech"
        ? TECH_SENTENCES
        : theme === "business"
        ? BUSINESS_SENTENCES
        : [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
          ];

    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const pLen = 4;
      const pSents: string[] = [];
      for (let s = 0; s < pLen; s++) {
        const idx = (p * pLen + s + seed) % sentences.length;
        pSents.push(sentences[idx]);
      }
      paragraphs.push(pSents.join(" "));
    }

    if (outputFormat === "json") {
      return JSON.stringify({ paragraphs, theme, generatedAt: new Date().toISOString() }, null, 2);
    }

    if (outputFormat === "markdown") {
      return paragraphs
        .map((p, i) => `## Section ${i + 1}\n\n${p}\n\n- Key Highlight A\n- Key Highlight B`)
        .join("\n\n");
    }

    if (outputFormat === "html") {
      return paragraphs.map((p) => `<p>${p}</p>`).join("\n\n");
    }

    return paragraphs.join("\n\n");
  }, [theme, count, outputFormat, seed]);

  const handleCopy = () => {
    copyToClipboard(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = outputFormat === "json" ? "json" : outputFormat === "markdown" ? "md" : outputFormat === "html" ? "html" : "txt";
    const blob = new Blob([generatedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-content.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Realistic Mock Data Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Dummy Text & Mock Data Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate realistic modern tech copy, enterprise marketing boilerplate, mock user fixtures, and classic Latin lorem ipsum.
          </p>
        </div>

        {/* Theme Selector Strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          {[
            { id: "tech", label: "Modern Tech & SaaS", icon: Sparkles },
            { id: "business", label: "Enterprise Business", icon: Briefcase },
            { id: "users", label: "User Profiles Database", icon: Users },
            { id: "latin", label: "Classic Latin Lorem Ipsum", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Options Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Quantity: {count} {theme === "users" ? "records" : "paragraphs"}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-36 accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Format
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                {[
                  { id: "plain", label: "Plain Text" },
                  { id: "markdown", label: "Markdown" },
                  { id: "html", label: "HTML" },
                  { id: "json", label: "JSON" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setOutputFormat(fmt.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      outputFormat === fmt.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Shuffle
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/25"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Content"}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Save File
            </button>
          </div>
        </div>

        {/* Output Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <textarea
            readOnly
            rows={14}
            value={generatedOutput}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-purple-300 focus:outline-none select-all resize-y"
          />
        </div>
      </div>
    </div>
  );
}
