import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryLabel?: string;
  readTime?: string;
  date?: string;
  author?: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

// Helper to fetch blog data server-side for Google SEO crawlers
async function getBlog(slug: string): Promise<BlogPost | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.botock.app";
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/public/blogs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to load blog post for SEO:", err);
    return null;
  }
}

// 1. DYNAMIC SEO METADATA FOR GOOGLE RANKING
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Article Not Found | Botock Blog",
      description: "The requested article could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.app";
  const url = `${siteUrl}/blog/${slug}`;

  return {
    title: `${blog.title} | Botock AI Blog`,
    description: blog.excerpt || `Read ${blog.title} on Botock. Complete guide and tutorials.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: url,
      siteName: "Botock",
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author || "Botock Editorial Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

// 2. BLOG POST PAGE COMPONENT
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.app";
  const postUrl = `${siteUrl}/blog/${slug}`;

  // Schema.org Article Structured Data for Rich Snippets in Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.excerpt,
    "author": {
      "@type": "Person",
      "name": blog.author || "Botock AI Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Botock",
      "url": "https://botock.app"
    },
    "datePublished": blog.date,
    "mainEntityOfPage": postUrl
  };

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Google Rich Snippet Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8">
          <Link href="/" className="hover:text-violet-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-violet-500 transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">{blog.title}</span>
        </nav>

        {/* Header Section */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{blog.categoryLabel || blog.category || "Tutorial"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
            {blog.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light mb-8">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                <User className="w-4 h-4 text-violet-500" />
                {blog.author || "Botock Editorial Team"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {blog.date || "Recent"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {blog.readTime || "5 min read"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed space-y-6">
          <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
            {blog.content || blog.excerpt}
          </div>
        </main>

        {/* Bottom Call to Action for Ranking & Engagement */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent border border-violet-500/20 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Ready to explore AI Video & Creative Tools?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-lg mx-auto">
            Experience cinematic AI generation with Omni and Veo models on Botock.
          </p>
          <Link
            href="/tools/video-generator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
          >
            <span>Try AI Video Generator</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
