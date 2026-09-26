"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Code,
  Download,
  Sparkles,
  Columns,
} from "lucide-react";

const INITIAL_MD = `# Markdown to HTML Converter

Welcome to **Botock's Markdown Converter**! It parses Markdown in real-time right inside your browser.

## Features
- **Zero latency**: Instant parsing with 0 server requests
- *Rich typography*: Headers, bold, italics, quotes, and lists
- Code blocks with syntax formatting:

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

> "Simplicity is prerequisite for reliability." – Edsger W. Dijkstra

### Useful Links
Visit [Botock Studio](https://botock.com) to explore more than 100+ creative web tools!
`;

export default function MarkdownToHtmlClient() {
  const [markdown, setMarkdown] = useState<string>(INITIAL_MD);
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  // Pure client-side markdown to html parser
  const htmlOutput = useMemo(() => {
    if (!markdown) return "";

    let html = markdown;

    // Escape raw HTML entities to prevent XSS
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      return `<pre class="bg-slate-900 border border-slate-800 p-4 rounded-xl overflow-x-auto text-sm my-4 font-mono text-purple-300"><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-xs">$1</code>');

    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-base font-bold text-white mt-4 mb-2">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-lg font-bold text-white mt-4 mb-2">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold text-white mt-5 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-white mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black text-white mt-6 mb-4 border-b border-slate-800 pb-3">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 py-1 italic text-slate-400 my-4">$1</blockquote>');

    // Horizontal Rules
    html = html.replace(/^---$/gim, '<hr class="border-slate-800 my-6" />');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-slate-300">$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline font-medium">$1</a>');

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-6 list-disc text-slate-300 my-1">$1</li>');

    // Paragraphs
    const lines = html.split("\n\n");
    const parsedParas = lines.map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<pre") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<hr") ||
        block.startsWith("<li")
      ) {
        return block;
      }
      return `<p class="text-slate-300 leading-relaxed my-3">${block.replace(/\n/g, "<br />")}</p>`;
    });

    return parsedParas.filter(Boolean).join("\n");
  }, [markdown]);

  const handleCopy = () => {
    copyToClipboard(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Converted Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1, h2, h3 { color: #111; }
    pre { background: #f4f4f5; padding: 12px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #9333ea; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${htmlOutput}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileCode className="w-3.5 h-3.5" />
            High Performance Markdown Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Markdown to HTML Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Live side-by-side Markdown editor with rendered visual preview and exportable clean HTML markup.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "preview"
                  ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Visual Preview
            </button>
            <button
              onClick={() => setActiveTab("html")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "html"
                  ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw HTML Code
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied HTML!" : "Copy HTML"}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML
            </button>
          </div>
        </div>

        {/* Dual Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Markdown Input */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[600px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Markdown Source
              </span>
              <button
                onClick={() => setMarkdown("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Rendered Output / HTML View */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[600px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {activeTab === "preview" ? "Formatted Document" : "HTML Output"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
              {activeTab === "preview" ? (
                <div
                  className="prose prose-invert max-w-none text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              ) : (
                <pre className="font-mono text-xs text-purple-300 whitespace-pre-wrap break-all select-all">
                  {htmlOutput}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
