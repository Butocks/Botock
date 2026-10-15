import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogBySlug, BOTOCK_BLOG_POSTS } from '@/lib/blog/blogData';
import BlogVideoClipPlayer from '@/app/components/BlogVideoClipPlayer';

export async function generateStaticParams() {
  return BOTOCK_BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Guide Not Found | Botock',
      description: 'The requested guide could not be found.',
    };
  }

  return {
    title: `${post.metaTitle} | Botock`,
    description: post.metaDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://botock.app/blog/${post.slug}`,
      siteName: 'Botock',
      type: 'article',
      images: [post.heroImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.heroImage],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  // Rich JSON-LD Schema for Google Discover & Video Carousel Ranking
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { '@type': 'Organization', name: post.author.name },
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: post.viewsCount,
        },
      },
      {
        '@type': 'VideoObject',
        name: post.featuredClip.title,
        description: post.featuredClip.caption,
        thumbnailUrl: [post.featuredClip.posterUrl],
        uploadDate: post.publishedAt,
        contentUrl: post.featuredClip.videoUrl,
      },
    ],
  };

  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <span>/</span>
          <span className="text-indigo-400">{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-300">
              {post.category}
            </span>
            <span>👁️ {(post.viewsCount + 1).toLocaleString()} Views</span>
            <span>• {post.readTime}</span>
            <span>• Updated {post.updatedAt}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            {post.title}
          </h1>

          {/* Featured Hero Video Clip */}
          <div className="my-6">
            <BlogVideoClipPlayer clip={post.featuredClip} />
          </div>

          {/* Executive Key Takeaways Box */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 my-8">
            <h2 className="text-base font-bold text-indigo-300 mb-3">
              🚀 Key Takeaways (Quick Summary)
            </h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {post.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Main Content Sections with Inline Video Clips */}
        <div className="space-y-10">
          {post.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-4">{sec.heading}</h2>
              <div
                className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: sec.bodyHtml }}
              />

              {sec.proTip && (
                <div className="mt-4 rounded-xl border-l-4 border-cyan-400 bg-slate-900/90 p-4 text-sm text-slate-200">
                  <strong className="text-cyan-400">💡 Creator Pro-Tip: </strong>
                  {sec.proTip}
                </div>
              )}

              {sec.clip && (
                <div className="mt-6">
                  <BlogVideoClipPlayer clip={sec.clip} />
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQ Section for Featured Snippets */}
        <section className="mt-14 pt-10 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {post.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-base font-bold text-white mb-2">{item.question}</h3>
                <p className="text-sm text-slate-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
