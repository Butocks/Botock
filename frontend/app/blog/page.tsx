"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  FileText,
  Scissors,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  Search,
  BookOpen,
  CheckCircle2,
  Share2,
  Paperclip,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "ai" | "pdf" | "video" | "image";
  categoryLabel: string;
  categoryColor: string;
  readTime: string;
  date: string;
  author: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

const POSTS: BlogPost[] = [
  {
    id: "mastering-ai-video-prompts",
    title: "Mastering AI Video Prompts: How to Get Cinematic Motion in Google Flow",
    excerpt: "Learn the exact prompt structures, camera motion hints, and lighting modifiers that transform basic text descriptions into Hollywood-grade 4–10 second footage.",
    category: "ai",
    categoryLabel: "Generative AI",
    categoryColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    readTime: "5 min read",
    date: "Sep 18, 2026",
    author: "Botock VFX Lab",
  },
  {
    id: "compress-pdf-without-quality-loss",
    title: "How to Compress Heavy PDF Files by 80% Without Losing Vector Clarity",
    excerpt: "Detailed breakdown of JBIG2 vs Flate compression algorithms and how in-browser PDF optimization preserves readable fonts for email and corporate submissions.",
    category: "pdf",
    categoryLabel: "PDF Workflows",
    categoryColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    readTime: "4 min read",
    date: "Sep 15, 2026",
    author: "Document Engineering Team",
  },
  {
    id: "webp-vs-png-modern-web-perf",
    title: "Next-Gen WebP vs PNG: Why High-Traffic Sites Are Upgrading",
    excerpt: "Comparing lossy and lossless WebP image compression benchmarks against standard PNGs. Save bandwidth and boost Google Core Web Vitals scores effortlessly.",
    category: "image",
    categoryLabel: "Image Tech",
    categoryColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    readTime: "6 min read",
    date: "Sep 12, 2026",
    author: "Performance Lab",
  },
  {
    id: "browser-video-editing-zero-lag",
    title: "The Zero-Latency Workflow: Trimming & Color Grading in Modern Browsers",
    excerpt: "How WebCodecs and HTML5 canvas APIs enable real-time video cutting, speed manipulation, and frame filtering without waiting for multi-gigabyte server uploads.",
    category: "video",
    categoryLabel: "Video Studio",
    categoryColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    readTime: "7 min read",
    date: "Sep 08, 2026",
    author: "Botock Studio Team",
  },
  {
    id: "nano-banana-pro-aspect-ratios",
    title: "Choosing the Right Aspect Ratio: 16:9 vs 9:16 for Viral Content",
    excerpt: "Mastering composition and focal point framing for Instagram Reels, YouTube Shorts, and widescreen desktop cinema when generating images with Nano Banana.",
    category: "ai",
    categoryLabel: "Generative AI",
    categoryColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    readTime: "4 min read",
    date: "Sep 04, 2026",
    author: "Creative Operations",
  },
  {
    id: "aes-256-pdf-encryption-guide",
    title: "Securing Financial Documents: Military-Grade AES-256 PDF Protection",
    excerpt: "Why standard password locks fail and how Botock's client-side AES-256 cryptographic wrapper protects sensitive legal contracts from unauthorized decryption.",
    category: "pdf",
    categoryLabel: "Security & PDF",
    categoryColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    readTime: "5 min read",
    date: "Aug 29, 2026",
    author: "Cybersecurity Desk",
  },
];

export default function BlogPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [posts, setPosts] = useState<BlogPost[]>(POSTS);

  useEffect(() => {
    const loadBlogs = () => {
      try {
        const stored = localStorage.getItem("botock_custom_blogs");
        if (stored) {
          const customPosts: any[] = JSON.parse(stored);
          const formatted: BlogPost[] = customPosts.map((cp) => ({
            id: cp.id,
            title: cp.title,
            excerpt: cp.excerpt,
            category: cp.category,
            categoryLabel: cp.categoryLabel,
            categoryColor:
              cp.category === "ai"
                ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                : cp.category === "pdf"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                : cp.category === "video"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            readTime: cp.readTime,
            date: cp.date,
            author: cp.author,
            attachmentName: cp.attachmentName,
            attachmentUrl: cp.attachmentUrl,
          }));
          // Merge unique by ID
          const existingIds = new Set(formatted.map((p) => p.id));
          setPosts([...formatted, ...POSTS.filter((p) => !existingIds.has(p.id))]);
        }
      } catch (e) {}
    };

    loadBlogs();
    window.addEventListener("botock_blogs_updated", loadBlogs);
    return () => window.removeEventListener("botock_blogs_updated", loadBlogs);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCat = filter === "all" || post.category === filter;
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Botock Knowledge Hub & Creative Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Master AI Media & Online Workflows
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            In-depth guides, prompt formulas, technical breakdowns, and video production tutorials directly from the Botock engineering and design teams.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search articles & tutorials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  filter === "all" ? "bg-white text-zinc-950 font-bold" : "bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("ai")}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  filter === "ai" ? "bg-violet-600 text-white font-bold" : "bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                AI Video & Images
              </button>
              <button
                onClick={() => setFilter("pdf")}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  filter === "pdf" ? "bg-rose-600 text-slate-900 dark:text-white font-bold" : "bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                PDF Suite
              </button>
              <button
                onClick={() => setFilter("video")}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  filter === "video" ? "bg-sky-600 text-slate-900 dark:text-white font-bold" : "bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                Video Studio
              </button>
            </div>
          </div>
        </div>

        {/* Featured Top Article */}
        {filteredPosts.length > 0 && filter === "all" && !search && (
          <div className="mb-12 rounded-2xl bg-gradient-to-br from-[#13111c] via-[#101015] to-[#121216] border border-slate-300 dark:border-white/[0.1] p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 hover:border-violet-500/40 transition-all">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Featured Guide
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 5 min read
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 hover:text-violet-300 transition-colors cursor-pointer">
                {POSTS[0].title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {POSTS[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span>By {POSTS[0].author}</span>
                <span>•</span>
                <span>{POSTS[0].date}</span>
              </div>
            </div>
            <Link
              href={`/blog/${POSTS[0].id}`}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <span>Read Full Tutorial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all group hover:bg-slate-100 dark:bg-[#15151a]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${post.categoryColor}`}>
                    {post.categoryLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {post.attachmentName && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{post.attachmentName}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{post.date}</span>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
