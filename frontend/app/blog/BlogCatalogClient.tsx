'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BOTOCK_BLOG_POSTS } from '@/lib/blog/blogData';
import BlogVideoClipPlayer from '@/app/components/BlogVideoClipPlayer';

const CATEGORIES = ['All', 'AI Video', 'Video Editing', 'Image AI', 'PDF & Docs', 'Creator Growth'] as const;

export default function BlogCatalogClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return BOTOCK_BLOG_POSTS.filter((post) => {
      const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesQuery =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-4">
            🎬 Interactive Video Clips & Creator Playbooks
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Botock Creator & AI Workflows Hub
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Watch bite-sized tutorial clips, master 4K browser editing, and boost your content views with our step-by-step AI guides.
          </p>
        </div>

        {/* Search & Category Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, clips, tools..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Blog Grid with Live Video Clips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 overflow-hidden shadow-lg hover:border-indigo-500/50 transition-all"
            >
              <div>
                {/* Embedded Interactive Video Clip Preview */}
                <div className="p-3 pb-0">
                  <BlogVideoClipPlayer
                    clip={post.featuredClip}
                    autoPlayOnHover={true}
                    compact={true}
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="rounded-md bg-indigo-500/15 px-2.5 py-1 font-medium text-indigo-300">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>👁️ {post.viewsCount.toLocaleString()} views</span>
                      <span>• {post.readTime}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="group block">
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                    {post.metaDescription}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-500">{post.publishedAt}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Read Guide & Watch Clips →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
