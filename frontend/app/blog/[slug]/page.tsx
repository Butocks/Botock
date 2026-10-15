import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, CheckCircle2, ChevronRight, Search } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  h1?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image?: string;
  is_indexable?: boolean;
  content_cluster?: string;
  parent_id?: string;
  tool_cta?: string;
  status?: string;
  published_at?: string;
  updated_at?: string;
  // legacy compat
  category?: string;
  categoryLabel?: string;
  readTime?: string;
  date?: string;
  author?: string;
  blocks?: Array<{ type: string; content?: string; url?: string; caption?: string }>;
  parent?: { title: string; slug: string };
  children?: Array<{ title: string; slug: string; excerpt?: string }>;
  related?: Array<{ title: string; slug: string }>;
}

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.botock.app").replace(/\/$/, "");

async function getBlog(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${BACKEND}/api/public/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getRedirect(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/api/public/blog-redirects/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.new_slug ?? null;
    }
  } catch {}
  return null;
}


// 1. DYNAMIC SEO METADATA FOR GOOGLE RANKING
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    const newSlug = await getRedirect(slug);
    if (newSlug) return { title: "Redirecting..." };
    return { title: "Blog Not Found" };
  }

  // Use the first attachment as OG Image if available
  let ogImage = blog.og_image || blog.featured_image || "https://botock.app/og-image.jpg";
  if (blog.blocks && ogImage === "https://botock.app/og-image.jpg") {
    const firstImg = blog.blocks.find(b => b.type === "attachment" && b.url);
    if (firstImg) ogImage = firstImg.url as string;
  }

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    alternates: {
      canonical: blog.canonical_url || `/blog/${slug}`,
    },
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      url: `https://botock.app/blog/${slug}`,
      siteName: "Botock",
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author || "Botock Editorial"],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      images: [ogImage],
    },
    robots: {
      index: blog.is_indexable !== false,
      follow: blog.is_indexable !== false,
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    const newSlug = await getRedirect(slug);
    if (newSlug) redirect(`/blog/${newSlug}`);
    notFound();
  }

  // BreadcrumbList JSON-LD
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://botock.app/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://botock.app/blog" }
  ];
  if (blog.parent) {
    breadcrumbItems.push({ "@type": "ListItem", position: 3, name: blog.parent.title, item: `https://botock.app/blog/${blog.parent.slug}` });
    breadcrumbItems.push({ "@type": "ListItem", position: 4, name: blog.title, item: `https://botock.app/blog/${slug}` });
  } else {
    breadcrumbItems.push({ "@type": "ListItem", position: 3, name: blog.title, item: `https://botock.app/blog/${slug}` });
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.excerpt,
      "author": {
        "@type": "Organization",
        "name": blog.author || "Botock Editorial Team"
      },
      "datePublished": blog.date || new Date().toISOString().split("T")[0],
      "publisher": {
        "@type": "Organization",
        "name": "Botock",
        "logo": {
          "@type": "ImageObject",
          "url": "https://botock.app/logo.png"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    }
  ];

  const featuredImgUrl = blog.featured_image || blog.blocks?.find(b => b.type === "attachment" && b.url)?.url;

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Search & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-violet-500 transition-colors font-semibold">Botock Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-violet-500 transition-colors font-semibold">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {blog.parent && (
              <>
                <Link href={`/blog/${blog.parent.slug}`} className="hover:text-violet-500 transition-colors font-semibold truncate max-w-[120px]">{blog.parent.title}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">{blog.title}</span>
          </nav>

          
          <form action="/blog" method="GET" className="relative w-full sm:w-64">
            <input 
              type="text" 
              name="q" 
              placeholder="Search related topics..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111116] border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-violet-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Header Section */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{blog.categoryLabel || blog.category || "Tutorial"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
            {blog.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 py-4 border-y border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <User className="w-3.5 h-3.5" />
              </div>
              {blog.author || "Botock Editorial"}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4" />
              {blog.date || "Recent"}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4" />
              {blog.readTime || "5 min read"}
            </span>
            
            {/* Social Sharing */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-bold text-[10px] uppercase text-slate-400">Share:</span>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=https://botock.app/blog/${blog.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=https://botock.app/blog/${blog.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {featuredImgUrl && (
          <div className="mb-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl group">
            {featuredImgUrl.endsWith(".mp4") || featuredImgUrl.endsWith(".webm") ? (
              <video src={featuredImgUrl} controls className="w-full h-auto max-h-[500px] object-cover" />
            ) : (
              <img src={featuredImgUrl} alt={blog.title} className="w-full h-auto max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Body */}
          <main className="flex-1 prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
            {blog.blocks && blog.blocks.length > 0 ? (
              blog.blocks.map((b, idx) => {
                if (b.type === "paragraph") {
                  if (b.content?.startsWith("### ")) return <h3 key={idx} className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{b.content.replace("### ", "")}</h3>;
                  if (b.content?.startsWith("## ")) return <h2 key={idx} className="text-2xl font-black mt-10 mb-4 text-slate-900 dark:text-white">{b.content.replace("## ", "")}</h2>;
                  if (b.content?.startsWith("# ")) return <h1 key={idx} className="text-3xl font-black mt-12 mb-6 text-slate-900 dark:text-white">{b.content.replace("# ", "")}</h1>;
                  return <p key={idx} className="whitespace-pre-wrap mb-6">{b.content}</p>;
                }
                if (b.type === "attachment" && b.url && b.url !== featuredImgUrl) { // Skip featured image
                  return (
                    <figure key={idx} className="my-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-black/30 flex flex-col items-center">
                      {b.url.endsWith(".mp4") || b.url.endsWith(".webm") ? (
                        <video src={b.url} controls className="w-full h-auto max-h-[600px] object-contain rounded-t-2xl" />
                      ) : (
                        <img src={b.url} alt={b.caption || "Blog attachment"} className="w-full h-auto max-h-[600px] object-contain m-0 rounded-t-2xl" />
                      )}
                      {b.caption && (
                        <figcaption className="w-full p-4 text-center text-sm font-semibold text-slate-500 bg-white dark:bg-[#111116] border-t border-slate-200 dark:border-slate-800 m-0 rounded-b-2xl">
                          {b.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
                if (b.type === "button" && b.url) {
                  return (
                    <div key={idx} className="my-8 flex justify-center sm:justify-start">
                      <a 
                        href={b.url} 
                        target={b.url.startsWith("http") ? "_blank" : "_self"} 
                        rel={b.url.startsWith("http") ? "noopener noreferrer" : ""}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-violet-600/40 no-underline"
                      >
                        {b.content || "Click Here"}
                      </a>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <div className="space-y-6">
                {(blog.content || blog.excerpt || "").split('\n\n').filter(Boolean).map((block, idx) => {
                  const trimmed = block.trim();
                  if (trimmed.startsWith("### ")) return <h3 key={idx} className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{trimmed.replace("### ", "")}</h3>;
                  if (trimmed.startsWith("## ")) return <h2 key={idx} className="text-2xl font-black mt-10 mb-4 text-slate-900 dark:text-white">{trimmed.replace("## ", "")}</h2>;
                  if (trimmed.startsWith("# ")) return <h1 key={idx} className="text-3xl font-black mt-12 mb-6 text-slate-900 dark:text-white">{trimmed.replace("# ", "")}</h1>;
                  return <p key={idx} className="whitespace-pre-wrap mb-6">{trimmed}</p>;
                })}
              </div>
            )}
            
            {/* Bottom Call to Action for Ranking & Engagement */}
            <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent border border-violet-500/20 text-center shadow-inner">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Ready to explore Botock AI Tools?
              </h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
                Join thousands of creators using our cinematic Video Generators and high-res Image AI.
              </p>
              <Link
                href="/tools/video-generator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-105"
              >
                <span>Try AI Video Generator</span>
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </main>
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Subscribe to Newsletter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Get the latest AI tutorials, feature drops, and creative inspiration straight to your inbox.
              </p>
              <form className="space-y-2">
                <input type="email" placeholder="Email Address" className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-violet-500" required />
                <button type="button" className="w-full px-3 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity">Subscribe</button>
              </form>
            </div>
            
            {blog.children && blog.children.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  In This Guide
                </h3>
                <div className="flex flex-col gap-3 text-sm">
                  {blog.children.map(child => (
                    <Link key={child.slug} href={`/blog/${child.slug}`} className="text-slate-600 dark:text-slate-400 hover:text-violet-600 font-semibold transition-colors leading-snug">
                      <span className="text-violet-500 mr-2">→</span>{child.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {blog.related && blog.related.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Related Topics
                </h3>
                <div className="flex flex-col gap-3 text-sm">
                  {blog.related.map(rel => (
                    <Link key={rel.slug} href={`/blog/${rel.slug}`} className="text-slate-600 dark:text-slate-400 hover:text-violet-600 font-semibold transition-colors leading-snug">
                      <span className="text-slate-400 mr-2">•</span>{rel.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {(!blog.children?.length && !blog.related?.length) && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Explore Botock
                </h3>
                <div className="flex flex-col gap-3 text-sm">
                  <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 font-semibold transition-colors">→ All AI Guides</Link>
                  <Link href="/tools" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 font-semibold transition-colors">→ View AI Tools</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
