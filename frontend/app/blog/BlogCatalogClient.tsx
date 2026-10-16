"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  ArrowRight,
  Search,
  BookOpen,
  TrendingUp,
  Tag,
  X,
  SlidersHorizontal,
  Calendar,
  Layers,
  Paperclip,
} from "lucide-react";
import { getBackendUrl } from "../../utils/runtime-urls";

export type BlogCategoryKey =
  | "all"
  | "ai-tech"
  | "news-trends"
  | "showbiz-media"
  | "productivity"
  | "creator-guides";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "ai-tech" | "news-trends" | "showbiz-media" | "productivity" | "creator-guides";
  categoryLabel: string;
  categoryColor: string;
  tags: string[];
  readTime: string;
  date: string;
  timestamp: number;
  author: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

const POSTS: BlogPost[] = [
  {
    id: "tesla-new-roadster-the-car-that-almost-flies",
    title: "Tesla's New Roadster: The Car That Almost Flies — Tech, Flight Physics & Reality Check",
    excerpt: "On October 15, 2026, Tesla showed its 2nd-gen Roadster driving upside down, jumping over a Semi, and flipping mid-air. Deep engineering breakdown: 10 SpaceX cold-gas thrusters, 2G suction fans, sub-1s 0-60, and the truth about flying cars.",
    category: "news-trends",
    categoryLabel: "News & Trends",
    categoryColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    tags: ["TeslaRoadster", "SpaceX", "ElectricVehicles", "FlyingCars", "TechNews"],
    readTime: "9 min read",
    date: "October 16, 2026",
    timestamp: 1792108900000,
    author: "Boto",
    attachmentUrl: "/images/blog/tesla-roadster-unveil.jpg",
    attachmentName: "Tesla Roadster Flight Demo",
  },
  {
    id: "complete-guide-to-botock-video-editor",
    title: "The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export",
    excerpt: "The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown (multi-track power hierarchy, resizable FX blocks, continuous zooms, directional motion animations, typewriter text), and zero-server client-side MP4 export.",
    category: "creator-guides",
    categoryLabel: "Creator Guides",
    categoryColor: "bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-500/30",
    tags: ["VideoEditor", "TimelineFX", "MotionAnimation", "ContinuousZoom", "WebAssembly"],
    readTime: "15 min read",
    date: "October 11, 2026",
    timestamp: 1791676900000,
    author: "Boto",
  },
  {
    id: "complete-guide-to-ai-image-tools-upscale-rotate",
    title: "AI Image Editing Mastery: Batch Auto-Rotate, 4K/8K Upscaler & Background Removal",
    excerpt: "Scale your visual workflows. Batch straighten up to 100+ photos via folder upload with ZIP download, upscale low-res images to 4K/8K with 200% Pixel Inspect, and generate transparent cutouts.",
    category: "ai-tech",
    categoryLabel: "AI & Tech",
    categoryColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    tags: ["Photography", "ECommerce", "SuperResolution", "BatchProcessing", "AI"],
    readTime: "13 min read",
    date: "October 11, 2026",
    timestamp: 1791676800000,
    author: "Boto",
  },
  {
    id: "complete-guide-to-ai-video-tools-creators",
    title: "The Ultimate AI Video Creator Toolkit: Auto-Reframe, Background Remover, Rotate & Reaction Studio",
    excerpt: "The master guide for content creators. Learn how to repurpose horizontal clips to 9:16 Shorts, strip backgrounds without green screens, straighten orientation, and build stacked reaction videos.",
    category: "creator-guides",
    categoryLabel: "Creator Guides",
    categoryColor: "bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30",
    tags: ["VideoProduction", "TikTokReels", "Shorts", "AutoReframe", "ReactionStudio"],
    readTime: "14 min read",
    date: "October 11, 2026",
    timestamp: 1791676800000,
    author: "Boto",
  },
  {
    id: "complete-guide-to-ai-audio-voice-tools",
    title: "Mastering AI Audio & Voice Production: Noise Removal, Voice Changer & Text-to-Speech",
    excerpt: "Transform noisy smartphone recordings into acoustic studio masters. Comprehensive guide on noise removal, neural character voices, automated subtitles, and video sound extraction.",
    category: "ai-tech",
    categoryLabel: "AI & Tech",
    categoryColor: "bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/30",
    tags: ["AudioTech", "VoiceSynthesis", "Podcasting", "Subtitles", "NoiseRemoval"],
    readTime: "11 min read",
    date: "October 11, 2026",
    timestamp: 1791676800000,
    author: "Boto",
  },
  {
    id: "complete-guide-to-pdf-tools-workflows",
    title: "The Complete Guide to Modern PDF Tools: AI Summarizer, 3D Flipbook, Forms & Auto-Straighten",
    excerpt: "Everything you need to know about modern digital documents. In-depth manual detailing what each PDF tool does, step-by-step instructions, benefits, use cases, and target audiences.",
    category: "productivity",
    categoryLabel: "Productivity & Workflows",
    categoryColor: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    tags: ["DocumentIntelligence", "PDF", "AcroForms", "3DFlipbook", "Automation"],
    readTime: "12 min read",
    date: "October 11, 2026",
    timestamp: 1791676800000,
    author: "Boto",
  },
  {
    id: "how-to-create-reaction-videos-trends-guide",
    title: "Why Reaction Videos Dominate Social Media in 2026: Trends, Data & Complete Guide",
    excerpt: "Discover why top-and-bottom stacked reaction videos dominate TikTok, Shorts, and Reels with 82% retention rates. Full showbiz market graphs and creation tutorial.",
    category: "showbiz-media",
    categoryLabel: "Showbiz & Digital Media",
    categoryColor: "bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-500/30",
    tags: ["Showbiz", "ViralTrends", "ReactionVideos", "PopCulture", "Streaming"],
    readTime: "8 min read",
    date: "October 10, 2026",
    timestamp: 1791590400000,
    author: "Boto",
  },
  {
    id: "top-5-ai-video-trends-2026",
    title: "Top 5 AI Video Generation Trends You Need to Know This Year",
    excerpt: "From real-time 3D rendering to text-to-video masterpieces, discover the trends shaping the future of digital filmmaking and digital showbiz content.",
    category: "news-trends",
    categoryLabel: "News & Trends",
    categoryColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    tags: ["TechNews", "VideoTrends", "FutureOfMedia", "AI", "Entertainment"],
    readTime: "7 min read",
    date: "October 10, 2026",
    timestamp: 1791590400000,
    author: "Boto",
  },
  {
    id: "ai-agents-creative-workflows",
    title: "How AI Agents are Revolutionizing Creative Workflows in 2026",
    excerpt: "Explore how autonomous AI agents are taking over repetitive coding, designing, and video editing tasks, allowing creators to focus on imagination.",
    category: "ai-tech",
    categoryLabel: "AI & Tech",
    categoryColor: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
    tags: ["AIAgents", "Automation", "TechInnovation", "MachineLearning"],
    readTime: "6 min read",
    date: "October 10, 2026",
    timestamp: 1791590400000,
    author: "Boto",
  },
  {
    id: "ai-document-management-productivity",
    title: "Maximizing Productivity with AI-Powered Document Management",
    excerpt: "Learn how integrating AI processing with traditional PDF tools can cut down administrative hours and optimize your digital workspace.",
    category: "productivity",
    categoryLabel: "Productivity & Workflows",
    categoryColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    tags: ["Workflows", "Enterprise", "Productivity", "OfficeTech"],
    readTime: "5 min read",
    date: "October 10, 2026",
    timestamp: 1791590400000,
    author: "Boto",
  },
  {
    id: "evolution-of-ai-image-generation",
    title: "The Evolution of AI Image Generation: What's Next in 2026?",
    excerpt: "A deep dive into algorithmic visualizations and the future of canvas painting with glowing digital energy and code matrices.",
    category: "news-trends",
    categoryLabel: "News & Trends",
    categoryColor: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
    tags: ["GenerativeAI", "TechNews", "DigitalArt", "VisualComputing"],
    readTime: "9 min read",
    date: "October 10, 2026",
    timestamp: 1791590400000,
    author: "Boto",
  },
  {
    id: "guide-to-ai-video-generation",
    title: "The Ultimate Guide to AI Video Generation: From Text to Masterpiece",
    excerpt: "Learn the secrets of Text-to-Video and Image-to-Video. Discover how to write the perfect prompt and stitch 10-second clips into a 30-minute masterpiece.",
    category: "creator-guides",
    categoryLabel: "Creator Guides",
    categoryColor: "bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30",
    tags: ["TextToVideo", "Prompts", "Filmmaking", "Storytelling"],
    readTime: "15 min read",
    date: "October 4, 2026",
    timestamp: 1791072000000,
    author: "Boto",
  },
  {
    id: "guide-to-photo-generation-and-faq",
    title: "Mastering AI Photo Generation & Important FAQs",
    excerpt: "Everything you need to know about generating stunning images, understanding system speeds, and navigating our strict content safety policies.",
    category: "ai-tech",
    categoryLabel: "AI & Tech",
    categoryColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    tags: ["PhotoGeneration", "PromptEngineering", "AIImages", "FAQ"],
    readTime: "12 min read",
    date: "October 4, 2026",
    timestamp: 1791072000000,
    author: "Boto",
  },
  {
    id: "guide-to-image-editing-and-background-removal",
    title: "The Magic of AI Image Editing & Background Removal",
    excerpt: "Discover how to seamlessly remove backgrounds and utilize transparent PNGs for thumbnails, e-commerce, and professional presentations.",
    category: "creator-guides",
    categoryLabel: "Creator Guides",
    categoryColor: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    tags: ["ImageEditing", "BackgroundRemoval", "Thumbnails", "Design"],
    readTime: "10 min read",
    date: "October 4, 2026",
    timestamp: 1791072000000,
    author: "Boto",
  },
  {
    id: "guide-to-pdf-and-document-tools",
    title: "Streamlining Your Workflow with Botock's PDF Tools",
    excerpt: "Learn how to secure, unlock, and split PDF documents directly inside your Botock creative workspace.",
    category: "productivity",
    categoryLabel: "Productivity & Workflows",
    categoryColor: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    tags: ["PDFTools", "DocumentSecurity", "Privacy", "OfficeHacks"],
    readTime: "8 min read",
    date: "October 4, 2026",
    timestamp: 1791072000000,
    author: "Boto",
  },
  {
    id: "about-botock-app",
    title: "About Us: The Story Behind Botock",
    excerpt: "Built by a web developer while vibe coding: completely costless in-browser tools with or without login, daily maintenance, and the Spider-Man Doc Ock name origin.",
    category: "news-trends",
    categoryLabel: "News & Trends",
    categoryColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    tags: ["FounderStory", "WebDevelopment", "VibeCoding", "DocOck", "Botock"],
    readTime: "8 min read",
    date: "October 4, 2026",
    timestamp: 1791072000000,
    author: "Boto",
  },
];

const CATEGORIES: { key: BlogCategoryKey; label: string }[] = [
  { key: "all", label: "All Stories" },
  { key: "ai-tech", label: "AI & Tech" },
  { key: "news-trends", label: "News & Trends" },
  { key: "showbiz-media", label: "Showbiz & Media" },
  { key: "productivity", label: "Productivity & Workflows" },
  { key: "creator-guides", label: "Creator Guides" },
];

const POPULAR_TAGS = [
  "AI",
  "TechNews",
  "TeslaRoadster",
  "FlyingCars",
  "Showbiz",
  "VideoProduction",
  "Shorts",
  "Photography",
  "ECommerce",
  "Workflows",
  "AudioTech",
  "ViralTrends",
];

export default function BlogCatalogClient() {
  const [filter, setFilter] = useState<BlogCategoryKey>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
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
            category: (cp.category as any) || "ai-tech",
            categoryLabel: cp.categoryLabel || "AI & Tech",
            categoryColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
            tags: Array.isArray(cp.tags) ? cp.tags : ["AI", "Tech"],
            readTime: cp.readTime || "5 min read",
            date: cp.date || "October 11, 2026",
            timestamp: cp.timestamp || Date.now(),
            author: cp.author || "Boto",
            attachmentName: cp.attachmentName,
            attachmentUrl: cp.attachmentUrl,
          }));
          setPosts([...POSTS, ...formatted]);
        }
      } catch (e) {
        console.warn("Backend not reachable for custom blogs. Using static blogs.");
      }
    };

    loadBlogs();
  }, []);

  // Filter & Search Logic
  const filteredPosts = posts
    .filter((post) => {
      const matchesCat = filter === "all" || post.category === filter;
      const matchesTag = !selectedTag || post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.categoryLabel.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCat && matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.timestamp - a.timestamp;
      }
      if (sortBy === "oldest") {
        return a.timestamp - b.timestamp;
      }
      return 0;
    });

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setSearch("");
    }
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Botock News, Tech &amp; Creative Journal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Explore AI Tech, News, Trends &amp; Showbiz
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            In-depth guides, breaking digital media news, showbiz trends, and production workflows directly from the Botock editorial and engineering teams.
          </p>

          {/* Search Bar & Sort Dropdown */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, keywords, or #tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/[0.06] w-full sm:w-auto justify-center">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Sort:
              </span>
              <button
                onClick={() => setSortBy("newest")}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  sortBy === "newest"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-3 h-3 text-sky-500" />
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  sortBy === "oldest"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Clock className="w-3 h-3 text-purple-500" />
                Oldest
              </button>
            </div>
          </div>
        </div>

        {/* Editorial Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setFilter(cat.key);
                setSelectedTag(null);
              }}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filter === cat.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Popular Tags Strip */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-10 max-w-4xl mx-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Popular Tags:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-violet-600 text-white font-bold border-violet-500 shadow-sm shadow-violet-500/20"
                  : "bg-white dark:bg-[#111114] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:border-violet-500/40 hover:text-violet-500"
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold border border-rose-500/20 flex items-center gap-1 ml-2"
            >
              <X className="w-3 h-3" /> Clear Tag Filter
            </button>
          )}
        </div>

        {/* Active Tag Filter Status */}
        {selectedTag && (
          <div className="mb-6 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs text-violet-700 dark:text-violet-300">
            <span>
              Showing articles tagged with <strong>#{selectedTag}</strong> ({filteredPosts.length} results)
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="font-bold underline hover:opacity-80"
            >
              Show all articles
            </button>
          </div>
        )}

        {/* Featured Top Article */}
        {filteredPosts.length > 0 && filter === "all" && !selectedTag && !search && sortBy === "newest" && (
          <div className="mb-12 rounded-3xl bg-slate-100 dark:bg-gradient-to-br dark:from-[#13111c] dark:via-[#101015] dark:to-[#121216] border border-slate-300 dark:border-white/[0.1] p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 hover:border-violet-500/40 transition-all shadow-sm">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Featured Story
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${filteredPosts[0].categoryColor}`}>
                  {filteredPosts[0].categoryLabel}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {filteredPosts[0].readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer">
                <Link href={`/blog/${filteredPosts[0].id}`}>{filteredPosts[0].title}</Link>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {filteredPosts[0].excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                {filteredPosts[0].tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => handleTagClick(t)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-violet-500/50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>By {filteredPosts[0].author}</span>
                <span>•</span>
                <span>{filteredPosts[0].date}</span>
              </div>
            </div>
            <Link
              href={`/blog/${filteredPosts[0].id}`}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Article Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No Articles Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              We couldn&apos;t find any articles matching your search query or selected tag.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedTag(null);
                setFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all group hover:bg-slate-50 dark:hover:bg-[#15151a] shadow-sm"
              >
                <div>
                  {/* Category and Date Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${post.categoryColor}`}>
                      {post.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {post.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors leading-snug">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  {/* Tags List */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {post.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTagClick(t)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                          selectedTag === t
                            ? "bg-violet-600 text-white font-bold"
                            : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>

                  {post.attachmentName && (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{post.attachmentName}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
