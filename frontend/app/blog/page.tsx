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
import { getBackendUrl } from "../../utils/runtime-urls";

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
    id: "about-botock-app",
    title: "About Us: The Story Behind Botock",
    excerpt: "Botock was created by Boto with a simple idea: creative technology should be easier to access. Learn about our vision, why we offer free tools, and our future plans.",
    category: "ai",
    categoryLabel: "Story",
    categoryColor: "amber",
    readTime: "8 min read",
    date: "October 4, 2026",
    author: "Boto"
  },
  {
    id: "guide-to-ai-video-generation",
    title: "The Ultimate Guide to AI Video Generation: From Text to Masterpiece",
    excerpt: "Learn the secrets of Text-to-Video and Image-to-Video. Discover how to write the perfect prompt and stitch 10-second clips into a 30-minute masterpiece.",
    category: "video",
    categoryLabel: "Video Generation",
    categoryColor: "blue",
    readTime: "15 min read",
    date: "October 4, 2026",
    author: "Boto"
  },
  {
    id: "guide-to-photo-generation-and-faq",
    title: "Mastering AI Photo Generation & Important FAQs",
    excerpt: "Everything you need to know about generating stunning images, understanding system speeds, and navigating our strict content safety policies.",
    category: "image",
    categoryLabel: "Photo Generation",
    categoryColor: "emerald",
    readTime: "12 min read",
    date: "October 4, 2026",
    author: "Boto"
  },
  {
    id: "guide-to-image-editing-and-background-removal",
    title: "The Magic of AI Image Editing & Background Removal",
    excerpt: "Discover how to seamlessly remove backgrounds and utilize transparent PNGs for thumbnails, e-commerce, and professional presentations.",
    category: "image",
    categoryLabel: "Image Editing",
    categoryColor: "purple",
    readTime: "10 min read",
    date: "October 4, 2026",
    author: "Boto"
  },
  {
    id: "guide-to-pdf-and-document-tools",
    title: "Streamlining Your Workflow with Botock's PDF Tools",
    excerpt: "Learn how to secure, unlock, and split PDF documents directly inside your Botock creative workspace.",
    category: "pdf",
    categoryLabel: "Productivity",
    categoryColor: "red",
    readTime: "8 min read",
    date: "October 4, 2026",
    author: "Boto"
  }
];

export default function BlogPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [posts, setPosts] = useState<BlogPost[]>(POSTS);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const backendUrl = await getBackendUrl();
        const res = await fetch(`${backendUrl}/api/public/blogs`);
        if (res.ok) {
          const customPosts: any[] = await res.json();
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
          setPosts([...POSTS, ...formatted]);
        }
      } catch (e) {
        console.error("Failed to fetch blogs:", e);
      }
    };

    loadBlogs();
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
                {filteredPosts[0].title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {filteredPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span>By {filteredPosts[0].author}</span>
                <span>•</span>
                <span>{filteredPosts[0].date}</span>
              </div>
            </div>
            <Link
              href={`/blog/${filteredPosts[0].id}`}
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
